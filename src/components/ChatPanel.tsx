"use client";

import { useEffect, useRef, useState } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";

export default function ChatPanel({
  orderId,
  open,
  onClose,
  currentUserId,
}: {
  orderId: string;
  open: boolean;
  onClose: () => void;
  currentUserId: string; // This should be the Convex user ID
}) {
  const [input, setInput] = useState("");
  const [sending, setSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const order = useQuery(api.orders.get, { orderId: orderId as Id<"orders"> });
  const sendMessage = useMutation(api.orders.addChatMessage);
  const markAsRead = useMutation(api.orders.markMessagesAsRead);

  const messages = order?.chats || [];
  
  useEffect(() => {
    if (open && messages.length > 0) {
        markAsRead({ orderId: orderId as Id<"orders"> });
    }
  }, [open, messages.length, orderId, markAsRead]);

  // Determine peer name (the other person)
  // If I am the customer, peer is runner. If I am the runner, peer is customer.
  const isCustomer = order?.userId === currentUserId;
  const peerName = isCustomer ? (order?.runner_info?.name || "Runner") : (order?.customer_name || "Customer");

  useEffect(() => {
    if (open) {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, open]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    setSubmitting(true);
    try {
      await sendMessage({
        orderId: orderId as Id<"orders">,
        message: input.trim(),
      });
      setInput("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg bg-white rounded-t-[40px] shadow-2xl flex flex-col h-[85vh] animate-in slide-in-from-bottom-10 duration-500">
        
        {/* Chat Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 font-black text-xl">
              {peerName.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 leading-none">{peerName}</h3>
              <p className="text-xs font-bold text-green-500 mt-1 uppercase tracking-widest">Active Chat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors cursor-pointer"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 px-10">
               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Send size={32} />
               </div>
               <p className="font-bold">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((m, idx) => {
              const isMine = m.senderId === currentUserId;
              return (
                <div
                  key={idx}
                  className={cn(
                    "flex flex-col",
                    isMine ? "items-end" : "items-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] px-5 py-4 rounded-[24px] text-sm font-medium leading-relaxed",
                      isMine
                        ? "bg-gray-900 text-white rounded-tr-none"
                        : "bg-gray-100 text-gray-800 rounded-tl-none"
                    )}
                  >
                    {m.message}
                  </div>
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-2 px-1">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-6 pt-2 flex-shrink-0">
          <div className="bg-gray-50 rounded-[32px] p-2 flex items-center gap-2 border border-gray-100 focus-within:border-red-200 transition-all">
            <input
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-transparent px-4 py-2 text-sm font-bold outline-none placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-100 active:scale-90 transition-all disabled:opacity-50 disabled:grayscale cursor-pointer"
            >
              {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}