"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBasket,
  Plus,
  Trash2,
  ArrowLeft,
  Gift,
  ChevronRight,
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

// Constants
const TAKEAWAY_PLATE_FEE = 600;

const RESTAURANT_TRANSFER_CHARGES: Record<string, number> = {
  'dunnkayce': 20,
  'dunkayce': 20,
  'dunn kayce': 20,
  "laughter's kitchen": 50,
  'laughters kitchen': 50,
  'laughters': 50,
  'laughter': 50,
  'bto': 0,
  'grills': 50,
};

const CAFE_DELIVERY_FEES: Record<string, number> = {
  'grills': 500,
  'dunnkayce': 500,
  'dunn kayce': 500,
  'bto': 500,
  "laughter's kitchen": 500,
  'laughters kitchen': 500,
  'laughters': 500,
  'laughter': 500,
};
const DEFAULT_DELIVERY_FEE = 500;

export function FloatingCart({ deliveryFee = 500 }: { deliveryFee?: number }) {
  const {
    items,
    getTotalItems,
    updateQuantity,
    isTakeaway,
    setTakeaway,
  } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"mini" | "full">("mini");
  const [noteOpen, setNoteOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [note, setNote] = useState("");
  const [gift, setGift] = useState(false);
  const [giftName, setGiftName] = useState("");
  const [giftPhone, setGiftPhone] = useState("");
  const [giftAddress, setGiftAddress] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Hydrate address from localStorage
    try {
      const savedAddress =
        typeof window !== "undefined"
          ? localStorage.getItem("user_location")
          : null;
      if (savedAddress) setUserAddress(savedAddress);

      const savedPhone =
        typeof window !== "undefined"
          ? localStorage.getItem("user_phone")
          : null;
      if (savedPhone) setUserPhone(savedPhone);
    } catch { }
  }, []);

  const total = getTotalItems();

  const thumbnails = useMemo(() => {
    const lastItems = items.slice(-4);
    return lastItems.map((it) => ({
      id: it.id,
      image: it.image || "/placeholder.svg",
      qty: it.quantity,
      name: it.name,
    }));
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  }, [items]);

  // 1. Calculate Base Delivery Fee (Always applies now)
  const restaurantFees = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((it) => {
      const name = it.restaurantName?.toLowerCase().trim();
      if (name && !map.has(name)) {
        const fee = CAFE_DELIVERY_FEES[name] || DEFAULT_DELIVERY_FEE;
        map.set(name, fee);
      }
    });
    return map;
  }, [items]);

  const deliveryTotal = useMemo(() => {
    const sum = Array.from(restaurantFees.values()).reduce((a, b) => a + b, 0);
    return sum || (items.length > 0 ? DEFAULT_DELIVERY_FEE : 0);
  }, [restaurantFees, items.length]);

  // 2. Calculate Transfer Charge
  const transferCharge = useMemo(() => {
    const restaurantNames = new Set<string>();
    items.forEach((item) => {
      if (item.restaurantName) {
        restaurantNames.add(item.restaurantName.toLowerCase().trim());
      }
    });

    // Transfer charge logic: sum all charges
    let total = 0;
    restaurantNames.forEach((name) => {
      const charge = RESTAURANT_TRANSFER_CHARGES[name];
      if (charge !== undefined) {
        total += charge;
      }
    });
    return total;
  }, [items]);

  // 3. Calculate Takeaway Plate Fee (Additive)
  const takeawayFee = isTakeaway ? TAKEAWAY_PLATE_FEE : 0;

  // 4. Final Total
  const totalAmount = subtotal + deliveryTotal + transferCharge + takeawayFee;

  if (total === 0) return null;

  const proceedToCheckout = () => {
    setError(null);

    // Validation: Address is ALWAYS required now
    if (gift) {
      if (!giftName || !giftPhone || !giftAddress) {
        setError(
          "Please enter recipient name, phone and address for a gift order"
        );
        return;
      }
    } else {
      if (!userAddress) {
        setError("Please set your delivery address");
        return;
      }
      if (!userPhone) {
        setError("Please enter your phone number for delivery");
        return;
      }
    }

    const checkoutPayload: any = {
      cart_items: items
        .filter((it) => it.id && it.quantity > 0)
        .map((it) => ({
          menu_item_id: it.id,
          quantity: it.quantity,
          restaurantName: it.restaurantName,
        })),
      subtotal: subtotal,
      delivery_fee: deliveryTotal,
      takeaway_fee: takeawayFee, // Explicitly send takeaway fee
      delivery_notes: note,
      is_gift: gift,
      is_takeaway: isTakeaway,
      recipient_name: "",
      recipient_phone: "",
      delivery_address: "",
      recipient_room: "",
    };

    if (gift) {
      checkoutPayload.recipient_name = giftName;
      checkoutPayload.recipient_phone = giftPhone;
      checkoutPayload.recipient_room = giftAddress;
      checkoutPayload.delivery_address = giftAddress;
    } else {
      const accountName = "Customer";
      checkoutPayload.recipient_name = accountName;
      checkoutPayload.recipient_phone = userPhone;
      checkoutPayload.delivery_address = userAddress;
      checkoutPayload.recipient_room = "";
    }

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "checkout_payload",
          JSON.stringify(checkoutPayload)
        );
      }
    } catch (e) {
      console.error("Failed to save checkout data:", e);
      setError("Failed to prepare checkout");
      return;
    }

    setOpen(false);
    setView("mini");
    navigate("/checkout");
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setView("mini");
      }}
    >
      <div className="fixed left-1/2 -translate-x-1/2 bottom-20 z-50">
        <DrawerTrigger asChild>
          <div className="flex items-center gap-3 justify-center rounded-full w-72 px-3 py-2 bg-[#D35454] text-white shadow-lg">
            <div className="flex items-center -space-x-2">
              {thumbnails.map((t) => (
                <div key={t.id} className="relative">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="h-9 w-9 rounded-full ring-2 ring-white object-cover bg-white"
                  />
                  {t.qty > 1 && (
                    <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] leading-3 font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center">
                      {t.qty}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="h-6 w-px bg-white/70" />

            <button
              className="flex items-center gap-2 text-sm font-medium pr-1"
              aria-label="View Cart"
            >
              <span>View Cart</span>
              <div className="relative">
                <ShoppingBasket className="h-5 w-5" />
                <span className="absolute -top-2 -right-2 bg-green-600 text-white text-[10px] leading-3 font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center">
                  {total}
                </span>
              </div>
            </button>
          </div>
        </DrawerTrigger>
      </div>

      <DrawerContent className="w-full max-w-none mx-auto rounded-t-[32px] outline-none border-none">
        {view === "mini" ? (
          <>
            <DrawerHeader>
              <DrawerTitle className="text-left">Your Cart</DrawerTitle>
            </DrawerHeader>
            <div className="flex flex-col max-h-[80vh]">
              <div className="px-4 pb-4 space-y-4 overflow-y-auto">
                {items.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={it.image || "/placeholder.svg"}
                        alt={it.name}
                        className="h-12 w-12 rounded-md object-cover border"
                      />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{it.name}</span>
                        <span className="text-muted-foreground text-sm">
                          ₦{it.price}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() =>
                          updateQuantity(it.id, Math.max(0, it.quantity - 1))
                        }
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
                        {it.quantity <= 1 ? (
                          <Trash2 className="h-4 w-4" />
                        ) : (
                          <span className="text-lg leading-none">−</span>
                        )}
                      </Button>
                      <span className="font-semibold text-base min-w-[20px] text-center">
                        {it.quantity}
                      </span>
                      <Button
                        onClick={() => updateQuantity(it.id, it.quantity + 1)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mini view footer */}
              <div className="px-4 pt-2 pb-4 bg-card border-t">
                <Button
                  className="w-full h-11 bg-[#D35454] hover:bg-[#c54848] text-white rounded-lg"
                  onClick={() => setView("full")}
                >
                  Go to Cart (₦{subtotal})
                  <ShoppingBasket className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Full cart view */}
            <div className="px-4 pt-4 pb-2 flex items-center gap-3">
              <button
                onClick={() => setView("mini")}
                className="h-9 w-9 inline-flex items-center justify-center rounded-full border"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-semibold">Cart</h2>
              <div className="ml-auto text-sm text-muted-foreground">
                Orders
              </div>
            </div>
            <div className="flex flex-col max-h-[80vh]">
              <div className="px-4 pb-2">
                {restaurantFees.size > 0 && (
                  <div className="flex items-center gap-2 flex-wrap text-sm">
                    <span className="text-muted-foreground">From:</span>
                    {Array.from(restaurantFees.keys()).map((name) => (
                      <span
                        key={name}
                        className="px-2 py-1 rounded-full bg-muted text-foreground"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-4 space-y-3 overflow-y-auto">
                {items.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center justify-between gap-3 bg-card rounded-lg p-2 shadow-sm border"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={it.image || "/placeholder.svg"}
                        alt={it.name}
                        className="h-14 w-14 rounded-md object-cover border"
                      />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{it.name}</span>
                        <span className="text-muted-foreground text-sm">
                          ₦{it.price}
                        </span>
                        {it.restaurantName && (
                          <span className="text-xs text-muted-foreground">
                            {it.restaurantName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() =>
                          updateQuantity(it.id, Math.max(0, it.quantity - 1))
                        }
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
                        {it.quantity <= 1 ? (
                          <Trash2 className="h-4 w-4" />
                        ) : (
                          <span className="text-lg leading-none">−</span>
                        )}
                      </Button>
                      <span className="font-semibold text-base min-w-[20px] text-center">
                        {it.quantity}
                      </span>
                      <Button
                        onClick={() => updateQuantity(it.id, it.quantity + 1)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions and summary */}
              <div className="px-4 pt-2 pb-4 bg-card border-t">
                {/* Change Location - ALWAYS VISIBLE */}
                <button
                  onClick={() => setLocationOpen((v) => !v)}
                  className="w-full flex items-center justify-between py-3"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />{" "}
                    Your Details
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </button>
                {locationOpen && (
                  <div className="space-y-2">
                    <label className="block text-sm">Delivery Address</label>
                    <input
                      value={userAddress}
                      onChange={(e) => {
                        const v = e.target.value;
                        setUserAddress(v);
                        try {
                          if (typeof window !== "undefined")
                            localStorage.setItem("user_location", v);
                        } catch { }
                      }}
                      placeholder="Hostel/Block/Room"
                      className="w-full rounded-md border p-2 text-sm"
                    />
                    {!gift && (
                      <>
                        <label className="block text-sm">
                          Your Phone Number
                        </label>
                        <input
                          type="tel"
                          value={userPhone}
                          onChange={(e) => {
                            const v = e.target.value;
                            setUserPhone(v);
                            try {
                              if (typeof window !== "undefined")
                                localStorage.setItem("user_phone", v);
                            } catch { }
                          }}
                          placeholder="08012345678 or +2348012345678"
                          className="w-full rounded-md border p-2 text-sm"
                        />
                      </>
                    )}
                  </div>
                )}

                <button
                  onClick={() => setNoteOpen((v) => !v)}
                  className="w-full flex items-center justify-between py-3"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Add
                    Note
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </button>
                {noteOpen && (
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Any preferences for the restaurant?"
                    className="w-full min-h-[80px] rounded-md border p-2 text-sm"
                  />
                )}

                <button
                  onClick={() => setGift((v) => !v)}
                  className="w-full flex items-center justify-between py-3"
                >
                  <span className="flex items-center gap-2">
                    <Gift className="h-4 w-4" /> Send as gift
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </button>
                {gift && (
                  <div className="grid grid-cols-1 gap-2">
                    <input
                      value={giftName}
                      onChange={(e) => setGiftName(e.target.value)}
                      placeholder="Recipient name"
                      className="rounded-md border p-2 text-sm"
                    />
                    <input
                      value={giftPhone}
                      onChange={(e) => setGiftPhone(e.target.value)}
                      placeholder="Recipient phone"
                      className="rounded-md border p-2 text-sm"
                    />
                    <input
                      value={giftAddress}
                      onChange={(e) => setGiftAddress(e.target.value)}
                      placeholder="Recipient address"
                      className="rounded-md border p-2 text-sm"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between py-3">
                  <span className="flex items-center gap-2">
                    <ShoppingBasket className="h-4 w-4" /> Takeaway Plate
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      +₦{TAKEAWAY_PLATE_FEE}
                    </span>
                    <input
                      type="checkbox"
                      checked={isTakeaway}
                      onChange={(e) => setTakeaway(e.target.checked)}
                      className="h-6 w-6 rounded border-gray-300 accent-[#af2927] cursor-pointer focus:ring-red-800"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₦{subtotal}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>₦{deliveryTotal}</span>
                  </div>
                  {transferCharge > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Transfer Charge</span>
                      <span>₦{transferCharge}</span>
                    </div>
                  )}
                  {isTakeaway && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Takeaway Plate</span>
                      <span>₦{takeawayFee}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-base font-semibold pt-2 border-t">
                    <span>Total</span>
                    <span>₦{totalAmount}</span>
                  </div>
                </div>

                <div className="pt-2">
                  {error && (
                    <p className="text-sm text-red-600 pb-2">{error}</p>
                  )}
                  <Button
                    className="w-full h-11 bg-[#D35454] hover:bg-[#c54848] text-white rounded-lg"
                    onClick={proceedToCheckout}
                  >
                    Proceed to Payment
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}