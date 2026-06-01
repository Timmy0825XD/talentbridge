import Link from "next/link";
import { publicLinks } from "@/src/content/site-links";

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
    <div className="max-w-3xl mx-auto px-6 py-12 lg:py-16 space-y-8">
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="flex items-center gap-2 text-sm text-on-surface-variant">
          <Link href={publicLinks.home} className="hover:text-primary transition-colors">Inicio</Link>
          {breadcrumb.map((item) => (
            <span key={item.label} className="flex items-center gap-2">
              <span>/</span>
              {item.href ? (
                <Link href={item.href} className="hover:text-primary transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-on-surface font-medium">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="space-y-2">
        <h1 className="text-3xl lg:text-4xl font-extrabold text-primary font-headline">{title}</h1>
        {description && (
          <p className="text-lg text-on-surface-variant">{description}</p>
        )}
      </div>

      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}
