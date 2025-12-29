import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ChangeEmailProps {
  onConfirm: (newEmail: string) => void;
}

export default function ChangeEmail({ onConfirm }: ChangeEmailProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onConfirm(email);
      toast.success("Verification email sent");
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
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Email Address</h1>
          <p className="text-gray-500 mt-2 text-lg">Manage the email address associated with your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">New Email</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="h-12 bg-gray-50 border-transparent focus:bg-white focus:border-gray-200 transition-all rounded-xl"
              required
            />
            <p className="text-sm text-gray-500 pt-1">
              We'll send a verification link to this email address.
            </p>
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl text-base font-semibold shadow-none hover:shadow-md transition-all"
              disabled={isLoading || !email}
            >
              {isLoading ? "Sending..." : "Update Email"}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}
