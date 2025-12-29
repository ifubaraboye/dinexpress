"use client";

import { Link, useLocation } from "react-router-dom";
import { Menu, Home, Package, History, User, ChevronDown } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function RunnerNavbar() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();

  const links = [
    { to: "/runner", label: "Dashboard", icon: Home },
    { to: "/runner/orders", label: "Orders", icon: Package },
    { to: "/runner/history", label: "History", icon: History },
    { to: "/runner/profile", label: "Profile", icon: User },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
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
                    {links.map((link) => {
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
            <Link to="/runner" className="flex items-center gap-3 group select-none"> 
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
                 className={`text-sm font-medium transition-colors ${
                   location.pathname === link.to ? "text-red-600" : "text-gray-600 hover:text-red-600"
                 }`}
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
