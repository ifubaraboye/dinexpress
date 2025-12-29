"use client";

import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Building2, Copy, Check, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "../../context/CartContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type PaymentMethod = "transfer" | "card";

const RESTAURANT_TRANSFER_CHARGES: Record<string, number> = {
  'dunnkayce': 20,
  'laughters kitchen': 50,
  'the laughters kitchen': 50,
  'bto': 0,
  'grills': 50,
};

export default function Checkout() {
  const navigate = useNavigate();
  const { clear: clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState<any | null>(null);
  const [step, setStep] = useState<"method" | "details">("method");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("checkout_payload");
      if (raw) {
        setPayload(JSON.parse(raw));
      } else {
        // Mock fallback for testing
        setPayload({
          subtotal: 2500,
          delivery_fee: 500,
          takeaway_fee: 0,
          cart_items: [{ restaurantName: "Dunnkayce" }],
          delivery_address: "Hostel A, Room 302"
        });
      }
    } catch (e) {
      console.error("Failed to load checkout data");
    }
  }, []);

  const transferCharge = useMemo(() => {
    if (!payload || !payload.cart_items) return 0;
    const restaurantNames = new Set<string>();
    payload.cart_items.forEach((item: any) => {
      if (item.restaurantName) restaurantNames.add(item.restaurantName.toLowerCase().trim());
    });
    let total = 0;
    restaurantNames.forEach((name) => {
      total += RESTAURANT_TRANSFER_CHARGES[name] || 0;
    });
    return total;
  }, [payload]);

  const totalAmount = (payload?.subtotal || 0) + (payload?.delivery_fee || 0) + (payload?.takeaway_fee || 0) + transferCharge;

  const handleInitialize = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("details");
    }, 1000);
  };

  const handleComplete = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      clearCart();
      localStorage.removeItem("checkout_payload");
      toast.success("Order successful!");
      navigate("/reorder");
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!payload) return null;

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden pt-[85px]">
      
      {/* Fixed Full Width Header */}
      <div className="fixed top-0 left-0 right-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md h-16 px-6 lg:px-12 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors cursor-pointer">
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
        <h1 className="text-xl font-black tracking-tight text-gray-900">Payment</h1>
      </div>

      <div className="max-w-2xl mx-auto border-x border-gray-50 shadow-sm min-h-[calc(100vh-85px)] flex flex-col">
        
        {/* Order Summary */}
        <div className="px-6 py-10 border-b border-gray-100 bg-gray-50/80">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 px-1 text-center">Order Summary</h2>
          <div className="space-y-4 text-sm max-w-md mx-auto">
            <div className="flex justify-between text-gray-600 font-semibold px-1">
              <span>Subtotal</span>
              <span>₦{payload.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600 font-semibold px-1">
              <span>Delivery Fee</span>
              <span>₦{payload.delivery_fee.toLocaleString()}</span>
            </div>
            {payload.takeaway_fee > 0 && (
              <div className="flex justify-between text-gray-600 font-semibold px-1">
                <span>Takeaway Plate</span>
                <span>₦{payload.takeaway_fee.toLocaleString()}</span>
              </div>
            )}
            {transferCharge > 0 && (
              <div className="flex justify-between text-gray-600 font-semibold px-1">
                <span>Transfer Charges</span>
                <span>₦{transferCharge.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between pt-6 mt-4 border-t border-gray-200 px-1">
              <span className="font-black text-gray-900 text-base uppercase tracking-tight">Total to pay</span>
              <span className="font-black text-3xl text-[#BF1F1B] tracking-tighter">
                ₦{totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 px-6 pt-10 pb-12 overflow-y-auto flex flex-col items-center">
          {step === "method" ? (
            <div className="space-y-8 w-full max-w-md">
              <h2 className="text-lg font-black text-gray-900 tracking-tight text-center">Select Payment Method</h2>
              
              <div className="space-y-4">
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`w-full flex items-center justify-between p-6 border-2 rounded-[28px] transition-all cursor-pointer ${
                    paymentMethod === "card" ? "border-[#BF1F1B] bg-red-50/30 shadow-lg shadow-red-50/20" : "border-gray-100 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-gray-700 shadow-sm border border-gray-50">
                      <CreditCard className="w-7 h-7" />
                    </div>
                    <div className="text-left">
                      <span className="font-bold text-gray-900 block text-base">Pay with Card</span>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-tighter">Visa, Mastercard, Verve</span>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    paymentMethod === "card" ? "border-[#BF1F1B]" : "border-gray-200"
                  }`}>
                    {paymentMethod === "card" && <div className="w-3.5 h-3.5 rounded-full bg-[#BF1F1B] animate-in zoom-in-50 duration-300" />}
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod("transfer")}
                  className={`w-full flex items-center justify-between p-6 border-2 rounded-[28px] transition-all cursor-pointer ${
                    paymentMethod === "transfer" ? "border-[#BF1F1B] bg-red-50/30 shadow-lg shadow-red-50/20" : "border-gray-100 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-gray-700 shadow-sm border border-gray-50">
                      <Building2 className="w-7 h-7" />
                    </div>
                    <div className="text-left">
                      <span className="font-bold text-gray-900 block text-base">Bank Transfer</span>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-tighter">All Nigerian banks</span>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    paymentMethod === "transfer" ? "border-[#BF1F1B]" : "border-gray-200"
                  }`}>
                    {paymentMethod === "transfer" && <div className="w-3.5 h-3.5 rounded-full bg-[#BF1F1B] animate-in zoom-in-50 duration-300" />}
                  </div>
                </button>
              </div>

              <Button
                disabled={loading}
                onClick={handleInitialize}
                className="w-full h-16 text-lg font-black rounded-[28px] bg-[#BF1F1B] hover:bg-[#A01A17] text-white shadow-xl shadow-red-100  transition-all active:scale-95 border-none cursor-pointer"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : "Continue"}
              </Button>
            </div>
          ) : (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-md">
              {paymentMethod === "transfer" ? (
                <div className="space-y-8">
                  <div className="bg-green-50 border border-green-100 rounded-[28px] p-6 flex items-start gap-5">
                     <div className="p-3 bg-white rounded-2xl text-green-600 shadow-sm">
                        <Check size={20} strokeWidth={3} />
                     </div>
                     <div>
                        <p className="text-base font-bold text-green-900">Account generated</p>
                        <p className="text-xs font-bold text-green-700 mt-0.5 uppercase tracking-widest opacity-70">Expires in 30:00 mins</p>
                     </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-4 px-1 text-center">Account Number</label>
                      <div className="flex items-center justify-between">
                        <p className="font-black text-4xl tracking-tighter text-gray-900">9023114562</p>
                        <button onClick={() => copyToClipboard("9023114562")} className="p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors cursor-pointer">
                          {copied ? <Check className="w-6 h-6 text-green-600" /> : <Copy className="w-6 h-6 text-gray-400" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-sm">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-1">Bank</label>
                        <p className="font-black text-gray-900">Wema Bank</p>
                      </div>
                      <div className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-sm">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-1">Name</label>
                        <p className="font-black text-gray-900 line-clamp-1">DineXpress Ltd</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <h2 className="text-xl font-black text-gray-900 tracking-tight text-center">Enter Card Details</h2>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Card Number</label>
                      <input 
                        type="text" 
                        placeholder="0000 0000 0000 0000" 
                        className="w-full h-16 px-6 bg-gray-50 border-transparent focus:bg-white focus:border-gray-200 transition-all rounded-[28px] font-black text-xl tracking-tighter"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Expiry</label>
                        <input type="text" placeholder="MM/YY" className="w-full h-16 px-6 bg-gray-50 border-transparent focus:bg-white focus:border-gray-200 transition-all rounded-[28px] font-bold" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">CVV</label>
                        <input type="password" placeholder="123" className="w-full h-16 px-6 bg-gray-50 border-transparent focus:bg-white focus:border-gray-200 transition-all rounded-[28px] font-bold" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6 pt-4">
                <Button
                  disabled={loading}
                  onClick={handleComplete}
                  className="w-full h-16 text-lg font-black rounded-[28px] bg-[#BF1F1B] hover:bg-[#A01A17] text-white shadow-xl shadow-red-100 transition-all active:scale-95 border-none cursor-pointer"
                >
                  {loading ? <Loader2 className="animate-spin" size={24} /> : `I've sent the ₦${totalAmount.toLocaleString()}`}
                </Button>
                <button 
                  onClick={() => setStep("method")}
                  className="w-full py-2 text-xs font-black text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-[0.2em] cursor-pointer"
                >
                  Change Method
                </button>
              </div>
            </div>
          )}

          <div className="mt-16 flex items-center justify-center gap-2 text-gray-300 w-full">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Secured by Monnify</span>
          </div>
        </div>
      </div>
    </div>
  );
}