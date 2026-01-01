"use client";

import { Link } from "react-router-dom";
import { ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function RunnerDashboard() {
  const stats = useQuery(api.orders.getRunnerStats);

  if (stats === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-red-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-20 font-sans pt-16">
      <div className="px-6 space-y-8 pt-8">
        {/* Earnings Card */}
        <section className="space-y-4">
           <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Earnings</h2>
              <Link to="/runner/history" className="text-sm font-bold text-red-600 flex items-center gap-0.5 hover:gap-1 transition-all">
                View History <ChevronRight size={16} />
              </Link>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-[32px] p-6 border border-gray-100 flex flex-col justify-between h-40">
                 {/* <div className="w-10 h-10 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center">
                    <DollarSign size={20} />
                 </div> */}
                 <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Today</span>
                    <p className="text-3xl font-black text-gray-900 mt-1">₦{stats.todayEarnings.toLocaleString()}</p>
                 </div>
              </div>

              <div className="bg-gray-50 rounded-[32px] p-6 border border-gray-100 flex flex-col justify-between h-40">
                 {/* <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <TrendingUp size={20} />
                 </div> */}
                 <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">This Week</span>
                    <p className="text-3xl font-black text-gray-900 mt-1">₦{stats.weekEarnings.toLocaleString()}</p>
                 </div>
              </div>
           </div>
        </section>

        {/* Action Center */}
        <section className="bg-red-600 rounded-[40px] p-7 text-white shadow-2xl shadow-red-100 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
           <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-3xl -ml-16 -mb-16"></div>
           
           <div className="relative z-10">
              <div className="flex items-start justify-between mb-12">
                 <div>
                    <h3 className="text-3xl font-black tracking-tight mb-2">New Orders</h3>
                    <p className="text-white/80 font-medium">Available for pickup now</p>
                 </div>
              </div>

              <div className="flex items-end justify-between">
                 <div>
                    <span className="text-7xl font-black tracking-tighter leading-none">{stats.availableCount}</span>
                    <span className="text-white/60 font-bold ml-3 uppercase tracking-widest text-xs">Waiting</span>
                 </div>
                 <Button 
                   asChild 
                   className="bg-white text-red-600 hover:bg-gray-100 font-bold rounded-2xl px-8 h-14 shadow-lg active:scale-95 transition-transform"
                 >
                    <Link to="/runner/orders">
                       Find Orders
                    </Link>
                 </Button>
              </div>
           </div>
        </section>

        {/* Performance Metrics (Static for now but using real total earnings and rating) */}
        <section className="space-y-4">
           <h2 className="text-xl font-bold text-gray-900 tracking-tight">Performance</h2>
           <div className="bg-white border border-gray-100 rounded-[32px] p-2 shadow-sm">
              <div className="grid grid-cols-2 divide-x divide-gray-100">
                 <div className="py-6 text-center">
                    <p className="text-3xl font-black text-gray-900 tracking-tighter">{stats.rating > 0 ? stats.rating.toFixed(1) : "N/A"}</p>
                    <p className="text-[10px] uppercase font-bold text-gray-400 mt-2 tracking-widest">Rating</p>
                 </div>
                 <div className="py-6 text-center">
                    <p className="text-xl font-black text-gray-900 tracking-tighter truncate px-1">₦{stats.totalEarnings.toLocaleString()}</p>
                    <p className="text-[10px] uppercase font-bold text-gray-400 mt-2 tracking-widest">Total Earned</p>
                 </div>
              </div>
           </div>
        </section>

      </div>
    </div>
  );
}
