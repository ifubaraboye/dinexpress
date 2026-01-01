import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(), // Changed from fullName to match Clerk pattern
    externalId: v.string(), // Clerk user ID (was authId)
    role: v.union(
      v.literal("student"),
      v.literal("runner"),
      v.literal("admin")
    ),
    address: v.optional(v.string()), // Added address field

    // Runner-only fields (safe & optional)
    runnerAvgRating: v.optional(v.number()),
    runnerTotalRatings: v.optional(v.number()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("byExternalId", ["externalId"]), // Changed index name to match pattern

  // ... rest of your schema stays the same
  cafeterias: defineTable({
    name: v.string(),
    deliveryFee: v.number(),
    transferCharge: v.number(),
    avgRating: v.optional(v.number()),
    totalRatings: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_name", ["name"]),

  categories: defineTable({
    name: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_name", ["name"]),

  products: defineTable({
    categoryId: v.id("categories"),
    name: v.string(),
    imageUrl: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_category", ["categoryId"]),

  menuItems: defineTable({
    cafeteriaId: v.id("cafeterias"),
    productId: v.id("products"),
    price: v.number(),
    avgWaitTimeMinutes: v.number(),
    quantityAvailable: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    avgRating: v.optional(v.number()),
    totalRatings: v.optional(v.number()),
  })
    .index("by_cafeteria", ["cafeteriaId"])
    .index("by_product", ["productId"]),

  cartItems: defineTable({
    userId: v.id("users"),
    menuItemId: v.id("menuItems"),
    quantity: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  orders: defineTable({
    userId: v.id("users"),
    runnerId: v.optional(v.id("users")),
    total: v.number(),
    status: v.union(
      v.literal("PLACED"),
      v.literal("CONFIRMED"),
      v.literal("PREPARING"),
      v.literal("PICKED_UP"),
      v.literal("ARRIVED_AT_DELIVERY"),
      v.literal("DELIVERED"),
      v.literal("CANCELLED")
    ),
    paymentStatus: v.union(
      v.literal("PENDING"),
      v.literal("PAID"),
      v.literal("FAILED")
    ),
    deliveryAddress: v.optional(v.string()),
    deliveryNotes: v.optional(v.string()),
    recipientName: v.optional(v.string()),
    recipientPhone: v.optional(v.string()),
    recipientRoom: v.optional(v.string()),
    deliveryFee: v.number(),
    takeawayFee: v.number(),
    isTakeaway: v.boolean(),
    paymentReference: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    chats: v.array(
      v.object({
        senderId: v.id("users"),
        message: v.string(),
        read: v.boolean(),
        createdAt: v.number(),
      })
    ),
  })
    .index("by_user", ["userId"])
    .index("by_runner", ["runnerId"])
    .index("by_status", ["status"]),

  orderItems: defineTable({
    orderId: v.id("orders"),
    menuItemId: v.id("menuItems"),
    quantity: v.number(),
    subtotal: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_order", ["orderId"]),

  chats: defineTable({
    orderId: v.id("orders"),
    senderId: v.id("users"),
    message: v.string(),
    read: v.boolean(),
    createdAt: v.number(),
  }).index("by_order", ["orderId"]),

  ratings: defineTable({
    userId: v.id("users"),
    menuItemId: v.id("menuItems"),
    rating: v.number(),
    comment: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_menu_item", ["menuItemId"]),

  runnerRatings: defineTable({
    runnerId: v.id("users"),
    userId: v.id("users"),
    orderId: v.id("orders"),
    rating: v.number(),
    comment: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_runner", ["runnerId"])
    .index("by_runner_and_order", ["runnerId", "orderId"]),

  transactions: defineTable({
    orderId: v.id("orders"),
    userId: v.id("users"),
    reference: v.string(),
    amount: v.number(),
    status: v.union(
      v.literal("PENDING"),
      v.literal("SUCCESS"),
      v.literal("FAILED")
    ),
    paymentMethod: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_order", ["orderId"]),
});