"use client";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Welcome back");
      navigate("/");
    }, 1000);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Account created");
      setActiveTab("login");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans">
      
      <div className="w-full max-w-[360px] space-y-5">
        
        {/* Minimal Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-6">
             <img src="/dinelogonew.png" alt="Logo" className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">
            {activeTab === "login" ? "Sign in to DineXpress" : "Create your account"}
          </h1>
          <p className="text-sm text-gray-400 font-medium">
            Enter your details below to continue
          </p>
        </div>

        {/* Minimal Tab Switcher with Sliding Line */}
        <div className="flex justify-center relative border-b border-gray-50 pb-4">
          <div className="flex gap-12 relative">
            <button 
              onClick={() => setActiveTab("login")}
              className={cn(
                "text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer",
                activeTab === "login" ? "text-gray-900" : "text-gray-300 hover:text-gray-500"
              )}
            >
              Login
            </button>
            <button 
              onClick={() => setActiveTab("signup")}
              className={cn(
                "text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer",
                activeTab === "signup" ? "text-gray-900" : "text-gray-300 hover:text-gray-500"
              )}
            >
              Sign Up
            </button>

            {/* Sliding Line Indicator */}
            <div 
              className={cn(
                "absolute -bottom-[17px] h-0.5 bg-red-600 transition-all duration-300 ease-in-out rounded-full",
                activeTab === "login" ? "left-0 w-[42px]" : "left-[88px] w-[58px]"
              )}
            />
          </div>
        </div>

        {/* Swipe Transition Container */}
        <div className="relative overflow-hidden">
          <div 
            className={cn(
              "flex w-[200%] transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] items-start",
              activeTab === "login" ? "translate-x-0" : "-translate-x-1/2"
            )}
          >
            {/* Login Form */}
            <div className={cn(
                "w-1/2 pr-4 transition-opacity duration-500",
                activeTab === "login" ? "opacity-100" : "opacity-0 pointer-events-none"
            )}>
              <form onSubmit={handleLogin} className="space-y-4">
                <Input 
                  type="email" 
                  placeholder="Email address" 
                  className="h-12 bg-gray-50 border-transparent focus:bg-white focus:border-red-100 transition-all rounded-xl shadow-none text-sm font-medium"
                  required
                />
                <div className="relative group">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password" 
                    className="h-12 bg-gray-50 border-transparent focus:bg-white focus:border-red-100 transition-all rounded-xl shadow-none pr-10 text-sm font-medium"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="flex justify-end">
                   <Link to="/forgot-password" title="Reset your password">
                     <button type="button" className="text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-red-600 cursor-pointer">Forgot password?</button>
                   </Link>
                </div>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all mt-4 shadow-lg shadow-red-100 cursor-pointer border-none"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : "Login"}
                </Button>
              </form>
            </div>

            {/* Signup Form */}
            <div className={cn(
                "w-1/2 pl-4 transition-opacity duration-500",
                activeTab === "signup" ? "opacity-100" : "opacity-0 pointer-events-none"
            )}>
              <form onSubmit={handleSignup} className="space-y-4">
                <Input 
                  placeholder="Full name" 
                  className="h-12 bg-gray-50 border-transparent focus:bg-white focus:border-red-100 transition-all rounded-xl shadow-none text-sm font-medium"
                  required
                />
                <Input 
                  type="email" 
                  placeholder="Email address" 
                  className="h-12 bg-gray-50 border-transparent focus:bg-white focus:border-red-100 transition-all rounded-xl shadow-none text-sm font-medium"
                  required
                />
                <Input 
                  type="password" 
                  placeholder="Create password" 
                  className="h-12 bg-gray-50 border-transparent focus:bg-white focus:border-red-100 transition-all rounded-xl shadow-none text-sm font-medium"
                  required
                />
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all mt-4 shadow-lg shadow-red-100 cursor-pointer border-none"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : "Create Account"}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Divider and Google OAuth */}
        <div className="space-y-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-50"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
              <span className="bg-white px-4 text-gray-300">Or continue with</span>
            </div>
          </div>

          <button 
            type="button"
            className="w-full h-12 flex items-center justify-center gap-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all active:scale-[0.98] cursor-pointer shadow-sm shadow-gray-50"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 grayscale opacity-70" />
            <span className="text-sm font-bold text-gray-600 tracking-tight">Google</span>
          </button>
        </div>

        <p className="text-center text-[10px] text-gray-300 font-medium leading-relaxed px-4">
           By continuing, you agree to our <span className="text-gray-400 underline">Terms</span> and <span className="text-gray-400 underline">Privacy</span>.
        </p>

      </div>
    </div>
  );
}