"use client"

import { ItemCard } from "../components/ItemCard"
import { ArrowRight } from "lucide-react"

export interface FoodItem {
  id: string
  name: string
  price: number
  rating: number
  reviews: number
  waitTime: string
  image: string
  quantity_available?: number
}

interface FoodSectionProps {
  title: string
  items: FoodItem[]
}

export function ItemSection({ title, items }: FoodSectionProps) {
  return (
    <section className="py-4 border-b border-gray-50 last:border-0 mb-8 last:mb-0">
      <div className="flex items-end justify-between mb-6 px-4 md:px-0">
        <div>
           <h2 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h2>
           <p className="text-sm text-gray-400 font-medium mt-1">{items.length} items</p>
        </div>
        
        {/* <button className="group flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors">
          See all <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button> */}
      </div>

      <div className="relative group -mx-4 md:-mx-8">
        <div className="flex gap-4 md:gap-6 overflow-x-auto pb-8 pt-2 px-4 md:px-8 scroll-smooth snap-x snap-mandatory no-scrollbar mask-gradient-right">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
