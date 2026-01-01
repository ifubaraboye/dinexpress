"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";

export default function SSOCallbackPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative">
          <Loader2 className="absolute inset-0 h-16 w-16 animate-spin text-red-600" />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Authenticating</h2>
          <p className="text-sm font-medium text-gray-400 mt-1">Please wait while we set up your session...</p>
        </div>
      </div>
      {/* Clerk's logic component - usually renders nothing while processing */}
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
