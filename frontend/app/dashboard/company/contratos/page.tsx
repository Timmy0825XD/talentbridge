"use client";

import { useAuth } from "@/src/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useCompanyJobs, useContracts, useJobApplicantsBatch, queryKeys } from "@/src/hooks/queries";
import CreateContractForm from "./_components/CreateContractForm";
import { ContractsListSkeleton } from "@/src/components/contracts/ContractsListSkeleton";
import TalentBridgeLoader from "@/src/components/ui/TalentBridgeLoader";
import { publicLinks } from "@/src/content/site-links";
import {
  FileText, CheckCircle2, AlertCircle, ChevronRight,
  Users, Plus, Calendar, Loader2, Clock, XCircle, ArrowRight,
} from "lucide-react";

interface Contract {
  id: string; status: string; title: string; description: string | null;
  startDate: string | null; endDate: string | null; totalAmount: number | null;
  createdAt: string;
  candidate: { fullName: string | null } | null;
  job: { title: string } | null;
  _count?: { payments: number };
}
interface Application {
  id: string; status: string;
  candidate: { id: string; fullName: string | null };
  job: { id: string; title: string };
}

const STATUS_META: Record<string,{ label:string; color:string; bg:string; dot:string; icon:React.ReactNode }> = {
  PENDING_CANDIDATE: { label:"Pendiente candidato", color:"text-[#7c5c00]", bg:"bg-[#fff3cd]",    dot:"bg-[#ffc107]", icon:<Clock className="w-3.5 h-3.5"/> },
  ACTIVE:            { label:"Activo",               color:"text-[#005228]", bg:"bg-[#6bfe9c]/20", dot:"bg-[#006d37]", icon:<CheckCircle2 className="w-3.5 h-3.5"/> },
  COMPLETED:         { label:"Completado",            color:"text-[#00386c]", bg:"bg-[#a6c8ff]/20", dot:"bg-[#1a4f8b]", icon:<CheckCircle2 className="w-3.5 h-3.5"/> },
  CANCELLED:         { label:"Cancelado",             color:"text-[#93000a]", bg:"bg-[#ffdad6]",    dot:"bg-[#ba1a1a]", icon:<XCircle className="w-3.5 h-3.5"/> },
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", { day:"numeric", month:"short", year:"numeric" });
}

export default function ContratosEmpresaPage() {
  const { user, isLoading } = useAuth();
  const router       = useRouter();
  const queryClient  = useQueryClient();
  const enabled      = !!user && user.role === "COMPANY";

  const [filter,      setFilter]      = useState("ALL");
  const [showForm,    setShowForm]    = useState(false);
  const [successMsg,  setSuccessMsg]  = useState("");

  const { data: contracts=[], isLoading: contractsLoading, isError } = useContracts(enabled, user?.userId);
  const { data: myJobs=[], isLoading: jobsLoading }                  = useCompanyJobs(enabled && showForm, user?.userId);

  const jobIds           = (myJobs as { id:string; title:string }[]).map(j => j.id);
  const applicantQueries = useJobApplicantsBatch(jobIds, enabled && showForm && jobIds.length > 0);
  const applicationsLoading = showForm && (jobsLoading || applicantQueries.some(q => q.isLoading));

  const applications = useMemo(() => {
    if (!showForm) return [] as Application[];
    const jobsList = myJobs as { id:string; title:string }[];
    const out: Application[] = [];
    applicantQueries.forEach((q,i) => {
      if (q.data) {
        (q.data as Array<{ id:string; status:string; candidate:{ id:string; fullName:string|null } }>)
          .filter(a => a.status==="SELECTED")
          .forEach(a => out.push({ id:a.id, status:a.status, candidate:{ id:a.candidate.id, fullName:a.candidate.fullName }, job:{ id:jobsList[i]?.id??"", title:jobsList[i]?.title??"" } }));
      }
    });
    return out;
  }, [showForm, myJobs, applicantQueries]);

  useEffect(() => {
    if (!isLoading && user?.role !== "COMPANY") router.replace("/dashboard/candidate");
  }, [user, isLoading, router]);

  function handleFormSuccess() {
    setShowForm(false);
    setSuccessMsg("Contrato creado y enviado al candidato para confirmación.");
    setTimeout(() => setSuccessMsg(""), 5000);
    queryClient.invalidateQueries({ queryKey: queryKeys.contracts.list });
  }

  if (isLoading || !user) return <TalentBridgeLoader />;

  if (showForm) {
    if (applicationsLoading) return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#f7f9fb]">
        <Loader2 className="w-8 h-8 text-[#006d37] animate-spin" />
        <p className="text-sm text-[#424750] font-medium">Cargando candidatos seleccionados...</p>
      </div>
    );
    return <CreateContractForm applications={applications} onSuccess={handleFormSuccess} onCancel={() => setShowForm(false)} />;
  }

  const filtered     = filter==="ALL" ? contracts : contracts.filter(c => c.status===filter);
  const activeCount  = contracts.filter(c => c.status==="ACTIVE").length;
  const pendingCount = contracts.filter(c => c.status==="PENDING_CANDIDATE").length;
  const listLoading  = contractsLoading && contracts.length===0;

  if (isError && contracts.length===0) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f7f9fb] text-center px-8">
      <AlertCircle className="w-10 h-10 text-[#ba1a1a]" />
      <p className="text-[#93000a] font-semibold">No se pudieron cargar los contratos.</p>
      <button onClick={() => queryClient.invalidateQueries({ queryKey: queryKeys.contracts.list })}
        className="px-6 py-2 bg-[#006d37] text-white rounded-full text-sm font-bold hover:opacity-90">Reintentar</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f9fb]">

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-r from-[#005228] via-[#006d37] to-[#00743a] overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="ce-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.8"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#ce-grid)" />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="relative max-w-screen-lg mx-auto px-8 py-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-[#6bfe9c] text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" /> Contratos
              </p>
              <h1 className="font-headline font-extrabold text-4xl text-white tracking-tight">Contratos</h1>
              <p className="text-white/60 text-sm mt-2">Gestiona los contratos formalizados con candidatos.</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              {[
                { label:"Total",      value:contracts.length,  cls:"bg-white/10 border-white/15 text-white" },
                { label:"Activos",    value:activeCount,       cls:"bg-[#6bfe9c]/15 border-[#6bfe9c]/20 text-[#6bfe9c]" },
                { label:"Pendientes", value:pendingCount,      cls:pendingCount>0?"bg-[#ffc107]/15 border-[#ffc107]/30 text-[#ffc107]":"bg-white/10 border-white/15 text-white" },
              ].map(({ label, value, cls }) => (
                <div key={label} className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border backdrop-blur-sm ${cls}`}>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</p>
                    <p className="text-xl font-headline font-extrabold leading-none mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
              <button onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-[#6bfe9c] text-[#00210c] px-5 py-2.5 rounded-2xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#006d37]/20">
                <Plus className="w-4 h-4" /> Nuevo contrato
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto px-8 py-8 space-y-6">

        {successMsg && (
          <div className="bg-[#6bfe9c]/20 text-[#005228] text-sm font-semibold px-5 py-3.5 rounded-2xl flex items-center gap-2 border border-[#6bfe9c]/30">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />{successMsg}
          </div>
        )}

        {/* Alerta pendientes */}
        {pendingCount > 0 && (
          <div className="bg-[#fff3cd] border border-[#ffc107]/30 text-[#7c5c00] px-5 py-4 rounded-2xl flex items-center gap-3">
            <Clock className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-semibold">
              Tienes <span className="font-black">{pendingCount}</span> contrato{pendingCount>1?"s":""} pendiente{pendingCount>1?"s":""} de confirmación por el candidato.
            </p>
          </div>
        )}

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key:"ALL",               label:"Todos" },
            { key:"PENDING_CANDIDATE", label:"Pendientes" },
            { key:"ACTIVE",            label:"Activos" },
            { key:"COMPLETED",         label:"Completados" },
            { key:"CANCELLED",         label:"Cancelados" },
          ].map(tab => {
            const count = tab.key==="ALL" ? contracts.length : contracts.filter(c=>c.status===tab.key).length;
            return (
              <button key={tab.key} onClick={() => setFilter(tab.key)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  filter===tab.key ? "bg-[#006d37] text-white shadow-md" : "bg-white text-[#424750] border border-[#e6e8ea] hover:border-[#006d37]/20"
                }`}>
                {tab.label}
                <span className={`ml-1.5 text-xs ${filter===tab.key?"opacity-70":"text-[#737781]"}`}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Lista */}
        {listLoading ? <ContractsListSkeleton /> : filtered.length===0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-[#c2c6d1] p-16 text-center">
            <div className="w-16 h-16 bg-[#f2f4f6] rounded-2xl flex items-center justify-center mx-auto mb-4"><FileText className="w-7 h-7 text-[#c2c6d1]"/></div>
            <h3 className="font-bold text-lg text-[#191c1e] font-headline mb-1">Sin contratos</h3>
            <p className="text-sm text-[#737781] mb-6">
              {filter==="ALL" ? "Crea un contrato para formalizar el trabajo con un candidato." : "No hay contratos con este estado."}
            </p>
            {filter==="ALL" && (
              <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 bg-[#006d37] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:opacity-90">
                <Plus className="w-4 h-4"/> Crear contrato
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(contract => {
              const meta      = STATUS_META[contract.status] ?? STATUS_META.CANCELLED;
              const isPending = contract.status==="PENDING_CANDIDATE";
              return (
                <Link key={contract.id} href={`/dashboard/company/contratos/${contract.id}`}
                  className={`block bg-white rounded-2xl border transition-all hover:shadow-lg hover:shadow-[#006d37]/5 group ${
                    isPending ? "border-[#ffc107]/40 ring-1 ring-[#ffc107]/20" : "border-[#e6e8ea] hover:border-[#006d37]/15"
                  }`}>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${isPending?"bg-[#fff3cd]":"bg-gradient-to-br from-[#006d37]/10 to-[#00743a]/10"}`}>
                          <FileText className={`w-5 h-5 ${isPending?"text-[#7c5c00]":"text-[#006d37]"}`}/>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="font-bold text-base text-[#191c1e] font-headline group-hover:text-[#006d37] transition-colors truncate">
                              {contract.title}
                            </h3>
                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold flex-shrink-0 ${meta.bg} ${meta.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`}/>{meta.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-[#737781]">
                            {contract.candidate?.fullName && <span className="flex items-center gap-1"><Users className="w-3 h-3"/>{contract.candidate.fullName}</span>}
                            {contract.job?.title && <span className="flex items-center gap-1 text-[#737781]">· {contract.job.title}</span>}
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/>{formatDate(contract.startDate)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {contract.totalAmount ? <p className="font-extrabold text-base text-[#191c1e] font-headline">${contract.totalAmount.toLocaleString("es-CO")}</p> : null}
                        <div className="flex items-center gap-2">
                          {contract._count && contract._count.payments>0 && (
                            <span className="text-[10px] text-[#737781] bg-[#f2f4f6] px-2.5 py-0.5 rounded-full font-semibold">{contract._count.payments} pago{contract._count.payments>1?"s":""}</span>
                          )}
                          <ChevronRight className="w-4 h-4 text-[#c2c6d1] group-hover:text-[#006d37] transition-colors"/>
                        </div>
                      </div>
                    </div>
                    {isPending && (
                      <div className="mt-3 pt-3 border-t border-[#f2f4f6] flex items-center justify-between">
                        <p className="text-xs text-[#7c5c00] font-semibold">Esperando confirmación del candidato</p>
                        <span className="text-xs font-bold text-[#006d37] underline underline-offset-2">Ver detalles →</span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Footer info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 pb-4">
          {[
            { icon:<FileText className="w-4 h-4"/>, title:"Gestión de contratos", desc:"Entregables, pagos y calificaciones.", href:publicLinks.processes.contracts },
            { icon:<ArrowRight className="w-4 h-4"/>, title:"¿Cómo funciona TalentBridge?", desc:"El flujo completo de la plataforma.", href:publicLinks.howItWorks },
          ].map(({ icon, title, desc, href }) => (
            <a key={title} href={href} target="_blank" rel="noopener noreferrer"
              className="group flex items-start gap-3 p-4 bg-white/60 border border-[#e6e8ea] rounded-2xl hover:border-[#006d37]/20 hover:bg-white hover:shadow-sm transition-all">
              <div className="w-8 h-8 bg-[#006d37]/8 rounded-xl flex items-center justify-center text-[#006d37] flex-shrink-0">{icon}</div>
              <div>
                <p className="text-xs font-bold text-[#191c1e] group-hover:text-[#006d37] transition-colors">{title}</p>
                <p className="text-[10px] text-[#737781] mt-0.5">{desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}