"use client";

import { useAuth } from "@/src/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, Bookmark, CheckCircle2 } from "lucide-react";

const JOBS = [
  {
    id: 1,
    title: "Desarrollador Frontend Junior",
    company: "TechFlow Colombia",
    location: "Valledupar, Colombia (Remoto)",
    tags: ["Tiempo completo", "$2.5M - $3.5M COP"],
    badge: "Nuevo",
    posted: "Hace 2 horas",
    salary: "$2.5M - $3.5M COP",
    type: "Tiempo completo",
    experience: "Recién graduado",
    matchPct: 92,
    description:
      "Únete al equipo de TechFlow Colombia y trabaja en proyectos de alto impacto para clientes del sector financiero y retail. Buscamos un desarrollador apasionado por crear interfaces modernas y accesibles.",
    responsibilities: [
      "Desarrollar componentes reutilizables en React y TypeScript.",
      "Colaborar con el equipo de diseño para implementar interfaces pixel-perfect.",
      "Participar en code reviews y contribuir a la cultura de calidad del equipo.",
    ],
  },
  {
    id: 2,
    title: "Practicante de Ingeniería de Software",
    company: "CodeFlow Systems",
    location: "Bogotá, Colombia",
    tags: ["Práctica", "Verano 2026"],
    posted: "Ayer",
    salary: "$1.2M COP",
    type: "Práctica",
    experience: "Estudiante universitario",
    matchPct: 78,
    description:
      "Programa de práctica diseñado para estudiantes de últimos semestres. Trabajarás en un equipo ágil desarrollando APIs y microservicios con tecnologías modernas.",
    responsibilities: [
      "Apoyar el desarrollo y mantenimiento de APIs REST.",
      "Escribir pruebas unitarias y de integración.",
      "Documentar procesos técnicos y participar en ceremonias ágiles.",
    ],
  },
  {
    id: 3,
    title: "Analista de Investigación de Producto",
    company: "BrightFuture Lab",
    location: "Barranquilla, Colombia",
    tags: ["Medio tiempo", "$30.000/hr COP"],
    posted: "Hace 3 días",
    salary: "$30.000/hr COP",
    type: "Medio tiempo",
    experience: "Sin experiencia requerida",
    matchPct: 65,
    description:
      "BrightFuture Lab busca un estudiante curioso y analítico para apoyar la investigación de usuarios y análisis de mercado en proyectos de producto digital.",
    responsibilities: [
      "Realizar entrevistas y encuestas a usuarios.",
      "Analizar datos cualitativos y cuantitativos.",
      "Elaborar reportes de hallazgos para el equipo de producto.",
    ],
  },
];

const FILTERS = ["Remoto", "Práctica", "Nivel inicial", "Medio tiempo"];

export default function ExplorarPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [selectedJob, setSelectedJob] = useState(JOBS[0]);
  const [activeFilter, setActiveFilter] = useState<string | null>("Remoto");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isLoading && user?.role === "COMPANY") {
      router.replace("/dashboard/company");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
        <span className="w-8 h-8 border-2 border-[#00386c]/20 border-t-[#00386c] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-8 py-6">
      <section className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1 max-w-2xl">
          <div className="bg-white rounded-xl shadow-sm flex items-center p-1 focus-within:ring-2 focus-within:ring-[#00386c]/10 transition-all">
            <div className="flex items-center px-4 text-[#737781]">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Busca roles como 'Desarrollador Frontend' o 'Diseñador UX'..."
              className="flex-1 border-none focus:ring-0 bg-transparent text-[#191c1e] py-3 text-base font-medium placeholder:text-[#c2c6d1] outline-none"
            />
            <button className="bg-gradient-to-br from-[#00386c] to-[#1a4f8b] text-white px-6 py-3 rounded-xl font-headline font-bold text-sm tracking-widest uppercase hover:opacity-90 active:scale-95 transition-all">
              Buscar
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#e6e8ea] text-[#0c4783] rounded-full font-semibold text-sm transition-all hover:bg-[#e0e3e5] active:scale-95">
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
          </button>
          <div className="h-6 w-px bg-[#c2c6d1]/30 mx-1" />
          <div className="flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(activeFilter === filter ? null : filter) }
                className={`px-5 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-colors ${
                  activeFilter === filter
                    ? "bg-[#6bfe9c] text-[#00743a]"
                    : "bg-[#f2f4f6] text-[#424750] hover:bg-[#e0e3e5]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="flex gap-8 h-[calc(100vh-280px)] min-h-[600px]">
        <aside className="w-full md:w-[400px] flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-hide">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold text-[#737781] uppercase tracking-widest"> Ofertas laborales </h2>
            <span className="text-xs font-semibold text-[#00386c]"> {JOBS.length} resultados </span>
          </div>

          {JOBS.map((job) => {
            const isActive = selectedJob.id === job.id;
            return (
              <article
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`p-6 rounded-xl cursor-pointer transition-all ${
                  isActive
                    ? "bg-white border-2 border-[#00386c]/20 shadow-lg"
                    : "bg-[#f2f4f6] border border-transparent hover:bg-white hover:shadow-md"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#eceef0] flex items-center justify-center">
                    <span className="text-xl font-black text-[#00386c]"> {job.company[0]} </span>
                  </div>
                  {job.badge && (
                    <span className="bg-[#6bfe9c] text-[#00743a] px-3 py-1 rounded-full text-xs font-bold"> {job.badge} </span>
                  )}
                </div>
                <h3 className="font-headline font-bold text-lg text-[#191c1e] mb-1"> {job.title} </h3>
                <p className="text-sm font-medium text-[#737781] mb-4"> {job.company} • {job.location} </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-[#e6e8ea] text-[#424750] rounded-md text-xs font-semibold" >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-[#c2c6d1]/15">
                  <span className="text-xs text-[#737781] italic">{job.posted}</span>
                  <span className={`text-sm font-bold ${ isActive ? "text-[#00386c]" : "text-[#c2c6d1]" }`} >
                    Ver detalles
                  </span>
                </div>
              </article>
            );
          })}
        </aside>

        <main className="hidden md:flex flex-1 flex-col bg-[#f2f4f6] rounded-xl overflow-hidden">
          <div className="relative h-44 bg-gradient-to-r from-[#00386c] to-[#1a4f8b] overflow-hidden">
            <div className="absolute bottom-0 left-0 p-8 flex items-end gap-6 w-full translate-y-12">
              <div className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center shadow-xl ring-8 ring-[#f2f4f6]">
                <span className="text-4xl font-black text-[#00386c]"> {selectedJob.company[0]} </span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 pt-16">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="font-headline font-extrabold text-4xl text-[#191c1e] tracking-tight mb-2"> {selectedJob.title} </h1>
                <div className="flex items-center gap-4 text-[#737781] font-medium text-sm flex-wrap">
                  <span>{selectedJob.company}</span>
                  <span>•</span>
                  <span>{selectedJob.location}</span>
                  <span>•</span>
                  <span>{selectedJob.posted}</span>
                </div>
              </div>

              <div className="flex gap-3 flex-shrink-0">
                <button className="p-3 rounded-full bg-white text-[#00386c] border border-[#c2c6d1]/20 shadow-sm hover:shadow-md transition-all active:scale-95">
                  <Bookmark className="w-5 h-5" />
                </button>
                <button className="bg-gradient-to-br from-[#006d37] to-[#4ae183] text-white px-8 py-3 rounded-full font-headline font-bold tracking-widest uppercase shadow-lg shadow-[#006d37]/20 hover:opacity-90 active:scale-95 transition-all text-sm">
                  Postularme
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-10">
              {[
                { label: "Salario", value: selectedJob.salary },
                { label: "Tipo", value: selectedJob.type },
                { label: "Experiencia", value: selectedJob.experience },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white p-5 rounded-xl">
                  <p className="text-xs font-bold text-[#737781] uppercase tracking-wider mb-1"> {label} </p>
                  <p className="text-[#191c1e] font-bold text-base">{value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-headline font-bold text-xl text-[#191c1e] mb-3"> Descripción del rol </h3>
                <p className="text-[#424750] leading-relaxed"> {selectedJob.description} </p>
              </div>

              <div>
                <h3 className="font-headline font-bold text-xl text-[#191c1e] mb-3"> Responsabilidades </h3>
                <ul className="space-y-3">
                  {selectedJob.responsibilities.map((r) => (
                    <li key={r} className="flex gap-3 items-start text-[#424750]"> <CheckCircle2 className="w-5 h-5 text-[#006d37] flex-shrink-0 mt-0.5" /> {r} </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-6 rounded-xl flex items-center gap-6 border border-[#c2c6d1]/10">
                <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                    <circle
                      cx="32" cy="32" r="28"
                      fill="transparent"
                      stroke="#e6e8ea"
                      strokeWidth="4"
                    />
                    <circle
                      cx="32" cy="32" r="28"
                      fill="transparent"
                      stroke="#006d37"
                      strokeWidth="4"
                      strokeDasharray="176"
                      strokeDashoffset={176 - (176 * selectedJob.matchPct) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-[#191c1e]"> {selectedJob.matchPct}% </span>
                </div>
                <div>
                  <h4 className="font-bold text-[#191c1e]"> Compatibilidad con tu perfil </h4>
                  <p className="text-sm text-[#737781]">
                    Tu perfil coincide con el {selectedJob.matchPct}% de los requisitos.{" "}
                    {selectedJob.matchPct >= 80
                      ? "¡Excelente match!"
                      : "Completa tu perfil para mejorar tu score."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}