"use client";

import { useAuth } from "@/src/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LogOut, GraduationCap } from "lucide-react";

export default function InstitutionLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "INSTITUTION")) router.replace("/");
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
        <span className="w-8 h-8 border-2 border-[#00386c]/20 border-t-[#00386c] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto">
          <Link href="/institution"
            className="flex items-center gap-2 text-2xl font-black text-[#00386c] tracking-tighter font-headline hover:opacity-80 transition-opacity">
            <GraduationCap className="w-6 h-6" />
            TalentBridge
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#00386c] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <button onClick={logout}
              className="p-2 rounded-full hover:bg-[#ffdad6] transition-colors group" title="Cerrar sesión">
              <LogOut className="w-5 h-5 text-[#424750] group-hover:text-[#ba1a1a] transition-colors" />
            </button>
          </div>
        </div>
      </header>
      <div className="pt-20">{children}</div>
    </div>
  );
}