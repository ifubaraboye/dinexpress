import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ChangeAddressProps {
  onConfirm: (newAddress: string) => void;
}

export default function ChangeAddress({ onConfirm }: ChangeAddressProps) {
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onConfirm(address);
      toast.success("Address updated");
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
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Delivery Address</h1>
          <p className="text-gray-500 mt-2 text-lg">Set your default delivery location for faster checkout.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium text-gray-700">Address</label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Hostel A, Room 101"
              className="h-12 bg-gray-50 border-transparent focus:bg-white focus:border-gray-200 transition-all rounded-xl"
              required
            />
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl text-base font-semibold shadow-none hover:shadow-md transition-all"
              disabled={isLoading || !address}
            >
              {isLoading ? "Saving..." : "Save Address"}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}
