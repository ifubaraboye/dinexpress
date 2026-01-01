"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import RateOrderModal from "./RateOrderModal";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { CheckCircle2, Ticket, Star, ArrowRight, Loader2, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onOpenComplaintModal: () => void;
}

export default function OrderSuccessModal({
  isOpen,
  onClose,
  order,
  onOpenComplaintModal,
}: OrderSuccessModalProps) {
  const [step, setStep] = useState<"summary" | "items">("summary");
  const [showRunnerRating, setShowRunnerRating] = useState(false);
  const [itemRatings, setItemRatings] = useState<Record<string, number>>({});
  const [submittingItems, setSubmittingItems] = useState(false);
  
  const hasRatedRunner = useQuery(api.orders.checkIfRated, 
    order?.id ? { orderId: order.id as Id<"orders"> } : "skip" as any
  );
  
  const hasRatedItems = useQuery(api.orders.checkIfItemsRated,
    order?.id ? { orderId: order.id as Id<"orders"> } : "skip" as any
  );

  const rateItems = useMutation(api.orders.rateMenuItems);

  if (!order) return null;

  const handleRateItem = (menuItemId: string, rating: number) => {
    setItemRatings(prev => ({ ...prev, [menuItemId]: rating }));
  };

  const handleSubmitItemRatings = async () => {
    // Filter out any invalid menuItemIds and create ratings array
    const ratingsArray = Object.entries(itemRatings)
      .filter(([menuItemId]) => menuItemId && menuItemId !== "undefined")
      .map(([menuItemId, rating]) => ({
        menuItemId: menuItemId as Id<"menuItems">,
        rating
      }));

    if (ratingsArray.length === 0) {
        toast.error("Please rate at least one item");
        return;
    }

    setSubmittingItems(true);
    try {
      await rateItems({
        orderId: order.id as Id<"orders">,
        ratings: ratingsArray
      });
      toast.success("Items rated! Thanks for your feedback.");
      setStep("summary");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit ratings");
    } finally {
      setSubmittingItems(false);
    }
  };

  // Get items - handle both structures
  const orderItems = order.items || order.order_items || [];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-sm w-full rounded-[40px] p-0 border-none outline-none overflow-hidden shadow-2xl">
          
          {step === "summary" ? (
            <>
              <div className="bg-red-600 p-8 flex flex-col items-center justify-center text-white relative">
                 <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-4 backdrop-blur-md">
                    <CheckCircle2 size={48} className="text-white" />
                 </div>
                 <DialogTitle className="text-2xl font-black tracking-tight text-center">Delivered!</DialogTitle>
                 <p className="text-red-100 text-sm font-medium mt-1">Hope you enjoy your meal</p>
              </div>

              <div className="p-8 pt-6 space-y-6">
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                            <Ticket size={20} />
                         </div>
                         <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Ticket ID</p>
                            <p className="font-bold text-gray-900 mt-1 uppercase">{order.id.slice(-8)}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Total Paid</p>
                         <p className="text-xl font-black text-red-600 mt-1">₦{order.total.toLocaleString()}</p>
                      </div>
                   </div>
                </div>

                <hr className="border-dashed border-gray-100" />

                <div className="flex flex-col gap-3">
                  {hasRatedRunner === false && (
                    <Button
                      className="h-14 rounded-2xl bg-gray-900 hover:bg-black text-white font-black text-base shadow-xl transition-all active:scale-95"
                      onClick={() => setShowRunnerRating(true)}
                    >
                      Rate Your Runner
                    </Button>
                  )}

                  {hasRatedItems === false && orderItems.length > 0 && (
                    <Button
                      variant="outline"
                      className="h-14 rounded-2xl border-red-100 text-red-600 font-bold hover:bg-red-50 flex items-center justify-center gap-2"
                      onClick={() => setStep("items")}
                    >
                      <Utensils size={18} /> Rate Menu Items
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    className="h-12 rounded-2xl text-gray-400 font-bold text-xs hover:text-red-600 transition-colors"
                    onClick={onOpenComplaintModal}
                  >
                    Report an Issue
                  </Button>
                  
                  <Link to="/" className="w-full">
                    <Button
                      variant="outline"
                      className="w-full h-14 rounded-2xl border-gray-100 text-gray-900 font-bold hover:bg-gray-50 flex items-center justify-center gap-2"
                      onClick={onClose}
                    >
                      Back to Home <ArrowRight size={18} />
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 space-y-6">
               <div className="text-center space-y-2">
                  <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight">Rate the Food</DialogTitle>
                  <p className="text-sm text-gray-500 font-medium">How was each item in your order?</p>
               </div>

               <div className="space-y-6 max-h-[40vh] overflow-y-auto no-scrollbar pr-1">
                  {orderItems.map((item: any) => {
                    // Get menuItemId - handle both data structures
                    const menuItemId = item.menuItemId || item.id;
                    const itemName = item.name || item.menu_items?.products?.name || "Unknown Item";
                    
                    // Skip items without valid menuItemId
                    if (!menuItemId || menuItemId === "undefined") {
                      console.warn("Skipping item without menuItemId:", item);
                      return null;
                    }

                    return (
                      <div key={menuItemId} className="space-y-3 p-4 bg-gray-50 rounded-[24px] border border-gray-100">
                         <p className="text-sm font-bold text-gray-800 text-center">{itemName}</p>
                         <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => handleRateItem(menuItemId, star)}
                                className="transition-transform active:scale-90"
                              >
                                <Star
                                  size={24}
                                  className={cn(
                                    "transition-colors",
                                    (itemRatings[menuItemId] || 0) >= star 
                                      ? "fill-yellow-400 text-yellow-400" 
                                      : "text-gray-200"
                                  )}
                                />
                              </button>
                            ))}
                         </div>
                      </div>
                    );
                  })}
               </div>

               <div className="flex flex-col gap-3">
                  <Button 
                    className="h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black shadow-xl disabled:opacity-50"
                    onClick={handleSubmitItemRatings}
                    disabled={submittingItems || Object.keys(itemRatings).length === 0}
                  >
                    {submittingItems ? <Loader2 className="animate-spin" size={24} /> : "Submit Ratings"}
                  </Button>
                  <button 
                    onClick={() => setStep("summary")}
                    className="py-2 text-xs font-black text-gray-400 hover:text-gray-900 uppercase tracking-widest"
                  >
                    Back
                  </button>
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <RateOrderModal
        isOpen={showRunnerRating}
        onClose={() => setShowRunnerRating(false)}
        orderId={order.id}
      />
    </>
  );
}