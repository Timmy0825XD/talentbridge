"use client";

import { useAuth } from "@/src/context/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Settings, GraduationCap, Building2, LogOut, Menu, X } from "lucide-react";

type UserRole = "STUDENT" | "GRADUATE" | "COMPANY" | "INSTITUTION" | "ADMIN";

const navLinks: Record<string, { label: string; href: string }[]> = {
  STUDENT: [
    { label: "Dashboard",     href: "/dashboard/candidate" },
    { label: "Postulaciones", href: "/dashboard/candidate/postulaciones" },
    { label: "Explorar",      href: "/dashboard/candidate/explorar" },
    { label: "Contratos",     href: "/dashboard/candidate/contratos" },
    { label: "Mi Perfil",     href: "/profile/candidate" },
  ],
  GRADUATE: [
    { label: "Dashboard",     href: "/dashboard/candidate" },
    { label: "Postulaciones", href: "/dashboard/candidate/postulaciones" },
    { label: "Explorar",      href: "/dashboard/candidate/explorar" },
    { label: "Contratos",     href: "/dashboard/candidate/contratos" },
    { label: "Mi Perfil",     href: "/profile/candidate" },
  ],
  COMPANY: [
    { label: "Dashboard",      href: "/dashboard/company" },
    { label: "Mis Vacantes",   href: "/dashboard/company/vacantes" },
    { label: "Buscar Talento", href: "/dashboard/company/talento" },
    { label: "Contratos",      href: "/dashboard/company/contratos" },
    { label: "Beneficios",     href: "/dashboard/company/beneficios-tributarios" },
    { label: "Mi Perfil",      href: "/profile/company" },
  ],
};

function RoleIcon({ role }: { role: UserRole }) {
  if (role === "COMPANY") return <Building2 className="w-5 h-5 text-white" />;
  return <GraduationCap className="w-5 h-5 text-white" />;
}

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/dashboard/candidate" || href === "/dashboard/company") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(href + "/");
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/");
  }, [user, isLoading, router]);

  // Cierra el menú al navegar
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
        <span className="w-8 h-8 border-2 border-[#00386c]/20 border-t-[#00386c] rounded-full animate-spin" />
      </div>
    );
  }

  const links       = navLinks[user.role] ?? navLinks.STUDENT;
  const accentColor = user.role === "COMPANY" ? "#006d37" : "#00386c";
  const avatarBg    = user.role === "COMPANY" ? "bg-[#006d37]" : "bg-[#00386c]";

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <header className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-[#e6e8ea]/60">
        <div className="flex justify-between items-center w-full px-6 lg:px-8 py-3.5 max-w-screen-2xl mx-auto">

          {/* Logo + nombre */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <img
                src="/TalentBridge-logo.jpeg"
                alt="TalentBridge"
                className="h-8 w-auto object-contain rounded-lg"
              />
              <span className="text-xl font-black text-[#00386c] tracking-tighter font-headline">
                TalentBridge
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-5">
              {links.map(({ label, href }) => {
                const active = isNavActive(pathname, href);
                return (
                  <Link key={label} href={href}
                    className={`font-semibold tracking-tight transition-colors duration-200 text-sm whitespace-nowrap ${
                      active ? "border-b-2 pb-0.5" : "text-[#424750] hover:text-[#00386c]"
                    }`}
                    style={active ? { color: accentColor, borderColor: accentColor } : {}}>
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-[#f2f4f6] transition-colors hidden sm:flex">
              <Bell className="w-5 h-5 text-[#424750]" />
            </button>
            <button onClick={logout}
              className="p-2 rounded-full hover:bg-[#ffdad6] transition-colors group hidden sm:flex"
              title="Cerrar sesión">
              <LogOut className="w-5 h-5 text-[#424750] group-hover:text-[#ba1a1a] transition-colors" />
            </button>
            <div className={`w-9 h-9 rounded-full ${avatarBg} flex items-center justify-center hidden sm:flex`}>
              <RoleIcon role={user.role as UserRole} />
            </div>

            {/* Hamburger — solo mobile */}
            <button
              onClick={() => setMenuOpen(p => !p)}
              className="md:hidden p-2 rounded-xl hover:bg-[#f2f4f6] transition-colors ml-1">
              {menuOpen
                ? <X className="w-5 h-5 text-[#00386c]" />
                : <Menu className="w-5 h-5 text-[#00386c]" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-[#e6e8ea] px-6 py-3 space-y-0.5 shadow-lg">
            {links.map(({ label, href }) => {
              const active = isNavActive(pathname, href);
              return (
                <Link key={label} href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center py-3 text-sm font-semibold border-b border-[#f2f4f6] last:border-0 transition-colors ${
                    active ? "font-bold" : "text-[#424750] hover:text-[#00386c]"
                  }`}
                  style={active ? { color: accentColor } : {}}>
                  {active && (
                    <span className="w-1 h-4 rounded-full mr-3 shrink-0" style={{ background: accentColor }} />
                  )}
                  {!active && <span className="w-1 h-4 mr-3 shrink-0" />}
                  {label}
                </Link>
              );
            })}

            {/* Acciones en mobile */}
            <div className="flex items-center justify-between pt-3 pb-1">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full ${avatarBg} flex items-center justify-center`}>
                  <RoleIcon role={user.role as UserRole} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#191c1e]">{user.role}</p>
                  <p className="text-[10px] text-[#737781]">Sesión activa</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-full hover:bg-[#f2f4f6] transition-colors">
                  <Bell className="w-4 h-4 text-[#424750]" />
                </button>
                <button className="p-2 rounded-full hover:bg-[#f2f4f6] transition-colors">
                  <Settings className="w-4 h-4 text-[#424750]" />
                </button>
                <button onClick={logout}
                  className="p-2 rounded-full hover:bg-[#ffdad6] transition-colors group">
                  <LogOut className="w-4 h-4 text-[#424750] group-hover:text-[#ba1a1a] transition-colors" />
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="pt-[64px]">
        {children}
      </div>
    </div>
  );
}