"use client";

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBasket,
  Plus,
  Trash2,
  ChevronRight,
  Package,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TAKEAWAY_PLATE_FEE = 600;

export function FloatingCart() {
  const {
    items,
    getTotalItems,
    updateQuantity,
    isTakeaway,
    setTakeaway,
  } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const totalItems = getTotalItems();
  const subtotal = useMemo(() => items.reduce((sum, it) => sum + it.price * it.quantity, 0), [items]);
  const totalAmount = subtotal + (isTakeaway ? TAKEAWAY_PLATE_FEE : 0);

  if (totalItems === 0) return null;

  const handleCheckout = () => {
    // Save minimal payload for checkout page to handle details
    const checkoutPayload = {
      subtotal,
      is_takeaway: isTakeaway,
      takeaway_fee: isTakeaway ? TAKEAWAY_PLATE_FEE : 0,
      cart_items: items.map(it => ({
        id: it.id,
        name: it.name,
        price: it.price,
        quantity: it.quantity,
        restaurantName: it.restaurantName,
        restaurantTransferCharge: it.restaurantTransferCharge,
        restaurantFee: it.restaurantFee
      }))
    };
    localStorage.setItem("checkout_payload", JSON.stringify(checkoutPayload));
    setOpen(false);
    navigate("/checkout");
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <div className="fixed left-1/2 -translate-x-1/2 bottom-8 z-50">
        <DrawerTrigger asChild>
          <button className="flex items-center justify-between gap-4 rounded-full px-6 py-4 bg-gray-900 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer min-w-[280px]">
            <div className="flex items-center gap-3">
               <div className="relative">
                  <ShoppingBasket size={20} />
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black h-4 w-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
               </div>
               <span className="text-sm font-bold tracking-tight">View Cart</span>
            </div>
            <span className="text-sm font-black">₦{totalAmount.toLocaleString()}</span>
          </button>
        </DrawerTrigger>
      </div>

      <DrawerContent className="w-full rounded-t-[40px] border-none p-0">
        <div className="max-w-2xl mx-auto w-full p-8">
          <DrawerHeader className="px-0 pt-0 pb-6 text-left">
            <DrawerTitle className="text-3xl font-black text-gray-900 tracking-tighter">Your Cart</DrawerTitle>
          </DrawerHeader>

          <div className="space-y-6 max-h-[40vh] overflow-y-auto no-scrollbar pr-2 mb-8 -mx-2 px-2 pb-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                    <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                    <p className="text-xs font-bold text-gray-400 mt-0.5">₦{item.price.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors"
                  >
                    {item.quantity === 1 ? <Trash2 size={16} /> : <span className="text-lg font-bold">−</span>}
                  </button>
                  <span className="text-sm font-black text-gray-900 min-w-[20px] text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-900 hover:bg-white hover:shadow-sm transition-all"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4 border-t border-gray-50 pt-6">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
                    <Package size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Takeaway Plate</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">+₦{TAKEAWAY_PLATE_FEE}</p>
                  </div>
               </div>
               <input 
                 type="checkbox" 
                 checked={isTakeaway}
                 onChange={(e) => setTakeaway(e.target.checked)}
                 className="w-6 h-6 rounded-lg border-gray-200 accent-red-600 cursor-pointer transition-transform active:scale-90 hover:scale-110"
               />
            </div>

            <div className="flex justify-between items-end pt-4">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Estimated Total</p>
                  <p className="text-3xl font-black text-gray-900">₦{totalAmount.toLocaleString()}</p>
               </div>
               <Button 
                 onClick={handleCheckout}
                 className="h-14 px-8 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-base shadow-xl shadow-red-100 flex items-center gap-2 active:scale-95 transition-transform cursor-pointer"
               >
                 Checkout <ChevronRight size={20} />
               </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
