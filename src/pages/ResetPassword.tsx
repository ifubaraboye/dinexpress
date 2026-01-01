"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setIsSuccess(true);
      toast.success("Password reset successfully");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans">
      
      <div className="w-full max-w-[360px] space-y-10">
        
        {/* Minimal Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-6">
             <img src="/dinelogonew.png" alt="Logo" className="w-10 h-10 grayscale brightness-50" />
          </div>
          
          {!isSuccess ? (
            <>
              <h1 className="text-2xl font-black tracking-tight text-gray-900">
                Set new password
              </h1>
              <p className="text-sm text-gray-400 font-medium px-4">
                Your new password must be different from previously used passwords.
              </p>
            </>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                 <CheckCircle2 size={32} />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-gray-900">
                Password reset
              </h1>
              <p className="text-sm text-gray-400 font-medium px-4 mt-2">
                Your password has been successfully reset. Click below to log in.
              </p>
            </div>
          )}
        </div>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1 relative">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">New Password</label>
                <Input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="h-12 bg-gray-50 border-transparent focus:bg-white focus:border-gray-100 transition-all rounded-xl shadow-none pr-10 text-sm font-medium"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 bottom-3.5 text-gray-300 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Confirm Password</label>
                <Input 
                  type={showPassword ? "text" : "password"} 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="h-12 bg-gray-50 border-transparent focus:bg-white focus:border-gray-100 transition-all rounded-xl shadow-none text-sm font-medium"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading || !password || !confirmPassword}
              className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all shadow-lg shadow-red-100 cursor-pointer border-none"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Reset Password"}
            </Button>
          </form>
        ) : (
          <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
             <Link 
               to="/login" 
               className="inline-block w-full py-4 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-100"
             >
               Back to Login
             </Link>
          </div>
        )}

      </div>
    </div>
  );
}
