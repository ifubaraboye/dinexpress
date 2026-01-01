import { internalMutation, mutation, query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import { v } from "convex/values";

// Type for Clerk user data from webhook
type ClerkUserData = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email_addresses?: Array<{ email_address: string }>;
};

// Get current user
export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

// Webhook handler: upsert user from Clerk
export const upsertFromClerk = internalMutation({
  args: { data: v.any() }, // We'll cast it inside
  async handler(ctx, { data }) {
    const clerkUser = data as ClerkUserData;
    const now = Date.now();
    
    const userAttributes = {
      name: `${clerkUser.first_name ?? ""} ${clerkUser.last_name ?? ""}`.trim() || "User",
      externalId: clerkUser.id,
      updatedAt: now,
    };

    const user = await userByExternalId(ctx, clerkUser.id);
    
    if (user === null) {
      // Create new user with default role
      await ctx.db.insert("users", {
        ...userAttributes,
        role: "student" as const, // Default role
        createdAt: now,
      });
    } else {
      // Update existing user (preserve role and createdAt)
      await ctx.db.patch(user._id, {
        name: userAttributes.name,
        updatedAt: userAttributes.updatedAt,
      });
    }
  },
});

// Webhook handler: delete user from Clerk
export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await userByExternalId(ctx, clerkUserId);

    if (user !== null) {
      await ctx.db.delete(user._id);
    } else {
      console.warn(
        `Can't delete user, there is none for Clerk user ID: ${clerkUserId}`,
      );
    }
  },
});

// Update user role (admin only)
export const updateRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(
      v.literal("student"),
      v.literal("runner"),
      v.literal("admin")
    ),
  },
  handler: async (ctx, { userId, role }) => {
    const currentUser = await getCurrentUserOrThrow(ctx);
    
    // Only admins can update roles
    if (currentUser.role !== "admin") {
      throw new Error("Unauthorized: Only admins can update roles");
    }
    
    await ctx.db.patch(userId, {
      role,
      updatedAt: Date.now(),
    });
  },
});

// Update user address
export const updateAddress = mutation({
  args: { address: v.string() },
  handler: async (ctx, { address }) => {
    const currentUser = await getCurrentUserOrThrow(ctx);
    
    await ctx.db.patch(currentUser._id, {
      address,
      updatedAt: Date.now(),
    });
  },
});

// Get all users (admin only)
export const list = query({
  handler: async (ctx) => {
    const currentUser = await getCurrentUserOrThrow(ctx);
    
    if (currentUser.role !== "admin") {
      throw new Error("Unauthorized: Only admins can view all users");
    }
    
    return await ctx.db.query("users").collect();
  },
});

// Helper: Get current user or throw
export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx);
  if (!userRecord) throw new Error("Can't get current user");
  return userRecord;
}

// Helper: Get current user or null
export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }
  return await userByExternalId(ctx, identity.subject);
}

// Helper: Get user by Clerk ID
async function userByExternalId(ctx: QueryCtx, externalId: string) {
  return await ctx.db
    .query("users")
    .withIndex("byExternalId", (q) => q.eq("externalId", externalId))
    .unique();
}