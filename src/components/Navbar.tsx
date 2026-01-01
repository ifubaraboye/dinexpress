"use client";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Menu, 
  Home, 
  Search, 
  RotateCcw, 
  User, 
  Utensils, 
  ChevronDown, 
  LogOut, 
  ShoppingBag,
  LogIn
} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [restaurantsOpen, setRestaurantsOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut } = useClerk();

  // Fetch Convex user profile to check role
  const convexUser = useQuery(api.users.current);
  const isAdmin = convexUser?.role === "admin";

  const mainLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/search", label: "Search", icon: Search },
    { to: "/reorder", label: "Orders", icon: RotateCcw },
  ];

  const restaurants = [
    { to: "/dunnkayce", label: "Dunnkayce" },
    { to: "/grills", label: "Grills" },
    { to: "/bto", label: "BTO" },
    { to: "/the-laughters-kitchen", label: "The Laughters Kitchen" },
  ];

  useEffect(() => {
    setVisible(true);
  }, [location.pathname]);

  useEffect(() => {
    let lastY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastY && currentScrollY > 10) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      lastY = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md transition-transform duration-300 ${
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
                  <Button variant="ghost" size="icon" className="rounded-xl">
                    <Menu className="h-6 w-6" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="h-full w-[280px] rounded-r-2xl rounded-l-none outline-none flex flex-col">
                  <DrawerHeader className="text-left px-6 py-4 border-b border-gray-50 flex-shrink-0">
                    <DrawerTitle className="text-xl font-bold text-red-600">
                      <div className="flex items-center gap-3 group select-none">
                        <img src="/dinelogonew.png" alt="Logo" width={32} height={32} />
                        <p>DineXpress</p>
                      </div>
                    </DrawerTitle>
                  </DrawerHeader>
                  <div className="flex flex-col flex-1 overflow-y-auto p-4 gap-2">
                    {mainLinks.map((link) => {
                      const Icon = link.icon;
                      const isActive = location.pathname === link.to;
                      return (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={() => setOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                            isActive ? "bg-red-50 text-red-600 font-bold" : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <Icon className={`h-5 w-5 ${isActive ? "text-red-600" : "text-gray-400"}`} />
                          {link.label}
                        </Link>
                      );
                    })}

                    {isAdmin && (
                      <Link
                        to="/dashboard"
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                          location.pathname === "/dashboard" ? "bg-red-50 text-red-600 font-bold" : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <RotateCcw className={`h-5 w-5 ${location.pathname === "/dashboard" ? "text-red-600" : "text-gray-400"}`} />
                        Dashboard
                      </Link>
                    )}

                    <div className="border-t border-gray-50">
                      <button
                        onClick={() => setRestaurantsOpen(!restaurantsOpen)}
                        className="flex w-full items-center justify-between px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Utensils className="h-5 w-5 text-gray-400" />
                          <span className="font-medium">Restaurants</span>
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
                          <div className="ml-4 pl-4 border-l border-gray-100 flex flex-col gap-1 mt-1">
                            {restaurants.map((rest) => (
                              <Link
                                key={rest.to}
                                to={rest.to}
                                onClick={() => setOpen(false)}
                                className="block px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50"
                              >
                                {rest.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto p-4 border-t border-gray-50 flex-shrink-0">
                    {isSignedIn ? (
                      <>
                        <div className="px-4 mb-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 shadow-sm">
                            <img src={user.imageUrl} alt={user.fullName || "User"} className="w-full h-full object-cover" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-bold text-gray-900 leading-none truncate">{user.fullName}</p>
                            <p className="text-[10px] font-medium text-gray-400 mt-1 truncate">{user.primaryEmailAddress?.emailAddress}</p>
                          </div>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                            location.pathname === "/profile" ? "bg-red-50 text-red-600 font-bold" : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <User className="h-5 w-5" />
                          Manage Profile
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors mt-1"
                        >
                          <LogOut className="h-5 w-5" />
                          <span className="font-medium text-sm">Sign Out</span>
                        </button>
                      </>
                    ) : (
                      <Link
                        to="/login"
                        onClick={() => setOpen(false)}
                        className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors"
                      >
                        <LogIn size={18} />
                        Sign In
                      </Link>
                    )}
                  </div>
                </DrawerContent>
              </Drawer>
            </div>

            {/* Branding */}
            <Link to="/" className="flex items-center gap-3 group select-none"> 
              <img src="/dinelogonew.png" alt="Logo" width={36} height={36} className="transition-transform group-hover:scale-110" />
              <span className="text-xl font-black tracking-tighter text-gray-900 group-hover:text-red-600 transition-colors">
                DineXpress
              </span>
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-2">
             <div className="flex items-center gap-6 mr-4">
                {mainLinks.map((link) => (
                  <Link 
                    key={link.to} 
                    to={link.to} 
                    className={`text-sm font-bold transition-colors ${
                      location.pathname === link.to ? "text-red-600" : "text-gray-500 hover:text-red-600"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
             </div>

             {/* Profile Dropdown */}
             {isLoaded && (
               isSignedIn ? (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 rounded-full bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer border border-transparent hover:border-gray-200 group">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white shadow-sm">
                           <img src={user.imageUrl} alt={user.fullName || "User"} className="w-full h-full object-cover" />
                        </div>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 mt-2">
                      <DropdownMenuLabel className="font-bold text-xs uppercase tracking-widest text-gray-400 py-3">
                        {user.fullName || "Account"}
                      </DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer gap-3 py-3">
                        <User size={18} className="text-gray-400" />
                        <span>My Profile</span>
                      </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => navigate("/reorder")} className="cursor-pointer gap-3 py-3">
                                          <ShoppingBag size={18} className="text-gray-400" />
                                          <span>Orders</span>
                                        </DropdownMenuItem>
                                        
                                        {isAdmin && (
                                          <DropdownMenuItem onClick={() => navigate("/dashboard")} className="cursor-pointer gap-3 py-3">
                                            <ShoppingBag size={18} className="text-gray-400" />
                                            <span>Dashboard</span>
                                          </DropdownMenuItem>
                                        )}
                      
                                        <DropdownMenuSeparator />
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="cursor-pointer gap-3 py-3">
                          <Utensils size={18} className="text-gray-400" />
                          <span>Restaurants</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent className="w-48 rounded-xl ml-1">
                            {restaurants.map((rest) => (
                              <DropdownMenuItem 
                                key={rest.to} 
                                onClick={() => navigate(rest.to)}
                                className="cursor-pointer py-2.5"
                              >
                                {rest.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>

                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer gap-3 py-3 text-red-600 focus:text-red-600 focus:bg-red-50">
                        <LogOut size={18} />
                        <span>Sign Out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                 </DropdownMenu>
               ) : (
                 <Button asChild className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-100">
                    <Link to="/login">Sign In</Link>
                 </Button>
               )
             )}
          </div>

        </div>
      </div>
    </header>
  );
}