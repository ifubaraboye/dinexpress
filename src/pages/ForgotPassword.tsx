"use client";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setIsSent(true);
      toast.success("Reset link sent to your email");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans">
      
      <div className="w-full max-w-[360px] space-y-10">
        
        {/* Minimal Header */}
        <div className="text-center space-y-3">
          {/* <div className="flex justify-center mb-6">
             <img src="/dinelogonew.png" alt="Logo" className="w-10 h-10" />
          </div> */}
          
          {!isSent ? (
            <>
              <h1 className="text-2xl font-black tracking-tight text-gray-900">
                Forgot password?
              </h1>
              <p className="text-sm text-gray-400 font-medium px-4">
                No worries, we'll send you instructions to reset it.
              </p>
            </>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                 <CheckCircle2 size={32} />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-gray-900">
                Check your email
              </h1>
              <p className="text-sm text-gray-400 font-medium px-4 mt-2">
                We've sent a password reset link to <span className="text-gray-900 font-bold">{email}</span>
              </p>
            </div>
          )}
        </div>

        {!isSent ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
              <Input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com" 
                className="h-12 bg-gray-50 border-transparent focus:bg-white focus:border-gray-100 transition-all rounded-xl shadow-none text-sm font-medium"
                required
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading || !email}
              className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all shadow-lg shadow-red-100 cursor-pointer border-none"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Reset Password"}
            </Button>

            <Link 
              to="/login" 
              className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft size={14} />
              Back to login
            </Link>
          </form>
        ) : (
          <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
             <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xs text-gray-500 font-medium">
                  Didn't receive the email? Check your spam folder or
                  <button 
                    onClick={() => setIsSent(false)}
                    className="text-red-600 font-bold ml-1 hover:underline cursor-pointer"
                  >
                    try another email
                  </button>
                </p>
             </div>
             
             <Link 
               to="/login" 
               className="inline-block px-8 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-100"
             >
               Back to Login
             </Link>
          </div>
        )}

      </div>
    </div>
  );
}
