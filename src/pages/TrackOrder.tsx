"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { 
  ChevronLeft, 
  MapPin, 
  CheckCircle2, 
  Clock,
  Store,
  MessageSquare,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import OrderSuccessModal from "@/components/OrderSuccessModal";
import ComplaintDrawer from "@/components/ComplaintDrawer";
import ChatPanel from "@/components/ChatPanel";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type OrderStatus = "PLACED" | "CONFIRMED" | "PREPARING" | "PICKED_UP" | "ARRIVED_AT_DELIVERY" | "DELIVERED";

const TRACKING_STEPS = [
  { status: "PLACED", label: "Order Placed", description: "Your order has been received by the restaurant." },
  { status: "CONFIRMED", label: "Confirmed", description: "The restaurant has confirmed your order." },
  { status: "PREPARING", label: "Preparing Food", description: "The chef is cooking your delicious meal." },
  { status: "PICKED_UP", label: "On the Way", description: "Your runner has picked up your order and is heading to you." },
  { status: "ARRIVED_AT_DELIVERY", label: "Nearby", description: "Your runner is almost at your location!" },
  { status: "DELIVERED", label: "Delivered", description: "Enjoy your meal!" },
];

export default function TrackOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  
  const orderData = useQuery(api.orders.get, { 
      orderId: orderId as Id<"orders"> 
  });
  const currentUser = useQuery(api.users.current);
  const updateStatus = useMutation(api.orders.updateStatus);

  useEffect(() => {
    if (orderData?.status === "DELIVERED") {
      setIsSuccessModalOpen(true);
    }
  }, [orderData?.status]);

  useEffect(() => {
    if (searchParams.get("openChat") === "true") {
      setIsChatOpen(true);
    }
  }, [searchParams]);

  const handleConfirmDelivery = async () => {
    if (!orderData) return;
    setConfirming(true);
    try {
      await updateStatus({
        orderId: orderData._id,
        status: "DELIVERED"
      });
      toast.success("Delivery confirmed!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to confirm delivery");
    } finally {
      setConfirming(false);
    }
  };

  if (orderData === undefined) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-red-600" size={32} />
      </div>
    );
  }

  if (orderData === null) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white px-6 text-center">
        <h2 className="text-2xl font-black text-gray-900 mb-2">Order Not Found</h2>
        <p className="text-gray-500 mb-8">We couldn't find the order you're looking for.</p>
        <button onClick={() => navigate("/reorder")} className="h-14 px-8 rounded-2xl bg-red-600 text-white font-bold cursor-pointer">
          Go to My Orders
        </button>
      </div>
    );
  }

  const currentStatus = orderData.status as OrderStatus;
  const currentStepIndex = Math.max(0, TRACKING_STEPS.findIndex(s => s.status === currentStatus));
  const restaurantName = (orderData.order_items?.[0] as any)?.menu_items?.cafeterias?.name || "Restaurant";

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-32 pt-20">
      <header className="px-6 max-w-2xl mx-auto mb-8 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white rounded-full transition-colors cursor-pointer">
          <ChevronLeft size={24} />
        </button>
        <div className="bg-white border border-gray-100 px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm">
           Track: {orderData.id.slice(-8)}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 space-y-8">
        {/* Live Status Card */}
        <section className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-8">
           <div className="flex justify-between items-start">
              <div>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Live Status</h2>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{TRACKING_STEPS[currentStepIndex]?.label || currentStatus}</h3>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600"><Clock size={24} /></div>
           </div>

           {currentStatus === "ARRIVED_AT_DELIVERY" && (
              <div className="bg-red-50 p-6 rounded-[32px] border border-red-100 animate-in zoom-in-95 duration-500">
                 <p className="text-sm font-bold text-red-900 mb-4 text-center">Your runner has arrived! Please confirm when you've received your items.</p>
                 <Button 
                   onClick={handleConfirmDelivery}
                   disabled={confirming}
                   className="w-full h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black shadow-lg shadow-red-100 cursor-pointer"
                 >
                   {confirming ? <Loader2 className="animate-spin" size={24} /> : "Confirm Delivery"}
                 </Button>
              </div>
           )}
           
           <div className="space-y-0 pt-4">
              {TRACKING_STEPS.map((step, idx) => {
                const isCompleted = idx < currentStepIndex;
                const isActive = idx === currentStepIndex;
                return (
                  <div key={step.status} className="flex gap-6 relative">
                    {idx < TRACKING_STEPS.length - 1 && (
                      <div className={cn("absolute left-[19px] top-10 w-[2px] h-[calc(100%-24px)] z-0", isCompleted ? "bg-red-600" : "bg-gray-100")} />
                    )}
                    <div className="relative z-10 py-1">
                       <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", isCompleted ? "bg-red-600 text-white" : isActive ? "bg-red-600 text-white shadow-lg ring-4 ring-red-50" : "bg-gray-50 text-gray-300")}>
                          {isCompleted ? <CheckCircle2 size={18} /> : isActive ? <div className="w-2 h-2 bg-white rounded-full animate-pulse" /> : <div className="w-1.5 h-1.5 bg-gray-200 rounded-full" />}
                       </div>
                    </div>
                    <div className={cn("pb-10 transition-opacity", isActive ? "opacity-100" : "opacity-40")}>
                       <h4 className={cn("text-lg font-bold tracking-tight", isCompleted ? "text-gray-400" : "text-gray-900")}>{step.label}</h4>
                       <p className="text-sm text-gray-500 font-medium mt-1">{step.description}</p>
                    </div>
                  </div>
                );
              })}
           </div>
        </section>

        {orderData.runner_info && (
            <section className="bg-gray-900 rounded-[32px] p-6 text-white shadow-xl flex items-center justify-between">
               <div className="flex items-center gap-4 overflow-hidden">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/20 bg-gray-800 flex items-center justify-center flex-shrink-0"><span className="text-xl font-black">{orderData.runner_info.name.charAt(0)}</span></div>
                  <div className="overflow-hidden">
                     <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Your Runner</p>
                     <h4 className="text-lg font-bold truncate">{orderData.runner_info.name}</h4>
                     <div className="flex items-center gap-1 mt-1"><CheckCircle2 size={12} className="text-blue-400" /><span className="text-xs font-medium text-white/70">Verified Runner • ⭐ {orderData.runner_info.rating.toFixed(1)}</span></div>
                  </div>
               </div>
               <div className="flex gap-2">
                  <button 
                    onClick={() => setIsChatOpen(true)}
                    className="h-14 px-6 rounded-[20px] bg-white/10 hover:bg-white/20 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                     <MessageSquare size={20} />
                     <span className="font-bold text-sm">Chat</span>
                  </button>
               </div>
            </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-red-50 rounded-xl text-red-600"><Store size={20} /></div>
                 <div><p className="text-[10px] font-bold text-gray-400 uppercase">Restaurant</p><h4 className="font-bold text-gray-900">{restaurantName}</h4></div>
              </div>
           </div>
           <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-gray-50 rounded-xl text-gray-400"><MapPin size={20} /></div>
                 <div><p className="text-[10px] font-bold text-gray-400 uppercase">Delivery Address</p><h4 className="font-bold text-gray-900">{orderData.deliveryAddress}</h4></div>
              </div>
           </div>
        </div>
      </main>

      {orderData && (
        <OrderSuccessModal 
          isOpen={isSuccessModalOpen} 
          onClose={() => setIsSuccessModalOpen(false)} 
          order={orderData}
          onOpenComplaintModal={() => {
              setIsComplaintModalOpen(true);
          }}
        />
      )}

      {orderData && (
        <ComplaintDrawer 
          isOpen={isComplaintModalOpen}
          onClose={() => setIsComplaintModalOpen(false)}
          orderId={orderData.id}
        />
      )}

      {orderData && currentUser && (
        <ChatPanel 
          orderId={orderData.id}
          open={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          currentUserId={currentUser._id}
        />
      )}
    </div>
  );
}