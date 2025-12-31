import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getUserId } from "./helpers/getUserId";
import type { Id } from "./_generated/dataModel";

export const cafeterias = mutation({
  handler: async (ctx) => {
    const now = Date.now();

    const cafeterias = [
      "Grills",
      "BTO",
      "Laughter's Kitchen",
      "DunnKayce",
    ];

    for (const name of cafeterias) {
      await ctx.db.insert("cafeterias", {
        name,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

export const categories = mutation({
  handler: async (ctx) => {
    const now = Date.now();

    const categories = [
      "rice",
      "drinks",
      "grills_and_proteins",
      "combos",
      "soups_sauces_swallows",
      "snacks",
      "pastries"
    ];

    for (const name of categories) {
      await ctx.db.insert("categories", {
        name,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

export const addToCart = mutation({ //also called cart items(manages the cart items)
  args: {
    menuItemId: v.id("menuItems"),
    quantity: v.number(),
  },
  handler: async (ctx, { menuItemId, quantity }) => {
    const userId = await getUserId(ctx); // ✅ Convex Id<"users">
    const now = Date.now();

    const existing = await ctx.db
      .query("cartItems")
      .withIndex("by_user", q => q.eq("userId", userId))
      .filter(q => q.eq(q.field("menuItemId"), menuItemId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        quantity: existing.quantity + quantity,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("cartItems", {
        userId,
        menuItemId,
        quantity,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

export const addChatMessage = mutation({ //responsible for adding chat messages to active orders
  args: {
    orderId: v.id("orders"),
    message: v.string(),
  },
  handler: async (ctx, { orderId, message }) => {
    const senderId = await getUserId(ctx);
    const now = Date.now();

    // Get the existing chats array from the order
    const order = await ctx.db.get(orderId);
    if (!order) throw new Error("Order not found");

    const newChats = [
      ...(order.chats || []),
      {
        senderId,
        message,
        read: false,
        createdAt: now,
      },
    ];

    // Patch the order with the updated chats array
    await ctx.db.patch(orderId, {
      chats: newChats,
      updatedAt: now,
    });
  },
});

export const getMenuItemsWithDetails = query({
  args: { cafeteriaId: v.id("cafeterias") },
  handler: async (ctx, { cafeteriaId }) => {
    const items = await ctx.db
      .query("menuItems")
      .withIndex("by_cafeteria", q => q.eq("cafeteriaId", cafeteriaId))
      .collect();

    return Promise.all(
      items.map(async item => {
        const product = await ctx.db.get("products", item.productId);

        return {
          menuItemId: item._id,
          price: item.price,
          quantityAvailable: item.quantityAvailable,
          avgWaitTimeMinutes: item.avgWaitTimeMinutes,

          avgRating: item.avgRating ?? 0,
          totalRatings: item.totalRatings ?? 0,

          productName: product?.name,
          imageUrl: product?.imageUrl,
          categoryId: product?.categoryId,
        };
      })
    );
  },
});

export const getAllProducts = query({
  handler: async (ctx) => {
    return await ctx.db.query("products").collect();
  },
});




