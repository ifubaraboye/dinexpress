import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import RunnerNavbar from "./components/RunnerNavbar";
import { CartProvider } from "../context/CartContext";
import { Toaster } from "./components/ui/sonner";
import { cn } from "@/lib/utils";

export default function App() {
  const location = useLocation();
  const isRunnerRoute = location.pathname.startsWith("/runner");
  const isAuthRoute = 
    location.pathname.startsWith("/login") || 
    location.pathname.startsWith("/forgot-password") || 
    location.pathname.startsWith("/reset-password");

  return (
    <CartProvider>
      <div className="app-container">
        {!isAuthRoute && (isRunnerRoute ? <RunnerNavbar /> : <Navbar />)}
        <main className={cn("min-h-[80vh]", !isAuthRoute && "pt-0")}>
          <Outlet /> {/* This is where child pages render */}
        </main>
        <Toaster />
      </div>
    </CartProvider>
  );
}