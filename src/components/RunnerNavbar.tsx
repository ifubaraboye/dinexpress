"use client";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Menu, 
  Home, 
  Package, 
  History, 
  User, 
  LogOut, 
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
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";

export default function RunnerNavbar() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const links = [
    { to: "/runner", label: "Home", icon: Home },
    { to: "/runner/orders", label: "Orders", icon: Package },
    { to: "/runner/history", label: "History", icon: History },
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
                    {links.map((link) => {
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
                  </div>

                  <div className="mt-auto p-4 border-t border-gray-50 flex-shrink-0">
                     {isSignedIn ? (
                      <>
                        <div className="px-4 mb-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 shadow-sm">
                            <img src={user.imageUrl} alt={user.fullName || "Runner"} className="w-full h-full object-cover" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-bold text-gray-900 leading-none truncate">{user.fullName || "Runner"}</p>
                            <p className="text-[10px] font-medium text-gray-400 mt-1 truncate">Dispatch Account</p>
                          </div>
                        </div>
                        <Link
                          to="/runner/profile"
                          onClick={() => setOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                            location.pathname === "/runner/profile" ? "bg-red-50 text-red-600 font-bold" : "text-gray-600 hover:bg-gray-50"
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
            <Link to="/runner" className="flex items-center gap-3 group select-none"> 
              <img src="/dinelogonew.png" alt="Logo" width={36} height={36} className="transition-transform group-hover:scale-110" />
              <span className="text-xl font-black tracking-tighter text-gray-900 group-hover:text-[#D35454] transition-colors">
                DineXpress
              </span>
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-2">
             <div className="flex items-center gap-6 mr-4">
                {links.map((link) => (
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
                      <button className="flex items-center gap-2 p-1 pr-3 rounded-full bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer border border-transparent hover:border-gray-200 group">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white shadow-sm">
                           <img src={user.imageUrl} alt={user.fullName || "Runner"} className="w-full h-full object-cover" />
                        </div>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 mt-2">
                      <DropdownMenuLabel className="font-bold text-xs uppercase tracking-widest text-gray-400 py-3">
                        {user.fullName || "Account"}
                      </DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => navigate("/runner/profile")} className="cursor-pointer gap-3 py-3">
                        <User size={18} className="text-gray-400" />
                        <span>My Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/runner/orders")} className="cursor-pointer gap-3 py-3">
                        <Package size={18} className="text-gray-400" />
                        <span>Orders</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/runner/history")} className="cursor-pointer gap-3 py-3">
                        <History size={18} className="text-gray-400" />
                        <span>History</span>
                      </DropdownMenuItem>
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