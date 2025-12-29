"use client";

import { createContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
// import { apiFetch } from "@/lib/api";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  user: any;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const setCookie = (name: string, value: string, days = 7) => {
    try {
      const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Expires=${expires}; SameSite=Lax`;
    } catch {}
  };

  const clearCookie = (name: string) => {
    try {
      document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    } catch {}
  };

  const roleHome = (role?: string) => {
    if (role === "runner") return "/runner";
    if (role === "admin") return "/dashboard";
    return "/";
  };

  useEffect(() => {
    const verifyToken = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await apiFetch<{ user: any }>("/auth/user");
        setUser(data.user);
        setIsAuthenticated(true);
        // reflect auth state to middleware via cookies
        if (data.user?.role) setCookie("app-role", String(data.user.role));
        setCookie("app-auth", "1");
      } catch (error) {
        localStorage.removeItem("token");
        clearCookie("app-role");
        clearCookie("app-auth");
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    verifyToken();
  }, []);

  const login = async (token: string) => {
    localStorage.setItem("token", token);
    try {
      const data = await apiFetch<{ user: any }>("/auth/user");
      setUser(data.user);
      setIsAuthenticated(true);
      if (data.user?.role) setCookie("app-role", String(data.user.role));
      setCookie("app-auth", "1");
      const dest = roleHome(data.user?.role);
      navigate.replace(dest);
    } catch (e) {
      // fallback: go to signin on failure
      navigate.replace("/auth/signin");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
    clearCookie("app-role");
    clearCookie("app-auth");
    navigate.replace("/auth/signin");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
