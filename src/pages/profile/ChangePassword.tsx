import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Password updated");
      setIsLoading(false);
      navigate("/profile");
    }, 800);
  };

  return (
    <div className="bg-white min-h-screen pt-24 px-4 pb-12">
      <div className="max-w-lg mx-auto">
        
        {/* Minimal Header */}
        <div className="mb-10">
          <Link to="/profile" className="inline-flex items-center text-gray-400 hover:text-gray-900 transition-colors mb-8 group">
            <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Security</h1>
          <p className="text-gray-500 mt-2 text-lg">Ensure your account stays secure by updating your password.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="current" className="text-sm font-medium text-gray-700">Current Password</label>
            <div className="relative">
              <Input
                id="current"
                type={showPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="h-12 bg-gray-50 border-transparent focus:bg-white focus:border-gray-200 transition-all rounded-xl pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="new" className="text-sm font-medium text-gray-700">New Password</label>
            <Input
              id="new"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="h-12 bg-gray-50 border-transparent focus:bg-white focus:border-gray-200 transition-all rounded-xl"
              required
            />
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl text-base font-semibold shadow-none hover:shadow-md transition-all"
              disabled={isLoading || !currentPassword || !newPassword}
            >
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}
