"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { toast } from "sonner"


interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  restaurantName?: string
  restaurantFee?: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  getTotalItems: () => number
  clear: () => void
  isTakeaway: boolean
  setTakeaway: (isTakeaway: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isTakeaway, setTakeaway] = useState(false)

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem("cart_items") : null
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[]
        if (Array.isArray(parsed)) setItems(parsed)
      }
      const takeawayRaw = typeof window !== "undefined" ? window.localStorage.getItem("is_takeaway") : null
      if (takeawayRaw) {
        setTakeaway(JSON.parse(takeawayRaw))
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error)
    }
  }, [])

  // Persist to localStorage on changes
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("cart_items", JSON.stringify(items))
        window.localStorage.setItem("is_takeaway", JSON.stringify(isTakeaway))
      }
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error)
    }
  }, [items, isTakeaway])

  const addItem = (item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existingRestaurant = prev.find((i) => i.restaurantName)?.restaurantName
      if (
        existingRestaurant &&
        item.restaurantName &&
        item.restaurantName !== existingRestaurant
      ) {
        toast.error("You can only order from one restaurant per order. Please clear your cart to switch restaurants.")
        return prev
      }

      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)))
  }

  const getTotalItems = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0)
  }

  const clear = () => {
    // Clear items from state
    setItems([])

    // Ensure localStorage is also cleared
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("cart_items")
        console.log("Cart cleared from localStorage and state")
      }
    } catch (error) {
      console.error("Failed to clear cart from localStorage:", error)
    }
  }

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, getTotalItems, clear, isTakeaway, setTakeaway }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }
  return context
}