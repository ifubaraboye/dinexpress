"use client";

import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ChevronRight, 
  Package, 
  MapPin, 
  Clock, 
  Info, 
  CheckCircle2, 
  Search,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerFooter,
  DrawerClose
} from "@/components/ui/drawer";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  runner_id?: string;
  delivery_address?: string;
  total: number;
  status: "PLACED" | "DELIVERED" | "ACCEPTED" | string;
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"available" | "active">("available");
  const [previewOrder, setPreviewOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching orders
    setLoading(true);
    setTimeout(() => {
      setOrders([
        {
          id: "ord_123456",
          total: 3500,
          status: "PLACED",
          delivery_address: "Hostel A, Room 302",
          order_items: [
            { 
              id: "item_1", 
              quantity: 2, 
              menu_items: { 
                products: { name: "Jollof Rice & Chicken" }, 
                cafeterias: { name: "Dunnkayce" } 
              } 
            }
          ]
        },
        {
          id: "ord_789012",
          total: 1200,
          status: "PLACED",
          delivery_address: "LTL, Floor 2",
          order_items: [
            { 
              id: "item_2", 
              quantity: 1, 
              menu_items: { 
                products: { name: "Beef Burger" }, 
                cafeterias: { name: "Grills" } 
              } 
            }
          ]
        },
        {
          id: "ord_ACTIVE_1",
          total: 2800,
          status: "ACCEPTED",
          runner_id: "me",
          delivery_address: "Hostel C, Room 101",
          order_items: [
            { 
              id: "item_3", 
              quantity: 1, 
              menu_items: { 
                products: { name: "Chicken Wings" }, 
                cafeterias: { name: "BTO" } 
              } 
            }
          ]
        }
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const available = useMemo(() => orders.filter(o => !o.runner_id && o.status === "PLACED"), [orders]);
  const active = useMemo(() => orders.filter(o => o.runner_id === "me" && o.status !== "DELIVERED"), [orders]);

  const acceptOrder = (orderId: string) => {
    setBusyId(orderId);
    setTimeout(() => {
      toast.success("Order accepted!");
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, runner_id: "me", status: "ACCEPTED" } : o));
      setBusyId(null);
      setPreviewOrder(null);
      setActiveTab("active");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 pt-20 overflow-x-hidden">
      
      {/* Header Info (Minimal) */}
      <div className="px-6 max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Orders</h1>
        <p className="text-sm text-gray-500 font-medium">Find new orders or manage your current tasks.</p>
      </div>

      {/* Sliding Tab Selector */}
      <div className="px-6 max-w-2xl mx-auto mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 relative flex">
          <div 
            className={cn(
              "absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-red-600 rounded-xl shadow-md shadow-red-100 transition-all duration-300 ease-in-out",
              activeTab === "available" ? "left-1.5" : "left-[calc(50%+3px)]"
            )}
          />

          <button
            onClick={() => setActiveTab("available")}
            className={cn(
              "flex-1 py-3 rounded-xl cursor-pointer text-sm font-bold relative z-10 transition-colors duration-300",
              activeTab === "available" ? "text-white" : "text-gray-400 hover:text-gray-600"
            )}
          >
            Available ({available.length})
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={cn(
              "flex-1 py-3 rounded-xl cursor-pointer text-sm font-bold relative z-10 transition-colors duration-300",
              activeTab === "active" ? "text-white" : "text-gray-400 hover:text-gray-600"
            )}
          >
            My Active ({active.length})
          </button>
        </div>
      </div>

      {/* Swipe Transition Content */}
      <div className="relative max-w-2xl mx-auto overflow-hidden">
        <div 
          className={cn(
            "flex w-[200%] transition-transform duration-500 ease-in-out items-start",
            activeTab === "available" ? "translate-x-0" : "-translate-x-1/2"
          )}
        >
          {/* Available Orders Panel */}
          <div className={cn(
              "w-1/2 px-6 transition-opacity duration-500",
              activeTab === "available" ? "opacity-100" : "opacity-0 pointer-events-none"
          )}>
            <div className="space-y-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => <div key={i} className="h-48 bg-white rounded-[32px] animate-pulse border border-gray-50" />)}
                </div>
              ) : available.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[32px] border border-gray-100">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-200">
                    <Search size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Searching...</h3>
                  <p className="text-sm text-gray-400 font-medium">No new orders found in your area.</p>
                </div>
              ) : (
                available.map(order => (
                  <OrderCard key={order.id} order={order} onPreview={() => setPreviewOrder(order)} />
                ))
              )}
            </div>
          </div>

          {/* Active Orders Panel */}
          <div className={cn(
              "w-1/2 px-6 transition-opacity duration-500",
              activeTab === "active" ? "opacity-100" : "opacity-0 pointer-events-none"
          )}>
            <div className="space-y-6">
              {active.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[32px] border border-gray-100">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-200">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">All clear</h3>
                  <p className="text-sm text-gray-400 font-medium">You don't have any active deliveries.</p>
                </div>
              ) : (
                active.map(order => (
                  <OrderCard key={order.id} order={order} onPreview={() => setPreviewOrder(order)} isActive />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Preview Drawer */}
      <Drawer open={!!previewOrder} onOpenChange={(open) => !open && setPreviewOrder(null)}>
        <DrawerContent className="w-full rounded-t-[40px] border-none p-0">
          <div className="max-w-2xl mx-auto w-full p-8 pb-12">
            <DrawerHeader className="px-0 pt-0 pb-8 text-left">
              <DrawerTitle className="text-3xl font-black text-gray-900 tracking-tighter">Order Summary</DrawerTitle>
            </DrawerHeader>
            
            {previewOrder && (
              <div className="space-y-8 mb-10">
                <div className="flex items-start gap-5">
                  <div className="p-4 bg-red-50 rounded-[20px] text-red-600">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Drop-off Location</p>
                    <p className="text-xl font-bold text-gray-900 leading-tight">{previewOrder.delivery_address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="p-4 bg-gray-50 rounded-[20px] text-gray-400">
                    <Package size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Order Items</p>
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
            )}

            <div className="grid grid-cols-2 gap-4">
              <DrawerClose asChild>
                <button className="h-14 rounded-2xl font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors">
                  Close
                </button>
              </DrawerClose>
              {previewOrder?.runner_id === "me" ? (
                <Link 
                  to={`/runner/orders/${previewOrder.id}`}
                  className="h-14 rounded-2xl font-bold bg-gray-900 text-white hover:bg-black transition-colors shadow-lg shadow-gray-100 flex items-center justify-center gap-2"
                >
                  Manage Order
                  <ChevronRight size={18} />
                </Link>
              ) : (
                <button 
                  className="h-14 rounded-2xl font-bold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-100 active:scale-95 disabled:opacity-50 flex items-center justify-center"
                  onClick={() => previewOrder && acceptOrder(previewOrder.id)}
                  disabled={!!busyId}
                >
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
          <div className="w-14 h-14 rounded-[20px] bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
            <Package size={28} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-none mb-1.5">{order.order_items?.[0]?.menu_items?.cafeterias?.name || "Restaurant"}</h3>
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">ID: {order.id}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
           <p className="text-xl font-black text-gray-900 leading-none">₦{(order.total * 0.1).toLocaleString()}</p>
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Fee</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6 bg-gray-50/50 p-3 rounded-2xl">
        <div className="text-red-400 shrink-0">
          <MapPin size={16} />
        </div>
        <span className="text-sm font-semibold text-gray-600 line-clamp-1">{order.delivery_address}</span>
      </div>

      <button 
        className={cn(
          "w-full h-12 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95",
          isActive 
            ? "bg-gray-100 text-gray-600 hover:bg-gray-200" 
            : "bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-100"
        )}
        onClick={() => {
          if (isActive) {
            navigate(`/runner/orders/${order.id}`);
          } else {
            onPreview();
          }
        }}
      >
        {isActive ? "Manage Order" : "Preview Order"}
        <ChevronRight size={16} />
      </button>
    </div>
  );
}