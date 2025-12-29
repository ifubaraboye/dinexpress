"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

type ChatMessage = {
  id: string | number;
  order_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  read?: boolean;
  sender?: { id: string; full_name?: string | null } | null;
};

type ChatPayload = {
  messages: ChatMessage[];
  order_status: string;
  current_user_id: string;
  peer: { id: string; full_name?: string | null } | null;
};

export default function ChatPanel({
  orderId,
  open,
  onClose,
}: {
  orderId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [me, setMe] = useState<string | null>(null);
  const [peerName, setPeerName] = useState("Chat");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  const getToken = () =>
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  /* ----------------------------------------
     Fetch messages
  ---------------------------------------- */
  const fetchMessages = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/api/chats/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to load chat");

      const data: ChatPayload = await res.json();

      setMessages(data.messages || []);
      setMe(data.current_user_id);
      setPeerName(data.peer?.full_name || "Chat");
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Failed to load chat");
    }
  };

  /* ----------------------------------------
     Initial load + polling
  ---------------------------------------- */
  useEffect(() => {
    if (!open) return;

    fetchMessages().then(() => {
      const token = getToken();
      if (!token) return;

      fetch(`${API_BASE_URL}/api/chats/${orderId}/mark-read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => {});
    });

    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [open, orderId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const canSend = useMemo(
    () => input.trim().length > 0 && !busy,
    [input, busy]
  );

  /* ----------------------------------------
     Send message
  ---------------------------------------- */
  const send = async () => {
    if (!canSend) return;

    setBusy(true);
    try {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(
        `${API_BASE_URL}/api/chats/${orderId}/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: input.trim() }),
        }
      );

      if (!res.ok) throw new Error("Failed to send message");

      setInput("");
      await fetchMessages();

      fetch(`${API_BASE_URL}/api/chats/${orderId}/mark-read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => {});
    } catch (err: any) {
      setError(err?.message || "Failed to send message");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/30">
      <div className="mx-auto w-full max-w-md rounded-t-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-[#ffe3d7]" />
            <div className="leading-tight">
              <div className="text-sm font-semibold">{peerName}</div>
              <div className="text-xs text-gray-500">Active now</div>
            </div>
          </div>
          <button
            aria-label="Close chat"
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto space-y-3 px-4 py-4">
          {error && <div className="text-xs text-red-600">{error}</div>}

          {messages.map((m) => {
            const mine = m.sender_id === me;
            return (
              <div
                key={m.id}
                className={`flex ${
                  mine ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
                    mine
                      ? "bg-[#ff6b6b] text-white"
                      : "bg-gray-100 text-[#252525]"
                  }`}
                >
                  <div>{m.message}</div>
                  <div
                    className={`mt-1 text-[10px] ${
                      mine
                        ? "text-white/80"
                        : "text-gray-500"
                    }`}
                  >
                    {new Date(m.created_at).toLocaleTimeString(
                      [],
                      { hour: "numeric", minute: "2-digit" }
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>

        <div className="flex items-center gap-2 border-t p-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message"
            className="h-11 flex-1 rounded-full border px-4 text-sm outline-none"
          />
          <button
            onClick={send}
            disabled={!canSend}
            className="h-11 w-11 rounded-full bg-[#bf1f1b] text-white disabled:opacity-50"
            aria-label="Send"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
}
