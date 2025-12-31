import { Id } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";

export async function getUserId(ctx: MutationCtx): Promise<Id<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const authId = identity.subject;
  const now = Date.now();

  // find existing user in Convex
  const existingUser = await ctx.db
    .query("users")
    .withIndex("by_authId", q => q.eq("authId", authId))
    .first();

  if (existingUser) return existingUser._id;

  // create user if not exists
  return await ctx.db.insert("users", {
    authId,
    fullName: identity.name ?? "Unknown",
    role: "student",
    createdAt: now,
    updatedAt: now,
  });
}
