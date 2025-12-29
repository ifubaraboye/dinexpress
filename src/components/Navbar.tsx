"use client";

import { Link, useLocation } from "react-router-dom";
import { Menu, Home, Search, RotateCcw, User, Utensils, ChevronDown } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [restaurantsOpen, setRestaurantsOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();

  const links = [
    { to: "/", label: "Home", icon: Home },
    { to: "/search", label: "Search", icon: Search },
    { to: "/reorder", label: "Orders", icon: RotateCcw },
    { to: "/profile", label: "Profile", icon: User },
  ];

  const restaurants = [
    { to: "/dunnkayce", label: "Dunnkayce" },
    { to: "/grills", label: "Grills" },
    { to: "/bto", label: "BTO" },
    { to: "/laughters-kitchen", label: "The Laughters Kitchen" },
  ];

  // Hide Navbar on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // If scrolling down and not at the very top (buffer of 10px)
      if (currentScrollY > lastScrollY && currentScrollY > 10) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="w-full px-4 lg:px-10">
        <div className="flex h-16 items-center justify-between">
          
          <div className="flex items-center gap-4">
            {/* Hamburger Menu (Mobile/Tablet) */}
            <div className="lg:hidden">
              <Drawer direction="left" open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="h-full w-[280px] rounded-r-2xl rounded-l-none outline-none">
                  <DrawerHeader className="text-left px-6 py-4 border-b">
                    <DrawerTitle className="text-xl font-bold text-red-600">
                      <div className="flex items-center gap-3 group select-none">
                        <img 
                          src="/dinelogonew.png" 
                          alt="DineXpress Logo" 
                          width={40} 
                          height={40} 
                          className="object-contain"
                        />
                        <p>DineXpress</p>
                      </div>
                    </DrawerTitle>
                  </DrawerHeader>
                  <div className="flex flex-col gap-2 p-4 overflow-y-auto">
                    {/* Home & Search */}
                    {links.slice(0, 2).map((link) => {
                      const Icon = link.icon;
                      const isActive = location.pathname === link.to;
                      return (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={() => setOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                            isActive
                              ? "bg-red-50 text-red-600 font-medium"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <Icon className={`h-5 w-5 ${isActive ? "text-red-600" : "text-gray-500"}`} />
                          {link.label}
                        </Link>
                      );
                    })}

                    {/* Restaurants Dropdown */}
                    <div className="mt-0">
                      <button
                        onClick={() => setRestaurantsOpen(!restaurantsOpen)}
                        className="flex w-full items-center justify-between px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Utensils className="h-5 w-5 text-gray-500" />
                          <span>Restaurants</span>
                        </div>
                        <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${restaurantsOpen ? "rotate-180" : ""}`} />
                      </button>

                      {/* Restaurants Dropdown Content with Animation */}
                      <div 
                        className={`grid transition-all duration-300 ease-in-out ${
                          restaurantsOpen 
                            ? "grid-rows-[1fr] opacity-100 mt-1" 
                            : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="ml-4 pl-4 border-l border-gray-200 flex flex-col gap-1">
                            {restaurants.map((rest) => {
                              const isActive = location.pathname === rest.to;
                              return (
                                <Link
                                  key={rest.to}
                                  to={rest.to}
                                  onClick={() => setOpen(false)}
                                  className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                                    isActive
                                      ? "text-red-600 font-medium bg-red-50"
                                      : "text-gray-600 hover:bg-gray-100"
                                  }`}
                                >
                                  {rest.label}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Re-order & Profile */}
                    {links.slice(2).map((link) => {
                      const Icon = link.icon;
                      const isActive = location.pathname === link.to;
                      return (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={() => setOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                            isActive
                              ? "bg-red-50 text-red-600 font-medium"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <Icon className={`h-5 w-5 ${isActive ? "text-red-600" : "text-gray-500"}`} />
                          {link.label}
                        </Link>
                      );
                    })}

                  </div>
                </DrawerContent>
              </Drawer>
            </div>

            {/* Branding */}
            <Link to="/" className="flex items-center gap-3 group select-none"> 
              <div className="relative transition-transform duration-300 ease-in-out group-hover:scale-110">
                <img 
                  src="/dinelogonew.png" 
                  alt="DineXpress Logo" 
                  width={40} 
                  height={40} 
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900 transition-colors duration-300 group-hover:text-[#D35454]">
                DineXpress
              </span>
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-6">
             {links.map((link) => (
               <Link 
                 key={link.to} 
                 to={link.to} 
                 className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
               >
                 {link.label}
               </Link>
             ))}
          </div>

        </div>
      </div>
    </header>
  );
}
