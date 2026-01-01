import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getUserId, getOrCreateUserId, getMaybeUserId } from "./helpers/getUserId";

export const create = mutation({
  args: {
    items: v.array(
      v.object({
        menuItemId: v.id("menuItems"),
        quantity: v.number(),
        price: v.number(),
      })
    ),
    deliveryAddress: v.string(),
    phone: v.string(),
    recipientName: v.optional(v.string()),
    recipientPhone: v.optional(v.string()),
    isGift: v.boolean(),
    isTakeaway: v.boolean(),
    takeawayFee: v.number(),
    deliveryFee: v.number(),
    total: v.number(),
    paymentMethod: v.string(),
    deliveryNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getOrCreateUserId(ctx);
    const now = Date.now();

    const orderId = await ctx.db.insert("orders", {
      userId,
      total: args.total,
      status: "PLACED",
      paymentStatus: "PENDING",
      deliveryAddress: args.deliveryAddress,
      deliveryNotes: args.deliveryNotes,
      recipientPhone: args.isGift ? args.recipientPhone : args.phone,
      recipientName: args.recipientName,
      isTakeaway: args.isTakeaway,
      takeawayFee: args.takeawayFee,
      deliveryFee: args.deliveryFee,
      createdAt: now,
      updatedAt: now,
      chats: [],
    });

    for (const item of args.items) {
      await ctx.db.insert("orderItems", {
        orderId,
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
        createdAt: now,
        updatedAt: now,
      });
    }

    return orderId;
  },
});

export const listAvailable = query({
  handler: async (ctx) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_status", q => q.eq("status", "PLACED"))
      .collect();

    const availableOrders = orders.filter(o => !o.runnerId);

    return await Promise.all(availableOrders.map(async (order) => {
      const orderItems = await ctx.db
        .query("orderItems")
        .withIndex("by_order", q => q.eq("orderId", order._id))
        .collect();

      const itemsWithDetails = await Promise.all(orderItems.map(async (oi) => {
        const menuItem = await ctx.db.get(oi.menuItemId);
        let cafeteriaName = "Unknown Cafeteria";
        
                        if (menuItem) {
        
                          await ctx.db.get(menuItem.productId);
        
                          
        
                          const cafeteria = await ctx.db.get(menuItem.cafeteriaId);
        
                  if (cafeteria) cafeteriaName = cafeteria.name;
        
                }

        return {
          id: oi._id,
          quantity: oi.quantity,
          menu_items: {
            products: { name: (await ctx.db.get(menuItem!.productId))?.name || "Unknown Item" },
            cafeterias: { name: cafeteriaName }
          }
        };
      }));

      return {
        id: order._id,
        runner_id: order.runnerId,
        delivery_address: order.deliveryAddress,
        delivery_notes: order.deliveryNotes,
        customer_name: (await ctx.db.get(order.userId))?.name || "Customer",
        total: order.total,
        status: order.status,
        order_items: itemsWithDetails,
        created_at: order.createdAt
      };
    }));
  },
});

export const listMyActive = query({
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_runner", q => q.eq("runnerId", userId))
      .collect();

    const activeOrders = orders.filter(o => o.status !== "DELIVERED" && o.status !== "CANCELLED");

    return await Promise.all(activeOrders.map(async (order) => {
      const orderItems = await ctx.db
        .query("orderItems")
        .withIndex("by_order", q => q.eq("orderId", order._id))
        .collect();

      const itemsWithDetails = await Promise.all(orderItems.map(async (oi) => {
        const menuItem = await ctx.db.get(oi.menuItemId);
        let cafeteriaName = "Unknown Cafeteria";
        
        if (menuItem) {
          const product = await ctx.db.get(menuItem.productId);
          if (product) {
              // productName = product.name; (Removed)
          }
          const cafeteria = await ctx.db.get(menuItem.cafeteriaId);
          if (cafeteria) cafeteriaName = cafeteria.name;
        }

        return {
          id: oi._id,
          quantity: oi.quantity,
          menu_items: {
            products: { name: (await ctx.db.get(menuItem!.productId))?.name || "Unknown Item" },
            cafeterias: { name: cafeteriaName }
          }
        };
      }));

      return {
        id: order._id,
        runner_id: order.runnerId,
        delivery_address: order.deliveryAddress,
        delivery_notes: order.deliveryNotes,
        customer_name: (await ctx.db.get(order.userId))?.name || "Customer",
        total: order.total,
        status: order.status,
        order_items: itemsWithDetails,
        created_at: order.createdAt
      };
    }));
  },
});

export const accept = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    const runnerId = await getUserId(ctx);
    const order = await ctx.db.get(orderId);
    if (!order) throw new Error("Order not found");
    if (order.runnerId) throw new Error("Order already taken");

    await ctx.db.patch(orderId, {
      runnerId,
      status: "CONFIRMED",
      updatedAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: { 
    orderId: v.id("orders"), 
    status: v.union(
      v.literal("PLACED"),
      v.literal("CONFIRMED"),
      v.literal("PREPARING"),
      v.literal("PICKED_UP"),
      v.literal("ARRIVED_AT_DELIVERY"),
      v.literal("DELIVERED"),
      v.literal("CANCELLED")
    )
  },
  handler: async (ctx, { orderId, status }) => {
    const userId = await getUserId(ctx);
    const order = await ctx.db.get(orderId);
    if (!order) throw new Error("Order not found");
    
    if (status === "DELIVERED") {
        if (order.userId !== userId) {
            throw new Error("Only the customer can confirm delivery");
        }
    } else {
        if (order.runnerId !== userId) {
            const user = await ctx.db.get(userId);
            if (user?.role !== "admin") throw new Error("Unauthorized");
        }
    }

    await ctx.db.patch(orderId, {
      status,
      updatedAt: Date.now(),
    });
  },
});

export const listRunnerHistory = query({
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_runner", q => q.eq("runnerId", userId))
      .collect();

    const sortedOrders = orders.sort((a, b) => b.updatedAt - a.updatedAt);

    return await Promise.all(sortedOrders.map(async (order) => {
      const orderItems = await ctx.db
        .query("orderItems")
        .withIndex("by_order", q => q.eq("orderId", order._id))
        .collect();

      const itemsWithDetails = await Promise.all(orderItems.map(async (oi) => {
        const menuItem = await ctx.db.get(oi.menuItemId);
        let cafeteriaName = "Unknown Cafeteria";
        
        if (menuItem) {
          // REMOVED: const product = await ctx.db.get(menuItem.productId);
          // REMOVED: if (product) productName = product.name;
          const cafeteria = await ctx.db.get(menuItem.cafeteriaId);
          if (cafeteria) cafeteriaName = cafeteria.name;
        }

        return {
          id: oi._id,
          quantity: oi.quantity,
          menu_items: [
            { cafeterias: { name: cafeteriaName } }
          ]
        };
      }));

      return {
        id: order._id,
        runner_id: order.runnerId,
        delivery_address: order.deliveryAddress,
        total: order.total,
        status: order.status,
        commission: order.total * 0.1,
        order_items: itemsWithDetails,
        updatedAt: order.updatedAt
      };
    }));
  },
});

export const listMyOrders = query({
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user", q => q.eq("userId", userId))
      .collect();

    const sortedOrders = orders.sort((a, b) => b.createdAt - a.createdAt);

    return await Promise.all(sortedOrders.map(async (order) => {
      const orderItems = await ctx.db
        .query("orderItems")
        .withIndex("by_order", q => q.eq("orderId", order._id))
        .collect();

      const itemsWithDetails = await Promise.all(orderItems.map(async (oi) => {
        const menuItem = await ctx.db.get(oi.menuItemId);
        let cafeteriaName = "Unknown Cafeteria";
        let imageUrl = "";
        
        if (menuItem) {
          const product = await ctx.db.get(menuItem.productId);
          if (product) {
              imageUrl = product.imageUrl;
          }
          const cafeteria = await ctx.db.get(menuItem.cafeteriaId);
          if (cafeteria) cafeteriaName = cafeteria.name;
        }

        return {
          id: oi._id,
          menuItemId: oi.menuItemId,
          quantity: oi.quantity,
          price: oi.subtotal,
          name: (await ctx.db.get(menuItem!.productId))?.name || "Unknown Item",
          image: imageUrl,
          restaurant: cafeteriaName
        };
      }));

      return {
        id: order._id,
        restaurant: itemsWithDetails[0]?.restaurant || "DineXpress",
        items: itemsWithDetails,
        total: order.total,
        status: order.status,
        date: new Date(order.createdAt).toLocaleString(),
        image: itemsWithDetails[0]?.image || "",
        createdAt: order.createdAt
      };
    }));
  },
});

export const getRunnerStats = query({
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    
    const myDeliveredOrders = await ctx.db
      .query("orders")
      .withIndex("by_runner", q => q.eq("runnerId", userId))
      .filter(q => q.eq(q.field("status"), "DELIVERED"))
      .collect();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = startOfToday - (7 * 24 * 60 * 60 * 1000);

    let todayEarnings = 0;
    let weekEarnings = 0;

    for (const order of myDeliveredOrders) {
      const commission = order.total * 0.1;
      if (order.updatedAt >= startOfToday) {
        todayEarnings += commission;
      }
      if (order.updatedAt >= startOfWeek) {
        weekEarnings += commission;
      }
    }

    const availableOrders = await ctx.db
      .query("orders")
      .withIndex("by_status", q => q.eq("status", "PLACED"))
      .collect();
    
    const availableCount = availableOrders.filter(o => !o.runnerId).length;
    const runner = await ctx.db.get(userId);

    return {
      todayEarnings,
      weekEarnings,
      totalEarnings: myDeliveredOrders.reduce((sum, o) => sum + (o.total * 0.1), 0),
      availableCount,
      rating: runner?.runnerAvgRating || 0,
    };
  },
});

export const get = query({
    args: { orderId: v.id("orders") },
    handler: async (ctx, { orderId }) => {
        const order = await ctx.db.get(orderId);
        if (!order) return null;

        const orderItems = await ctx.db
            .query("orderItems")
            .withIndex("by_order", q => q.eq("orderId", order._id))
            .collect();

        const itemsWithDetails = await Promise.all(orderItems.map(async (oi) => {
            const menuItem = await ctx.db.get(oi.menuItemId);
            let cafeteriaName = "Unknown Cafeteria";
            
            if (menuItem) {
                await ctx.db.get(menuItem.productId);
                const cafeteria = await ctx.db.get(menuItem.cafeteriaId);
                if (cafeteria) cafeteriaName = cafeteria.name;
            }

            return {
                id: oi._id,
                menuItemId: oi.menuItemId,
                quantity: oi.quantity,
                menu_items: {
                    products: { name: (await ctx.db.get(menuItem!.productId))?.name || "Unknown Item" },
                    cafeterias: { name: cafeteriaName }
                }
            };
        }));

        let runner = null;
        if (order.runnerId) {
            runner = await ctx.db.get(order.runnerId);
        }

        return {
            ...order,
            id: order._id,
            customer_name: (await ctx.db.get(order.userId))?.name || "Customer",
            order_items: itemsWithDetails,
            runner_info: runner ? {
                name: runner.name,
                rating: runner.runnerAvgRating || 4.5,
            } : null
        };
    }
});

export const rateRunner = mutation({
  args: {
    orderId: v.id("orders"),
    rating: v.number(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, { orderId, rating, comment }) => {
    const userId = await getUserId(ctx);
    const order = await ctx.db.get(orderId);
    if (!order) throw new Error("Order not found");
    if (!order.runnerId) throw new Error("No runner assigned to this order");

    const existing = await ctx.db
      .query("runnerRatings")
      .withIndex("by_runner_and_order", q => q.eq("runnerId", order.runnerId!).eq("orderId", orderId))
      .unique();
    if (existing) throw new Error("Already rated");

    const now = Date.now();
    await ctx.db.insert("runnerRatings", {
      runnerId: order.runnerId,
      userId,
      orderId,
      rating,
      comment,
      createdAt: now,
      updatedAt: now,
    });

    const runner = await ctx.db.get(order.runnerId);
    if (runner) {
      const currentTotal = runner.runnerTotalRatings || 0;
      const currentAvg = runner.runnerAvgRating || 0;
      const newTotal = currentTotal + 1;
      const newAvg = ((currentAvg * currentTotal) + rating) / newTotal;

      await ctx.db.patch(order.runnerId, {
        runnerTotalRatings: newTotal,
        runnerAvgRating: newAvg,
      });
    }
  },
});

export const rateMenuItems = mutation({
  args: {
    orderId: v.id("orders"),
    ratings: v.array(
      v.object({
        menuItemId: v.id("menuItems"),
        rating: v.number(),
      })
    ),
  },
  handler: async (ctx, { orderId, ratings }) => {
    const userId = await getUserId(ctx);
    const order = await ctx.db.get(orderId);
    if (!order) throw new Error("Order not found");

    const now = Date.now();

    for (const itemRating of ratings) {
      await ctx.db.insert("ratings", {
        userId,
        menuItemId: itemRating.menuItemId,
        rating: itemRating.rating,
        createdAt: now,
      });

      const menuItem = await ctx.db.get(itemRating.menuItemId);
      if (menuItem) {
        const currentTotal = menuItem.totalRatings || 0;
        const currentAvg = menuItem.avgRating || 0;
        const newTotal = currentTotal + 1;
        const newAvg = ((currentAvg * currentTotal) + itemRating.rating) / newTotal;

        await ctx.db.patch(itemRating.menuItemId, {
          totalRatings: newTotal,
          avgRating: newAvg,
        });

        const cafeteria = await ctx.db.get(menuItem.cafeteriaId);
        if (cafeteria) {
            const cafTotal = cafeteria.totalRatings || 0;
            const cafAvg = cafeteria.avgRating || 0;
            const newCafTotal = cafTotal + 1;
            const newCafAvg = ((cafAvg * cafTotal) + itemRating.rating) / newCafTotal;

            await ctx.db.patch(menuItem.cafeteriaId, {
                totalRatings: newCafTotal,
                avgRating: newCafAvg,
            });
        }
      }
    }
  },
});

export const checkIfItemsRated = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    const userId = await getMaybeUserId(ctx);
    if (!userId) return false;

    const orderItems = await ctx.db
      .query("orderItems")
      .withIndex("by_order", q => q.eq("orderId", orderId))
      .collect();
    
    if (orderItems.length === 0) return false;

    const rating = await ctx.db
      .query("ratings")
      .filter(q => q.eq(q.field("userId"), userId))
      .filter(q => q.eq(q.field("menuItemId"), orderItems[0].menuItemId))
      .first();

    return !!rating;
  }
});

export const checkIfRated = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    const order = await ctx.db.get(orderId);
    if (!order || !order.runnerId) return false;

    const userId = await getMaybeUserId(ctx);
    if (!userId) return false;

    const existing = await ctx.db
      .query("runnerRatings")
      .withIndex("by_runner_and_order", q => q.eq("runnerId", order.runnerId!).eq("orderId", orderId))
      .unique();
    
    return !!existing;
  }
});

export const getIncomingMessages = query({
  handler: async (ctx) => {
    const userId = await getMaybeUserId(ctx);
    if (!userId) return [];

    const myOrdersAsCustomer = await ctx.db
      .query("orders")
      .withIndex("by_user", q => q.eq("userId", userId))
      .collect();
    
    const myOrdersAsRunner = await ctx.db
      .query("orders")
      .withIndex("by_runner", q => q.eq("runnerId", userId))
      .collect();

    const allMyOrders = [...myOrdersAsCustomer, ...myOrdersAsRunner];
    const incomingMessages: any[] = [];

    for (const order of allMyOrders) {
      if (!order.chats) continue;
      const unread = order.chats.filter(c => !c.read && c.senderId !== userId);
      for (const msg of unread) {
          const sender = await ctx.db.get(msg.senderId);
          incomingMessages.push({
              ...msg,
              orderId: order._id,
              senderName: sender?.name || "Someone",
          });
      }
    }
    return incomingMessages;
  }
});

export const markMessagesAsRead = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    const userId = await getMaybeUserId(ctx);
    if (!userId) return;
    const order = await ctx.db.get(orderId);
    if (!order || !order.chats) return;

    const updatedChats = order.chats.map(c => {
      if (c.senderId !== userId) return { ...c, read: true };
      return c;
    });
    await ctx.db.patch(orderId, { chats: updatedChats });
  }
});

export const getLatestDeliveredUnrated = query({
  handler: async (ctx) => {
    const userId = await getMaybeUserId(ctx);
    if (!userId) return null;

    const latestDelivered = await ctx.db
      .query("orders")
      .withIndex("by_user", q => q.eq("userId", userId))
      .filter(q => q.eq(q.field("status"), "DELIVERED"))
      .order("desc")
      .first();

    if (!latestDelivered) return null;

    const rating = await ctx.db
      .query("runnerRatings")
      .withIndex("by_runner_and_order", q => 
        q.eq("runnerId", latestDelivered.runnerId!).eq("orderId", latestDelivered._id)
      )
      .unique();

    if (rating) return null;

    return { ...latestDelivered, id: latestDelivered._id };
  }
});

export const addChatMessage = mutation({
  args: { orderId: v.id("orders"), message: v.string() },
  handler: async (ctx, { orderId, message }) => {
    const senderId = await getUserId(ctx);
    const order = await ctx.db.get(orderId);
    if (!order) throw new Error("Order not found");
    const now = Date.now();
    const newChat = { senderId, message, read: false, createdAt: now };
    await ctx.db.patch(orderId, { chats: [...(order.chats || []), newChat], updatedAt: now });
  },
});
