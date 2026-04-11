"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type UserRole = "STUDENT" | "GRADUATE" | "COMPANY" | "INSTITUTION" | "ADMIN";

interface AuthUser {
  userId: string;
  role: UserRole;
  token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (data: AuthUser) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const token = localStorage.getItem("tb_token");
      const role = localStorage.getItem("tb_role") as UserRole | null;
      const userId = localStorage.getItem("tb_userId");

      if (token && role && userId) {
        setUser({ token, role, userId });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  function login(data: AuthUser) {
    localStorage.setItem("tb_token", data.token);
    localStorage.setItem("tb_role", data.role);
    localStorage.setItem("tb_userId", data.userId);
    setUser(data);

    if (data.role === "STUDENT" || data.role === "GRADUATE") {
      router.push("/dashboard/candidate");
    } else if (data.role === "COMPANY") {
      router.push("/dashboard/company");
    } else {
      router.push("/");
    }
  }

  function logout() {
    localStorage.removeItem("tb_token");
    localStorage.removeItem("tb_role");
    localStorage.removeItem("tb_userId");
    setUser(null);
    router.push("/");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}