import { useQuery } from "convex/react";
import { Navigate, Outlet } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";

type Role = "student" | "runner" | "admin";

interface ProtectedRouteProps {
  allowedRoles: Role[];
  allowGuests?: boolean;
}

export default function ProtectedRoute({ allowedRoles, allowGuests }: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useUser();
  const user = useQuery(api.users.current);

  // If Clerk is still loading, or if the user is signed in but Convex profile is still fetching
  if (!isLoaded || (isSignedIn && user === undefined)) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  // If not signed in, either allow guest access or redirect to login
  if (!isSignedIn) {
    if (allowGuests) return <Outlet />;
    return <Navigate to="/login" replace />;
  }

  // If signed in but Convex profile is not found yet (e.g. webhook delay), keep waiting
  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <Loader2 className="h-8 w-8 animate-spin text-red-600" />
           <p className="text-sm font-medium text-gray-500">Syncing profile...</p>
        </div>
      </div>
    );
  }

  if (!allowedRoles.includes(user.role as Role)) {
    // Redirect based on their actual role to avoid getting stuck
    if (user.role === "runner") {
        return <Navigate to="/runner" replace />;
    } else if (user.role === "admin") {
        return <Navigate to="/dashboard" replace />;
    } else {
        return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}
