"use client";

import { useAuth } from "@/src/context/auth-context";
import { useInstitutionAnalytics } from "@/src/hooks/queries/use-institution";
import TalentBridgeLoader from "@/src/components/ui/TalentBridgeLoader";
import LinkStudentsCallout from "@/src/components/institution/LinkStudentsCallout";
import { AlertCircle, Star, TrendingUp } from "lucide-react";

function formatMonth(ym: string): string {
  const [y, m] = ym.split("-");
  const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  return `${months[parseInt(m, 10) - 1] ?? m} ${y?.slice(2)}`;
}

function TrendBars({ items, accent }: { items: Array<{ month: string; count: number }>; accent: string }) {
  if (items.every(i => i.count === 0)) {
    return <p className="text-sm text-[#737781] text-center py-6">Sin datos en los últimos 12 meses.</p>;
  }
  const max = Math.max(...items.map(i => i.count), 1);
  return (
    <div className="flex items-end gap-1 h-32">
      {items.map(i => {
        const h = Math.max(4, Math.round((i.count / max) * 100));
        return (
          <div key={i.month} className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <span className="text-[9px] font-bold text-[#737781] leading-none">{i.count || ""}</span>
            <div className={`w-full rounded-t-md ${accent}`} style={{ height: `${h}%` }} />
            <span className="text-[8px] text-[#737781] truncate w-full text-center leading-none">
              {formatMonth(i.month)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function InstitutionEmpleabilidadPage() {
  const { user, isLoading } = useAuth();
  const enabled = !!user && user.role === "INSTITUTION";
  const { data, isLoading: analyticsLoading, isError } = useInstitutionAnalytics(enabled, user?.userId);

  if (isLoading || !user) return <TalentBridgeLoader />;
  if (analyticsLoading && !data) return <TalentBridgeLoader />;

  if (isError) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center px-8">
        <AlertCircle className="w-10 h-10 text-[#ba1a1a]" />
        <p className="text-[#93000a] font-semibold">No se pudieron cargar las métricas.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-[#00386c] text-white rounded-full text-sm font-bold hover:opacity-90"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 space-y-6 lg:space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-[#00386c] font-headline tracking-tight">
          Empleabilidad
        </h1>
        <p className="text-[#424750] text-sm mt-1">
          Métricas por carrera, tendencias y áreas de contratación de tus vinculados
        </p>
      </div>

      <LinkStudentsCallout />

      {/* Score promedio */}
      {data?.avgGraduateScore != null && (
        <div className="bg-white rounded-2xl border border-[#e6e8ea] p-5 sm:p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#a6c8ff]/20 flex items-center justify-center flex-shrink-0">
            <Star className="w-6 h-6 text-[#00386c]" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#737781]">Score promedio vinculados</p>
            <p className="text-3xl font-headline font-extrabold text-[#00386c]">{data.avgGraduateScore}</p>
          </div>
        </div>
      )}

      {/* Tabla por carrera — scroll horizontal SOLO en la tabla, no en toda la página */}
      <div className="bg-white rounded-2xl border border-[#e6e8ea] p-5 sm:p-6">
        <h2 className="text-sm font-black uppercase tracking-widest text-[#424750] mb-5 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Por carrera
        </h2>
        {(data?.byCareer ?? []).length === 0 ? (
          <p className="text-sm text-[#737781] text-center py-6">Sin datos por carrera.</p>
        ) : (
          <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="border-b border-[#e6e8ea]">
                  {["Carrera", "Vinculados", "Contratados", "Tasa inserción"].map(h => (
                    <th key={h} className="text-left px-3 py-2 text-xs font-black uppercase text-[#737781] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data?.byCareer ?? []).map(c => (
                  <tr key={c.career} className="border-b border-[#f2f4f6] hover:bg-[#f7f9fb]/50 transition-colors">
                    <td className="px-3 py-3 font-semibold">{c.career}</td>
                    <td className="px-3 py-3 whitespace-nowrap">{c.linked}</td>
                    <td className="px-3 py-3 whitespace-nowrap">{c.withCompletedContract}</td>
                    <td className="px-3 py-3 font-bold text-[#006d37] whitespace-nowrap">
                      {c.insertionRatePercent.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Gráficas de tendencia — apiladas en móvil, lado a lado en desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-8">
        <div className="bg-white rounded-2xl border border-[#e6e8ea] p-5 sm:p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-[#424750] mb-1">
            Contratos cerrados por mes
          </h2>
          <p className="text-xs text-[#737781] mb-5">Últimos 12 meses</p>
          <TrendBars items={data?.insertionTrend ?? []} accent="bg-[#006d37]" />
        </div>

        <div className="bg-white rounded-2xl border border-[#e6e8ea] p-5 sm:p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-[#424750] mb-1">
            Postulaciones por mes
          </h2>
          <p className="text-xs text-[#737781] mb-5">Últimos 12 meses</p>
          <TrendBars items={data?.applicationsTrend ?? []} accent="bg-[#00386c]" />
        </div>
      </div>

      {/* Áreas de contratación */}
      <div className="bg-white rounded-2xl border border-[#e6e8ea] p-5 sm:p-6">
        <h2 className="text-sm font-black uppercase tracking-widest text-[#424750] mb-5">
          Contrataciones por área
        </h2>
        {(data?.topHiringAreas ?? []).length === 0 ? (
          <p className="text-sm text-[#737781] text-center py-6">Sin contratos cerrados aún.</p>
        ) : (
          <div className="space-y-3">
            {(data?.topHiringAreas ?? []).map(a => {
              const max = data?.topHiringAreas[0]?.count ?? 1;
              const pct = Math.round((a.count / max) * 100);
              return (
                <div key={a.area}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-[#191c1e] truncate mr-4">{a.area}</span>
                    <span className="text-xs font-bold text-[#00386c] flex-shrink-0">{a.count}</span>
                  </div>
                  <div className="h-1.5 bg-[#f2f4f6] rounded-full overflow-hidden">
                    <div className="h-full bg-[#00386c] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}