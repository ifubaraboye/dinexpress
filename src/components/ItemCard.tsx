"use client"

import { Plus, Minus, Star } from "lucide-react"
import { useCart } from "../../context/CartContext"
import type { FoodItem } from "../components/ItemSection"
import { useRestaurant } from "../../context/RestaurantContext"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ItemCardProps {
  item: FoodItem
}

export function ItemCard({ item }: ItemCardProps) {
  const { items, addItem, updateQuantity } = useCart()
  const restaurant = useRestaurant()
  const cartItem = items.find((i) => i.id === item.id)
  const quantity = cartItem?.quantity || 0

  const isAvailable = item.quantity_available === undefined || item.quantity_available > 0

  const handleAdd = () => {
    if (!isAvailable) {
      toast.error("Item unavailable")
      return
    }
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      restaurantName: restaurant.name,
      restaurantFee: item.restaurantDeliveryFee ?? restaurant.deliveryFee,
      restaurantTransferCharge: item.restaurantTransferCharge,
    })
  }

  const handleRemove = () => {
    if (quantity > 0) updateQuantity(item.id, quantity - 1)
  }

  const handleIncrease = () => {
    if (!isAvailable) return
    updateQuantity(item.id, quantity + 1)
  }

  return (
    <div className={cn("group flex flex-col w-64 md:w-72 shrink-0 snap-start", !isAvailable && "opacity-60")}>
      
      {/* Image Container */}
      <div className="relative aspect-[4/3] rounded-3xl overflow-hidden mb-4 bg-gray-50">
        <img 
          src={item.image || "/placeholder.svg"} 
          alt={item.name}  
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
        />
        
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white/20 backdrop-blur-md text-white border border-white/30 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              Sold Out
            </span>
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
          <Star size={12} className="text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-bold text-gray-900">{item.rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1 px-1">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-lg font-bold text-gray-900 leading-tight transition-colors line-clamp-1">
            {item.name}
          </h3>
          <span className="text-lg font-black text-gray-900 whitespace-nowrap">
            ₦{item.price.toLocaleString()}
          </span>
        </div>
        
        <p className="text-sm text-gray-500 font-medium line-clamp-2">
           {item.waitTime.replace('Avg wait: ', '')} wait time
        </p>

        {/* Action Button */}
        <div className="mt-3">
          {quantity === 0 ? (
            <button
              onClick={handleAdd}
              disabled={!isAvailable}
              className="w-full h-11 cursor-pointer rounded-2xl bg-gray-100 hover:bg-red-600 hover:text-white text-gray-900 font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to Cart
            </button>
          ) : (
            <div className="flex items-center justify-between h-11 bg-gray-900 text-white rounded-2xl px-1">
              <button
                onClick={handleRemove}
                className="w-10 h-full flex items-center justify-center text-white/70 hover:text-white transition-colors active:scale-90"
              >
                <Minus size={18} strokeWidth={2.5} />
              </button>
              <span className="font-bold text-base min-w-[20px] text-center">{quantity}</span>
              <button
                onClick={handleIncrease}
                className="w-10 h-full flex items-center justify-center text-white/70 hover:text-white transition-colors active:scale-90"
              >
                <Plus size={18} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
