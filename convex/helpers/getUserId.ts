import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

/**
 * Get the current user ID or throw if not authenticated.
 */
export async function getUserId(ctx: QueryCtx | MutationCtx): Promise<Id<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const externalId = identity.subject;
  
  const user = await ctx.db
    .query("users")
    .withIndex("byExternalId", (q) => q.eq("externalId", externalId))
    .unique();

  if (!user) throw new Error("User not found");
  return user._id;
}

/**
 * Get the current user ID or null if not authenticated.
 * Useful for global queries that shouldn't crash if logged out.
 */
export async function getMaybeUserId(ctx: QueryCtx | MutationCtx): Promise<Id<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const externalId = identity.subject;
  
  const user = await ctx.db
    .query("users")
    .withIndex("byExternalId", (q) => q.eq("externalId", externalId))
    .unique();

  return user?._id ?? null;
}

/**
 * Get the current user ID or create one if not exists (Mutation only).
 */
export async function getOrCreateUserId(ctx: MutationCtx): Promise<Id<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const externalId = identity.subject;
  const now = Date.now();

  // find existing user in Convex
  const existingUser = await ctx.db
    .query("users")
    .withIndex("byExternalId", q => q.eq("externalId", externalId))
    .first();

  if (existingUser) return existingUser._id;

  // create user if not exists
  return await ctx.db.insert("users", {
    externalId,
    name: identity.name ?? "Unknown",
    role: "student",
    createdAt: now,
    updatedAt: now,
  });
}
