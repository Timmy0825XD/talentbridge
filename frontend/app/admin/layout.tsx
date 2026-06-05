"use client";

import { useAuth } from "@/src/context/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard, Users, Briefcase, Scale,
  Building2, GraduationCap, UserPlus, LogOut, Shield, Menu, X,
} from "lucide-react";

const navLinks = [
  { label: "Métricas",      href: "/admin",              icon: LayoutDashboard },
  { label: "Usuarios",      href: "/admin/usuarios",     icon: Users },
  { label: "Vacantes",      href: "/admin/vacantes",     icon: Briefcase },
  { label: "Pesos ranking", href: "/admin/pesos-ranking",icon: Scale },
  { label: "Universidades", href: "/admin/universidades",icon: Building2 },
  { label: "Carreras",      href: "/admin/carreras",     icon: GraduationCap },
  { label: "Crear admin",   href: "/admin/admins",       icon: UserPlus },
];

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

function SidebarContent({
  pathname,
  logout,
  onClose,
}: {
  pathname: string;
  logout: () => void;
  onClose?: () => void;
}) {
  return (
    <>
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#6bfe9c]" />
          <span className="text-white font-headline font-black text-lg tracking-tight">Admin</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-white/60 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      <p className="text-white/40 text-xs px-6 pt-1 pb-2">TalentBridge</p>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navLinks.map(({ label, href, icon: Icon }) => {
          const active = isNavActive(pathname, href);
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? "bg-[#6bfe9c]/15 text-[#6bfe9c]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <button onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/60 hover:text-white hover:bg-white/5 transition-all w-full">
          <LogOut className="w-4 h-4" /> Cerrar sesión
        </button>
      </div>
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "ADMIN")) router.replace("/");
  }, [user, isLoading, router]);

  useEffect(() => { setOpen(false); }, [pathname]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
        <span className="w-8 h-8 border-2 border-[#424750]/20 border-t-[#424750] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex">

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-60 bg-[#191c1e] flex-col z-50">
        <SidebarContent pathname={pathname} logout={logout} />
      </aside>

      {/* Drawer mobile */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="relative w-72 max-w-[85vw] bg-[#191c1e] flex flex-col h-full shadow-2xl">
            <SidebarContent pathname={pathname} logout={logout} onClose={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Top bar mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 bg-[#191c1e] shadow-md">
        <Link href="/admin" className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#6bfe9c]" />
          <span className="text-white font-headline font-black text-base tracking-tight">Admin</span>
        </Link>
        <button onClick={() => setOpen(true)} className="text-white p-1">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <main className="flex-1 lg:ml-60 min-h-screen pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}