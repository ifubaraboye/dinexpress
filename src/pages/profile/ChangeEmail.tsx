import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useUser } from "@clerk/clerk-react";

interface ChangeEmailProps {
  onConfirm?: (newEmail: string) => void;
}

export default function ChangeEmail({ onConfirm }: ChangeEmailProps) {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !user) return;
    setIsLoading(true);
    
    try {
      const emailResource = await user.createEmailAddress({ email });
      await emailResource.prepareVerification({ strategy: "email_code" });
      setPendingVerification(true);
      toast.success("Verification code sent");
    } catch (err: any) {
      console.error(err);
      toast.error(err.errors?.[0]?.message || "Failed to send code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !user) return;
    setIsLoading(true);

    try {
      const emailResource = user.emailAddresses.find(e => e.emailAddress === email);
      if (!emailResource) throw new Error("Email resource not found");

      const verification = await emailResource.attemptVerification({ code });
      if (verification.verification.status === "verified") {
        await user.update({ primaryEmailAddressId: emailResource.id });
        toast.success("Email updated successfully");
        if (onConfirm) onConfirm(email);
        navigate("/profile");
      } else {
        toast.error("Verification failed");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.errors?.[0]?.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
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

        {!pendingVerification ? (
          <form onSubmit={handleSendCode} className="space-y-6">
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
        ) : (
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium text-gray-700">Verification Code</label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter code"
                className="h-12 bg-gray-50 border-transparent focus:bg-white focus:border-gray-200 transition-all rounded-xl text-center tracking-widest"
                required
              />
              <p className="text-sm text-gray-500 pt-1">
                Enter the code sent to {email}
              </p>
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl text-base font-semibold shadow-none hover:shadow-md transition-all"
                disabled={isLoading || !code}
              >
                {isLoading ? "Verifying..." : "Verify & Update"}
              </Button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
