"use client";

import { useAuth } from "@/src/context/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Bell, Settings, GraduationCap, Building2, LogOut } from "lucide-react";

type UserRole = "STUDENT" | "GRADUATE" | "COMPANY" | "INSTITUTION" | "ADMIN";

const navLinks: Record<string, { label: string; href: string }[]> = {
  STUDENT: [
    { label: "Dashboard", href: "/dashboard/candidate" },
    { label: "Postulaciones", href: "/dashboard/candidate/postulaciones" },
    { label: "Explorar", href: "/dashboard/candidate/explorar" },
    { label: "Mi Perfil", href: "/profile/candidate" },
  ],
  GRADUATE: [
    { label: "Dashboard", href: "/dashboard/candidate" },
    { label: "Postulaciones", href: "/dashboard/candidate/postulaciones" },
    { label: "Explorar", href: "/dashboard/candidate/explorar" },
    { label: "Mi Perfil", href: "/profile/candidate" },
  ],
  COMPANY: [
    { label: "Dashboard", href: "/dashboard/company" },
    { label: "Mis Vacantes", href: "/dashboard/company/vacantes" },
    { label: "Buscar Talento", href: "/dashboard/company/talento" },
    { label: "Mi Perfil", href: "/profile/company" },
  ],
};

function RoleIcon({ role }: { role: UserRole }) {
  if (role === "COMPANY") return <Building2 className="w-5 h-5 text-white" />;
  return <GraduationCap className="w-5 h-5 text-white" />;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();


  useEffect(() => { if (!isLoading && !user) router.replace("/") }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
        <span className="w-8 h-8 border-2 border-[#00386c]/20 border-t-[#00386c] rounded-full animate-spin" />
      </div>
    );
  }

  const links = navLinks[user.role] ?? navLinks.STUDENT;
  const accentColor = user.role === "COMPANY" ? "#006d37" : "#00386c";
  const avatarBg = user.role === "COMPANY" ? "bg-[#006d37]" : "bg-[#00386c]";

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-black text-[#00386c] tracking-tighter font-headline hover:opacity-80 transition-opacity" >
              TalentBridge
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {links.map(({ label, href }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={label}
                    href={href}
                    className={`font-headline font-bold tracking-tight transition-colors duration-300 text-sm ${
                      isActive ? "border-b-2 pb-1" : "text-[#424750] hover:text-[#00386c]"
                    }`}
                    style={ isActive ? { color: accentColor, borderColor: accentColor } : {} }
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-[#f2f4f6] transition-colors"> <Bell className="w-5 h-5 text-[#424750]" /> </button>
            <button className="p-2 rounded-full hover:bg-[#f2f4f6] transition-colors"> <Settings className="w-5 h-5 text-[#424750]" /> </button>
            <button onClick={logout} className="p-2 rounded-full hover:bg-[#ffdad6] transition-colors group" title="Cerrar sesión" >
              <LogOut className="w-5 h-5 text-[#424750] group-hover:text-[#ba1a1a] transition-colors" />
            </button>
            <div className={`w-10 h-10 rounded-full ${avatarBg} flex items-center justify-center ml-1`}> <RoleIcon role={user.role as UserRole} /> </div>
          </div>
        </div>
      </header>

      <div className="pt-20">
        {children}
      </div>
    </div>
  );
}