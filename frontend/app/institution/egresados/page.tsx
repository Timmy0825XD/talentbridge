"use client";

import { useAuth } from "@/src/context/auth-context";
import { useState, useMemo } from "react";
import {
  useInstitutionCandidates,
  type InstitutionCandidatesParams,
  type InstitutionEmploymentStatus,
} from "@/src/hooks/queries/use-institution";
import api from "@/src/lib/api";
import TalentBridgeLoader from "@/src/components/ui/TalentBridgeLoader";
import LinkStudentsCallout from "@/src/components/institution/LinkStudentsCallout";
import { Search, AlertCircle, Download, Loader2 } from "lucide-react";

const ROLE_LABEL: Record<string, string> = {
  STUDENT: "Estudiante",
  GRADUATE: "Egresado",
};

const STATUS_LABEL: Record<InstitutionEmploymentStatus, string> = {
  incomplete_profile: "Perfil incompleto",
  no_applications: "Sin postular",
  in_process: "En proceso",
  hired: "Contratado",
};

const STATUS_COLOR: Record<InstitutionEmploymentStatus, string> = {
  incomplete_profile: "bg-[#fff3cd] text-[#7c5c00]",
  no_applications: "bg-[#f2f4f6] text-[#424750]",
  in_process: "bg-[#a6c8ff]/20 text-[#00386c]",
  hired: "bg-[#6bfe9c]/20 text-[#005228]",
};

function escapeCsv(val: string | number | null | undefined): string {
  const s = val == null ? "" : String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export default function InstitutionEgresadosPage() {
  const { user, isLoading } = useAuth();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | "STUDENT" | "GRADUATE">("");
  const [statusFilter, setStatusFilter] = useState<InstitutionCandidatesParams["status"]>("all");
  const [careerFilter, setCareerFilter] = useState("");
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState("");

  const params = useMemo<InstitutionCandidatesParams>(() => ({
    page,
    limit: 20,
    ...(search ? { search } : {}),
    ...(roleFilter ? { role: roleFilter } : {}),
    ...(statusFilter && statusFilter !== "all" ? { status: statusFilter } : {}),
    ...(careerFilter ? { career: careerFilter } : {}),
  }), [page, search, roleFilter, statusFilter, careerFilter]);

  const enabled = !!user && user.role === "INSTITUTION";
  const { data, isLoading: listLoading, isError } = useInstitutionCandidates(
    params, enabled, user?.userId
  );

  async function handleExportCsv() {
    setExporting(true);
    setExportMsg("");
    try {
      const exportParams: Record<string, string> = { page: "1", limit: "50" };
      if (search) exportParams.search = search;
      if (roleFilter) exportParams.role = roleFilter;
      if (statusFilter && statusFilter !== "all") exportParams.status = statusFilter;
      if (careerFilter) exportParams.career = careerFilter;

      const res = await api.get<{
        items: Array<{
          fullName: string | null;
          role: string;
          career: string | null;
          graduationYear: number | null;
          totalScore: number | null;
          applicationCount: number;
          employmentStatus: InstitutionEmploymentStatus;
        }>;
        total: number;
      }>("/institution/candidates", { params: exportParams });

      const { items, total } = res.data;
      if (total > 50) {
        setExportMsg(`Hay ${total} registros. Exportando los primeros 50; usa filtros para acotar.`);
      }

      const header = "Nombre,Rol,Carrera,Año graduación,Score,Postulaciones,Estado";
      const rows = items.map(r =>
        [
          escapeCsv(r.fullName),
          escapeCsv(ROLE_LABEL[r.role] ?? r.role),
          escapeCsv(r.career),
          escapeCsv(r.graduationYear),
          escapeCsv(r.totalScore),
          escapeCsv(r.applicationCount),
          escapeCsv(STATUS_LABEL[r.employmentStatus]),
        ].join(",")
      );
      const csv = [header, ...rows].join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "vinculados-talentbridge.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setExportMsg("No se pudo exportar. Intenta de nuevo.");
    } finally {
      setExporting(false);
    }
  }

  if (isLoading || !user) return <TalentBridgeLoader />;

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / (data?.limit ?? 20)));

  return (
    <div className="max-w-screen-xl mx-auto px-8 py-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#00386c] font-headline tracking-tight">
            Estudiantes y egresados
          </h1>
          <p className="text-[#424750] text-sm mt-1">
            Perfiles vinculados a tu universidad en el catálogo ({total} en total)
          </p>
        </div>
        <button type="button" onClick={handleExportCsv} disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 bg-[#00386c] text-white rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-60">
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Exportar CSV
        </button>
      </div>

      {exportMsg && (
        <p className="text-xs text-[#7c5c00] bg-[#fff3cd] border border-[#ffc107]/30 rounded-xl px-4 py-2 mb-4">
          {exportMsg}
        </p>
      )}

      <div className="mb-6">
        <LinkStudentsCallout />
      </div>

      <div className="bg-white rounded-2xl border border-[#e6e8ea] p-4 mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737781]" />
          <input type="text" placeholder="Buscar por nombre o carrera…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#e6e8ea] text-sm focus:outline-none focus:border-[#00386c]/40" />
        </div>
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value as typeof roleFilter); setPage(1); }}
          className="px-3 py-2 rounded-xl border border-[#e6e8ea] text-sm bg-white">
          <option value="">Todos los roles</option>
          <option value="STUDENT">Estudiante</option>
          <option value="GRADUATE">Egresado</option>
        </select>
        <select value={statusFilter ?? "all"} onChange={e => { setStatusFilter(e.target.value as InstitutionCandidatesParams["status"]); setPage(1); }}
          className="px-3 py-2 rounded-xl border border-[#e6e8ea] text-sm bg-white">
          <option value="all">Todos los estados</option>
          <option value="incomplete_profile">Perfil incompleto</option>
          <option value="no_applications">Sin postular</option>
          <option value="in_process">En proceso</option>
          <option value="hired">Contratado</option>
        </select>
        <input type="text" placeholder="Filtrar carrera…" value={careerFilter}
          onChange={e => { setCareerFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl border border-[#e6e8ea] text-sm min-w-[140px]" />
      </div>

      {isError && (
        <div className="flex items-center gap-3 text-[#93000a] bg-[#ffdad6] rounded-2xl p-4 mb-6">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-semibold">No se pudo cargar el listado.</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#e6e8ea] overflow-hidden">
        {listLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-[#00386c] animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-[#737781] text-sm py-16">No hay vinculados con estos filtros.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e6e8ea] bg-[#f7f9fb]">
                  {["Nombre", "Rol", "Carrera", "Score", "Postulaciones", "Estado"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-black uppercase tracking-wider text-[#737781]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(row => (
                  <tr key={row.id} className="border-b border-[#f2f4f6] hover:bg-[#f7f9fb]/50">
                    <td className="px-4 py-3 font-semibold text-[#191c1e]">
                      {row.fullName ?? "Sin nombre"}
                    </td>
                    <td className="px-4 py-3 text-[#424750]">{ROLE_LABEL[row.role] ?? row.role}</td>
                    <td className="px-4 py-3 text-[#424750]">{row.career ?? "—"}</td>
                    <td className="px-4 py-3 font-bold text-[#00386c]">
                      {row.totalScore != null ? row.totalScore : "—"}
                    </td>
                    <td className="px-4 py-3">{row.applicationCount}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${STATUS_COLOR[row.employmentStatus]}`}>
                        {STATUS_LABEL[row.employmentStatus]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button type="button" disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 rounded-xl border border-[#e6e8ea] text-sm font-semibold disabled:opacity-40 hover:bg-white">
            Anterior
          </button>
          <span className="text-sm text-[#737781]">Página {page} de {totalPages}</span>
          <button type="button" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 rounded-xl border border-[#e6e8ea] text-sm font-semibold disabled:opacity-40 hover:bg-white">
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
