import { useState } from "react";
import { Link } from "react-router-dom";
import { FloatingCart } from "../components/FloatingCart";
import { useCart } from "../../context/CartContext";
import { RestaurantProvider } from "../../context/RestaurantContext";
import { toast } from "sonner";
import { Clock, Package, RotateCcw, Loader2 } from "lucide-react";
import ComplaintDrawer from "../components/ComplaintDrawer";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

type OrderStatus = "PLACED" | "CONFIRMED" | "PREPARING" | "PICKED_UP" | "ARRIVED_AT_DELIVERY" | "DELIVERED" | "CANCELLED";

interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  restaurant: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  date: string;
  image: string;
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const styles = {
    PLACED: "bg-blue-50 text-blue-600 border-blue-100",
    CONFIRMED: "bg-cyan-50 text-cyan-600 border-cyan-100",
    PREPARING: "bg-orange-50 text-orange-600 border-orange-100",
    PICKED_UP: "bg-purple-50 text-purple-600 border-purple-100",
    ARRIVED_AT_DELIVERY: "bg-yellow-50 text-yellow-600 border-yellow-100",
    DELIVERED: "bg-green-50 text-green-600 border-green-100",
    CANCELLED: "bg-red-50 text-red-600 border-red-100",
  };

  const labels = {
    PLACED: "Placed",
    CONFIRMED: "Confirmed",
    PREPARING: "Preparing",
    PICKED_UP: "Picked Up",
    ARRIVED_AT_DELIVERY: "Arrived",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  };

  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${styles[status] || ""}`}>
      {labels[status] || status}
    </span>
  );
}

function OrderCard({ order, isHistory, onReport }: { order: Order; isHistory?: boolean; onReport?: (id: string) => void }) {
  const { addItem } = useCart();

  const handleReorder = () => {
    order.items.forEach(item => {
      addItem({
        id: item.menuItemId,
        name: item.name,
        price: item.price / item.quantity,
        image: order.image,
        restaurantName: order.restaurant,
        restaurantFee: 500,
      });
    });
    toast.success(`Reordered items from ${order.restaurant}`);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[24px] p-5 shadow-sm hover:shadow-md transition-shadow mb-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-4 overflow-hidden">
          <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
            <img src={order.image || "/dinelogonew.png"} alt={order.restaurant} className="w-full h-full object-cover" />
          </div>
          <div className="overflow-hidden">
            <h3 className="font-bold text-gray-900 text-base truncate">{order.restaurant}</h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5 truncate">{order.date}</p>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="space-y-2 mb-4">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <span className="text-gray-600 font-medium truncate pr-4">
              <span className="text-gray-400 font-bold mr-2">{item.quantity}x</span>
              {item.name}
            </span>
            <span className="text-gray-900 font-bold">₦{item.price.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Amount</span>
          <span className="text-lg font-black text-gray-900">₦{order.total.toLocaleString()}</span>
        </div>

        {isHistory ? (
          <div className="flex gap-2">
            <button 
              onClick={() => onReport?.(order.id)}
              className="px-4 py-2.5 bg-gray-50 text-gray-400 rounded-xl text-xs font-bold hover:text-red-500 transition-colors"
            >
              Report
            </button>
            <button 
              onClick={handleReorder}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors active:scale-95 shadow-sm shadow-red-100"
            >
              <RotateCcw size={14} />
              Reorder
            </button>
          </div>
        ) : (
          <Link 
            to={`/track/${order.id}`}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors shadow-sm"
          >
            Track Order
          </Link>
        )}
      </div>
    </div>
  );
}

export default function ReorderPage() {
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState("");

  const allOrders = useQuery(api.orders.listMyOrders);

  const activeOrders = (allOrders || []).filter(o => o.status !== "DELIVERED" && o.status !== "CANCELLED");
  const historyOrders = (allOrders || []).filter(o => o.status === "DELIVERED" || o.status === "CANCELLED");

  const handleReportIssue = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsDrawerOpen(true);
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-40 pt-20 overflow-y-auto">
      <div className="px-6 max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">My Orders</h1>
        <p className="text-sm text-gray-500 font-medium">Track ongoing orders or reorder favorites.</p>
      </div>

      <div className="px-6 max-w-2xl mx-auto mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 relative flex">
          <div 
            className={cn(
              "absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-red-600 rounded-xl shadow-md transition-all duration-300 ease-in-out",
              activeTab === "active" ? "left-1.5" : "left-[calc(50%+3px)]"
            )}
          />
          <button onClick={() => setActiveTab("active")} className={cn("flex-1 py-3 rounded-xl cursor-pointer text-sm font-bold relative z-10 transition-colors", activeTab === "active" ? "text-white" : "text-gray-400")}>
            Active Orders ({activeOrders.length})
          </button>
          <button onClick={() => setActiveTab("history")} className={cn("flex-1 py-3 rounded-xl cursor-pointer text-sm font-bold relative z-10 transition-colors", activeTab === "history" ? "text-white" : "text-gray-400")}>
            History ({historyOrders.length})
          </button>
        </div>
      </div>

      <div className="relative max-w-2xl mx-auto overflow-hidden">
         {allOrders === undefined ? (
           <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-red-600" size={32} />
           </div>
         ) : (
           <div className={cn("flex w-[200%] transition-transform duration-500", activeTab === "active" ? "translate-x-0" : "-translate-x-1/2")}>
              <div className="w-1/2 px-6">
                  {activeOrders.length > 0 ? activeOrders.map(o => (
                    <RestaurantProvider key={o.id} value={{ name: o.restaurant, deliveryFee: 500 }}>
                      <OrderCard order={o as any} />
                    </RestaurantProvider>
                  )) : (
                    <div className="text-center py-20 opacity-50"><Package size={48} className="mx-auto mb-4" /><p>No active orders.</p></div>
                  )}
              </div>
              <div className="w-1/2 px-6">
                  {historyOrders.length > 0 ? historyOrders.map(o => (
                    <RestaurantProvider key={o.id} value={{ name: o.restaurant, deliveryFee: 500 }}>
                      <OrderCard order={o as any} isHistory onReport={handleReportIssue} />
                    </RestaurantProvider>
                  )) : (
                    <div className="text-center py-20 opacity-50"><Clock size={48} className="mx-auto mb-4" /><p>No history yet.</p></div>
                  )}
              </div>
           </div>
         )}
      </div>

      <FloatingCart />
      <ComplaintDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} orderId={selectedOrderId} />
    </div>
  );
}
