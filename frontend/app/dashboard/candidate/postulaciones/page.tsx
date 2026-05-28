"use client";

import { useAuth } from "@/src/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useMyApplications } from "@/src/hooks/queries";
import { ApplicationStatus } from "@/src/types/api";
import {
  Briefcase, Building2, MapPin, Clock, CheckCircle2,
  XCircle, AlertCircle, Send, ChevronRight, Star,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_META: Record<ApplicationStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  RECEIVED: {
    label: "Recibida",
    color: "text-[#00386c]",
    bg: "bg-[#a6c8ff]/20",
    icon: <Send className="w-3.5 h-3.5" />,
  },
  REVIEWING: {
    label: "En revisión",
    color: "text-[#7c5c00]",
    bg: "bg-[#fff3cd]",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  SELECTED: {
    label: "Seleccionado",
    color: "text-[#005228]",
    bg: "bg-[#6bfe9c]/20",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  REJECTED: {
    label: "No seleccionado",
    color: "text-[#93000a]",
    bg: "bg-[#ffdad6]",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

const TYPE_LABEL: Record<string, string>     = { FORMAL: "Tiempo completo", FREELANCE: "Freelance" };
const WORKMODE_LABEL: Record<string, string> = { REMOTE: "Remoto", ONSITE: "Presencial", HYBRID: "Híbrido" };

const ACTIVE_STATUSES: ApplicationStatus[]   = ["RECEIVED", "REVIEWING", "SELECTED"];
const HISTORIC_STATUSES: ApplicationStatus[] = ["REJECTED"];

function timeAgo(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (days > 0)  return `hace ${days} día${days > 1 ? "s" : ""}`;
  if (hours > 0) return `hace ${hours} hora${hours > 1 ? "s" : ""}`;
  return `hace ${mins} min`;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function PostulacionesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const enabled = !!user && user.role !== "COMPANY";
  const { data: applications = [], isLoading: loading, isError, refetch } = useMyApplications(enabled, user?.userId);
  const error = isError ? "No se pudieron cargar las postulaciones." : "";

  useEffect(() => {
    if (!isLoading && user?.role === "COMPANY") router.replace("/dashboard/company");
  }, [user, isLoading, router]);

  async function loadApplications() {
    await refetch();
  }

  const [tab, setTab] = useState<"active" | "historic">("active");

  const active   = applications.filter(a => ACTIVE_STATUSES.includes(a.status));
  const historic = applications.filter(a => HISTORIC_STATUSES.includes(a.status));
  const shown    = tab === "active" ? active : historic;

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
        <span className="w-8 h-8 border-2 border-[#00386c]/20 border-t-[#00386c] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f7f9fb] text-center px-8">
        <AlertCircle className="w-10 h-10 text-[#ba1a1a]" />
        <p className="text-[#93000a] font-semibold">{error}</p>
        <button onClick={loadApplications}
          className="px-6 py-2 bg-[#00386c] text-white rounded-full text-sm font-bold hover:opacity-90 transition">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-screen-lg mx-auto px-8 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-[#00386c] font-headline tracking-tight">
          Mis Postulaciones
        </h1>
        <p className="text-[#424750] mt-1">
          Seguimiento de todas tus aplicaciones a vacantes.
        </p>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total",        value: applications.length,                                          color: "text-[#191c1e]" },
          { label: "En proceso",   value: applications.filter(a => a.status !== "REJECTED").length,     color: "text-[#00386c]" },
          { label: "Seleccionado", value: applications.filter(a => a.status === "SELECTED").length,     color: "text-[#005228]" },
          { label: "Rechazadas",   value: applications.filter(a => a.status === "REJECTED").length,     color: "text-[#93000a]" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-[#e6e8ea] p-5 text-center">
            <p className={`text-3xl font-extrabold font-headline ${color}`}>{value}</p>
            <p className="text-xs text-[#737781] font-semibold mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setTab("active")}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
            tab === "active"
              ? "bg-[#00386c] text-white shadow-md"
              : "bg-[#f2f4f6] text-[#424750] hover:bg-[#e6e8ea]"
          }`}
        >
          Activas
          <span className={`ml-1.5 text-xs ${tab === "active" ? "opacity-70" : "text-[#737781]"}`}>
            ({active.length})
          </span>
        </button>
        <button
          onClick={() => setTab("historic")}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
            tab === "historic"
              ? "bg-[#00386c] text-white shadow-md"
              : "bg-[#f2f4f6] text-[#424750] hover:bg-[#e6e8ea]"
          }`}
        >
          Historial
          <span className={`ml-1.5 text-xs ${tab === "historic" ? "opacity-70" : "text-[#737781]"}`}>
            ({historic.length})
          </span>
        </button>
      </div>

      {/* Lista vacía */}
      {shown.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-[#c2c6d1] p-16 text-center">
          <Briefcase className="w-12 h-12 text-[#c2c6d1] mx-auto mb-4" />
          <h3 className="font-bold text-lg text-[#191c1e] font-headline mb-1">
            {tab === "active" ? "Sin postulaciones activas" : "Sin historial aún"}
          </h3>
          <p className="text-sm text-[#737781] mb-6">
            {tab === "active"
              ? "Explora vacantes y postúlate para ver tu progreso aquí."
              : "Las postulaciones rechazadas aparecerán aquí."}
          </p>
          {tab === "active" && (
            <Link href="/dashboard/candidate/explorar"
              className="inline-flex items-center gap-2 bg-[#00386c] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition">
              Explorar vacantes
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {shown.map(app => {
            const meta = STATUS_META[app.status];
            return (
              <div key={app.id}
                className="bg-white rounded-2xl border border-[#e6e8ea] hover:shadow-lg hover:shadow-[#00386c]/5 transition-all p-6">
                <div className="flex items-start justify-between gap-4">

                  {/* Info principal */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-[#f2f4f6] flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-black text-[#00386c]">
                        {(app.job.company?.companyName ?? "?")[0].toUpperCase()}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h3 className="font-bold text-lg text-[#191c1e] font-headline truncate">
                          {app.job.title}
                        </h3>
                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${meta.bg} ${meta.color}`}>
                          {meta.icon}
                          {meta.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-3 text-sm text-[#424750] mb-3">
                        {app.job.company?.companyName && (
                          <span className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-[#737781]" />
                            {app.job.company.companyName}
                          </span>
                        )}
                        {app.job.company?.city && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#737781]" />
                            {app.job.company.city}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5 text-[#737781] text-xs">
                          <Clock className="w-3 h-3" />
                          Postulado {timeAgo(app.createdAt)}
                        </span>
                      </div>

                      {/* Tags de la vacante */}
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2.5 py-1 bg-[#f2f4f6] text-[#424750] rounded-md text-xs font-semibold">
                          {TYPE_LABEL[app.job.type] ?? app.job.type}
                        </span>
                        <span className="px-2.5 py-1 bg-[#f2f4f6] text-[#424750] rounded-md text-xs font-semibold">
                          {WORKMODE_LABEL[app.job.workMode] ?? app.job.workMode}
                        </span>
                        {app.job.budgetMin && (
                          <span className="px-2.5 py-1 bg-[#f2f4f6] text-[#424750] rounded-md text-xs font-semibold">
                            ${(app.job.budgetMin / 1000000).toFixed(1)}M
                            {app.job.budgetMax ? ` – $${(app.job.budgetMax / 1000000).toFixed(1)}M` : "+"} COP
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Score y flecha */}
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    {app.scoreAtApply !== null && (
                      <div className="flex items-center gap-1.5 bg-[#f2f4f6] px-3 py-1.5 rounded-full">
                        <Star className="w-3.5 h-3.5 text-[#006d37]" />
                        <span className="text-xs font-bold text-[#191c1e]">
                          {Math.round(app.scoreAtApply)}% match
                        </span>
                      </div>
                    )}
                    <Link href={`/dashboard/candidate/explorar`}
                      className="flex items-center gap-1 text-xs font-bold text-[#00386c] hover:underline">
                      Ver vacante <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Mensaje si fue seleccionado */}
                {app.status === "SELECTED" && (
                  <div className="mt-4 pt-4 border-t border-[#f2f4f6] flex items-center justify-between">
                    <p className="text-xs text-[#005228] font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      ¡Fuiste seleccionado! La empresa puede enviarte un contrato.
                    </p>
                    <Link href="/dashboard/candidate/contratos"
                      className="text-xs font-bold text-[#006d37] hover:underline">
                      Ver contratos →
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}