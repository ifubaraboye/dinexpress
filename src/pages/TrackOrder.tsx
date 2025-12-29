"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  MapPin, 
  Package, 
  CheckCircle2, 
  Clock,
  Store,
  Phone,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type OrderStatus = "PLACED" | "PREPARING" | "PICKED_UP" | "ARRIVED_AT_DELIVERY" | "DELIVERED";

const TRACKING_STEPS = [
  { status: "PLACED", label: "Order Placed", description: "Your order has been received by the restaurant." },
  { status: "PREPARING", label: "Preparing Food", description: "The chef is cooking your delicious meal." },
  { status: "PICKED_UP", label: "On the Way", description: "Your runner has picked up your order and is heading to you." },
  { status: "ARRIVED_AT_DELIVERY", label: "Nearby", description: "Your runner is almost at your location!" },
  { status: "DELIVERED", label: "Delivered", description: "Enjoy your meal!" },
];

export default function TrackOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<OrderStatus>("PREPARING");

  // Mock order data matching the customer view
  const order = {
    id: orderId || "ORD-2025-001",
    restaurant: "Dunnkayce",
    customerAddress: "Hostel A, Room 302",
    total: 6000,
    runner: {
        name: "Sanni",
        rating: 4.8,
        avatar: "/profilephoto.svg"
    },
    items: [
      { name: "Jollof Rice & Chicken", quantity: 2, price: 5000 },
      { name: "Cold Drink", quantity: 2, price: 1000 }
    ]
  };

  const currentStepIndex = TRACKING_STEPS.findIndex(s => s.status === status);

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-32 pt-20">
      
      {/* Header */}
      <header className="px-6 max-w-2xl mx-auto mb-8 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div className="bg-white border border-gray-100 px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm">
           Track: {order.id.slice(-8)}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 space-y-8">
        
        {/* Live Status Card */}
        <section className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-8">
           <div className="flex justify-between items-start">
              <div>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Live Status</h2>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{TRACKING_STEPS[currentStepIndex].label}</h3>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                 <Clock size={24} />
              </div>
           </div>
           
           <div className="space-y-0 pt-4">
              {TRACKING_STEPS.map((step, idx) => {
                const isCompleted = idx < currentStepIndex;
                const isActive = idx === currentStepIndex;

                return (
                  <div key={step.status} className="flex gap-6 relative">
                    {/* Vertical line */}
                    {idx < TRACKING_STEPS.length - 1 && (
                      <div className={cn(
                        "absolute left-[19px] top-10 w-[2px] h-[calc(100%-24px)] z-0",
                        isCompleted ? "bg-red-600" : "bg-gray-100"
                      )} />
                    )}

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

                    <div className={cn(
                      "pb-10 transition-all duration-500",
                      isActive ? "opacity-100" : "opacity-40"
                    )}>
                       <h4 className={cn(
                         "text-lg font-bold tracking-tight",
                         isCompleted ? "text-gray-400" : "text-gray-900"
                       )}>
                         {step.label}
                       </h4>
                       <p className="text-sm text-gray-500 font-medium mt-1">
                         {step.description}
                       </p>
                    </div>
                  </div>
                );
              })}
           </div>
        </section>

        {/* Runner Info Card (Only if assigned) */}
        {currentStepIndex >= 2 && (
            <section className="bg-gray-900 rounded-[32px] p-6 text-white shadow-xl flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/20">
                     <img src={order.runner.avatar} alt={order.runner.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                     <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Your Runner</p>
                     <h4 className="text-lg font-bold">{order.runner.name}</h4>
                     <div className="flex items-center gap-1 mt-1">
                        <CheckCircle2 size={12} className="text-blue-400 fill-blue-400" />
                        <span className="text-xs font-medium text-white/70">Verified Runner</span>
                     </div>
                  </div>
               </div>
               <div className="flex gap-2">
                  <button className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                     <Phone size={20} />
                  </button>
                  <button className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                     <MessageSquare size={20} />
                  </button>
               </div>
            </section>
        )}

        {/* Delivery Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-red-50 rounded-xl text-red-600">
                    <Store size={20} />
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Restaurant</p>
                    <h4 className="font-bold text-gray-900">{order.restaurant}</h4>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-gray-50 rounded-xl text-gray-400">
                    <MapPin size={20} />
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Delivery Address</p>
                    <h4 className="font-bold text-gray-900">{order.customerAddress}</h4>
                 </div>
              </div>
           </div>
        </div>

      </main>
    </div>
  );
}
