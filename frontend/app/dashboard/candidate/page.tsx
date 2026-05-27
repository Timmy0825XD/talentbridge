"use client";

import { useAuth } from "@/src/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Send, Eye, Sparkles, ArrowRight, GraduationCap, Rocket, Users, BarChart3, FileText, Pencil } from "lucide-react";

const roleLabel: Record<string, string> = {
  STUDENT: "Estudiante",
  GRADUATE: "Egresado",
};

const statsCards = [
  {
    icon: <Send className="w-5 h-5 text-[#a6c8ff]" />,
    label: "FLUJO ACTIVO",
    value: "08",
    sub: "Postulaciones en progreso",
    bg: "bg-gradient-to-br from-[#00386c] to-[#1a4f8b]",
    textValue: "text-white",
    textSub: "text-[#a6c8ff]",
    textLabel: "text-[#a6c8ff]/70",
  },
  {
    icon: <Eye className="w-5 h-5 text-[#006d37]" />,
    label: "ALCANCE",
    value: "142",
    sub: "Vistas de CV este mes",
    bg: "bg-white",
    textValue: "text-[#191c1e]",
    textSub: "text-[#424750]",
    textLabel: "text-[#424750]",
  },
  {
    icon: <Sparkles className="w-5 h-5 text-[#00743a]" />,
    label: "MATCH EXACTO",
    value: "24",
    sub: "Empleos con tu perfil",
    bg: "bg-[#6bfe9c]",
    textValue: "text-[#00210c]",
    textSub: "text-[#005228]",
    textLabel: "text-[#005228]",
  },
];

const applications = [
  {
    icon: <BarChart3 className="w-7 h-7 text-[#00386c]" />,
    title: "Desarrollador Frontend",
    company: "TechFlow Colombia • Bogotá",
    steps: ["Postulado", "Entrevista", "Oferta"],
    activeStep: 0,
  },
  {
    icon: <Users className="w-7 h-7 text-[#00386c]" />,
    title: "Diseñador UI/UX",
    company: "DesignCraft • Remoto",
    steps: ["Postulado", "Entrevista", "Oferta"],
    activeStep: 1,
  },
];

const recommendations = [
  {
    icon: <BarChart3 className="w-6 h-6 text-[#00386c]" />,
    badge: "98% Match",
    title: "Lead de Datos",
    desc: "Da forma al futuro de las plataformas de analítica en una startup de alto crecimiento.",
    tags: ["Remoto", "$4.5M - $6M COP", "Nuevo"],
  },
  {
    icon: <Users className="w-6 h-6 text-[#00386c]" />,
    badge: "94% Match",
    title: "Practicante UI Engineer",
    desc: "Perfecto para estudiantes de último semestre. Únete al equipo que construyó el sistema de diseño Nebula.",
    tags: ["Valledupar", "Medio tiempo", "Para estudiantes"],
  },
  {
    icon: <Rocket className="w-6 h-6 text-[#00386c]" />,
    badge: "Alto crecimiento",
    title: "Tecnólogo Creativo",
    desc: "Agencia boutique buscando un estudiante que pueda cerrar la brecha entre Figma y producción.",
    tags: ["Híbrido", "Contrato", "Urgente"],
  },
];

export default function CandidateDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.role === "COMPANY") { router.replace("/dashboard/company"); }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
        <span className="w-8 h-8 border-2 border-[#00386c]/20 border-t-[#00386c] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="pb-20 px-8 pt-8 max-w-screen-2xl mx-auto space-y-12">
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
        <div className="lg:col-span-7 animate-fade-up">
          <h1 className="text-5xl lg:text-6xl font-headline font-extrabold text-[#00386c] tracking-tight leading-tight">
            ¡Bienvenido de nuevo,{" "}
            <span className="text-[#006d37]">
              {roleLabel[user.role] ?? user.role}.
            </span>
          </h1>
          <p className="mt-4 text-[#424750] text-lg max-w-lg leading-relaxed">
            Tu trayectoria profesional se ve sólida. Tienes oportunidades
            esperándote. ¿Listo para dar el siguiente paso?
          </p>
        </div>

        <div className="lg:col-span-5 flex justify-end animate-fade-up-delay-1">
          <div className="bg-[#f2f4f6] rounded-xl p-5 flex items-center gap-4 w-full lg:w-auto">
            <div className="flex -space-x-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-[#00386c] border-2 border-[#f2f4f6] flex items-center justify-center"
                  style={{ opacity: 1 - i * 0.2 }}
                >
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
              ))}
            </div>
            <span className="text-sm font-semibold text-[#00386c]">
              12 reclutadores vieron tu perfil hoy
            </span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-up-delay-2">
        {statsCards.map(({ icon, label, value, sub, bg, textValue, textSub, textLabel }) => (
          <div key={label} className={`${bg} p-8 rounded-xl flex flex-col justify-between h-48`}>
            <div className="flex justify-between items-start">
              {icon}
              <span className={`text-xs font-bold uppercase tracking-widest ${textLabel}`}>
                {label}
              </span>
            </div>
            <div>
              <h3 className={`text-4xl font-headline font-extrabold ${textValue}`}>{value}</h3>
              <p className={`text-sm font-medium ${textSub}`}>{sub}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-headline font-bold text-[#00386c]"> Postulaciones activas </h2>
            <Link
              href="/dashboard/candidate/postulaciones"
              className="text-[#00386c] text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all"
            >
              Ver todas <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {applications.map(({ icon, title, company, steps, activeStep }) => (
              <div
                key={title}
                className="bg-[#f2f4f6] rounded-xl p-6 flex flex-col md:flex-row md:items-center gap-6"
              >
                <div className="flex-shrink-0 w-14 h-14 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  {icon}
                </div>
                <div className="flex-grow">
                  <h4 className="font-bold text-lg text-[#191c1e]">{title}</h4>
                  <p className="text-[#424750] text-sm">{company}</p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-4">
                  {steps.map((step, i) => (
                    <div key={step} className="flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-2.5 h-2.5 rounded-full ${i <= activeStep ? "bg-[#006d37]" : "bg-[#c2c6d1]"}`} />
                        <span className={`text-[10px] font-bold uppercase mt-2 ${i <= activeStep ? "text-[#006d37]" : "text-[#424750]/40"}`}>
                          {step}
                        </span>
                      </div>
                      {i < steps.length - 1 && (
                        <div className={`w-10 h-[2px] mb-4 ${i < activeStep ? "bg-[#006d37]" : "bg-[#e6e8ea]"}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <h2 className="text-2xl font-headline font-bold text-[#00386c]"> Tu hoja de vida </h2>
          <div className="bg-[#f2f4f6] rounded-xl p-8 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-[#006d37]/10 rounded-full blur-2xl" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-4 border-[#4ae183]/40 border-t-[#006d37] flex items-center justify-center bg-white shadow-sm">
                  <span className="text-sm font-bold text-[#006d37]">92%</span>
                </div>
                <div>
                  <h4 className="font-bold text-[#191c1e]">Fuerza del perfil</h4>
                  <p className="text-xs text-[#424750] uppercase tracking-widest font-semibold mt-1">
                    Excelente
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/profile/candidate"
                  className="w-full py-4 bg-[#00386c] text-white rounded-full font-bold text-sm tracking-widest uppercase hover:bg-[#0c4783] transition-colors flex items-center justify-center gap-2"
                >
                  <Pencil className="w-4 h-4" /> Editar perfil
                </Link>
                <button className="w-full py-4 bg-white text-[#00386c] rounded-full font-bold text-sm tracking-widest uppercase hover:bg-[#e0e3e5] transition-colors flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" /> Ver CV
                </button>
              </div>

              <div className="pt-4 border-t border-[#c2c6d1]/30">
                <p className="text-xs text-[#424750] leading-relaxed">
                  <span className="font-bold text-[#00386c]">Consejo:</span> Agregar
                  un portafolio aumenta tu chance de entrevista en un 45%.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div>
          <h2 className="text-3xl font-headline font-extrabold text-[#00386c]"> Recomendado para ti </h2>
          <p className="text-[#424750] text-sm mt-1"> Curado según tu perfil de habilidades </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {recommendations.map(({ icon, badge, title, desc, tags }) => (
            <div
              key={title}
              className="bg-white p-8 rounded-xl shadow-sm hover:shadow-xl hover:shadow-[#00386c]/5 transition-all group cursor-pointer border border-transparent hover:border-[#c2c6d1]/15"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-[#f2f4f6] rounded-lg flex items-center justify-center"> {icon} </div>
                <span className="bg-[#6bfe9c] text-[#00743a] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {badge}
                </span>
              </div>
              <h3 className="text-xl font-headline font-bold text-[#00386c] group-hover:text-[#006d37] transition-colors"> {title} </h3>
              <p className="text-[#424750] mt-2 text-sm leading-relaxed mb-6 line-clamp-2"> {desc} </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {tags.map((tag) => (
                  <span key={tag} className="text-[11px] font-semibold text-[#424750] bg-[#f2f4f6] px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <button className="w-full py-3 rounded-full bg-[#e6e8ea] text-[#0c4783] text-sm font-bold tracking-widest uppercase hover:bg-[#006d37] hover:text-white transition-all">
                Postularme
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}