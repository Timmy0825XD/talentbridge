"use client";

import { useAuth } from "@/src/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogOut, Building2 } from "lucide-react";

export default function CompanyDashboardPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  // Proteger la ruta
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/login");
    }
    if (!isLoading && user && user.role !== "COMPANY") {
      router.replace("/dashboard/candidate");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
        <span className="w-8 h-8 border-2 border-[#00386c]/20 border-t-[#00386c] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-lg text-center space-y-8">

        {/* Icono */}
        <div className="w-20 h-20 bg-[#006d37] rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-[#006d37]/20">
          <Building2 className="w-10 h-10 text-white" />
        </div>

        {/* Bienvenida */}
        <div className="space-y-3">
          <p className="text-[#006d37] font-semibold text-sm uppercase tracking-widest">
            Empresa
          </p>
          <h1 className="text-4xl font-extrabold text-[#00386c] font-headline">
            ¡Bienvenido a TalentBridge!
          </h1>
          <p className="text-[#424750] text-lg leading-relaxed">
            Tu cuenta empresarial está lista. Pronto podrás publicar vacantes y
            conectar con el talento universitario del Cesar.
          </p>
        </div>

        {/* Info de sesión */}
        <div className="bg-white rounded-2xl p-6 border border-[#e6e8ea] text-left space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#737781]">Sesión activa</p>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#424750]">Rol</span>
            <span className="text-sm font-semibold text-[#006d37]">Empresa</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#424750]">ID de usuario</span>
            <span className="text-xs font-mono text-[#737781] truncate max-w-[180px]">{user.userId}</span>
          </div>
        </div>

        {/* Cerrar sesión */}
        <button
          onClick={logout}
          className="flex items-center gap-2 mx-auto text-sm font-medium text-[#424750] hover:text-[#ba1a1a] transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}