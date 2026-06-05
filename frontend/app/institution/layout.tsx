"use client";

import { useAuth } from "@/src/context/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard, Users, TrendingUp, BookOpen, LogOut, GraduationCap,
} from "lucide-react";
import { publicLinks } from "@/src/content/site-links";

const navLinks = [
  { label: "Dashboard", href: "/institution", icon: LayoutDashboard },
  { label: "Estudiantes y egresados", href: "/institution/egresados", icon: Users },
  { label: "Empleabilidad", href: "/institution/empleabilidad", icon: TrendingUp },
  { label: "Guía", href: publicLinks.universities, icon: BookOpen, external: true },
];

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/institution") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

export default function InstitutionLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();

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
    <div className="min-h-screen bg-[#f7f9fb] flex">
      <aside className="fixed top-0 left-0 h-full w-60 bg-[#00386c] flex flex-col z-50">
        <div className="px-6 py-5 border-b border-white/10">
          <Link href="/institution" className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#6bfe9c]" />
            <span className="text-white font-headline font-black text-lg tracking-tight">Institución</span>
          </Link>
          <p className="text-white/40 text-xs mt-0.5">TalentBridge</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navLinks.map(({ label, href, icon: Icon, external }) => {
            const active = !external && isNavActive(pathname, href);
            const cls = `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              active
                ? "bg-[#6bfe9c]/15 text-[#6bfe9c]"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`;
            if (external) {
              return (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer" className={cls}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </a>
              );
            }
            return (
              <Link key={href} href={href} className={cls}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <button onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/60 hover:text-white hover:bg-white/5 transition-all w-full">
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-60 min-h-screen">{children}</main>
    </div>
  );
}
