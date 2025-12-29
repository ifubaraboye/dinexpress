"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  MapPin, 
  Package, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  Clock,
  Navigation,
  Store,
  Circle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type OrderStatus = "ACCEPTED" | "ARRIVED_AT_RESTAURANT" | "PICKED_UP" | "ARRIVED_AT_DELIVERY" | "DELIVERED";

const STATUS_STEPS = [
  { status: "ACCEPTED", label: "Order Accepted", description: "You have successfully claimed this order." },
  { status: "ARRIVED_AT_RESTAURANT", label: "At Restaurant", description: "Let the kitchen know you've arrived." },
  { status: "PICKED_UP", label: "Order Picked Up", description: "Collect the items and start the delivery." },
  { status: "ARRIVED_AT_DELIVERY", label: "At Destination", description: "You are at the customer's location." },
  { status: "DELIVERED", label: "Delivered", description: "Hand over the food and complete the task." },
];

export default function ActiveOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<OrderStatus>("ACCEPTED");
  const [loading, setLoading] = useState(false);

  // Mock order data
  const order = {
    id: orderId || "ORD-123",
    customer: "Oribi",
    phone: "+234 800 000 0000",
    restaurant: "Dunnkayce",
    restaurantAddress: "Cafeteria Complex, West Wing",
    deliveryAddress: "Hostel A, Room 302",
    total: 3500,
    items: [
      { name: "Jollof Rice & Chicken", quantity: 2 },
      { name: "Extra Plantain", quantity: 1 }
    ]
  };

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.status === status);

  const handleUpdateStatus = () => {
    const nextStep = STATUS_STEPS[currentStepIndex + 1];
    if (!nextStep) return;

    setLoading(true);
    setTimeout(() => {
      setStatus(nextStep.status as OrderStatus);
      setLoading(false);
      toast.success(`Progress updated`);
      
      if (nextStep.status === "DELIVERED") {
        setTimeout(() => navigate("/runner/orders"), 2000);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-32 pt-20">
      
      {/* Header Info */}
      <header className="px-6 max-w-2xl mx-auto mb-8 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div className="bg-white border border-gray-100 px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm">
           ID: {order.id}
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
                const isUpcoming = idx > currentStepIndex;

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
                               className="h-12 rounded-xl bg-gray-900 hover:bg-black text-white px-8 font-bold text-sm transition-all animate-in fade-in slide-in-from-left-4 duration-500"
                               onClick={handleUpdateStatus}
                               disabled={loading || status === "DELIVERED"}
                             >
                               {loading ? "Updating..." : 
                                status === "ACCEPTED" ? "Arrived at Restaurant" :
                                status === "ARRIVED_AT_RESTAURANT" ? "Confirm Pickup" :
                                status === "PICKED_UP" ? "Arrived at Destination" :
                                status === "ARRIVED_AT_DELIVERY" ? "Mark Delivered" : "Finish"}
                             </Button>
                          </div>
                       )}
                    </div>
                  </div>
                );
              })}
           </div>
        </section>

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
                    <p className="font-bold text-gray-900 leading-tight">{order.restaurant}</p>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                    <MapPin size={22} />
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Deliver To</p>
                    <p className="font-bold text-gray-900 leading-tight">{order.customer}</p>
                 </div>
              </div>
           </div>

           {/* Quick Actions */}
           <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm flex flex-col justify-center gap-3">
              <Button variant="outline" className="h-14 rounded-2xl border-gray-100 gap-3 font-bold hover:bg-gray-50">
                 <Phone size={18} className="text-green-500" /> Call Customer
              </Button>
           </div>
        </div>

        {/* Items Summary */}
        <section className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Order Details</h3>
              <span className="text-lg font-black text-gray-900">₦{order.total.toLocaleString()}</span>
           </div>
           <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-2">
                   <div className="flex items-center gap-4">
                      <span className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center font-black text-gray-400 text-xs">
                        {item.quantity}x
                      </span>
                      <span className="font-bold text-gray-700">{item.name}</span>
                   </div>
                </div>
              ))}
           </div>
        </section>

      </main>
    </div>
  );
}