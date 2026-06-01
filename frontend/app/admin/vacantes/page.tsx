"use client";

import { useAuth } from "@/src/context/auth-context";
import { useEffect, useState } from "react";
import api from "@/src/lib/api";
import InfoCallout from "@/src/components/info/InfoCallout";
import { AlertCircle, XCircle } from "lucide-react";

interface AdminJob {
  id: string;
  title: string;
  status: string;
  type: string;
  createdAt: string;
  company: { companyName: string | null } | null;
  _count: { applications: number };
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Activa", SELECTING: "En selección",
  CLOSED: "Cerrada", CANCELLED: "Cancelada",
};
const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "bg-[#6bfe9c]/20 text-[#005228]",
  SELECTING: "bg-[#a6c8ff]/20 text-[#00386c]",
  CLOSED: "bg-[#f2f4f6] text-[#424750]",
  CANCELLED: "bg-[#ffdad6] text-[#93000a]",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminVacantesPage() {
  const { user } = useAuth();
  const [jobs, setJobs]       = useState<AdminJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [msg, setMsg]         = useState("");

  useEffect(() => {
    if (user) api.get("/admin/jobs")
      .then(res => setJobs(res.data.jobs ?? res.data))
      .catch(() => setError("No se pudieron cargar las vacantes."))
      .finally(() => setLoading(false));
  }, [user]);

  async function handleCancel(jobId: string) {
    if (!confirm("¿Cancelar esta vacante?")) return;
    try {
      await api.patch(`/admin/jobs/${jobId}/moderate`, { status: "CANCELLED" });
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: "CANCELLED" } : j));
      setMsg("Vacante cancelada."); setTimeout(() => setMsg(""), 3000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setMsg(e.response?.data?.error ?? "Error al cancelar."); setTimeout(() => setMsg(""), 3000);
    }
  }

  return (
    <div className="px-8 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-[#191c1e] font-headline">Vacantes</h1>
        <p className="text-[#424750] mt-1">Modera las vacantes publicadas en la plataforma</p>
      </div>

      <InfoCallout
        title="Gestión de vacantes"
        description="Revisa y modera las vacantes activas. Puedes cancelar publicaciones que incumplan las políticas."
      />

      {msg && <div className="mb-4 px-4 py-3 rounded-xl text-sm font-semibold bg-[#6bfe9c]/20 text-[#005228]">{msg}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="w-6 h-6 border-2 border-[#424750]/20 border-t-[#424750] rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertCircle className="w-8 h-8 text-[#ba1a1a]" />
          <p className="text-[#93000a] font-semibold">{error}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e6e8ea] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#f2f4f6]">
                {["Vacante", "Empresa", "Estado", "Postulantes", "Fecha", "Acción"].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#737781]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2f4f6]">
              {jobs.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-[#737781] text-sm">No hay vacantes.</td></tr>
              ) : jobs.map(job => (
                <tr key={job.id} className="hover:bg-[#f7f9fb] transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#191c1e] truncate max-w-[180px]">{job.title}</p>
                    <p className="text-xs text-[#737781]">{job.type === "FORMAL" ? "Formal" : "Freelance"}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#424750] truncate max-w-[140px]">
                    {job.company?.companyName ?? "—"}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLOR[job.status] ?? "bg-[#f2f4f6] text-[#424750]"}`}>
                      {STATUS_LABEL[job.status] ?? job.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#191c1e]">
                    {job._count.applications}
                  </td>
                  <td className="px-5 py-4 text-xs text-[#737781]">{formatDate(job.createdAt)}</td>
                  <td className="px-5 py-4">
                    {job.status !== "CANCELLED" && job.status !== "CLOSED" && (
                      <button onClick={() => handleCancel(job.id)}
                        className="flex items-center gap-1.5 text-xs font-bold text-[#93000a] bg-[#ffdad6] px-3 py-1.5 rounded-full hover:bg-[#ba1a1a] hover:text-white transition-colors">
                        <XCircle className="w-3.5 h-3.5" /> Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}