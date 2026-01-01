import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";

const http = httpRouter();

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    console.log("=== Webhook received ===");
    
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    
    // Debug logs
    console.log("Secret exists:", !!webhookSecret);
    console.log("Secret starts with whsec_:", webhookSecret?.startsWith("whsec_"));
    console.log("Secret length:", webhookSecret?.length);
    
    if (!webhookSecret) {
      console.error("CLERK_WEBHOOK_SECRET not set");
      return new Response("Missing CLERK_WEBHOOK_SECRET", { status: 500 });
    }

    const svix_id = request.headers.get("svix-id");
    const svix_signature = request.headers.get("svix-signature");
    const svix_timestamp = request.headers.get("svix-timestamp");

    console.log("Headers:", {
      hasSvixId: !!svix_id,
      hasSvixSignature: !!svix_signature,
      hasSvixTimestamp: !!svix_timestamp,
    });

    if (!svix_id || !svix_signature || !svix_timestamp) {
      console.error("Missing Svix headers");
      return new Response("Error: Missing Svix headers", { status: 400 });
    }

    const body = await request.text();
    console.log("Body length:", body.length);
    
    const svixHeaders = {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    };

    const wh = new Webhook(webhookSecret);
    let evt: any;

    try {
      evt = wh.verify(body, svixHeaders);
      console.log("✅ Webhook verified successfully");
      console.log("Event type:", evt.type);
    } catch (err) {
      console.error("❌ Webhook verification failed:", err);
      const error = err as Error;
      console.error("Error name:", error?.name);
      console.error("Error message:", error?.message);
      return new Response("Error: Verification error", { status: 400 });
    }

    const eventType = evt.type;
    
    if (eventType === "user.created" || eventType === "user.updated") {
      console.log("Processing user upsert for:", evt.data.id);
      await ctx.runMutation(internal.users.upsertFromClerk, {
        data: evt.data,
      });
    } else if (eventType === "user.deleted") {
      const clerkUserId = evt.data.id;
      if (clerkUserId) {
        console.log("Processing user deletion for:", clerkUserId);
        await ctx.runMutation(internal.users.deleteFromClerk, {
          clerkUserId,
        });
      }
    }

    console.log("=== Webhook processed successfully ===");
    return new Response(null, { status: 200 });
  }),
});

export default http;