"use client";

import { useAuth } from "@/src/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCompanyJobs,
  useContracts,
  useJobApplicantsBatch,
  queryKeys,
} from "@/src/hooks/queries";
import CreateContractForm from "./_components/CreateContractForm";
import { ContractsListSkeleton } from "@/src/components/contracts/ContractsListSkeleton";
import {
  FileText, CheckCircle2, AlertCircle,
  ChevronRight, Users, Plus, Calendar, Loader2,
} from "lucide-react";

interface Contract {
  id: string;
  status: string;
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  totalAmount: number | null;
  createdAt: string;
  candidate: { fullName: string | null } | null;
  job: { title: string } | null;
  _count?: { payments: number };
}

interface Application {
  id: string;
  status: string;
  candidate: { id: string; fullName: string | null };
  job: { id: string; title: string };
}

const STATUS_META: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  PENDING_CANDIDATE: { label: "Pendiente candidato", color: "text-[#7c5c00]",  bg: "bg-[#fff3cd]",    dot: "bg-[#ffc107]" },
  ACTIVE:            { label: "Activo",               color: "text-[#005228]",  bg: "bg-[#6bfe9c]/20", dot: "bg-[#006d37]" },
  COMPLETED:         { label: "Completado",            color: "text-[#00386c]",  bg: "bg-[#a6c8ff]/20", dot: "bg-[#1a4f8b]" },
  CANCELLED:         { label: "Cancelado",             color: "text-[#93000a]",  bg: "bg-[#ffdad6]",    dot: "bg-[#ba1a1a]" },
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

export default function ContratosEmpresaPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const enabled = !!user && user.role === "COMPANY";

  const [filter, setFilter]     = useState("ALL");
  const [showForm, setShowForm]   = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const { data: contracts = [], isLoading: contractsLoading, isError } = useContracts(enabled, user?.userId);
  const { data: myJobs = [], isLoading: jobsLoading } = useCompanyJobs(enabled && showForm, user?.userId);

  const jobIds = (myJobs as { id: string; title: string }[]).map(j => j.id);
  const applicantQueries = useJobApplicantsBatch(jobIds, enabled && showForm && jobIds.length > 0);

  const applicationsLoading = showForm && (jobsLoading || applicantQueries.some(q => q.isLoading));

  const applications = useMemo(() => {
    if (!showForm) return [] as Application[];
    const jobsList = myJobs as { id: string; title: string }[];
    const selectedApps: Application[] = [];
    applicantQueries.forEach((q, i) => {
      if (q.data) {
        const applicants = q.data as Array<{
          id: string;
          status: string;
          candidate: { id: string; fullName: string | null };
        }>;
        applicants
          .filter(a => a.status === "SELECTED")
          .forEach(a => {
            selectedApps.push({
              id:        a.id,
              status:    a.status,
              candidate: { id: a.candidate.id, fullName: a.candidate.fullName },
              job:       { id: jobsList[i]?.id ?? "", title: jobsList[i]?.title ?? "" },
            });
          });
      }
    });
    return selectedApps;
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

  if (showForm) {
    if (applicationsLoading) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#f7f9fb]">
          <Loader2 className="w-8 h-8 text-[#006d37] animate-spin" />
          <p className="text-sm text-[#424750] font-medium">Cargando candidatos seleccionados...</p>
        </div>
      );
    }
    return (
      <CreateContractForm
        applications={applications}
        onSuccess={handleFormSuccess}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  const filtered     = filter === "ALL" ? contracts : contracts.filter(c => c.status === filter);
  const activeCount  = contracts.filter(c => c.status === "ACTIVE").length;
  const pendingCount = contracts.filter(c => c.status === "PENDING_CANDIDATE").length;

  if (isLoading || !user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-[#f7f9fb]">
        <span className="w-8 h-8 border-2 border-[#006d37]/20 border-t-[#006d37] rounded-full animate-spin" />
      </div>
    );
  }

  const listLoading = contractsLoading && contracts.length === 0;

  if (isError && contracts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f7f9fb] text-center px-8">
        <AlertCircle className="w-10 h-10 text-[#ba1a1a]" />
        <p className="text-[#93000a] font-semibold">No se pudieron cargar los contratos.</p>
        <button onClick={() => queryClient.invalidateQueries({ queryKey: queryKeys.contracts.list })}
          className="px-6 py-2 bg-[#006d37] text-white rounded-full text-sm font-bold hover:opacity-90">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-screen-lg mx-auto px-8 py-10">
      <div className="flex items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-[#006d37] font-headline tracking-tight">
            Contratos
          </h1>
          <p className="text-[#424750] mt-1">Gestiona los contratos formalizados con candidatos.</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-gradient-to-br from-[#006d37] to-[#00743a] text-white px-6 py-3.5 rounded-full font-bold text-sm uppercase tracking-wider shadow-lg shadow-[#006d37]/20 hover:scale-105 active:scale-95 transition-all">
          <Plus className="w-4 h-4" /> Nuevo contrato
        </button>
      </div>

      {successMsg && (
        <div className="bg-[#6bfe9c]/20 text-[#005228] text-sm font-semibold px-5 py-3.5 rounded-2xl mb-6 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {successMsg}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total contratos",     value: listLoading ? "—" : contracts.length, color: "text-[#191c1e]" },
          { label: "Activos",             value: listLoading ? "—" : activeCount,      color: "text-[#006d37]" },
          { label: "Esperando candidato", value: listLoading ? "—" : pendingCount,     color: "text-[#7c5c00]" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-[#e6e8ea] p-5 text-center">
            <p className={`text-3xl font-extrabold font-headline ${color}`}>{value}</p>
            <p className="text-xs text-[#737781] font-semibold mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap mb-8">
        {[
          { key: "ALL",               label: "Todos" },
          { key: "PENDING_CANDIDATE", label: "Pendientes" },
          { key: "ACTIVE",            label: "Activos" },
          { key: "COMPLETED",         label: "Completados" },
          { key: "CANCELLED",         label: "Cancelados" },
        ].map(tab => {
          const count = tab.key === "ALL"
            ? contracts.length
            : contracts.filter(c => c.status === tab.key).length;
          return (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                filter === tab.key
                  ? "bg-[#006d37] text-white shadow-md"
                  : "bg-[#f2f4f6] text-[#424750] hover:bg-[#e6e8ea]"
              }`}>
              {tab.label}
              <span className={`ml-1.5 text-xs ${filter === tab.key ? "opacity-70" : "text-[#737781]"}`}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Lista */}
      {listLoading ? (
        <ContractsListSkeleton />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-[#c2c6d1] p-16 text-center">
          <FileText className="w-12 h-12 text-[#c2c6d1] mx-auto mb-4" />
          <h3 className="font-bold text-lg text-[#191c1e] font-headline mb-1">Sin contratos</h3>
          <p className="text-sm text-[#737781] mb-6">
            {filter === "ALL"
              ? "Crea un contrato para formalizar el trabajo con un candidato seleccionado."
              : "No hay contratos con este estado."}
          </p>
          {filter === "ALL" && (
            <button onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-[#006d37] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:opacity-90">
              <Plus className="w-4 h-4" /> Crear contrato
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(contract => {
            const meta = STATUS_META[contract.status] ?? STATUS_META.CANCELLED;
            return (
              <Link key={contract.id}
                href={`/dashboard/company/contratos/${contract.id}`}
                className="block bg-white rounded-2xl border border-[#e6e8ea] hover:shadow-lg hover:shadow-[#006d37]/5 transition-all group">
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-[#f2f4f6] flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-[#006d37]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <h3 className="font-bold text-lg text-[#191c1e] font-headline group-hover:text-[#006d37] transition-colors truncate">
                            {contract.title}
                          </h3>
                          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${meta.bg} ${meta.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                            {meta.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-[#424750]">
                          {contract.candidate?.fullName && (
                            <span className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-[#737781]" />
                              {contract.candidate.fullName}
                            </span>
                          )}
                          {contract.job?.title && (
                            <span className="flex items-center gap-1.5 text-[#737781]">
                              · {contract.job.title}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#737781]" />
                            {formatDate(contract.startDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {contract.totalAmount ? (
                        <p className="font-extrabold text-lg text-[#191c1e] font-headline">
                          ${contract.totalAmount.toLocaleString("es-CO")}
                        </p>
                      ) : null}
                      <div className="flex items-center gap-2">
                        {contract._count && contract._count.payments > 0 && (
                          <span className="text-xs text-[#737781] bg-[#f2f4f6] px-2.5 py-1 rounded-full font-semibold">
                            {contract._count.payments} pago{contract._count.payments > 1 ? "s" : ""}
                          </span>
                        )}
                        <ChevronRight className="w-5 h-5 text-[#c2c6d1] group-hover:text-[#006d37] transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
