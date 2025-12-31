"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Star, Clock, MapPin, ChevronLeft, Share2, Info } from "lucide-react";
import { RestaurantProvider } from "../../context/RestaurantContext";
import { FloatingCart } from "@/components/FloatingCart";
import { ItemSection } from "@/components/ItemSection";
import type { FoodItem } from "@/components/ItemSection";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface RestaurantLayoutProps {
  id?: string; // Optional Convex Id<"cafeterias">
  name: string; // Used as fallback or primary key
  image: string;
  deliveryFee: number;
  avgWait: string;
  rating: number;
  reviews: number;
}

// Helper
const getValidImage = (url: any): string => {
  if (!url || typeof url !== "string") return "/placeholder.svg";
  if (url.startsWith("http") || url.startsWith("/")) return url;
  return "/placeholder.svg";
};

export function RestaurantLayout({
  id: initialId,
  name,
  image,
  deliveryFee,
  avgWait,
  rating,
  reviews,
}: RestaurantLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  // Try to get ID from state if not provided
  const cafeteriaIdFromState = location.state?.cafeteriaId;
  const finalId = initialId || cafeteriaIdFromState;

  // Query cafeteria by name if ID is missing (robustness for refreshes)
  const cafeteria = useQuery(api.main.getCafeteriaByName, 
    !finalId ? { name } : "skip" as any
  );

  const cafeteriaId = finalId || cafeteria?._id;

  // Use Convex query for menu items
  const menuData = useQuery(api.main.getMenuItemsWithDetails, 
    cafeteriaId ? { cafeteriaId: cafeteriaId as Id<"cafeterias"> } : "skip" as any
  );

  const loading = menuData === undefined || (cafeteria === undefined && !finalId);
  const error = menuData === null;

  // Scroll effect for sticky header visual
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const groupedSections = useMemo(() => {
    if (!menuData) return [];

    const query = searchQuery.trim().toLowerCase();
    const customCategoryNames: Record<string, string> = {
      drinks: "Drinks",
      rice: "Rice & Bowls",
      grills_and_proteins: "Grills & Proteins",
      soups_sauces_swallows: "Soups & Swallows",
      snacks: "Snacks",
      fruits_salads: "Fruits & Salads",
      combos: "Combos",
      pastries: "Pastries",
    };
    
    const desiredOrder = [
      "Rice & Bowls",
      "Grills & Proteins",
      "Soups & Swallows",
      "Combos",
      "Snacks",
      "Drinks",
      "Pastries",
      "Fruits & Salads",
    ];

    const getCategory = (item: any): string => {
      const raw = (item.categoryName || "Menu") as string;
      const slug = raw.trim().toLowerCase().replace(/\s+/g, "_");
      return customCategoryNames[slug] || raw;
    };

    const menuToUse = query
      ? menuData.filter((m) =>
          (m.productName || "").toLowerCase().includes(query)
        )
      : menuData;

    const groups = new Map<string, FoodItem[]>();
    menuToUse.forEach((m) => {
      const title = getCategory(m);
      const item: FoodItem = {
        id: m.menuItemId,
        name: m.productName ?? "Item",
        price: m.price,
        rating: m.avgRating,
        reviews: m.totalRatings,
        waitTime: `${m.avgWaitTimeMinutes} mins`,
        image: getValidImage(m.imageUrl),
        quantity_available: m.quantityAvailable,
      };
      if (!groups.has(title)) groups.set(title, []);
      groups.get(title)!.push(item);
    });

    const sections = Array.from(groups.entries());
    sections.sort((a, b) => {
      const ai = desiredOrder.indexOf(a[0]);
      const bi = desiredOrder.indexOf(b[0]);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
    return sections;
  }, [menuData, searchQuery]);

  return (
    <RestaurantProvider value={{ name, deliveryFee }}>
      <div className="bg-white min-h-screen w-full overflow-x-hidden">
        
        {/* Navigation Bar (Floating/Sticky) */}
        

        {/* Immersive Hero */}
        <div className="relative h-[45vh] lg:h-[55vh] w-full group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          
          <div className="absolute bottom-0 left-0 w-full p-4 md:p-8 pb-10 z-20">
            <div className="max-w-7xl mx-auto space-y-4">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white leading-[1.1] break-words max-w-3xl">
                {name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 md:gap-6 pb-6 text-white/90 font-medium text-sm md:text-base">
                 <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                   <Star size={16} className="text-yellow-400 fill-yellow-400" />
                   <span className="font-bold">{rating}</span>
                   <span className="opacity-70">({reviews}+)</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <Clock size={18} />
                   <span>{avgWait}</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <MapPin size={18} />
                   <span>₦{deliveryFee} delivery</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="relative z-30 bg-white min-h-[50vh] rounded-t-3xl -mt-6">
           <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-10">
              
              {/* Modern Search */}
              <div className="sticky top-20 z-40 -mx-4 px-4 md:mx-0 md:px-0 bg-white/95 backdrop-blur-sm py-2">
                 <div className="relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                   <Input 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     placeholder="Search for food, drinks, etc..."
                     className="w-full h-12 pl-12 rounded-2xl bg-gray-100 border-transparent focus:bg-white focus:border-gray-200 transition-all font-medium placeholder:text-gray-400"
                   />
                 </div>
              </div>

              {/* Menu Sections */}
              <div className="min-h-[400px]">
                {loading ? (
                   <div className="space-y-12">
                     {[1, 2].map(i => (
                       <div key={i} className="space-y-6">
                         <Skeleton className="h-8 w-48 rounded-lg" />
                         <div className="flex gap-6 overflow-hidden">
                           {[1, 2, 3, 4].map(j => (
                             <Skeleton key={j} className="h-64 w-64 shrink-0 rounded-3xl" />
                           ))}
                         </div>
                       </div>
                     ))}
                   </div>
                ) : error ? (
                   <div className="flex flex-col items-center justify-center py-20 text-center">
                     <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4">
                       <Info size={32} />
                     </div>
                     <h3 className="text-xl font-bold text-gray-900">Menu unavailable</h3>
                     <p className="text-gray-500 mt-2 max-w-xs">There was an issue loading the menu.</p>
                     <Button variant="outline" className="mt-6 rounded-xl cursor-pointer" onClick={() => window.location.reload()}>
                       Try Again
                     </Button>
                   </div>
                ) : groupedSections.length > 0 ? (
                  <div className="space-y-4">
                    {groupedSections.map(([title, items]) => (
                      <ItemSection key={title} title={title} items={items} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-24">
                    <p className="text-gray-400 font-medium text-lg">No items match your search.</p>
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="text-red-600 font-bold mt-2 hover:underline cursor-pointer"
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </div>
           
           </div>
        </div>

        <FloatingCart deliveryFee={deliveryFee} />
      </div>
    </RestaurantProvider>
  );
}
