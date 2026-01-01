"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface RateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

export default function RateOrderModal({
  isOpen,
  onClose,
  orderId,
}: RateOrderModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const rateRunner = useMutation(api.orders.rateRunner);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setSubmitting(true);
    try {
      await rateRunner({
        orderId: orderId as Id<"orders">,
        rating,
        comment: comment || undefined,
      });
      toast.success("Thank you for your feedback!");
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-full rounded-[32px] p-8 border-none outline-none shadow-2xl">
        <DialogHeader className="relative">
          <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight text-center">
            Rate Your Runner
          </DialogTitle>
          <p className="text-center text-sm text-gray-500 font-medium mt-2">
            How was your delivery experience?
          </p>
        </DialogHeader>

        <div className="space-y-8 mt-4">
          {/* Star Rating */}
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="transition-transform active:scale-90 hover:scale-110 cursor-pointer"
              >
                <Star
                  size={40}
                  className={cn(
                    "transition-colors duration-300",
                    star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-100"
                  )}
                />
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
              Add a comment (Optional)
            </label>
            <Textarea
              placeholder="What could be improved?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px] rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-red-100 transition-all text-sm font-medium resize-none shadow-none"
            />
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleSubmit}
              disabled={submitting || rating === 0}
              className="h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-base shadow-xl shadow-red-100 transition-all active:scale-95 border-none cursor-pointer"
            >
              {submitting ? <Loader2 className="animate-spin" size={24} /> : "Submit Review"}
            </Button>
            <button
              onClick={onClose}
              className="py-2 text-xs font-black text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-[0.2em] cursor-pointer"
            >
              Skip for now
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}