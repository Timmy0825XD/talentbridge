import Link from "next/link";
import Image from "next/image";
import { Sparkles, GraduationCap, Newspaper, CheckCheck, ChartBarBig, ChartSpline, Handshake, Workflow, Landmark } from "lucide-react";
import { publicLinks } from "@/src/content/site-links";

export default function Home() {
  return (
    <div className="bg-[#f7f9fb] text-[#191c1e]">
      <nav className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-8">
            <span className="text-2xl font-extrabold font-headline text-[#00386c]"> TalentBridge </span>
            <div className="hidden lg:flex items-center gap-6">
              <Link href="#" className="text-[#00386c] font-bold border-b-2 border-[#006d37] py-1 text-sm" >
                Buscar Empleos
              </Link>
              <Link href="#" className="text-[#424750] font-medium hover:text-[#00386c] transition-colors py-1 text-sm" >
                Constructor de CV
              </Link>
              <Link href="#" className="text-[#424750] font-medium hover:text-[#00386c] transition-colors py-1 text-sm" >
                Portal Universitario
              </Link>
              <Link href="#" className="text-[#424750] font-medium hover:text-[#00386c] transition-colors py-1 text-sm" >
                Recursos
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-[#424750] font-medium hover:text-[#00386c] transition-colors px-4 py-2 text-sm" >
              Iniciar sesión
            </Link>
            <Link href="/auth/register"
              className="bg-gradient-to-br from-[#00386c] to-[#1a4f8b] text-white rounded-full px-6 py-2.5 font-bold tracking-wide text-xs uppercase shadow-md active:scale-95 transition-transform duration-150"
            >
              Publicar Empleo
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40 px-8">
          <div className="max-w-screen-2xl mx-auto grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7 space-y-8">
              <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6bfe9c]/20 text-[#00743a] font-semibold text-sm">
                <Sparkles/>Más de 500 alianzas universitarias
              </div>

              <h1 className="animate-fade-up-delay-1 text-5xl lg:text-7xl font-extrabold tracking-tight text-[#00386c] leading-[1.1] font-headline">
                Tu camino <br/>
                <span className="bg-gradient-to-r from-[#006d37] to-[#00743a] bg-clip-text text-transparent">
                  profesional empieza aquí
                </span>
              </h1>

              <p className="animate-fade-up-delay-2 text-xl text-[#424750] max-w-xl leading-relaxed">
                Conectamos estudiantes y egresados del Cesar con empresas que
                buscan talento calificado. Proyectos, microtrabajos y
                contrataciones formales en un solo lugar.
              </p>

              <div className="animate-fade-up-delay-3 flex flex-wrap gap-4">
                <Link href="/auth/register"
                  className="bg-gradient-to-br from-[#00386c] to-[#1a4f8b] text-white rounded-full px-8 py-4 font-bold tracking-wider text-sm uppercase shadow-xl hover:shadow-[#00386c]/20 transition-all active:scale-95"
                >
                  Explorar oportunidades
                </Link>
                <Link href="#"
                  className="bg-[#e6e8ea] text-[#0c4783] rounded-full px-8 py-4 font-bold tracking-wider text-sm uppercase hover:bg-[#e0e3e5] transition-all"
                >
                  Portal universitario
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative animate-fade-up-delay-4">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl relative z-10">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCm0KssseYAu7hq7n7XjhoLVJ7aqTxO87CKz3M7NwcawdXxR9Jsbpwx1IQWFocD6yXz8dHDFMWWzozefSOivq0Om8pO602d0M7Jl1ad2SApfZzrCBDqsCFQdskgftczLdAkAdWUZBjc2n0_F68oUBjioRlGhJPUeONqAnwgxHiVApPavLnU28cZV_izYIngHUDTzOKgF_1S-7XKZhQzCh4J4IfjprfGc5ufejvOgYBxIkmGZPfnHhs-gGZY0Hf3GgaRVvbkdVJIVRg"
                  alt="Estudiantes universitarios colaborando en espacio moderno"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-[#f2f4f6] px-8">
          <div className="max-w-screen-2xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl lg:text-5xl font-extrabold text-[#00386c] font-headline">
                Diseñado para todo el ecosistema
              </h2>
              <p className="text-[#424750] text-lg max-w-2xl mx-auto">
                Desde estudiantes individuales hasta grandes empresas,
                proporcionamos las herramientas para cerrar la brecha entre la
                educación y la carrera profesional.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6">
              <div className="md:col-span-3 lg:col-span-4 bg-white p-8 rounded-2xl shadow-sm border border-[#c2c6d1]/10 flex flex-col justify-between group hover:-translate-y-1 transition-transform duration-300">
                <div>
                  <div className="w-12 h-12 bg-[#00386c]/5 rounded-xl flex items-center justify-center mb-6 text-[#00386c] text-2xl"> <GraduationCap/> </div>
                  <h3 className="text-2xl font-bold mb-4 text-[#00386c] font-headline"> Para Estudiantes </h3>
                  <ul className="space-y-4">
                    {[
                      { icon: <GraduationCap/>, label: "Constructor de CV con IA" },
                      { icon: <CheckCheck/>, label: "Seguimiento de postulaciones" },
                      { icon: <ChartBarBig/>, label: "Matching por habilidades" },
                    ].map(({ icon, label }) => (
                      <li key={label} className="flex items-center gap-3 text-[#424750]" >
                        <span>{icon}</span>
                        <span>{label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href="#" className="mt-8 font-bold text-[#00386c] flex items-center gap-2 group-hover:gap-4 transition-all" >
                  Comenzar →
                </Link>
              </div>

              <div className="md:col-span-3 lg:col-span-4 bg-[#00386c] text-white p-8 rounded-2xl shadow-xl flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 text-2xl"> <Landmark/> </div>
                  <h3 className="text-2xl font-bold mb-4 font-headline"> Para Universidades </h3>
                  <ul className="space-y-4 opacity-90">
                    {[
                      { icon: <ChartSpline/>, label: "Analíticas de empleabilidad" },
                      { icon: <Handshake/>, label: "Alianzas con la industria" },
                      { icon: <Workflow/>, label: "Integración Career Hub" },
                    ].map(({ icon, label }) => (
                      <li key={label} className="flex items-center gap-3">
                        <span>{icon}</span>
                        <span>{label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href="#" className="mt-8 font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
                  Portal universitario →
                </Link>
              </div>

              <div className="md:col-span-6 lg:col-span-4 bg-white rounded-2xl shadow-sm border border-[#c2c6d1]/10 overflow-hidden group">
                <div className="h-48 overflow-hidden relative">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuARYqry3UXMOqQL4FPCnb5F7GoikFBuwHAsCYnBBDD8cX7ptfCWhv6PfEwAmHX774ugTeyazihApWnjl4ujWxRhejY550f7gZS709HvRAZdfL9-IAhBTdNMmQ1JADR5ISwKLfAi6mfGFABLx9erzXjWV6v8M1rBPuBHOZ_IdInbNZK_qDV0TKpcJ21rOM4holjgAkbT_huP-9D4F2RsDNZvgf1mfGso266CvkYvIfWjGwOYD87IozevEnS_5mNJFXEroWAfw5NSESk"
                    alt="Profesionales en sala de reuniones"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-4 text-[#00386c] font-headline"> Para Empresas </h3>
                  <p className="text-[#424750] mb-6">
                    Accede directamente a talento universitario verificado del
                    Cesar. Contrata con confianza basándote en excelencia
                    académica y potencial de habilidades.
                  </p>
                  <Link href="#" className="font-bold text-[#00386c] flex items-center gap-2 group-hover:gap-4 transition-all" >
                    Aliarse con nosotros →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 px-8 overflow-hidden">
          <div className="max-w-screen-2xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="bg-white p-12 rounded-2xl border border-[#c2c6d1]/15 relative z-10 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="font-bold text-[#00386c]"> Estado de postulaciones </h4>
                  <span className="text-[#006d37] text-lg">↗</span>
                </div>
                <div className="flex items-center gap-8">
                  <div className="w-32 h-32 rounded-full border-[12px] border-[#4ae183]/40 border-t-[#006d37] flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-black text-[#00386c]">
                      84%
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-[#00386c]">
                      Índice de empleabilidad
                    </p>
                    <p className="text-xs text-[#424750]">
                      Top 15% de egresados en Sistemas
                    </p>
                    <div className="flex gap-1 mt-2">
                      <div className="h-1 w-8 bg-[#006d37] rounded-full" />
                      <div className="h-1 w-8 bg-[#006d37] rounded-full" />
                      <div className="h-1 w-8 bg-[#006d37]/30 rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="mt-8 p-4 bg-[#f2f4f6] rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#424750]">
                      Postulaciones activas
                    </span>
                    <span className="text-xs font-bold text-[#00386c]">12</span>
                  </div>
                </div>
              </div>
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#6bfe9c] opacity-10 rounded-full blur-3xl" />
            </div>

            <div className="space-y-8">
              <h2 className="text-4xl font-extrabold text-[#00386c] leading-tight font-headline">
                Impulsando a la próxima generación de profesionales.
              </h2>
              <p className="text-[#424750] text-lg">
                Nuestra plataforma usa algoritmos de matching inteligente para
                conectar tu perfil de habilidades con las empresas que
                exactamente buscan lo que ofreces. Deja de enviar hojas de vida
                al vacío — inicia conversaciones con sentido.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-[#f2f4f6] rounded-xl">
                  <p className="text-3xl font-black text-[#006d37]">10k+</p>
                  <p className="text-sm font-medium text-[#424750]">
                    Contrataciones mensuales
                  </p>
                </div>
                <div className="p-6 bg-[#f2f4f6] rounded-xl">
                  <p className="text-3xl font-black text-[#00386c]">92%</p>
                  <p className="text-sm font-medium text-[#424750]">
                    Tasa de éxito
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-8 pb-24">
          <div className="max-w-screen-2xl mx-auto bg-gradient-to-br from-[#00386c] to-[#1a4f8b] rounded-[2.5rem] p-12 lg:p-24 relative overflow-hidden text-center text-white">
            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
              <h2 className="text-4xl lg:text-6xl font-extrabold tracking-tight font-headline">
                ¿Listo para lanzar tu carrera?
              </h2>
              <p className="text-xl opacity-80">
                Únete a TalentBridge hoy y accede a oportunidades exclusivas de
                las mejores organizaciones del Cesar y Colombia.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/auth/register"
                  className="bg-[#006d37] text-white rounded-full px-10 py-5 font-bold tracking-wider text-sm uppercase shadow-2xl hover:bg-[#005228] transition-all"
                >
                  Crear perfil de candidato
                </Link>
                <Link href="#"
                  className="bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full px-10 py-5 font-bold tracking-wider text-sm uppercase hover:bg-white/20 transition-all"
                >
                  Consultas empresariales
                </Link>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#006d37] opacity-20 blur-[120px] -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#4ae183] opacity-10 blur-[120px] -ml-48 -mb-48" />
          </div>
        </section>
      </main>

      <footer className="bg-slate-50 py-12 border-t border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-8 max-w-7xl mx-auto">
          <div className="col-span-1 space-y-4">
            <span className="text-xl font-bold font-headline text-slate-900">
              TalentBridge
            </span>
            <p className="text-xs text-slate-500 leading-relaxed">
              © 2026 TalentBridge. Impulsando a la próxima generación de
              profesionales del Cesar.
            </p>
          </div>

          {[
            {
              title: "Plataforma",
              links: [
                { label: "Buscar Empleos", href: "#" },
                { label: "Constructor de CV", href: "#" },
                { label: "Estadísticas", href: "#" },
              ],
            },
            {
              title: "Empresa",
              links: [
                { label: "Acerca de TalentBridge", href: "#" },
                { label: "Empleos", href: "#" },
                { label: "Contáctanos", href: "#" },
              ],
            },
            {
              title: "Legal",
              links: [
                { label: "Política de Privacidad", href: publicLinks.privacy },
                { label: "Términos de Servicio", href: publicLinks.terms },
                { label: "Cookies", href: publicLinks.cookies },
              ],
            },
          ].map(({ title, links }) => (
            <div key={title}>
              <h5 className="text-[#00386c] font-bold mb-4 font-headline text-sm uppercase tracking-widest"> {title} </h5>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-xs text-slate-500 hover:text-[#00386c] transition-colors" > {label} </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}