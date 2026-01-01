"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FloatingCart } from "../components/FloatingCart";
import { MapPin, Star, Clock, Info } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [userLocation, setUserLocation] = useState<string>("");
  const allCafeterias = useQuery(api.main.getAllCafeterias);

  useEffect(() => {
    const saved = localStorage.getItem("user_location");
    if (saved) setUserLocation(saved);
  }, []);

  // Map route based on name (robust normalization)
  const getNormalizedName = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");

  const getRoute = (name: string) => {
    const normalized = getNormalizedName(name);
    const map: Record<string, string> = {
      "grills": "/grills",
      "bto": "/bto",
      "laughterskitchen": "/the-laughters-kitchen",
      "thelaughterskitchen": "/the-laughters-kitchen",
      "dunnkayce": "/dunnkayce"
    };
    return map[normalized] || "/";
  };

  const getImage = (name: string) => {
    const normalized = getNormalizedName(name);
    const map: Record<string, string> = {
      "grills": "/grillsheader.png",
      "bto": "/btoheader.png",
      "laughterskitchen": "/laughheader.png",
      "thelaughterskitchen": "/laughheader.png",
      "dunnkayce": "/dunkhead.png"
    };
    return map[normalized] || "/placeholder.svg";
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16 pt-20">
      
      {/* Location Bar (Mobile Only) */}
      <div className="lg:hidden px-4 mb-6">
        <div className="flex items-center gap-2 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
          <div className="p-2 bg-red-50 rounded-full text-red-600">
            <MapPin size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Delivering to</p>
            <input
              value={userLocation}
              onChange={(e) => {
                setUserLocation(e.target.value);
                localStorage.setItem("user_location", e.target.value);
              }}
              className="w-full text-sm font-bold text-gray-800 bg-transparent focus:outline-none placeholder:text-gray-300 truncate"
              placeholder="Set location..."
            />
          </div>
          <Link to="/profile" className="shrink-0">
             <img src="/profilephoto.svg" alt="Profile" className="w-10 h-10 rounded-full border border-gray-100" />
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Modern Hero Section */}
        <section className="relative rounded-[40px] overflow-hidden bg-[#D35454] text-white shadow-xl lg:h-[400px] flex flex-col lg:flex-row items-center justify-between p-8 lg:p-12">
           <div className="z-10 max-w-lg space-y-6 text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-tight">
                Hungry? <br/> We've got you.
              </h1>
              <p className="text-white/90 text-lg font-medium max-w-md mx-auto lg:mx-0">
                Order from your favorite campus cafeterias and get it delivered in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
                <Button className="bg-white text-red-600 cursor-pointer hover:bg-gray-100 font-bold h-12 px-8 rounded-full shadow-lg transition-transform hover:scale-105 border-none">
                  Order Now
                </Button>
                <Link to="/reorder">
                  <Button variant="outline" className="border-white/30 text-red-600 cursor-pointer hover:text-white hover:bg-white/10 font-bold h-12 px-8 rounded-full backdrop-blur-sm border-2">
                    My Orders
                  </Button>
                </Link>
              </div>
           </div>

           <div className="relative mt-8 lg:mt-0 w-full lg:w-1/2 flex justify-center lg:justify-end">
              <div className="relative w-64 h-64 lg:w-96 lg:h-96">
                 <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl animate-pulse" />
                 <img 
                   src="/dinelogonew.png" 
                   alt="Food" 
                   className="relative z-10 w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500 invert brightness-0"
                 />
              </div>
           </div>
        </section>


        {/* Featured Restaurants Section */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Our Restaurants</h2>
              <p className="text-gray-500 mt-2 font-medium">Top picks for you today.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {allCafeterias === undefined ? (
                // Skeletons
                [1, 2, 3, 4].map(i => (
                    <div key={i} className="space-y-4">
                        <Skeleton className="h-48 w-full rounded-[32px]" />
                        <Skeleton className="h-6 w-3/4 rounded-lg" />
                        <Skeleton className="h-4 w-1/2 rounded-lg" />
                    </div>
                ))
            ) : allCafeterias.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white rounded-[40px] border border-gray-100">
                    <Info className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-500 font-bold">No cafeterias found.</p>
                </div>
            ) : (
                allCafeterias.map((cafe) => (
                <Link 
                    key={cafe._id} 
                    to={getRoute(cafe.name)} 
                    state={{ cafeteriaId: cafe._id }}
                    className="group flex flex-col h-full bg-white rounded-[32px] p-3 shadow-sm hover:shadow-xl transition-all duration-500 border border-transparent hover:border-gray-100"
                >
                    {/* Image Card */}
                    <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden bg-gray-100 mb-4">
                    <img
                        src={getImage(cafe.name)}
                        alt={cafe.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-black text-gray-900">{cafe.avgRating ? cafe.avgRating.toFixed(1) : "0"}</span>
                    </div>
                    </div>

                    {/* Content */}
                    <div className="px-3 pb-3 flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                        <h3 className="text-xl font-black text-gray-900 group-hover:text-red-600 transition-colors line-clamp-1">
                        {cafe.name}
                        </h3>
                    </div>

                    {/* <p className="text-xs font-bold text-gray-400 mt-1">Popular • Delicious • Quick</p> */}

                    <div className="mt-auto flex items-center justify-between pt-5 border-t border-gray-50">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                        <Clock size={14} className="text-gray-400" />
                        <span>25-35 min</span>
                        </div>
                        <div className="text-xs font-black text-red-600 bg-red-50 px-3 py-1.5 rounded-xl">
                        ₦{cafe.deliveryFee} Delivery
                        </div>
                    </div>
                    </div>
                </Link>
                ))
            )}
          </div>
        </section>

      </div>
      
      <FloatingCart />
    </div>
  );
}