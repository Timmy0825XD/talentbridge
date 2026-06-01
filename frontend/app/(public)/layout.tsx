import Link from "next/link";
import { publicLinks } from "@/src/content/site-links";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col">
      <nav className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="flex justify-between items-center w-full px-6 lg:px-8 py-4 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-8">
            <Link href={publicLinks.home} className="text-2xl font-extrabold font-headline text-primary">
              TalentBridge
            </Link>
            <div className="hidden lg:flex items-center gap-6">
              <Link
                href={publicLinks.candidates}
                className="text-on-surface font-medium hover:text-primary transition-colors py-1 text-sm"
              >
                Buscar Empleos
              </Link>
              <Link
                href={publicLinks.candidatesCv}
                className="text-on-surface font-medium hover:text-primary transition-colors py-1 text-sm"
              >
                Constructor de CV
              </Link>
              <Link
                href={publicLinks.universities}
                className="text-on-surface font-medium hover:text-primary transition-colors py-1 text-sm"
              >
                Portal Universitario
              </Link>
              <Link
                href={publicLinks.resources}
                className="text-on-surface font-medium hover:text-primary transition-colors py-1 text-sm"
              >
                Recursos
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href={publicLinks.login}
              className="text-on-surface font-medium hover:text-primary transition-colors px-4 py-2 text-sm"
            >
              Iniciar sesión
            </Link>
            <Link
              href={publicLinks.register}
              className="bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-full px-6 py-2.5 font-bold tracking-wide text-xs uppercase shadow-md active:scale-95 transition-transform duration-150"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">{children}</main>

      <footer className="bg-surface-container-low py-12 border-t border-outline-variant/20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="col-span-1 space-y-4">
            <span className="text-xl font-bold text-on-surface font-headline">
              TalentBridge
            </span>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              &copy; 2026 TalentBridge. Impulsando a la pr&oacute;xima generaci&oacute;n de
              profesionales del Cesar.
            </p>
          </div>

          <div>
            <h5 className="text-primary font-bold mb-4 font-headline text-sm uppercase tracking-widest">
              Plataforma
            </h5>
            <ul className="space-y-2">
              <li>
                <Link href={publicLinks.candidates} className="text-xs text-on-surface-variant hover:text-primary transition-colors">
                  Buscar Empleos
                </Link>
              </li>
              <li>
                <Link href={publicLinks.candidatesCv} className="text-xs text-on-surface-variant hover:text-primary transition-colors">
                  Constructor de CV
                </Link>
              </li>
              <li>
                <Link href={publicLinks.about} className="text-xs text-on-surface-variant hover:text-primary transition-colors">
                  Acerca de
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-primary font-bold mb-4 font-headline text-sm uppercase tracking-widest">
              Empresa
            </h5>
            <ul className="space-y-2">
              <li>
                <Link href={publicLinks.about} className="text-xs text-on-surface-variant hover:text-primary transition-colors">
                  Acerca de TalentBridge
                </Link>
              </li>
              <li>
                <Link href={publicLinks.companies} className="text-xs text-on-surface-variant hover:text-primary transition-colors">
                  Para empresas
                </Link>
              </li>
              <li>
                <Link href={publicLinks.contact} className="text-xs text-on-surface-variant hover:text-primary transition-colors">
                  Cont&aacute;ctanos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-primary font-bold mb-4 font-headline text-sm uppercase tracking-widest">
              Legal
            </h5>
            <ul className="space-y-2">
              <li>
                <Link href={publicLinks.privacy} className="text-xs text-on-surface-variant hover:text-primary transition-colors">
                  Pol&iacute;tica de Privacidad
                </Link>
              </li>
              <li>
                <Link href={publicLinks.terms} className="text-xs text-on-surface-variant hover:text-primary transition-colors">
                  T&eacute;rminos de Servicio
                </Link>
              </li>
              <li>
                <Link href={publicLinks.cookies} className="text-xs text-on-surface-variant hover:text-primary transition-colors">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
