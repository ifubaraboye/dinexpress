"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronRight, 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Loader2,
  MessageSquare
} from "lucide-react";
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerClose
} from "@/components/ui/drawer";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface Order {
  id: string;
  runner_id?: string;
  delivery_address?: string;
  delivery_notes?: string;
  customer_name: string;
  total: number;
  status: string;
  order_items?: { 
    id: string; 
    quantity: number; 
    menu_items?: { 
      products?: { name: string }; 
      cafeterias?: { name: string } 
    } 
  }[];
}

export default function RunnerOrders() {
  const navigate = useNavigate();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"available" | "active">("available");
  const [previewOrder, setPreviewOrder] = useState<Order | null>(null);

  const availableOrders = useQuery(api.orders.listAvailable);
  const activeOrders = useQuery(api.orders.listMyActive);
  const acceptOrderMutation = useMutation(api.orders.accept);

  const available = availableOrders || [];
  const active = activeOrders || [];
  const loading = availableOrders === undefined || activeOrders === undefined;

  const acceptOrder = async (orderId: string) => {
    console.log("Accepting order:", orderId);
    setBusyId(orderId);
    try {
      await acceptOrderMutation({ orderId: orderId as Id<"orders"> });
      toast.success("Order accepted!");
      setBusyId(null);
      setPreviewOrder(null);
      setActiveTab("active");
    } catch (error) {
      console.error("Failed to accept order:", error);
      toast.error("Failed to accept order");
      setBusyId(null);
    }
  };

  const handleManageOrder = (id: string) => {
    console.log("Navigating to manage order:", id);
    if (!id) {
        console.error("Order ID is missing");
        return;
    }
    setPreviewOrder(null);
    navigate(`/runner/orders/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 pt-20 overflow-x-hidden">
      <div className="px-6 max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Orders</h1>
        <p className="text-sm text-gray-500 font-medium">Find new orders or manage your current tasks.</p>
      </div>

      <div className="px-6 max-w-2xl mx-auto mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 relative flex">
          <div 
            className={cn(
              "absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-red-600 rounded-xl shadow-md transition-all duration-300 ease-in-out",
              activeTab === "available" ? "left-1.5" : "left-[calc(50%+3px)]"
            )}
          />
          <button onClick={() => setActiveTab("available")} className={cn("flex-1 py-3 rounded-xl cursor-pointer text-sm font-bold relative z-10 transition-colors", activeTab === "available" ? "text-white" : "text-gray-400")}>
            Available ({available.length})
          </button>
          <button onClick={() => setActiveTab("active")} className={cn("flex-1 py-3 rounded-xl cursor-pointer text-sm font-bold relative z-10 transition-colors", activeTab === "active" ? "text-white" : "text-gray-400")}>
            My Active ({active.length})
          </button>
        </div>
      </div>

      <div className="relative max-w-2xl mx-auto overflow-hidden">
        <div className={cn("flex w-[200%] transition-transform duration-500 ease-in-out", activeTab === "available" ? "translate-x-0" : "-translate-x-1/2")}>
          <div className="w-1/2 px-6">
            <div className="space-y-6">
              {loading ? (
                <div className="space-y-4">{[1, 2].map(i => <div key={i} className="h-48 bg-white rounded-[32px] animate-pulse border border-gray-50" />)}</div>
              ) : available.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[32px] border border-gray-100">
                  <span className="border animate-spin inline-block w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mb-4"></span>
                  {/* <Search size={32} className="mx-auto mb-4 text-gray-200" /> */}
                  <h3 className="text-lg font-bold">Finding Flavors</h3>
                </div>
              ) : (
                available.map(order => <OrderCard key={order.id} order={order as any} onPreview={() => { console.log("Previewing:", order.id); setPreviewOrder(order as any); }} />)
              )}
            </div>
          </div>
          <div className="w-1/2 px-6">
            <div className="space-y-6">
              {active.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[32px] border border-gray-100">
                  <CheckCircle2 size={32} className="mx-auto mb-4 text-gray-200" /><h3 className="text-lg font-bold">All clear</h3>
                </div>
              ) : (
                active.map(order => <OrderCard key={order.id} order={order as any} onPreview={() => { console.log("Previewing active:", order.id); setPreviewOrder(order as any); }} isActive />)
              )}
            </div>
          </div>
        </div>
      </div>

      <Drawer open={!!previewOrder} onOpenChange={(open) => !open && setPreviewOrder(null)}>
  {/* 
      1. Added 'max-h-[90vh]' and 'flex flex-col' to the DrawerContent itself.
      This forces the drawer to never exceed 90% of the viewport.
  */}
  <DrawerContent className="w-full rounded-t-[40px] border-none outline-none bg-white max-h-[90vh] flex flex-col">
    
    {/* 
        2. Changed container to 'h-full'.
        Removed padding here and moved it to children so the scrollbar hits the edge.
    */}
    <div className="max-w-2xl mx-auto w-full flex flex-col h-full overflow-hidden">
      
      {/* 3. Header: Added specific padding and shrink-0 */}
      <DrawerHeader className="px-8 pt-8 pb-4 text-left flex-shrink-0">
        <DrawerTitle className="text-2xl font-black text-gray-900 tracking-tighter">
          Order Summary
        </DrawerTitle>
      </DrawerHeader>
      
      {previewOrder && (
        /* 
           4. Scrollable Content:
           - Added 'px-8' (moved from container).
           - Kept 'flex-1', 'overflow-y-auto', 'min-h-0'.
           - This combination forces this specific div to scroll when space runs out.
        */
        <div className="flex-1 overflow-y-auto min-h-0 px-8 custom-scrollbar">
          <div className="space-y-8 pb-4"> {/* Reduced bottom padding here */}
            
            {/* Customer & Location */}
            <div className="flex items-start gap-5">
              <div className="p-4 bg-red-50 rounded-[20px] text-red-600 flex-shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Customer & Location</p>
                <p className="text-xl font-bold text-gray-900 leading-tight">{previewOrder.customer_name}</p>
                <p className="text-sm font-medium text-gray-500 mt-1">{previewOrder.delivery_address}</p>
              </div>
            </div>

            {/* Note from Customer */}
            {previewOrder.delivery_notes && (
              <div className="flex items-start gap-5 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <div className="p-2 bg-white rounded-xl text-blue-600 flex-shrink-0">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Note from Customer</p>
                  <p className="text-sm font-bold text-blue-900 leading-snug">"{previewOrder.delivery_notes}"</p>
                </div>
              </div>
            )}

            {/* Items to Collect */}
            <div className="flex items-start gap-5">
              <div className="p-4 bg-gray-50 rounded-[20px] text-gray-400 flex-shrink-0">
                <Package size={24} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Items to Collect</p>
                <div className="mt-3 space-y-3">
                  {previewOrder.order_items?.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-gray-50/50 p-3 rounded-xl">
                      <span className="text-sm font-bold text-gray-700">{item.menu_items?.products?.name}</span>
                      <span className="bg-white px-2 py-0.5 rounded-lg text-xs font-black text-gray-400 shadow-sm">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Est. Earning */}
            <div className="flex items-center justify-between py-6 border-t border-gray-100">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Est. Earning</span>
                <span className="text-3xl font-black text-gray-900">₦{(previewOrder.total * 0.1).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400 bg-gray-50 px-3 py-1.5 rounded-xl">
                <Clock size={14} />
                <span className="text-xs font-bold">~15 mins</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 
          5. Footer:
          - Added 'px-8' and 'pb-8' (moved from container).
          - Ensure bg-white is solid so content scrolls behind it.
      */}
      <div className="grid grid-cols-2 gap-4 pt-6 px-8 pb-8 flex-shrink-0 border-t border-gray-50 bg-white">
        <DrawerClose asChild>
          <button className="h-14 rounded-2xl font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 cursor-pointer">
            Close
          </button>
        </DrawerClose>
        {previewOrder?.runner_id ? (
          <button onClick={() => handleManageOrder(previewOrder.id)} className="h-14 rounded-2xl font-bold bg-gray-900 text-white flex items-center justify-center gap-2 cursor-pointer shadow-lg">
            Manage Order <ChevronRight size={18} />
          </button>
        ) : (
          <button className="h-14 rounded-2xl font-bold bg-red-600 text-white flex items-center justify-center shadow-lg" onClick={() => previewOrder && acceptOrder(previewOrder.id)} disabled={!!busyId}>
            {busyId ? <Loader2 className="animate-spin" size={24} /> : "Accept Order"}
          </button>
        )}
      </div>
    </div>
  </DrawerContent>
</Drawer>
    </div>
  );
}

function OrderCard({ order, onPreview, isActive }: { order: Order; onPreview: () => void; isActive?: boolean }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-[20px] bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-red-500 transition-colors"><Package size={28} /></div>
          <div><h3 className="text-lg font-bold text-gray-900 leading-none mb-1.5">{order.order_items?.[0]?.menu_items?.cafeterias?.name || "Restaurant"}</h3><span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">ID: {order.id?.slice(-8) || "..."}</span></div>
        </div>
        <div className="text-right"><p className="text-xl font-black text-gray-900 leading-none">₦{(order.total * 0.1).toLocaleString()}</p><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Fee</p></div>
      </div>
      <div className="flex items-center gap-3 mb-6 bg-gray-50/50 p-3 rounded-2xl"><div className="text-red-400 shrink-0"><MapPin size={16} /></div><span className="text-sm font-semibold text-gray-600 line-clamp-1">{order.delivery_address}</span></div>
      <div className={cn("w-full h-12 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer", isActive ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-100")} 
           onClick={(e) => { 
               e.stopPropagation(); 
               if (isActive) {
                   console.log("Navigating to active order:", order.id);
                   navigate(`/runner/orders/${order.id}`); 
               } else {
                   onPreview(); 
               }
           }}>
        {isActive ? "Manage Order" : "Preview Order"}<ChevronRight size={16} />
      </div>
    </div>
  );
}