import { useQuery } from "convex/react";
import { Navigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const { isLoaded, isSignedIn } = useUser();
  const user = useQuery(api.users.current);

  if (!isLoaded || (isSignedIn && user === undefined)) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
           <Loader2 className="h-8 w-8 animate-spin text-red-600" />
           <p className="text-sm font-medium text-gray-500">Setting up your experience...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  if (user) {
    if (user.role === "admin") {
      return <Navigate to="/dashboard" replace />;
    } else if (user.role === "runner") {
      return <Navigate to="/runner" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // If user is null but isSignedIn is true, we keep waiting for the profile to sync
  return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
         <Loader2 className="h-8 w-8 animate-spin text-red-600" />
         <p className="text-sm font-medium text-gray-500">Syncing your account...</p>
      </div>
    </div>
  );
}
