"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import OrderSuccessModal from "./OrderSuccessModal";
import ComplaintDrawer from "./ComplaintDrawer";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";

export default function GlobalOrderNotification() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const incomingMessages = useQuery(api.orders.getIncomingMessages);
  const markAsRead = useMutation(api.orders.markMessagesAsRead);

  // Track notified message timestamps to avoid repeat toasts
  const notifiedMessagesRef = useRef<Set<number>>(new Set());

  // 1. Handle Incoming Message Toasts
  useEffect(() => {
    if (incomingMessages && incomingMessages.length > 0) {
      incomingMessages.forEach((msg: any) => {
        // Only notify if we haven't seen this specific message timestamp yet
        if (!notifiedMessagesRef.current.has(msg.createdAt)) {
          
          // Check if we are ALREADY looking at this chat
          const isInThisChat = 
            location.pathname.includes(`/track/${msg.orderId}`) || 
            location.pathname.includes(`/runner/orders/${msg.orderId}`);

          if (!isInThisChat) {
            toast(msg.senderName, {
              description: msg.message,
              icon: <MessageSquare size={18} className="text-red-600" />,
              action: {
                label: "View",
                onClick: () => {
                    const baseUrl = location.pathname.startsWith('/runner') ? `/runner/orders/${msg.orderId}` : `/track/${msg.orderId}`;
                    navigate(`${baseUrl}?openChat=true`);
                },
              },
            });
          } else {
              // If we ARE in the chat, mark it as read immediately
              markAsRead({ orderId: msg.orderId });
          }
          
          notifiedMessagesRef.current.add(msg.createdAt);
        }
      });
    }
  }, [incomingMessages, location.pathname, navigate, markAsRead]);

  return null;
}