import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ChangeNameProps {
  onConfirm: (newName: string) => void;
}

export default function ChangeName({ onConfirm }: ChangeNameProps) {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const fullName = `${firstName} ${lastName}`.trim();
      onConfirm(fullName);
      toast.success("Name updated");
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
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Personal Info</h1>
          <p className="text-gray-500 mt-2 text-lg">Update your name as it appears on your profile.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="h-12 bg-gray-50 border-transparent focus:bg-white focus:border-gray-200 transition-all rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="h-12 bg-gray-50 border-transparent focus:bg-white focus:border-gray-200 transition-all rounded-xl"
                required
              />
            </div>
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl text-base font-semibold shadow-none hover:shadow-md transition-all"
              disabled={isLoading || !firstName || !lastName}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}
