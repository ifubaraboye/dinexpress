"use client"

import { createContext, useContext, type ReactNode } from "react"

export type RestaurantInfo = {
  name: string
  deliveryFee: number
}

const RestaurantContext = createContext<RestaurantInfo | null>(null)

export function RestaurantProvider({ value, children }: { value: RestaurantInfo; children: ReactNode }) {
  return <RestaurantContext.Provider value={value}>{children}</RestaurantContext.Provider>
}

export function useRestaurant() {
  const ctx = useContext(RestaurantContext)
  if (!ctx) throw new Error("useRestaurant must be used within RestaurantProvider")
  return ctx
}
