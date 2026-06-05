"use client";

import { useAuth } from "@/src/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useContracts } from "@/src/hooks/queries";
import { ContractsListSkeleton } from "@/src/components/contracts/ContractsListSkeleton";
import TalentBridgeLoader from "@/src/components/ui/TalentBridgeLoader";
import { publicLinks } from "@/src/content/site-links";
import {
  FileText, Clock, CheckCircle2, XCircle, AlertCircle,
  ChevronRight, Briefcase, Building2, Calendar, ArrowRight,
} from "lucide-react";

interface Contract {
  id: string; status: string; title: string; description: string | null;
  startDate: string | null; endDate: string | null; totalAmount: number | null;
  createdAt: string;
  job: { title: string } | null;
  company: { companyName: string | null } | null;
}

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDING_CANDIDATE: { label: "Pendiente de tu firma", color: "text-[#7c5c00]",  bg: "bg-[#fff3cd]",    icon: <Clock className="w-3.5 h-3.5" /> },
  ACTIVE:            { label: "Activo",                color: "text-[#005228]",  bg: "bg-[#6bfe9c]/20", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  COMPLETED:         { label: "Completado",            color: "text-[#00386c]",  bg: "bg-[#a6c8ff]/20", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  CANCELLED:         { label: "Cancelado",             color: "text-[#93000a]",  bg: "bg-[#ffdad6]",    icon: <XCircle className="w-3.5 h-3.5" /> },
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}
function formatAmount(amount: number | null) {
  if (!amount) return "A convenir";
  return `$${amount.toLocaleString("es-CO")} COP`;
}

export default function ContratosPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const enabled = !!user && user.role !== "COMPANY";
  const { data: contracts=[], isLoading: loading, isError, refetch } = useContracts(enabled, user?.userId);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    if (!isLoading && user?.role === "COMPANY") router.replace("/dashboard/company/contratos");
  }, [user, isLoading, router]);

  if (isLoading || !user) return <TalentBridgeLoader />;

  if (isError && contracts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f7f9fb] text-center px-6">
        <AlertCircle className="w-10 h-10 text-[#ba1a1a]" />
        <p className="text-[#93000a] font-semibold">No se pudieron cargar los contratos.</p>
        <button onClick={() => refetch()} className="px-6 py-2 bg-[#00386c] text-white rounded-full text-sm font-bold hover:opacity-90 transition">Reintentar</button>
      </div>
    );
  }

  const filtered     = filter === "ALL" ? contracts : contracts.filter(c => c.status === filter);
  const pendingCount = contracts.filter(c => c.status === "PENDING_CANDIDATE").length;
  const listLoading  = loading && contracts.length === 0;

  return (
    <div className="min-h-screen bg-[#f7f9fb]">

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-r from-[#00386c] via-[#0c4783] to-[#00386c] overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="ct-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.8"/>
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#ct-grid)" />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="relative max-w-screen-lg mx-auto px-4 sm:px-8 py-8 sm:py-10">
          <p className="text-[#a6c8ff] text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-[#6bfe9c]" /> Mis contratos
          </p>
          <h1 className="font-headline font-extrabold text-2xl sm:text-4xl text-white tracking-tight">Mis Contratos</h1>
          <p className="text-[#a6c8ff] text-xs sm:text-sm mt-1.5">Gestiona los acuerdos de trabajo formalizados con empresas.</p>

          {/* Stats chips */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {[
              { label: "Total",       value: contracts.length,                                   cls: "bg-white/10 border-white/15 text-white" },
              { label: "Activos",     value: contracts.filter(c=>c.status==="ACTIVE").length,    cls: "bg-[#6bfe9c]/15 border-[#6bfe9c]/20 text-[#6bfe9c]" },
              { label: "Pendientes",  value: pendingCount,                                       cls: pendingCount > 0 ? "bg-[#ffc107]/15 border-[#ffc107]/30 text-[#ffc107]" : "bg-white/10 border-white/15 text-white" },
              { label: "Completados", value: contracts.filter(c=>c.status==="COMPLETED").length, cls: "bg-white/10 border-white/15 text-white" },
            ].map(({ label, value, cls }) => (
              <div key={label} className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border backdrop-blur-sm ${cls}`}>
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</p>
                <p className="text-base sm:text-lg font-headline font-extrabold leading-none">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto px-4 sm:px-8 py-5 sm:py-8 space-y-4 sm:space-y-6">

        {/* Alerta pendientes */}
        {pendingCount > 0 && (
          <div className="bg-[#fff3cd] border border-[#ffc107]/30 text-[#7c5c00] px-4 py-3.5 rounded-2xl flex items-start sm:items-center gap-3">
            <Clock className="w-5 h-5 flex-shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-sm font-semibold">
              Tienes <span className="font-black">{pendingCount}</span> contrato{pendingCount > 1 ? "s" : ""} pendiente{pendingCount > 1 ? "s" : ""} de confirmación.
            </p>
          </div>
        )}

        {/* Filtros — scroll horizontal en mobile */}
        <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible scrollbar-hide">
          {[
            { key:"ALL",               label:"Todos" },
            { key:"PENDING_CANDIDATE", label:"Pendientes" },
            { key:"ACTIVE",            label:"Activos" },
            { key:"COMPLETED",         label:"Completados" },
            { key:"CANCELLED",         label:"Cancelados" },
          ].map(tab => {
            const count = tab.key === "ALL" ? contracts.length : contracts.filter(c=>c.status===tab.key).length;
            return (
              <button key={tab.key} onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                  filter === tab.key ? "bg-[#00386c] text-white shadow-md" : "bg-white text-[#424750] border border-[#e6e8ea] hover:border-[#00386c]/20"
                }`}>
                {tab.label}
                <span className={`ml-1 text-[10px] sm:text-xs ${filter===tab.key?"opacity-70":"text-[#737781]"}`}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Lista */}
        {listLoading ? <ContractsListSkeleton /> : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-[#c2c6d1] p-10 sm:p-16 text-center">
            <div className="w-14 h-14 bg-[#f2f4f6] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-[#c2c6d1]" />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-[#191c1e] font-headline mb-1">
              {filter === "ALL" ? "Sin contratos aún" : "Sin contratos en este estado"}
            </h3>
            <p className="text-sm text-[#737781]">
              {filter === "ALL" ? "Cuando una empresa te asigne un contrato aparecerá aquí." : "No tienes contratos con este estado."}
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filtered.map(contract => {
              const meta      = STATUS_META[contract.status] ?? STATUS_META.CANCELLED;
              const isPending = contract.status === "PENDING_CANDIDATE";
              return (
                <Link key={contract.id} href={`/dashboard/candidate/contratos/${contract.id}`}
                  className={`block bg-white rounded-2xl border transition-all hover:shadow-lg hover:shadow-[#00386c]/5 group ${
                    isPending ? "border-[#ffc107]/40 ring-1 ring-[#ffc107]/20" : "border-[#e6e8ea] hover:border-[#00386c]/15"
                  }`}>
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Icon */}
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        isPending ? "bg-[#fff3cd]" : "bg-gradient-to-br from-[#00386c]/10 to-[#1a4f8b]/10"
                      }`}>
                        <FileText className={`w-4 h-4 sm:w-5 sm:h-5 ${isPending ? "text-[#7c5c00]" : "text-[#00386c]"}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Title + status */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h3 className="font-bold text-sm sm:text-base text-[#191c1e] font-headline group-hover:text-[#00386c] transition-colors leading-tight line-clamp-2">
                            {contract.title}
                          </h3>
                          <ChevronRight className="w-4 h-4 text-[#c2c6d1] group-hover:text-[#00386c] transition-colors flex-shrink-0 mt-0.5" />
                        </div>

                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold mb-2 ${meta.bg} ${meta.color}`}>
                          {meta.icon}{meta.label}
                        </span>

                        {/* Meta info */}
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#424750]">
                          {contract.company?.companyName && (
                            <span className="flex items-center gap-1"><Building2 className="w-3 h-3 text-[#737781]" />{contract.company.companyName}</span>
                          )}
                          {contract.job?.title && (
                            <span className="flex items-center gap-1 hidden sm:flex"><Briefcase className="w-3 h-3 text-[#737781]" />{contract.job.title}</span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#737781]" />
                            {formatDate(contract.startDate)}{contract.endDate ? ` → ${formatDate(contract.endDate)}` : ""}
                          </span>
                        </div>

                        {/* Amount */}
                        {contract.totalAmount && (
                          <p className="font-extrabold text-sm text-[#191c1e] font-headline mt-2">
                            {formatAmount(contract.totalAmount)}
                          </p>
                        )}
                      </div>
                    </div>

                    {isPending && (
                      <div className="mt-3 pt-3 border-t border-[#f2f4f6] flex items-center justify-between gap-2">
                        <p className="text-xs text-[#7c5c00] font-semibold">Revisa los términos y confirma tu participación</p>
                        <span className="text-xs font-bold text-[#00386c] underline underline-offset-2 whitespace-nowrap">Confirmar →</span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Info footer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 pb-4">
          {[
            { icon: <FileText className="w-4 h-4" />, title: "Gestión de contratos", desc: "Entregables, pagos y calificaciones explicados.", href: publicLinks.processes.contracts },
            { icon: <ArrowRight className="w-4 h-4" />, title: "¿Cómo funciona TalentBridge?", desc: "El flujo completo de la plataforma.", href: publicLinks.howItWorks },
          ].map(({ icon, title, desc, href }) => (
            <a key={title} href={href} target="_blank" rel="noopener noreferrer"
              className="group flex items-start gap-3 p-4 bg-white/60 border border-[#e6e8ea] rounded-2xl hover:border-[#00386c]/20 hover:bg-white hover:shadow-sm transition-all">
              <div className="w-8 h-8 bg-[#00386c]/8 rounded-xl flex items-center justify-center flex-shrink-0 text-[#00386c]">{icon}</div>
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