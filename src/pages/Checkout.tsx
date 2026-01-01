"use client";

import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  CreditCard, 
  Building2, 
  ShieldCheck, 
  Loader2, 
  MapPin, 
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "../../context/CartContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

type PaymentMethod = "transfer" | "card";

export default function Checkout() {
  const navigate = useNavigate();
  const { clear: clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState<any | null>(null);
  const [step, setStep] = useState<"details" | "payment">("details");

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isGift, setIsGift] = useState(false);
  const [giftName, setGiftName] = useState("");
  const [giftPhone, setGiftPhone] = useState("");

  const createOrder = useMutation(api.orders.create);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("checkout_payload");
      if (raw) setPayload(JSON.parse(raw));
      const savedAddress = localStorage.getItem("user_location");
      const savedPhone = localStorage.getItem("user_phone");
      if (savedAddress) setAddress(savedAddress);
      if (savedPhone) setPhone(savedPhone);
    } catch (e) {
      console.error("Failed to load checkout data");
    }
  }, []);

  const transferCharge = useMemo(() => {
    if (!payload || !payload.cart_items) return 0;
    const restaurantTransferCharges = new Map<string, number>();
    payload.cart_items.forEach((item: any) => {
      if (item.restaurantName) {
          restaurantTransferCharges.set(item.restaurantName, item.restaurantTransferCharge || 0);
      }
    });
    let total = 0;
    restaurantTransferCharges.forEach((charge) => {
      total += charge;
    });
    return total;
  }, [payload]);

  const deliveryFee = useMemo(() => {
      if (!payload || !payload.cart_items || payload.cart_items.length === 0) return 500;
      return payload.cart_items[0].restaurantFee || 500;
  }, [payload]);

  const totalAmount = (payload?.subtotal || 0) + deliveryFee + (payload?.takeaway_fee || 0) + transferCharge;

  const handleProceedToPayment = () => {
    if (!address || (!isGift && !phone) || (isGift && (!giftName || !giftPhone))) {
      toast.error("Please complete all delivery details");
      return;
    }
    localStorage.setItem("user_location", address);
    if (phone) localStorage.setItem("user_phone", phone);
    setStep("payment");
    window.scrollTo(0, 0);
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      if (!payload || !payload.cart_items) throw new Error("No cart items");
      await createOrder({
        items: payload.cart_items.map((item: any) => ({
          menuItemId: item.id as Id<"menuItems">,
          quantity: item.quantity,
          price: item.price,
        })),
        deliveryAddress: address,
        deliveryNotes: notes || undefined,
        phone: phone || "",
        recipientName: isGift ? giftName : undefined,
        recipientPhone: isGift ? giftPhone : undefined,
        isGift: isGift,
        isTakeaway: !!payload.isTakeaway,
        takeawayFee: payload.takeaway_fee || 0,
        deliveryFee: deliveryFee,
        total: totalAmount,
        paymentMethod: paymentMethod,
      });
      clearCart();
      localStorage.removeItem("checkout_payload");
      toast.success("Order successful!");
      navigate("/reorder");
    } catch (error) {
      console.error(error);
      toast.error("Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  if (!payload) return null;

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden pt-[85px]">
      <div className="fixed top-0 left-0 right-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md h-16 px-6 lg:px-12 flex items-center gap-4">
        <button onClick={() => step === "payment" ? setStep("details") : navigate(-1)} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors cursor-pointer"><ArrowLeft className="w-6 h-6 text-gray-900" /></button>
        <h1 className="text-xl font-black text-gray-900">{step === "details" ? "Delivery Details" : "Payment"}</h1>
      </div>

      <div className="max-w-2xl mx-auto border-x border-gray-50 shadow-sm min-h-[calc(100vh-85px)] flex flex-col pb-20">
        {step === "details" ? (
          <div className="flex-1 px-6 pt-10 space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <section className="space-y-6">
               <div className="flex items-center gap-3 px-1"><div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center text-red-600"><MapPin size={20} /></div><h2 className="text-lg font-black text-gray-900">{isGift ? "Recipient's Address" : "Where are you?"}</h2></div>
               <div className="space-y-4 bg-gray-50 rounded-[32px] p-6 border border-gray-100">
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-400">Delivery Address</label><Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Hostel, Block, and Room Number" className="h-14 rounded-2xl bg-white border-transparent shadow-sm" /></div>
                  {!isGift && (<div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-400">Phone Number</label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0801 234 5678" className="h-14 rounded-2xl bg-white border-transparent shadow-sm" /></div>)}
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-400">Instructions for Runner</label><Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Call me when you get to the gate" className="h-14 rounded-2xl bg-white border-transparent shadow-sm" /></div>
               </div>
            </section>
            <section className="space-y-4">
               <button onClick={() => setIsGift(!isGift)} className={cn("w-full flex items-center justify-between p-6 rounded-[28px] border-2 transition-all", isGift ? "border-red-600 bg-red-50/30" : "border-gray-50 bg-white")}>
                  <div className="flex items-center gap-4"><div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors", isGift ? "bg-red-600 text-white" : "bg-gray-100 text-gray-400")}><Gift size={20} /></div><div className="text-left"><p className="font-bold">Send as a gift</p><p className="text-[10px] font-bold text-gray-400 uppercase">Surprise someone today</p></div></div>
                  <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all", isGift ? "border-red-600" : "border-gray-200")}>{isGift && <div className="w-3 h-3 bg-red-600 rounded-full animate-in zoom-in-50" />}</div>
               </button>
               {isGift && (<div className="space-y-4 bg-gray-50 rounded-[32px] p-6 border border-gray-100"><div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-400">Recipient Name</label><Input value={giftName} onChange={(e) => setGiftName(e.target.value)} placeholder="Who is this for?" className="h-14 rounded-2xl bg-white border-transparent shadow-sm font-bold" /></div><div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-400">Recipient Phone</label><Input value={giftPhone} onChange={(e) => setGiftPhone(e.target.value)} placeholder="Their contact number" className="h-14 rounded-2xl bg-white border-transparent shadow-sm font-bold" /></div></div>)}
            </section>
            <div className="pt-6"><Button onClick={handleProceedToPayment} className="w-full h-16 rounded-[28px] bg-gray-900 hover:bg-black text-white font-black text-lg shadow-xl transition-all active:scale-95">Review Order & Pay</Button></div>
          </div>
        ) : (
          <div className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="px-6 py-10 border-b border-gray-100 bg-gray-50/80">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 text-center">Final Summary</h2>
              <div className="space-y-4 text-sm max-w-md mx-auto">
                <div className="flex justify-between text-gray-600 font-semibold px-1"><span>Subtotal</span><span>₦{payload.subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-gray-600 font-semibold px-1"><span>Delivery Fee</span><span>₦{deliveryFee.toLocaleString()}</span></div>
                {payload.takeaway_fee > 0 && (<div className="flex justify-between text-gray-600 font-semibold px-1"><span>Takeaway Plate</span><span>₦{payload.takeaway_fee.toLocaleString()}</span></div>)}
                {transferCharge > 0 && (<div className="flex justify-between text-gray-600 font-semibold px-1"><span>Transfer Charges</span><span>₦{transferCharge.toLocaleString()}</span></div>)}
                <div className="flex justify-between pt-6 mt-4 border-t border-gray-200 px-1"><span className="font-black text-gray-900 text-base uppercase tracking-tight">Total</span><span className="font-black text-3xl text-[#BF1F1B] tracking-tighter">₦{totalAmount.toLocaleString()}</span></div>
              </div>
            </div>
            <div className="px-6 pt-10 pb-12 flex flex-col items-center">
              <div className="space-y-8 w-full max-w-md">
                <h2 className="text-lg font-black text-gray-900 tracking-tight text-center">Select Payment Method</h2>
                <div className="space-y-4">
                  <button onClick={() => setPaymentMethod("card")} className={`w-full flex items-center justify-between p-6 border-2 rounded-[28px] transition-all cursor-pointer ${paymentMethod === "card" ? "border-[#BF1F1B] bg-red-50/30 shadow-lg shadow-red-50/20" : "border-gray-100 hover:bg-gray-50"}`}>
                    <div className="flex items-center gap-5"><div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-gray-700 shadow-sm border border-gray-50"><CreditCard className="w-7 h-7" /></div><div className="text-left"><span className="font-bold text-gray-900 block text-base">Pay with Card</span><span className="text-xs font-semibold text-gray-400 uppercase">Instant & Secure</span></div></div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === "card" ? "border-[#BF1F1B]" : "border-gray-200"}`}>{paymentMethod === "card" && <div className="w-3.5 h-3.5 rounded-full bg-[#BF1F1B] animate-in zoom-in-50" />}</div>
                  </button>
                  <button onClick={() => setPaymentMethod("transfer")} className={`w-full flex items-center justify-between p-6 border-2 rounded-[28px] transition-all cursor-pointer ${paymentMethod === "transfer" ? "border-[#BF1F1B] bg-red-50/30 shadow-lg shadow-red-50/20" : "border-gray-100 hover:bg-gray-50"}`}>
                    <div className="flex items-center gap-5"><div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-gray-700 shadow-sm border border-gray-50"><Building2 className="w-7 h-7" /></div><div className="text-left"><span className="font-bold text-gray-900 block text-base">Bank Transfer</span><span className="text-xs font-semibold text-gray-400 uppercase">All Nigerian banks</span></div></div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === "transfer" ? "border-[#BF1F1B]" : "border-gray-200"}`}>{paymentMethod === "transfer" && <div className="w-3.5 h-3.5 rounded-full bg-[#BF1F1B] animate-in zoom-in-50" />}</div>
                  </button>
                </div>
                <div className="space-y-4 pt-4">
                  <Button disabled={loading} onClick={handleComplete} className="w-full h-16 text-lg font-black rounded-[28px] bg-[#BF1F1B] hover:bg-[#A01A17] text-white shadow-xl transition-all active:scale-95">{loading ? <Loader2 className="animate-spin" size={24} /> : `Complete Order • ₦${totalAmount.toLocaleString()}`}</Button>
                  <button onClick={() => setStep("details")} className="w-full py-2 text-xs font-black text-gray-400 hover:text-gray-900 uppercase tracking-[0.2em] cursor-pointer">Back to Details</button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="mt-auto flex items-center justify-center gap-2 text-gray-300 w-full pt-12 pb-8"><ShieldCheck size={16} /><span className="text-[10px] font-black uppercase tracking-[0.2em]">Secured by DineXpress</span></div>
      </div>
    </div>
  );
}
