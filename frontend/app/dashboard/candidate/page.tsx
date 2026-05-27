"use client";

import { useAuth } from "@/src/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import {
  useMyApplications,
  useMyRanking,
  useContracts,
} from "@/src/hooks/queries";
import {
  Send, ArrowRight, GraduationCap, FileText, Pencil,
  Briefcase, CheckCircle2, Clock, AlertCircle, Star,
} from "lucide-react";

const roleLabel: Record<string, string> = {
  STUDENT: "Estudiante",
  GRADUATE: "Egresado",
};

const APP_STATUS_LABEL: Record<string, string> = {
  RECEIVED:  "Recibida",
  REVIEWING: "En revisión",
  SELECTED:  "Seleccionado",
  REJECTED:  "Rechazada",
};

const CONTRACT_STATUS_LABEL: Record<string, string> = {
  PENDING_CANDIDATE: "Pendiente",
  ACTIVE:            "Activo",
  COMPLETED:         "Completado",
  CANCELLED:         "Cancelado",
};

export default function CandidateDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const enabled = !!user && user.role !== "COMPANY";

  const { data: score = null, isLoading: scoreLoading } = useMyRanking(enabled);
  const { data: applications = [], isLoading: appsLoading } = useMyApplications(enabled);
  const { data: contracts = [], isLoading: contractsLoading } = useContracts(enabled);

  const loading = scoreLoading || appsLoading || contractsLoading;

  useEffect(() => {
    if (!isLoading && user?.role === "COMPANY") router.replace("/dashboard/company");
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
        <span className="w-8 h-8 border-2 border-[#00386c]/20 border-t-[#00386c] rounded-full animate-spin" />
      </div>
    );
  }

  const activeApps      = applications.filter(a => a.status !== "REJECTED");
  const activeContracts = contracts.filter(c => c.status === "ACTIVE");
  const pendingContracts = contracts.filter(c => c.status === "PENDING_CANDIDATE");
  const scoreValue      = score ? Math.round(score.totalScore) : null;
  const topSuggestions  = score?.suggestions?.slice(0, 2) ?? [];

  const scoreLabel = scoreValue === null ? "—"
    : scoreValue >= 80 ? "Excelente"
    : scoreValue >= 60 ? "Bueno"
    : scoreValue >= 40 ? "Regular"
    : "Incompleto";

  const statsCards = [
    {
      icon: <Send className="w-5 h-5 text-[#a6c8ff]" />,
      label: "POSTULACIONES",
      value: loading ? "—" : String(activeApps.length),
      sub: "En progreso",
      bg: "bg-gradient-to-br from-[#00386c] to-[#1a4f8b]",
      textValue: "text-white",
      textSub: "text-[#a6c8ff]",
      textLabel: "text-[#a6c8ff]/70",
    },
    {
      icon: <Briefcase className="w-5 h-5 text-[#006d37]" />,
      label: "CONTRATOS",
      value: loading ? "—" : String(activeContracts.length),
      sub: "Activos ahora",
      bg: "bg-white",
      textValue: "text-[#191c1e]",
      textSub: "text-[#424750]",
      textLabel: "text-[#424750]",
    },
    {
      icon: <Star className="w-5 h-5 text-[#00743a]" />,
      label: "MI SCORE",
      value: loading ? "—" : scoreValue !== null ? `${scoreValue}%` : "—",
      sub: loading ? "Cargando..." : scoreLabel,
      bg: "bg-[#6bfe9c]",
      textValue: "text-[#00210c]",
      textSub: "text-[#005228]",
      textLabel: "text-[#005228]",
    },
  ];

  return (
    <main className="pb-20 px-8 pt-8 max-w-screen-2xl mx-auto space-y-12">
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
        <div className="lg:col-span-7">
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

        {pendingContracts.length > 0 ? (
          <div className="lg:col-span-5 flex justify-end">
            <Link href="/dashboard/candidate/contratos"
              className="bg-[#fff3cd] border border-[#ffc107]/30 rounded-xl p-5 flex items-center gap-4 w-full lg:w-auto hover:shadow-md transition-all">
              <div className="flex -space-x-3">
                {[...Array(Math.min(pendingContracts.length, 3))].map((_, i) => (
                  <div key={i}
                    className="w-10 h-10 rounded-full bg-[#ffc107] border-2 border-[#fff3cd] flex items-center justify-center"
                    style={{ opacity: 1 - i * 0.2 }}>
                    <Clock className="w-5 h-5 text-[#7c5c00]" />
                  </div>
                ))}
              </div>
              <span className="text-sm font-semibold text-[#7c5c00]">
                {pendingContracts.length} contrato{pendingContracts.length > 1 ? "s" : ""} pendiente{pendingContracts.length > 1 ? "s" : ""} de confirmación
              </span>
            </Link>
          </div>
        ) : (
          <div className="lg:col-span-5 flex justify-end">
            <div className="bg-[#f2f4f6] rounded-xl p-5 flex items-center gap-4 w-full lg:w-auto">
              <div className="flex -space-x-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i}
                    className="w-10 h-10 rounded-full bg-[#00386c] border-2 border-[#f2f4f6] flex items-center justify-center"
                    style={{ opacity: 1 - i * 0.2 }}>
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                ))}
              </div>
              <span className="text-sm font-semibold text-[#00386c]">
                {loading ? "Cargando tu perfil..." : `${activeApps.length} postulacion${activeApps.length !== 1 ? "es" : ""} activa${activeApps.length !== 1 ? "s" : ""}`}
              </span>
            </div>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsCards.map(({ icon, label, value, sub, bg, textValue, textSub, textLabel }) => (
          <div key={label} className={`${bg} p-8 rounded-xl flex flex-col justify-between h-48`}>
            <div className="flex justify-between items-start">
              {icon}
              <span className={`text-xs font-bold uppercase tracking-widest ${textLabel}`}>{label}</span>
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
            <h2 className="text-2xl font-headline font-bold text-[#00386c]">Postulaciones activas</h2>
            <Link href="/dashboard/candidate/postulaciones"
              className="text-[#00386c] text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
              Ver todas <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <span className="w-6 h-6 border-2 border-[#00386c]/20 border-t-[#00386c] rounded-full animate-spin" />
            </div>
          ) : activeApps.length === 0 ? (
            <div className="bg-[#f2f4f6] rounded-xl p-10 text-center">
              <Briefcase className="w-8 h-8 text-[#c2c6d1] mx-auto mb-3" />
              <p className="text-sm text-[#737781] font-medium mb-4">Aún no tienes postulaciones activas.</p>
              <Link href="/dashboard/candidate/explorar"
                className="inline-flex items-center gap-2 bg-[#00386c] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition">
                Explorar vacantes
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {activeApps.slice(0, 3).map(app => (
                <div key={app.id}
                  className="bg-[#f2f4f6] rounded-xl p-6 flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-shrink-0 w-14 h-14 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <span className="text-xl font-black text-[#00386c]">
                      {(app.job.company?.companyName ?? "?")[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="font-bold text-lg text-[#191c1e] truncate">{app.job.title}</h4>
                    <p className="text-[#424750] text-sm">{app.job.company?.companyName ?? "Empresa"}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {app.scoreAtApply !== null && (
                      <span className="text-xs font-bold text-[#006d37] bg-[#6bfe9c]/20 px-3 py-1 rounded-full">
                        {Math.round(app.scoreAtApply)}% match
                      </span>
                    )}
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      app.status === "SELECTED"  ? "bg-[#6bfe9c]/20 text-[#005228]" :
                      app.status === "REVIEWING" ? "bg-[#fff3cd] text-[#7c5c00]" :
                      "bg-[#a6c8ff]/20 text-[#00386c]"
                    }`}>
                      {APP_STATUS_LABEL[app.status] ?? app.status}
                    </span>
                  </div>
                </div>
              ))}
              {activeApps.length > 3 && (
                <Link href="/dashboard/candidate/postulaciones"
                  className="block text-center text-sm font-bold text-[#00386c] hover:underline py-2">
                  Ver {activeApps.length - 3} más →
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <h2 className="text-2xl font-headline font-bold text-[#00386c]">Tu hoja de vida</h2>
          <div className="bg-[#f2f4f6] rounded-xl p-8 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-[#006d37]/10 rounded-full blur-2xl" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="transparent" stroke="#e6e8ea" strokeWidth="4" />
                    <circle cx="32" cy="32" r="28" fill="transparent"
                      stroke="#006d37" strokeWidth="4"
                      strokeDasharray="176"
                      strokeDashoffset={176 - (176 * (scoreValue ?? 0)) / 100}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 0.6s ease" }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#006d37]">
                    {loading ? "..." : scoreValue !== null ? `${scoreValue}%` : "—"}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-[#191c1e]">Fuerza del perfil</h4>
                  <p className="text-xs text-[#424750] uppercase tracking-widest font-semibold mt-1">
                    {loading ? "Calculando..." : scoreLabel}
                  </p>
                </div>
              </div>

              {topSuggestions.length > 0 && (
                <div className="space-y-2">
                  {topSuggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-[#006d37] mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-[#424750] leading-relaxed">{s}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                <Link href="/profile/candidate"
                  className="w-full py-4 bg-[#00386c] text-white rounded-full font-bold text-sm tracking-widest uppercase hover:bg-[#0c4783] transition-colors flex items-center justify-center gap-2">
                  <Pencil className="w-4 h-4" /> Editar perfil
                </Link>
                <Link href="/dashboard/candidate/contratos"
                  className="w-full py-4 bg-white text-[#00386c] rounded-full font-bold text-sm tracking-widest uppercase hover:bg-[#e0e3e5] transition-colors flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  Contratos
                  {activeContracts.length > 0 && (
                    <span className="bg-[#006d37] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {activeContracts.length}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>

          {activeContracts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#424750] uppercase tracking-wider">Contratos activos</h3>
              {activeContracts.slice(0, 2).map(c => (
                <Link key={c.id}
                  href={`/dashboard/candidate/contratos/${c.id}`}
                  className="flex items-center gap-3 bg-white rounded-xl p-4 border border-[#e6e8ea] hover:shadow-md transition-all group">
                  <div className="w-8 h-8 bg-[#6bfe9c]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-[#006d37]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[#191c1e] truncate group-hover:text-[#00386c]">
                      {c.title}
                    </p>
                    <p className="text-xs text-[#737781]">
                      {CONTRACT_STATUS_LABEL[c.status]}
                      {c.totalAmount ? ` · $${c.totalAmount.toLocaleString("es-CO")}` : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-gradient-to-br from-[#00386c] to-[#1a4f8b] rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-headline font-extrabold text-white">
            {activeApps.length === 0 ? "Empieza a postularte hoy" : "Sigue explorando oportunidades"}
          </h2>
          <p className="text-[#a6c8ff] mt-1 text-sm">
            Encuentra vacantes que se ajusten a tu perfil y score actual.
          </p>
        </div>
        <Link href="/dashboard/candidate/explorar"
          className="flex items-center gap-2 bg-[#6bfe9c] text-[#00210c] px-8 py-3.5 rounded-full font-headline font-bold tracking-widest uppercase hover:opacity-90 active:scale-95 transition-all text-sm whitespace-nowrap">
          Explorar vacantes <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </main>
  );
}
