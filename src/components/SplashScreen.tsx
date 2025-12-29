import type { ReactNode } from "react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface SplashProviderProps {
  children: ReactNode;
  redirectTo?: string;
  duration?: number; // in milliseconds
}

export function SplashScreen({
  children,
  redirectTo,
  duration = 5000, // default = 5 seconds
}: SplashProviderProps) {
  const [showSplash, setShowSplash] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!redirectTo) return;

    const timer = setTimeout(() => {
      navigate(redirectTo, { replace: true });
      setShowSplash(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [navigate, redirectTo, duration]);

  if (showSplash) {
    return (
      <div className="fixed bg-[#bf1f1b] inset-0 flex items-center justify-center">
        <img
          className="bg-[#bf1f1b]"
          src="/icon-256x256.png"
          width={100}
          height={100}
          alt="DineXpress"
        />
      </div>
    );
  }

  return <>{children}</>;
}
