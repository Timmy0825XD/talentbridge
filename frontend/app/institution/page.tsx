"use client";

import { useAuth } from "@/src/context/auth-context";
import { useEffect, useState } from "react";
import api from "@/src/lib/api";
import { GraduationCap, Briefcase, TrendingUp, Users, AlertCircle } from "lucide-react";

interface InstitutionDashboard {
  metrics: {
    totalStudents: number;
    totalGraduates: number;
    activeStudents: number;
    insertionRate: number;
    totalContracts: number;
    completedContracts: number;
  };
  topSkills: Array<{ skill: string; count: number }>;
  contractsByArea: Array<{ area: string; count: number }>;
}

export default function InstitutionDashboardPage() {
  const { user } = useAuth();
  const [data, setData]     = useState<InstitutionDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  useEffect(() => {
    if (!user) return;
    api.get<InstitutionDashboard>("/institution/dashboard")
      .then(res => setData(res.data))
      .catch(() => setError("No se pudo cargar el dashboard."))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
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
        <button onClick={() => window.location.reload()}
          className="px-6 py-2 bg-[#00386c] text-white rounded-full text-sm font-bold hover:opacity-90">
          Reintentar
        </button>
      </div>
    );
  }

  const m = data?.metrics;

  return (
    <div className="max-w-screen-xl mx-auto px-8 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-[#00386c] font-headline tracking-tight">
          Panel Institucional
        </h1>
        <p className="text-[#424750] mt-1">
          Seguimiento de inserción laboral de tus estudiantes y egresados
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {[
          { icon: <GraduationCap className="w-5 h-5" />, label: "Estudiantes",        value: m?.totalStudents ?? 0,    color: "text-[#00386c]", bg: "bg-[#a6c8ff]/20" },
          { icon: <GraduationCap className="w-5 h-5" />, label: "Egresados",           value: m?.totalGraduates ?? 0,   color: "text-[#1a4f8b]", bg: "bg-[#a6c8ff]/10" },
          { icon: <Users className="w-5 h-5" />,         label: "Activos",             value: m?.activeStudents ?? 0,   color: "text-[#005228]", bg: "bg-[#6bfe9c]/20" },
          { icon: <TrendingUp className="w-5 h-5" />,    label: "Tasa inserción",      value: `${(m?.insertionRate ?? 0).toFixed(1)}%`, color: "text-[#006d37]", bg: "bg-[#6bfe9c]/30", isText: true },
          { icon: <Briefcase className="w-5 h-5" />,     label: "Contratos totales",   value: m?.totalContracts ?? 0,   color: "text-[#7c5c00]", bg: "bg-[#fff3cd]" },
          { icon: <Briefcase className="w-5 h-5" />,     label: "Completados",         value: m?.completedContracts ?? 0, color: "text-[#005228]", bg: "bg-[#6bfe9c]/10" },
        ].map(({ icon, label, value, color, bg, isText }) => (
          <div key={label} className={`${bg} rounded-2xl p-5`}>
            <div className={`${color} mb-3`}>{icon}</div>
            <p className={`${isText ? "text-2xl" : "text-3xl"} font-headline font-extrabold ${color}`}>{value}</p>
            <p className="text-xs text-[#737781] font-semibold mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Skills más demandadas */}
        <div className="bg-white rounded-2xl border border-[#e6e8ea] p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-[#424750] mb-5">
            Skills más demandadas
          </h2>
          {(data?.topSkills ?? []).length === 0 ? (
            <p className="text-sm text-[#737781] text-center py-6">Sin datos aún.</p>
          ) : (
            <div className="space-y-3">
              {(data?.topSkills ?? []).slice(0, 8).map((s, i) => {
                const max = data?.topSkills[0]?.count ?? 1;
                const pct = Math.round((s.count / max) * 100);
                return (
                  <div key={s.skill} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#737781] w-4">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-[#191c1e]">{s.skill}</span>
                        <span className="text-xs font-bold text-[#006d37]">{s.count}</span>
                      </div>
                      <div className="h-1.5 bg-[#f2f4f6] rounded-full overflow-hidden">
                        <div className="h-full bg-[#006d37] rounded-full transition-all"
                          style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Contrataciones por área */}
        <div className="bg-white rounded-2xl border border-[#e6e8ea] p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-[#424750] mb-5">
            Contrataciones por área
          </h2>
          {(data?.contractsByArea ?? []).length === 0 ? (
            <p className="text-sm text-[#737781] text-center py-6">Sin datos aún.</p>
          ) : (
            <div className="space-y-3">
              {(data?.contractsByArea ?? []).map(a => {
                const max = data?.contractsByArea[0]?.count ?? 1;
                const pct = Math.round((a.count / max) * 100);
                return (
                  <div key={a.area} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-[#191c1e]">{a.area || "Sin área"}</span>
                        <span className="text-xs font-bold text-[#00386c]">{a.count}</span>
                      </div>
                      <div className="h-1.5 bg-[#f2f4f6] rounded-full overflow-hidden">
                        <div className="h-full bg-[#00386c] rounded-full transition-all"
                          style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}