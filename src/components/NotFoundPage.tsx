import { useNavigate } from "react-router-dom";
import { Utensils, ArrowLeft, Home } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#FAFAFA] min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* Icon Illustration */}
        <div className="relative mb-8 flex justify-center">
          <div className="w-24 h-24 bg-red-50 rounded-[32px] flex items-center justify-center rotate-12 transition-transform hover:rotate-0 duration-500">
            <Utensils size={40} className="text-red-600 -rotate-12 group-hover:rotate-0 transition-transform" />
          </div>
          <div className="absolute -top-2 -right-2 bg-white border border-gray-100 px-3 py-1 rounded-full shadow-sm">
            <span className="text-xs font-black text-red-600 tracking-tighter">404</span>
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">
          Lost your appetite?
        </h1>
        <p className="text-gray-500 font-medium mb-10 leading-relaxed">
          The page you're looking for doesn't exist. It might have been moved or eaten by a hungry runner.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center cursor-pointer gap-2 w-full py-4 bg-red-600 text-white rounded-[20px] font-bold text-sm shadow-sm shadow-red-100 hover:bg-red-700 active:scale-[0.98] transition-all"
          >
            <Home size={18} />
            Back to Home
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 w-full cursor-pointer py-4 bg-white border border-gray-100 text-gray-600 rounded-[20px] font-bold text-sm hover:bg-gray-50 active:scale-[0.98] transition-all"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>

        {/* Subtle Footer Link */}
        <p className="mt-12 text-[11px] text-gray-400 font-bold uppercase tracking-widest">
          Need help? <span className="text-red-600 cursor-pointer">Contact Support</span>
        </p>
      </div>
    </div>
  );
}