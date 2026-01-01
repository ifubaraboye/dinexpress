"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { 
  ChevronLeft, 
  MapPin, 
  MessageSquare, 
  CheckCircle2, 
  Store,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import ChatPanel from "@/components/ChatPanel";

const STATUS_STEPS = [
  { status: "CONFIRMED", label: "Order Accepted", description: "You have successfully claimed this order." },
  { status: "PREPARING", label: "At Restaurant", description: "Let the kitchen know you've arrived or they are cooking." },
  { status: "PICKED_UP", label: "Order Picked Up", description: "Collect the items and start the delivery." },
  { status: "ARRIVED_AT_DELIVERY", label: "At Destination", description: "You are at the customer's location." },
];

export default function ActiveOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [updating, setUpdating] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const order = useQuery(api.orders.get, { orderId: orderId as Id<"orders"> });
  const currentUser = useQuery(api.users.current);
  const updateStatus = useMutation(api.orders.updateStatus);

  useEffect(() => {
    if (searchParams.get("openChat") === "true") {
      setIsChatOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (order?.status === "DELIVERED") {
      toast.success("Order completed by customer!");
      const timer = setTimeout(() => {
        navigate("/runner/orders");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [order?.status, navigate]);

  if (order === undefined || currentUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-red-600" size={32} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
        <h2 className="text-xl font-bold mb-4">Order not found</h2>
        <Button onClick={() => navigate("/runner/orders")}>Back to Orders</Button>
      </div>
    );
  }

  const currentStatus = order.status;
  const currentStepIndex = Math.max(0, STATUS_STEPS.findIndex(s => s.status === currentStatus));

  const handleUpdateStatus = async () => {
    const nextStep = STATUS_STEPS[currentStepIndex + 1];
    if (!nextStep) return;

    setUpdating(true);
    try {
      await updateStatus({ 
          orderId: order._id, 
          status: nextStep.status as any 
      });
      toast.success(`Progress updated`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const restaurantName = (order.order_items?.[0] as any)?.menu_items?.cafeterias?.name || "Restaurant";

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-32 pt-20">
      
      {/* Header Info */}
      <header className="px-6 max-w-2xl mx-auto mb-8 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white rounded-full transition-colors cursor-pointer">
          <ChevronLeft size={24} />
        </button>
        <div className="bg-white border border-gray-100 px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm">
           ID: {String(order.id).slice(-8)}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 space-y-8">
        
        {/* Modern Vertical Timeline Section */}
        <section className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-8">
           <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Live Progress</h2>
           
           <div className="space-y-0">
              {STATUS_STEPS.map((step, idx) => {
                const isCompleted = idx < currentStepIndex;
                const isActive = idx === currentStepIndex;

                return (
                  <div key={step.status} className="flex gap-6 relative group">
                    {/* Timeline vertical line */}
                    {idx < STATUS_STEPS.length - 1 && (
                      <div className={cn(
                        "absolute left-[19px] top-10 w-[2px] h-[calc(100%-24px)] z-0",
                        isCompleted ? "bg-red-600" : "bg-gray-100"
                      )} />
                    )}

                    {/* Timeline Node */}
                    <div className="relative z-10 py-1">
                       <div className={cn(
                         "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                         isCompleted ? "bg-red-600 text-white" : 
                         isActive ? "bg-red-600 text-white shadow-lg shadow-red-200 ring-4 ring-red-50" : 
                         "bg-gray-50 text-gray-300"
                       )}>
                          {isCompleted ? <CheckCircle2 size={18} /> : 
                           isActive ? <div className="w-2 h-2 bg-white rounded-full animate-pulse" /> : 
                           <div className="w-1.5 h-1.5 bg-gray-200 rounded-full" />}
                       </div>
                    </div>

                    {/* Timeline Content */}
                    <div className={cn(
                      "pb-10 transition-all duration-500",
                      isActive ? "opacity-100 translate-x-0" : "opacity-40"
                    )}>
                       <h3 className={cn(
                         "text-lg font-bold tracking-tight",
                         isCompleted ? "text-gray-400" : "text-gray-900"
                       )}>
                         {step.label}
                       </h3>
                       <p className="text-sm text-gray-500 font-medium mt-1">
                         {step.description}
                       </p>

                       {isActive && (
                          <div className="mt-6">
                             <Button 
                               className="h-12 rounded-xl bg-gray-900 hover:bg-black text-white px-8 font-bold text-sm transition-all animate-in fade-in slide-in-from-left-4 duration-500 cursor-pointer"
                               onClick={handleUpdateStatus}
                               disabled={updating || currentStatus === "ARRIVED_AT_DELIVERY" || currentStatus === "DELIVERED"}
                             >
                               {updating ? "Updating..." : 
                                currentStatus === "CONFIRMED" ? "Start Preparing" :
                                currentStatus === "PREPARING" ? "Confirm Pickup" :
                                currentStatus === "PICKED_UP" ? "I have Arrived" :
                                currentStatus === "ARRIVED_AT_DELIVERY" ? "Waiting for Customer" : "Finish"}
                             </Button>
                          </div>
                       )}
                    </div>
                  </div>
                );
              })}
           </div>
        </section>
        {/* Timeline nodal section ends */}

        {/* Delivery Notes / Instructions */}
        {order.deliveryNotes && (
            <section className="bg-blue-50 rounded-[32px] p-6 border border-blue-100 shadow-sm flex items-start gap-4">
               <div className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm">
                  <MessageSquare size={20} />
               </div>
               <div>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Instructions for You</p>
                  <p className="text-sm font-bold text-blue-900 leading-relaxed italic">"{order.deliveryNotes}"</p>
               </div>
            </section>
        )}

        {/* Location & Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Details Card */}
           <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                    <Store size={22} />
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pick Up</p>
                    <p className="font-bold text-gray-900 leading-tight">{restaurantName}</p>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                    <MapPin size={22} />
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Deliver To</p>
                    <p className="font-bold text-gray-900 leading-tight">{order.customer_name}</p>
                    <p className="text-[10px] font-medium text-gray-500 mt-1">{order.deliveryAddress}</p>
                 </div>
              </div>
           </div>

           {/* Quick Actions */}
           <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm flex flex-col justify-center gap-3">
              <Button 
                onClick={() => setIsChatOpen(true)}
                className="h-14 rounded-2xl bg-gray-900 text-white gap-3 font-bold hover:bg-black cursor-pointer shadow-lg"
              >
                 <MessageSquare size={18} /> Chat with Customer
              </Button>
              {/* <Button variant="outline" className="h-14 rounded-2xl border-gray-100 gap-3 font-bold hover:bg-gray-50 cursor-pointer" asChild>
                 <a href={`tel:${order.recipientPhone || ""}`}>
                    <Phone size={18} className="text-green-500" /> Call Customer
                 </a>
              </Button> */}
           </div>
        </div>

        {/* Items Summary */}
        <section className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Order Details</h3>
              <span className="text-lg font-black text-gray-900">₦{order.total.toLocaleString()}</span>
           </div>
           <div className="space-y-4">
              {order.order_items?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center py-2">
                   <div className="flex items-center gap-4">
                      <span className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center font-black text-gray-400 text-xs">
                        {item.quantity}x
                      </span>
                      <span className="font-bold text-gray-700">{item.menu_items?.products?.name}</span>
                   </div>
                </div>
              ))}
           </div>
        </section>

      </main>

      {currentUser && (
        <ChatPanel 
          orderId={order._id}
          open={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          currentUserId={currentUser._id}
        />
      )}
    </div>
  );
}
