"use client";

import { useState } from "react";
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerClose
} from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

interface ComplaintDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  userRole?: "customer" | "runner";
}

export default function ComplaintDrawer({
  isOpen,
  onClose,
  orderId,
  userRole = "customer",
}: ComplaintDrawerProps) {
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const cleanReport = report.trim();

    if (cleanReport.length < 10) {
      toast.error("Please provide more detail (min 10 characters).");
      return;
    }

    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Issue reported successfully.");
      setReport("");
      onClose();
    } catch (err) {
      toast.error("Failed to submit report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="w-full rounded-t-[40px] border-none p-0">
        <div className="max-w-2xl mx-auto w-full p-8 pb-12">
          <form onSubmit={handleSubmit}>
            <DrawerHeader className="px-0 pt-0 pb-8 text-left">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 mb-4">
                 <AlertCircle size={24} />
              </div>
              <DrawerTitle className="text-3xl font-black text-gray-900 tracking-tighter">
                Report an Issue
              </DrawerTitle>
              <p className="text-gray-500 font-medium mt-1">
                Tell us what went wrong with order <span className="font-bold text-gray-900">#{orderId.slice(-8)}</span>
              </p>
            </DrawerHeader>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Description</label>
                <Textarea 
                  value={report}
                  onChange={(e) => setReport(e.target.value)}
                  placeholder="Ex: My order was missing items, or the delivery was delayed..."
                  className="min-h-[160px] rounded-3xl bg-gray-50 border-transparent focus:bg-white focus:border-gray-100 transition-all resize-none p-6 text-base font-medium placeholder:text-gray-300"
                  required
                />
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
                 <InfoIcon size={18} className="text-amber-600 shrink-0 mt-0.5" />
                 <p className="text-xs font-semibold text-amber-800 leading-relaxed">
                   Our support team will review this and get back to you via email within 30 minutes.
                 </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <DrawerClose asChild>
                  <button type="button" className="h-14 rounded-2xl font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                    Cancel
                  </button>
                </DrawerClose>
                <button 
                  type="submit"
                  disabled={loading || report.trim().length < 10}
                  className="h-14 rounded-2xl font-bold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-100 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : (
                    <>
                      <Send size={18} />
                      <span>Submit Report</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function InfoIcon({ size, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
    </svg>
  );
}