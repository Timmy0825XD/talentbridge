"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { publicLinks } from "@/src/content/site-links";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname?.startsWith(href));
  return (
    <Link
      href={href}
      className={`relative text-sm font-semibold py-1 transition-colors duration-200 group ${
        isActive ? "text-[#00386c]" : "text-[#424750] hover:text-[#00386c]"
      }`}
    >
      {label}
      <span className={`absolute -bottom-0.5 left-0 h-0.5 bg-[#006d37] rounded-full transition-all duration-300 ${
        isActive ? "w-full" : "w-0 group-hover:w-full"
      }`} />
    </Link>
  );
}

const navLinks = [
  { href: publicLinks.candidates,   label: "Buscar Empleos" },
  { href: publicLinks.candidatesCv, label: "Constructor CV" },
  { href: publicLinks.universities, label: "Universidades" },
  { href: publicLinks.resources,    label: "Recursos" },
];

const footerSections = [
  {
    title: "Plataforma",
    links: [
      { label: "Buscar Empleos",   href: publicLinks.candidates },
      { label: "Constructor de CV", href: publicLinks.candidatesCv },
      { label: "Acerca de",        href: publicLinks.about },
      { label: "FAQ",              href: publicLinks.faq ?? "/" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Acerca de TalentBridge", href: publicLinks.about },
      { label: "Para empresas",          href: publicLinks.companies },
      { label: "Universidades",          href: publicLinks.universities },
      { label: "Contáctanos",            href: publicLinks.contact },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Política de Privacidad", href: publicLinks.privacy },
      { label: "Términos de Servicio",   href: publicLinks.terms },
      { label: "Cookies",                href: publicLinks.cookies },
    ],
  },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex flex-col">

      {/* ── NAV ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-sm border-b border-[#e6e8ea]/80"
          : "bg-white/80 backdrop-blur-xl border-b border-[#e6e8ea]/40"
      }`}>
        <div className="flex justify-between items-center w-full px-6 lg:px-10 py-4 max-w-screen-2xl mx-auto">

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-[#00386c] to-[#1a4f8b] rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-xs">TB</span>
            </div>
            <span className="text-xl font-extrabold font-headline text-[#00386c] tracking-tight">
              TalentBridge
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map(l => <NavLink key={l.href} {...l} />)}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link href={publicLinks.login}
              className="text-[#424750] font-semibold hover:text-[#00386c] transition-colors px-4 py-2 text-sm rounded-full hover:bg-[#f2f4f6]">
              Iniciar sesión
            </Link>
            <Link href={publicLinks.register}
              className="group flex items-center gap-1.5 bg-gradient-to-br from-[#00386c] to-[#1a4f8b] text-white rounded-full px-5 py-2.5 font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#00386c]/20 hover:shadow-[#00386c]/30 hover:scale-[1.02] active:scale-95 transition-all">
              Registrarse
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button className="lg:hidden p-2 rounded-xl hover:bg-[#f2f4f6] transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5 text-[#00386c]" /> : <Menu className="w-5 h-5 text-[#00386c]" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden bg-white border-t border-[#e6e8ea] px-6 py-4 space-y-1">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                className="block py-3 text-sm font-semibold text-[#424750] hover:text-[#00386c] border-b border-[#f2f4f6] last:border-0 transition-colors">
                {l.label}
              </Link>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              <Link href={publicLinks.login} onClick={() => setMenuOpen(false)}
                className="text-center py-3 text-sm font-semibold text-[#424750] border border-[#e6e8ea] rounded-full hover:border-[#00386c] transition-colors">
                Iniciar sesión
              </Link>
              <Link href={publicLinks.register} onClick={() => setMenuOpen(false)}
                className="text-center py-3 text-sm font-bold text-white bg-gradient-to-br from-[#00386c] to-[#1a4f8b] rounded-full uppercase tracking-wider">
                Registrarse
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Content ── */}
      <main className="flex-1 pt-[72px]">{children}</main>

      {/* ── FOOTER ── */}
      <footer className="bg-[#191c1e] text-white pt-16 pb-8">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">

            {/* Brand */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-gradient-to-br from-[#00386c] to-[#1a4f8b] rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-black text-sm">TB</span>
                </div>
                <span className="text-xl font-extrabold font-headline text-white tracking-tight">TalentBridge</span>
              </div>
              <p className="text-sm text-white/50 leading-relaxed max-w-xs">
                Conectando el talento universitario del Cesar con las empresas que lo necesitan. Proyectos, microtrabajos y contrataciones formales.
              </p>
              <div className="flex gap-3 pt-2">
                <Link href={publicLinks.register}
                  className="inline-flex items-center gap-2 bg-[#6bfe9c] text-[#00210c] rounded-full px-5 py-2.5 font-bold text-xs uppercase tracking-wider hover:bg-[#4ae183] transition-colors">
                  Comenzar gratis <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Links */}
            {footerSections.map(({ title, links }) => (
              <div key={title}>
                <h5 className="text-white font-bold mb-5 font-headline text-xs uppercase tracking-widest">{title}</h5>
                <ul className="space-y-3">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <Link href={href}
                        className="text-xs text-white/50 hover:text-white transition-colors hover:translate-x-0.5 inline-block transition-transform duration-200">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/30">
              © 2026 TalentBridge. Impulsando la próxima generación de profesionales del Cesar.
            </p>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6bfe9c] animate-pulse" />
              <span className="text-xs text-white/30">Todos los sistemas operativos</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}