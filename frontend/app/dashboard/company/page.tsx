"use client";

import { useAuth } from "@/src/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Briefcase, Users, CalendarCheck, TrendingUp, ChevronRight, ArrowRight, Building2 } from "lucide-react";

const stats = [
  {
    icon: <Briefcase className="w-7 h-7 text-[#00386c]" />,
    label: "VACANTES ACTIVAS",
    value: "24",
    sub: "+3 esta semana",
    subColor: "text-[#006d37]",
    bg: "bg-[#f2f4f6]",
    valueColor: "text-[#00386c]",
  },
  {
    icon: <Users className="w-7 h-7 text-[#006d37]" />,
    label: "TOTAL POSTULANTES",
    value: "1.284",
    sub: null,
    progress: 75,
    bg: "bg-white",
    valueColor: "text-[#191c1e]",
  },
  {
    icon: <CalendarCheck className="w-7 h-7 text-[#a6c8ff]" />,
    label: "ENTREVISTAS AGENDADAS",
    value: "18",
    sub: "7 ocurren hoy",
    subColor: "text-[#a6c8ff]",
    bg: "bg-gradient-to-br from-[#00386c] to-[#1a4f8b]",
    valueColor: "text-white",
    wide: true,
  },
];

const postings = [
  {
    title: "Desarrollador Frontend Senior",
    type: "Tiempo completo",
    location: "Remoto",
    applicants: 42,
    detail: null,
    avatars: 3,
  },
  {
    title: "Practicante de Ciencia de Datos",
    type: "Práctica",
    location: "Valledupar, Colombia",
    applicants: 156,
    detail: "Próxima entrevista: Mañana, 10:00 AM",
    avatars: 0,
  },
  {
    title: "Ingeniero de Software",
    type: "Tiempo completo",
    location: "Remoto",
    applicants: 18,
    detail: "Nueva publicación — hace 2 horas",
    avatars: 0,
  },
];

const candidates = [
  {
    initials: "AR",
    name: "Alex Rivera",
    university: "Universidad Popular del Cesar • Sistemas",
    skills: ["Python", "ML"],
    match: 98,
    offset: 2,
  },
  {
    initials: "MC",
    name: "Maya Chen",
    university: "UNICESAR • Diseño",
    skills: ["Figma", "UI/UX"],
    match: 92,
    offset: 9,
  },
  {
    initials: "JS",
    name: "Jordan Smyth",
    university: "Uniajc • Matemáticas",
    skills: ["R", "Estadística"],
    match: 85,
    offset: 18,
  },
];

export default function CompanyDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && user.role !== "COMPANY") {
      router.replace("/dashboard/candidate");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
        <span className="w-8 h-8 border-2 border-[#006d37]/20 border-t-[#006d37] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="pb-20 px-8 pt-8 max-w-screen-2xl mx-auto">

      {/* ── GREETING ─────────────────────────────────── */}
      <section className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 animate-fade-up">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-headline font-extrabold text-[#00386c] tracking-tight mb-4">
            ¡Bienvenido, Empresa.
          </h1>
          <p className="text-[#424750] text-lg leading-relaxed">
            Tu embudo de reclutamiento está activo hoy. Tienes{" "}
            <span className="text-[#006d37] font-bold">12 nuevos postulantes</span>{" "}
            esperando revisión en tus vacantes abiertas.
          </p>
        </div>
        <Link
          href="/dashboard/company/vacantes"
          className="bg-gradient-to-br from-[#00386c] to-[#1a4f8b] text-white px-8 py-4 rounded-full font-semibold uppercase tracking-wider flex items-center gap-3 shadow-xl shadow-[#00386c]/20 hover:scale-[1.02] active:scale-95 transition-all text-sm"
        >
          <Briefcase className="w-5 h-5" />
          Publicar vacante
        </Link>
      </section>

      {/* ── STATS BENTO ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12 animate-fade-up-delay-1">
        {stats.map(({ icon, label, value, sub, subColor, progress, bg, valueColor, wide }) => (
          <div
            key={label}
            className={`${bg} ${wide ? "lg:col-span-2" : "md:col-span-1"} rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden`}
          >
            {wide && (
              <>
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
                <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-[#006d37]/20 rounded-full blur-[100px]" />
              </>
            )}
            <div className="relative z-10">
              {icon}
              <h3 className={`font-medium text-xs tracking-widest uppercase mb-1 mt-4 ${wide ? "text-[#a6c8ff]" : "text-[#424750]"}`}>
                {label}
              </h3>
              <p className={`text-4xl font-headline font-extrabold ${valueColor}`}>
                {value}
              </p>
              {sub && (
                <div className={`mt-4 flex items-center gap-2 text-sm font-semibold ${subColor}`}>
                  <TrendingUp className="w-4 h-4" />
                  <span>{sub}</span>
                </div>
              )}
              {progress && (
                <div className="mt-6 h-2 bg-[#eceef0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#006d37] rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── POSTINGS + CANDIDATES ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* Postings */}
        <section className="lg:col-span-7 animate-fade-up-delay-2">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-headline font-bold text-[#191c1e] tracking-tight">
              Vacantes recientes
            </h2>
            <Link
              href="/dashboard/company/vacantes"
              className="text-[#00386c] font-semibold text-sm hover:underline flex items-center gap-1"
            >
              Ver todas <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {postings.map(({ title, type, location, applicants, detail, avatars }, i) => (
              <div
                key={title}
                className={`group rounded-2xl p-8 transition-all duration-300 ${
                  i === 0 ? "bg-white hover:bg-[#f7f9fb]" : "bg-[#f2f4f6]"
                }`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-headline font-bold text-[#191c1e] group-hover:text-[#00386c] transition-colors">
                      {title}
                    </h3>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="bg-[#6bfe9c]/30 text-[#00743a] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {type}
                      </span>
                      <span className="text-[#424750] text-sm">{location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-headline font-bold text-[#191c1e]">
                      {applicants}
                    </p>
                    <p className="text-[10px] font-bold text-[#424750] uppercase tracking-tighter">
                      Postulantes
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-[#eceef0]">
                  {avatars > 0 ? (
                    <div className="flex -space-x-3">
                      {[...Array(avatars)].map((_, j) => (
                        <div
                          key={j}
                          className="w-8 h-8 rounded-full bg-[#00386c] border-2 border-white flex items-center justify-center"
                          style={{ opacity: 1 - j * 0.2 }}
                        >
                          <Users className="w-4 h-4 text-white" />
                        </div>
                      ))}
                      <div className="w-8 h-8 rounded-full bg-[#eceef0] text-[10px] font-bold flex items-center justify-center border-2 border-white text-[#424750]">
                        +{applicants - avatars}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-[#424750] italic">{detail}</p>
                  )}
                  <button className="p-3 bg-[#f2f4f6] rounded-xl text-[#00386c] hover:bg-[#00386c] hover:text-white transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Candidates + Profile CTA */}
        <section className="lg:col-span-5 space-y-8 animate-fade-up-delay-3">

          {/* Top candidates */}
          <div className="bg-[#e6e8ea] rounded-[2rem] p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-headline font-bold text-[#191c1e] tracking-tight">
                Top candidatos
              </h2>
            </div>

            <div className="space-y-4">
              {candidates.map(({ initials, name, university, skills, match, offset }) => (
                <div
                  key={name}
                  className="flex items-center gap-5 p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-white/50 hover:shadow-lg transition-all cursor-pointer"
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-[#00386c] flex items-center justify-center">
                      <span className="text-white font-black text-lg">{initials}</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#006d37] text-white rounded-full flex items-center justify-center border-2 border-white">
                      <span className="text-[8px] font-bold">✓</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[#191c1e]">{name}</h4>
                    <p className="text-xs text-[#424750] mb-2 truncate">{university}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-[10px] bg-[#00386c]/10 text-[#00386c] px-2 py-0.5 rounded font-bold"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Match circle */}
                  <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 40 40">
                      <circle cx="20" cy="20" r="18" fill="transparent" stroke="#e6e8ea" strokeWidth="2" />
                      <circle
                        cx="20" cy="20" r="18"
                        fill="transparent"
                        stroke="#006d37"
                        strokeWidth="2"
                        strokeDasharray="113"
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="text-[10px] font-bold text-[#006d37]">{match}%</span>
                  </div>
                </div>
              ))}

              <button className="w-full py-4 border-2 border-dashed border-[#c2c6d1]/40 rounded-xl text-[#424750] font-semibold text-sm hover:border-[#00386c]/40 hover:text-[#00386c] transition-all">
                Ver más candidatos
              </button>
            </div>
          </div>

          {/* CTA — Completar perfil de empresa */}
          <div className="bg-gradient-to-br from-[#006d37] to-[#00743a] rounded-[2rem] p-10 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-2xl font-headline font-extrabold mb-3">
                Completa tu perfil
              </h3>
              <p className="text-[#6bfe9c]/90 mb-6 text-sm leading-relaxed">
                Las empresas con perfil completo reciben un 40% más de postulaciones
                de candidatos calificados. Agrega tu información corporativa ahora.
              </p>
              <Link
                href="/profile/company"
                className="inline-flex items-center gap-2 bg-white text-[#006d37] px-6 py-3 rounded-full font-bold text-sm tracking-tight hover:shadow-xl transition-all"
              >
                <Building2 className="w-4 h-4" />
                Completar perfil de empresa
              </Link>
            </div>
            <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white/5 rounded-full group-hover:scale-110 transition-transform duration-700" />
          </div>
        </section>
      </div>
    </main>
  );
}