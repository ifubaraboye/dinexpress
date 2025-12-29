import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FloatingCart } from "../components/FloatingCart";
import { MapPin, Star, Clock, ArrowRight } from "lucide-react";

interface Cafeteria {
  id: string;
  name: string;
  image: string;
  route: string;
  rating: number;
  reviews: number;
  deliveryFee: number;
  waitTime: string;
  tags: string[];
}

const CAFETERIAS: Cafeteria[] = [
  {
    id: "f02f9ee6-1ed7-484c-8711-eebf39aad236",
    name: "DunnKayce",
    image: "/dunkhead.png",
    route: "/dunnkayce",
    rating: 4.5,
    reviews: 128,
    deliveryFee: 500,
    waitTime: "25-35 min",
    tags: ["Rice & Bowls", "Drinks"],
  },
  {
    id: "401dcac5-889d-4d12-9b33-475c3864fb58",
    name: "BTO",
    image: "/btoheader.png",
    route: "/bto",
    rating: 4.2,
    reviews: 95,
    deliveryFee: 500,
    waitTime: "30-40 min",
    tags: ["Swallows", "Soups"],
  },
  {
    id: "cfdff904-fcf5-4902-a0e5-96c7cf850dde",
    name: "The Laughters Kitchen",
    image: "/laughheader.png",
    route: "/laughters-kitchen",
    rating: 4.7,
    reviews: 210,
    deliveryFee: 500,
    waitTime: "20-30 min",
    tags: ["Combos", "Snacks"],
  },
  {
    id: "14f26bab-610d-4ad8-baf4-5f1aafd97d9c",
    name: "Grills",
    image: "/grillsheader.png",
    route: "/grills",
    rating: 4.8,
    reviews: 156,
    deliveryFee: 500,
    waitTime: "35-45 min",
    tags: ["Grills", "Proteins"],
  },
];

export default function Home() {
  const [userLocation, setUserLocation] = useState<string>("");

  useEffect(() => {
    const saved = localStorage.getItem("user_location");
    if (saved) setUserLocation(saved);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen pb-16 pt-20">
      
      {/* Location Bar (Mobile Only - distinct from main nav) */}
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
        <section className="relative rounded-3xl overflow-hidden bg-[#D35454] text-white shadow-xl lg:h-[400px] flex flex-col lg:flex-row items-center justify-between p-8 lg:p-12">
           <div className="z-10 max-w-lg space-y-6 text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-tight">
                Hungry? <br/> We've got you.
              </h1>
              <p className="text-white/90 text-lg font-medium max-w-md mx-auto lg:mx-0">
                Order from your favorite campus cafeterias and get it delivered in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
                <Button className="bg-white text-red-600 cursor-pointer hover:bg-gray-100 font-bold h-12 px-8 rounded-full shadow-lg transition-transform hover:scale-105">
                  Order Now
                </Button>
                <Button variant="outline" className="border-white/30 text-red-600 cursor-pointer hover:text-white hover:bg-white/10 font-bold h-12 px-8 rounded-full backdrop-blur-sm">
                  Reorder
                </Button>
              </div>
           </div>

           {/* Hero Image/Graphic */}
           <div className="relative mt-8 lg:mt-0 w-full lg:w-1/2 flex justify-center lg:justify-end">
              <div className="relative w-64 h-64 lg:w-96 lg:h-96">
                 {/* Abstract shapes or food image placeholder */}
                 <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl animate-pulse" />
                 <img 
                   src="/unocard.svg" 
                   alt="Food" 
                   className="relative z-10 w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                 />
              </div>
           </div>
        </section>


        {/* Featured Restaurants Section */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Top Restaurants</h2>
              <p className="text-gray-500 mt-2 font-medium">Curated selection for you</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {CAFETERIAS.map((cafe) => (
              <Link key={cafe.id} to={cafe.route} className="group flex flex-col h-full bg-white rounded-3xl p-3 shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100">
                {/* Image Card */}
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 mb-4">
                  <img
                    src={cafe.image}
                    alt={cafe.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold text-gray-900">{cafe.rating}</span>
                  </div>
                  {/* {cafe.name === "DunnKayce" && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md uppercase tracking-wide">
                      Popular
                    </div>
                  )} */}
                </div>

                {/* Content */}
                <div className="px-2 pb-2 flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-1">
                      {cafe.name}
                    </h3>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-2 mb-3">
                    {cafe.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                      <Clock size={14} className="text-gray-400" />
                      <span>{cafe.waitTime}</span>
                    </div>
                    <div className="text-xs font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded-lg">
                      ₦{cafe.deliveryFee} delivery
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* <Link to="/search" className="mt-8 flex sm:hidden items-center justify-center gap-2 w-full py-4 text-sm font-bold text-gray-600 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors">
            View All Restaurants <ArrowRight size={16} />
          </Link> */}
        </section>

      </div>
      
      <FloatingCart />
    </div>
  );
}