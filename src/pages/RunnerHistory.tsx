"use client";

import { useState, useMemo } from "react";
import { Copy, AlertCircle, CheckCircle2, Clock, MapPin } from "lucide-react";
import ComplaintModal from "../components/ComplaintModal";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  runner_id?: string;
  delivery_address?: string;
  total: number;
  commission?: number;
  status: "DELIVERED" | "PENDING" | string;
  order_items?: { menu_items?: { cafeterias?: { name: string } }[] }[];
}

interface RunnerHistoryPageProps {
  orders?: Order[];
  runnerId?: string;
}

export default function RunnerHistory({ orders: initialOrders = [], runnerId }: RunnerHistoryPageProps) {
  const [orders] = useState<Order[]>(initialOrders);
  const [copied, setCopied] = useState<string | null>(null);
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");

  const mine = useMemo(() => (runnerId ? orders.filter((o) => o.runner_id === runnerId) : orders), [orders, runnerId]);
  const delivered = mine.filter((o) => o.status === "DELIVERED");
  const pending = mine.filter((o) => o.status !== "DELIVERED");

  const handleCopy = (ticketId: string) => {
    navigator.clipboard.writeText(ticketId);
    setCopied(ticketId);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleReportIssue = (orderId: string) => {
    setSelectedOrderId(orderId);
    setComplaintModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 pt-20">
      <main className="max-w-2xl mx-auto px-6 space-y-10">
        
        {/* Title Section (Minimal) */}
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Order History</h1>
          <p className="text-sm text-gray-500 font-medium">Review your past deliveries and earnings.</p>
        </div>

        {/* Pending Section */}
        {pending.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-2 px-1">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Active & Pending</h2>
            </div>
            <div className="space-y-4">
              {pending.map(order => (
                <OrderCard key={order.id} order={order} onCopy={handleCopy} onReport={handleReportIssue} copied={copied} />
              ))}
            </div>
          </section>
        )}

        {/* Completed Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 px-1">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Completed</h2>
          </div>
          {delivered.length === 0 && pending.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-[32px] p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <Clock size={32} />
              </div>
              <p className="text-gray-500 font-bold">No orders recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {delivered.map(order => (
                <OrderCard key={order.id} order={order} onCopy={handleCopy} onReport={handleReportIssue} copied={copied} />
              ))}
            </div>
          )}
        </section>
      </main>

      <ComplaintModal
        isOpen={complaintModalOpen}
        onClose={() => setComplaintModalOpen(false)}
        orderId={selectedOrderId}
      />
    </div>
  );
}

function OrderCard({ order, onCopy, onReport, copied }: { order: Order; onCopy: (id: string) => void; onReport: (id: string) => void; copied: string | null }) {
  const isDelivered = order.status === "DELIVERED";

  return (
    <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-tight">ID: {order.id.slice(0, 8)}</span>
            <button onClick={() => onCopy(order.id)} className="text-gray-300 hover:text-gray-900 transition-colors">
              <Copy size={14} className={copied === order.id ? "text-green-500" : ""} />
            </button>
          </div>
          <h3 className="text-lg font-bold text-gray-900">{order.order_items?.[0]?.menu_items?.[0]?.cafeterias?.name || "Multiple Vendors"}</h3>
        </div>
        <div className={cn(
          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
          isDelivered ? "bg-green-50 text-green-600 border-green-100" : "bg-amber-50 text-amber-600 border-amber-100"
        )}>
          {isDelivered ? "Delivered" : "In Progress"}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
            <MapPin size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Destination</p>
            <p className="text-sm font-semibold text-gray-700">{order.delivery_address || "N/A"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Total</p>
            <p className="text-lg font-black text-gray-900">₦{order.total.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Commission</p>
            <p className="text-lg font-black text-green-600">+₦{(order.commission || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
         <button onClick={() => onReport(order.id)} className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors">
           Report an issue
         </button>
         {isDelivered && (
           <div className="flex items-center gap-1.5 text-green-600">
             <CheckCircle2 size={16} />
             <span className="text-xs font-bold">Success</span>
           </div>
         )}
      </div>
    </div>
  );
}
