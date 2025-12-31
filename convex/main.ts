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
        const category = product ? await ctx.db.get("categories", product.categoryId) : null;

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
          categoryName: category?.name,
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

export const getAllCafeterias = query({
  handler: async (ctx) => {
    return await ctx.db.query("cafeterias").collect();
  },
});

export const getCafeteriaByName = query({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    return await ctx.db
      .query("cafeterias")
      .withIndex("by_name", (q) => q.eq("name", name))
      .unique();
  },
});

export const searchMenuItems = query({
  args: { query: v.string() },
  handler: async (ctx, { query }) => {
    if (!query) return [];

    const lowerQuery = query.toLowerCase();
    
    // In a production app, you'd use a search index. 
    // Here we'll simulate it by collecting all products and filtering.
    const products = await ctx.db.query("products").collect();
    const matchedProducts = products.filter(p => 
      p.name.toLowerCase().includes(lowerQuery)
    );

    const results = [];
    for (const product of matchedProducts) {
      const menuItems = await ctx.db
        .query("menuItems")
        .withIndex("by_product", q => q.eq("productId", product._id))
        .collect();

      for (const item of menuItems) {
        const cafeteria = await ctx.db.get("cafeterias", item.cafeteriaId);
        const category = await ctx.db.get("categories", product.categoryId);

        results.push({
          id: item._id,
          name: product.name,
          price: item.price,
          restaurant: cafeteria?.name || "Unknown",
          image: product.imageUrl,
          tag: category?.name || "Menu",
          avgRating: item.avgRating ?? 0,
          totalRatings: item.totalRatings ?? 0,
        });
      }
    }

    return results;
  },
});

export const getMenuItemsByCategory = query({
  args: { categoryName: v.string() },
  handler: async (ctx, { categoryName }) => {
    const category = await ctx.db
      .query("categories")
      .withIndex("by_name", q => q.eq("name", categoryName))
      .unique();

    if (!category) return [];

    const products = await ctx.db
      .query("products")
      .withIndex("by_category", q => q.eq("categoryId", category._id))
      .collect();

    const results = [];
    for (const product of products) {
      const menuItems = await ctx.db
        .query("menuItems")
        .withIndex("by_product", q => q.eq("productId", product._id))
        .collect();

      for (const item of menuItems) {
        const cafeteria = await ctx.db.get("cafeterias", item.cafeteriaId);
        results.push({
          id: item._id,
          name: product.name,
          price: item.price,
          restaurant: cafeteria?.name || "Unknown",
          image: product.imageUrl,
          tag: category.name,
          avgRating: item.avgRating ?? 0,
          totalRatings: item.totalRatings ?? 0,
        });
      }
    }
    return results;
  },
});




