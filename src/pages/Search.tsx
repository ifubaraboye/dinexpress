import { useState, useEffect } from "react";
import { Search as SearchIcon, TrendingUp, Utensils, Coffee, Pizza, Soup, Beef, Sandwich, X } from "lucide-react";
import { FloatingCart } from "../components/FloatingCart";
import { useCart } from "../../context/CartContext";
import { RestaurantProvider } from "../../context/RestaurantContext";
import { toast } from "sonner";

// Static Catalog Data
const CATALOG = [
  { id: "101", name: "Jollof Rice Special", price: 2500, restaurant: "DunnKayce", image: "/riceandbowls.svg", tag: "Rice & Bowls" },
  { id: "102", name: "Fried Rice & Beef", price: 2800, restaurant: "DunnKayce", image: "/riceandbowls.svg", tag: "Rice & Bowls" },
  { id: "103", name: "Pounded Yam & Egusi", price: 2200, restaurant: "BTO", image: "/soupsicon.png", tag: "Swallows" },
  { id: "104", name: "BBQ Chicken Wings", price: 3500, restaurant: "Grills", image: "/grills.svg", tag: "Grills" },
  { id: "105", name: "Meat Pie", price: 800, restaurant: "Laughter's Kitchen", image: "/snacks.svg", tag: "Snacks" },
  { id: "106", name: "Chapman Cocktail", price: 1200, restaurant: "Laughter's Kitchen", image: "/drinks.svg", tag: "Drinks" },
  { id: "107", name: "Catfish Pepper Soup", price: 2000, restaurant: "BTO", image: "/soups.png", tag: "Soups" },
  { id: "108", name: "Burger & Fries", price: 3000, restaurant: "Grills", image: "/combos.png", tag: "Combos" },
];

const CATEGORY_TILES = [
  { label: "Rice & Bowls", icon: Utensils, color: "bg-orange-50 text-orange-600", border: "border-orange-100" },
  { label: "Swallows", icon: Beef, color: "bg-yellow-50 text-yellow-600", border: "border-yellow-100" },
  { label: "Grills", icon: Flame, color: "bg-red-50 text-red-600", border: "border-red-100" },
  { label: "Drinks", icon: Coffee, color: "bg-blue-50 text-blue-600", border: "border-blue-100" },
  { label: "Snacks", icon: Sandwich, color: "bg-pink-50 text-pink-600", border: "border-pink-100" },
  { label: "Soups", icon: Soup, color: "bg-green-50 text-green-600", border: "border-green-100" },
];

// Fallback Icon
function Flame(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.204 1.15-3.003 1.05 1.05 1.85 2.503 1.85 4.003Z" />
    </svg>
  )
}

function SearchItemRow({ item }: { item: typeof CATALOG[0] }) {
  const { addItem } = useCart();

  const handleAdd = () => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      restaurantName: item.restaurant,
      restaurantFee: 500,
    });
    toast.success(`Added ${item.name}`);
  };

  return (
    <div className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[24px] mb-4 hover:border-red-200 transition-all shadow-sm hover:shadow-md group">
      <div className="flex items-center gap-5">
        <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-300">
          <img src={item.image} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-gray-900 text-base">{item.name}</h3>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{item.restaurant}</p>
          <span className="text-sm font-black text-red-600 block pt-1">₦{item.price.toLocaleString()}</span>
        </div>
      </div>
      <button 
        onClick={handleAdd}
        className="h-10 px-6 bg-gray-900 text-white text-xs font-black rounded-xl hover:bg-red-600 transition-all active:scale-95 shadow-sm"
      >
        ADD
      </button>
    </div>
  );
}

export default function Search() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const results = CATALOG.filter(item => {
    const matchesQuery = query 
      ? item.name.toLowerCase().includes(query.toLowerCase()) || item.restaurant.toLowerCase().includes(query.toLowerCase())
      : true;
    const matchesCategory = activeCategory 
      ? item.tag.toLowerCase() === activeCategory.toLowerCase()
      : true;
    
    return (query || activeCategory) && matchesQuery && matchesCategory;
  });

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-40 pt-20 pt-20">
      
      {/* Dynamic Search Container */}
      <div className="px-6 max-w-3xl mx-auto mb-10">
        <div className="flex flex-col mb-8">
          <p className="text-md font-black text-red-600 uppercase tracking-[0.2em] mb-2">Discover</p>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Find your taste</h1>
        </div>
        
        <div className="relative group">
           <input 
             value={query}
             onChange={(e) => {
               setQuery(e.target.value);
               if(e.target.value) setActiveCategory(null);
             }}
             placeholder="Dishes, restaurants, drinks..." 
             className="w-full h-16 pl-14 pr-14 rounded-[28px] bg-white border-2 border-transparent shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] focus:shadow-[0_8px_30px_0_rgba(0,0,0,0.08)] focus:border-gray-900 transition-all text-lg font-bold placeholder:text-gray-300 outline-none"
             autoFocus
           />
           <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900 transition-colors" size={24} />
           {query && (
             <button 
               onClick={() => setQuery("")}
               className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
             >
               <X size={16} className="text-gray-500" />
             </button>
           )}
        </div>
      </div>

      <div className="px-6 max-w-3xl mx-auto">
        
        {/* Categories View */}
        {!query && !activeCategory && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 ml-1">Popular Categories</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {CATEGORY_TILES.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => setActiveCategory(cat.label)}
                  className={`group ${cat.color} ${cat.border} border-2 h-40 rounded-[32px] p-6 flex flex-col justify-between items-start transition-all duration-300 hover:shadow-lg hover:-translate-y-1 active:scale-95`}
                >
                  <div className="bg-white p-3 rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                    <cat.icon size={24} />
                  </div>
                  <span className="font-bold text-xl text-gray-900 tracking-tight">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results / Category Results View */}
        {(query || activeCategory) && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8 px-2">
               <div>
                 <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-1">Results</p>
                 <h2 className="text-2xl font-black text-gray-900">
                   {activeCategory ? activeCategory : query}
                 </h2>
               </div>
               <button 
                 onClick={() => { setQuery(""); setActiveCategory(null); }}
                 className="px-4 py-2 bg-gray-100 text-[10px] font-black text-gray-500 uppercase tracking-widest rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
               >
                 Clear
               </button>
            </div>

            <div className="space-y-2">
              {results.length > 0 ? (
                results.map(item => (
                  <RestaurantProvider key={item.id} value={{ name: item.restaurant, deliveryFee: 500 }}>
                    <SearchItemRow item={item} />
                  </RestaurantProvider>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border-2 border-dashed border-gray-100">
                  <p className="font-bold text-gray-300 uppercase tracking-widest">No matches found</p>
                  <button onClick={() => setQuery("")} className="mt-4 text-xs font-black text-red-600 uppercase tracking-widest">Try another search</button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      <FloatingCart />
    </div>
  );
}