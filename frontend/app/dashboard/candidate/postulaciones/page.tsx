"use client";

import { useAuth } from "@/src/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useMyApplications } from "@/src/hooks/queries";
import { ApplicationStatus } from "@/src/types/api";
import TalentBridgeLoader from "@/src/components/ui/TalentBridgeLoader";
import {
  Briefcase, Building2, MapPin, Clock, CheckCircle2,
  XCircle, AlertCircle, Send, ChevronRight, Star, ArrowRight, BookOpen,
} from "lucide-react";
import { publicLinks } from "@/src/content/site-links";

const STATUS_META: Record<ApplicationStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  RECEIVED:  { label: "Recibida",        color: "text-[#00386c]",  bg: "bg-[#a6c8ff]/20",  icon: <Send className="w-3.5 h-3.5" /> },
  REVIEWING: { label: "En revisión",     color: "text-[#7c5c00]",  bg: "bg-[#fff3cd]",     icon: <Clock className="w-3.5 h-3.5" /> },
  SELECTED:  { label: "Seleccionado",    color: "text-[#005228]",  bg: "bg-[#6bfe9c]/20",  icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  REJECTED:  { label: "No seleccionado", color: "text-[#93000a]",  bg: "bg-[#ffdad6]",     icon: <XCircle className="w-3.5 h-3.5" /> },
};

const TYPE_LABEL: Record<string, string>     = { FORMAL: "Tiempo completo", FREELANCE: "Freelance" };
const WORKMODE_LABEL: Record<string, string> = { REMOTE: "Remoto", ONSITE: "Presencial", HYBRID: "Híbrido" };
const ACTIVE_STATUSES: ApplicationStatus[]   = ["RECEIVED", "REVIEWING", "SELECTED"];
const HISTORIC_STATUSES: ApplicationStatus[] = ["REJECTED"];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000), hours = Math.floor(mins / 60), days = Math.floor(hours / 24);
  if (days > 0)  return `hace ${days} día${days > 1 ? "s" : ""}`;
  if (hours > 0) return `hace ${hours} hora${hours > 1 ? "s" : ""}`;
  return `hace ${mins} min`;
}

// ── Progress steps ────────────────────────────────────────────────────────────
const APP_STATUS_STEP: Record<string, number> = { RECEIVED: 1, REVIEWING: 2, SELECTED: 3, REJECTED: 0 };

function AppProgressBar({ status }: { status: string }) {
  const step = APP_STATUS_STEP[status] ?? 1;
  if (status === "REJECTED") return (
    <div className="mt-2"><span className="text-[10px] font-bold text-[#ba1a1a] bg-[#ffdad6] px-2 py-0.5 rounded-full">No seleccionado</span></div>
  );
  const steps = ["Recibida", "En revisión", "Seleccionado"];
  return (
    <div className="mt-3">
      <div className="flex items-center">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all ${i+1 < step ? "bg-[#006d37]" : i+1 === step ? "bg-[#00386c] ring-2 ring-[#00386c]/25" : "bg-[#e0e3e5]"}`} />
            {i < steps.length-1 && <div className={`flex-1 h-0.5 mx-1 ${i+1 < step ? "bg-[#006d37]" : "bg-[#e0e3e5]"}`} />}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1.5">
        {steps.map((s, i) => (
          <span key={s} className={`text-[9px] font-bold uppercase tracking-wider ${i+1 <= step ? "text-[#00386c]" : "text-[#c2c6d1]"}`}>{s}</span>
        ))}
      </div>
    </div>
  );
}

export default function PostulacionesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const enabled = !!user && user.role !== "COMPANY";
  const { data: applications = [], isLoading: loading, isError, refetch } = useMyApplications(enabled, user?.userId);

  useEffect(() => {
    if (!isLoading && user?.role === "COMPANY") router.replace("/dashboard/company");
  }, [user, isLoading, router]);

  const [tab, setTab] = useState<"active" | "historic">("active");
  const active   = applications.filter(a => ACTIVE_STATUSES.includes(a.status));
  const historic = applications.filter(a => HISTORIC_STATUSES.includes(a.status));
  const shown    = tab === "active" ? active : historic;

  if (isLoading || !user) return <TalentBridgeLoader />;
  if (loading)             return <TalentBridgeLoader />;

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f7f9fb] text-center px-8">
        <AlertCircle className="w-10 h-10 text-[#ba1a1a]" />
        <p className="text-[#93000a] font-semibold">No se pudieron cargar las postulaciones.</p>
        <button onClick={() => refetch()}
          className="px-6 py-2 bg-[#00386c] text-white rounded-full text-sm font-bold hover:opacity-90 transition">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb]">

      {/* ── Hero header ── */}
      <div className="relative bg-gradient-to-r from-[#00386c] via-[#0c4783] to-[#00386c] overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="app-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.8"/>
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#app-grid)" />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative max-w-screen-lg mx-auto px-8 py-10">
          <p className="text-[#a6c8ff] text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
            <Send className="w-3.5 h-3.5 text-[#6bfe9c]" /> Mis postulaciones
          </p>
          <h1 className="font-headline font-extrabold text-4xl text-white tracking-tight">Mis Postulaciones</h1>
          <p className="text-[#a6c8ff] text-sm mt-2">Seguimiento de todas tus aplicaciones a vacantes.</p>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto px-8 py-8 space-y-6">

        {/* Stats rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total",        value: applications.length,                                      color: "text-[#191c1e]" },
            { label: "En proceso",   value: applications.filter(a => a.status !== "REJECTED").length, color: "text-[#00386c]" },
            { label: "Seleccionado", value: applications.filter(a => a.status === "SELECTED").length, color: "text-[#005228]" },
            { label: "Rechazadas",   value: applications.filter(a => a.status === "REJECTED").length, color: "text-[#93000a]" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-[#e6e8ea] p-5 text-center hover:shadow-md transition-all">
              <p className={`text-3xl font-extrabold font-headline ${color}`}>{value}</p>
              <p className="text-xs text-[#737781] font-semibold mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { key: "active",   label: "Activas",   count: active.length },
            { key: "historic", label: "Historial", count: historic.length },
          ].map(({ key, label, count }) => (
            <button key={key} onClick={() => setTab(key as "active" | "historic")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                tab === key ? "bg-[#00386c] text-white shadow-md" : "bg-white text-[#424750] border border-[#e6e8ea] hover:border-[#00386c]/20"
              }`}>
              {label}
              <span className={`ml-1.5 text-xs ${tab === key ? "opacity-70" : "text-[#737781]"}`}>({count})</span>
            </button>
          ))}
        </div>

        {/* Lista */}
        {shown.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-[#c2c6d1] p-16 text-center">
            <div className="w-16 h-16 bg-[#f2f4f6] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-7 h-7 text-[#c2c6d1]" />
            </div>
            <h3 className="font-bold text-lg text-[#191c1e] font-headline mb-1">
              {tab === "active" ? "Sin postulaciones activas" : "Sin historial aún"}
            </h3>
            <p className="text-sm text-[#737781] mb-6">
              {tab === "active" ? "Explora vacantes y postúlate para ver tu progreso aquí." : "Las postulaciones rechazadas aparecerán aquí."}
            </p>
            {tab === "active" && (
              <Link href="/dashboard/candidate/explorar"
                className="inline-flex items-center gap-2 bg-[#00386c] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition">
                Explorar vacantes <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {shown.map(app => {
              const meta = STATUS_META[app.status];
              return (
                <div key={app.id}
                  className="bg-white rounded-2xl border border-[#e6e8ea] hover:shadow-lg hover:shadow-[#00386c]/5 hover:border-[#00386c]/15 transition-all p-6 group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">

                      {/* Company initial */}
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00386c] to-[#1a4f8b] flex items-center justify-center flex-shrink-0 shadow-md shadow-[#00386c]/15">
                        <span className="text-xl font-black text-white">{(app.job.company?.companyName ?? "?")[0].toUpperCase()}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="font-bold text-lg text-[#191c1e] font-headline truncate group-hover:text-[#00386c] transition-colors">
                            {app.job.title}
                          </h3>
                          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ${meta.bg} ${meta.color}`}>
                            {meta.icon}{meta.label}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm text-[#424750] mb-3">
                          {app.job.company?.companyName && (
                            <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-[#737781]" />{app.job.company.companyName}</span>
                          )}
                          {app.job.company?.city && (
                            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#737781]" />{app.job.company.city}</span>
                          )}
                          <span className="flex items-center gap-1.5 text-[#737781] text-xs">
                            <Clock className="w-3 h-3" /> Postulado {timeAgo(app.createdAt)}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-2.5 py-1 bg-[#f2f4f6] text-[#424750] rounded-md text-xs font-semibold">{TYPE_LABEL[app.job.type] ?? app.job.type}</span>
                          <span className="px-2.5 py-1 bg-[#f2f4f6] text-[#424750] rounded-md text-xs font-semibold">{WORKMODE_LABEL[app.job.workMode] ?? app.job.workMode}</span>
                          {app.job.budgetMin && (
                            <span className="px-2.5 py-1 bg-[#f2f4f6] text-[#424750] rounded-md text-xs font-semibold">
                              ${(app.job.budgetMin/1000000).toFixed(1)}M{app.job.budgetMax ? ` – $${(app.job.budgetMax/1000000).toFixed(1)}M` : "+"} COP
                            </span>
                          )}
                        </div>

                        {/* Progress bar */}
                        <AppProgressBar status={app.status} />
                      </div>
                    </div>

                    {/* Score + link */}
                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                      {app.scoreAtApply !== null && (
                        <div className="flex items-center gap-1.5 bg-[#f2f4f6] px-3 py-1.5 rounded-full">
                          <Star className="w-3.5 h-3.5 text-[#006d37]" />
                          <span className="text-xs font-bold text-[#191c1e]">{Math.round(app.scoreAtApply)}% match</span>
                        </div>
                      )}
                      <Link href="/dashboard/candidate/explorar" className="flex items-center gap-1 text-xs font-bold text-[#00386c] hover:underline">
                        Ver vacante <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {app.status === "SELECTED" && (
                    <div className="mt-4 pt-4 border-t border-[#f2f4f6] flex items-center justify-between">
                      <p className="text-xs text-[#005228] font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ¡Fuiste seleccionado! La empresa puede enviarte un contrato.
                      </p>
                      <Link href="/dashboard/candidate/contratos" className="text-xs font-bold text-[#006d37] hover:underline">
                        Ver contratos →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Info footer sutil ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 pb-4">
          {[
            { icon: <Send className="w-4 h-4" />,     title: "Proceso de postulación", desc: "Entiende cada estado de tus aplicaciones.", href: publicLinks.processes.applications },
            { icon: <BookOpen className="w-4 h-4" />, title: "¿Cómo funciona TalentBridge?", desc: "El flujo completo explicado paso a paso.", href: publicLinks.howItWorks },
          ].map(({ icon, title, desc, href }) => (
            <a key={title} href={href} target="_blank" rel="noopener noreferrer"
              className="group flex items-start gap-3 p-4 bg-white/60 border border-[#e6e8ea] rounded-2xl hover:border-[#00386c]/20 hover:bg-white hover:shadow-sm transition-all">
              <div className="w-8 h-8 bg-[#00386c]/8 rounded-xl flex items-center justify-center flex-shrink-0 text-[#00386c] group-hover:bg-[#00386c]/12 transition-colors">{icon}</div>
              <div>
                <p className="text-xs font-bold text-[#191c1e] group-hover:text-[#00386c] transition-colors">{title}</p>
                <p className="text-[10px] text-[#737781] mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}