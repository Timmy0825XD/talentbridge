import Link from "next/link";
import { publicLinks } from "@/src/content/site-links";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface InfoPageLayoutProps {
  title: string;
  description?: string;
  breadcrumb?: BreadcrumbItem[];
  children: React.ReactNode;
}

export default function InfoPageLayout({ title, description, breadcrumb, children }: InfoPageLayoutProps) {
  return (
    <div className="min-h-screen">

      {/* ── Hero header ── */}
      <div className="relative bg-gradient-to-r from-[#00386c] via-[#0c4783] to-[#00386c] overflow-hidden">
        {/* Grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="info-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#info-grid)" />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        {/* Decorative orb */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#1a4f8b]/50 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 py-10 lg:py-14">
          {/* Breadcrumb */}
          {breadcrumb && breadcrumb.length > 0 && (
            <nav className="flex items-center gap-1.5 text-xs font-medium text-white/50 mb-4 flex-wrap">
              <Link href={publicLinks.home} className="hover:text-white transition-colors">Inicio</Link>
              {breadcrumb.map((item) => (
                <span key={item.label} className="flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3" />
                  {item.href ? (
                    <Link href={item.href} className="hover:text-white transition-colors">{item.label}</Link>
                  ) : (
                    <span className="text-white/80">{item.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}

          <h1 className="text-3xl lg:text-4xl font-extrabold text-white font-headline tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-[#a6c8ff] text-base mt-2 max-w-2xl leading-relaxed">{description}</p>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-10 lg:py-14">
        <div className="bg-white rounded-2xl border border-[#e6e8ea] shadow-sm p-8 lg:p-10 space-y-8">
          {children}
        </div>
      </div>
    </div>
  );
}