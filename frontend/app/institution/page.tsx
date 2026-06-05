"use client";

import { useAuth } from "@/src/context/auth-context";
import Link from "next/link";
import { useInstitutionDashboard } from "@/src/hooks/queries/use-institution";
import TalentBridgeLoader from "@/src/components/ui/TalentBridgeLoader";
import InfoCallout from "@/src/components/info/InfoCallout";
import LinkStudentsCallout from "@/src/components/institution/LinkStudentsCallout";
import {
  GraduationCap, Users, Briefcase, TrendingUp, AlertCircle,
  Zap, ChevronRight, ArrowRight,
} from "lucide-react";

function SkillBars({
  items,
  countKey,
  accent,
  barClass,
}: {
  items: Array<{ skill: string; count?: number; marketCount?: number }>;
  countKey: "count" | "marketCount";
  accent: string;
  barClass: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-[#737781] text-center py-6">Sin datos aún.</p>;
  }
  const max = items[0][countKey] ?? 1;
  return (
    <div className="space-y-3">
      {items.slice(0, 8).map((s, i) => {
        const val = s[countKey] ?? 0;
        const pct = Math.round((val / max) * 100);
        return (
          <div key={s.skill} className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#737781] w-4">{i + 1}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-[#191c1e] capitalize">{s.skill}</span>
                <span className={`text-xs font-bold ${accent}`}>{val}</span>
              </div>
              <div className="h-1.5 bg-[#f2f4f6] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${barClass}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const FUNNEL_STEPS = [
  { key: "linked",              label: "Vinculados" },
  { key: "profileComplete",     label: "Perfil completo" },
  { key: "hasApplied",          label: "Han postulado" },
  { key: "hasSelected",         label: "Seleccionados" },
  { key: "hasCompletedContract",label: "Contrato cerrado" },
] as const;

export default function InstitutionDashboardPage() {
  const { user, isLoading } = useAuth();
  const enabled = !!user && user.role === "INSTITUTION";
  const { data, isLoading: dashLoading, isError } = useInstitutionDashboard(enabled, user?.userId);

  if (isLoading || !user) return <TalentBridgeLoader />;
  if (dashLoading && !data) return <TalentBridgeLoader />;

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-8">
        <AlertCircle className="w-10 h-10 text-[#ba1a1a]" />
        <p className="text-[#93000a] font-semibold">No se pudo cargar el dashboard.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-[#00386c] text-white rounded-full text-sm font-bold hover:opacity-90"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const m      = data?.metrics;
  const funnel = data?.funnel;
  const linked = funnel?.linked ?? 0;

  return (
    <div className="min-h-screen bg-[#f7f9fb]">

      {/* Hero */}
      <div className="relative bg-gradient-to-r from-[#00386c] via-[#1a4f8b] to-[#00386c] overflow-hidden">
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-[#a6c8ff]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative max-w-screen-xl mx-auto px-4 sm:px-8 py-8 lg:py-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            {/* Título */}
            <div>
              <p className="text-[#6bfe9c] text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5" /> Panel institucional
              </p>
              <h1 className="font-headline font-extrabold text-3xl lg:text-5xl text-white tracking-tight leading-tight">
                {data?.institutionName ?? "Tu universidad"}
              </h1>
              <p className="text-white/70 text-sm mt-3 max-w-md leading-relaxed">
                Seguimiento de inserción laboral de estudiantes y egresados vinculados al catálogo.
              </p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:flex gap-3 lg:flex-wrap">
              {[
                { label: "Estudiantes", value: m?.activeStudents ?? 0,                              icon: <Users className="w-4 h-4" /> },
                { label: "Egresados",   value: m?.activeGraduates ?? 0,                             icon: <GraduationCap className="w-4 h-4" /> },
                { label: "Inserción",   value: `${(m?.insertionRatePercent ?? 0).toFixed(1)}%`,     icon: <TrendingUp className="w-4 h-4" />, isText: true },
                { label: "Contratados", value: m?.graduatesWithCompletedContract ?? 0,              icon: <Briefcase className="w-4 h-4" /> },
              ].map(({ label, value, icon, isText }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm text-white"
                >
                  {icon}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</p>
                    <p className={`${isText ? "text-2xl" : "text-xl"} font-headline font-extrabold leading-none mt-0.5`}>
                      {value}
                    </p>
                  </div>
                </div>
              ))}
              <Link
                href="/institution/egresados"
                className="col-span-2 lg:col-span-1 flex items-center justify-center gap-2 bg-[#6bfe9c] text-[#00210c] px-5 py-3 rounded-2xl font-bold text-sm hover:opacity-90 transition shadow-lg"
              >
                Ver vinculados <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        <InfoCallout
          title="Panel institucional"
          description="Monitorea egresados y estudiantes vinculados a tu universidad en el catálogo. Solo se cuentan perfiles verificados y activos."
        />

        <LinkStudentsCallout />

        {/* Embudo */}
        <div className="bg-white rounded-2xl border border-[#e6e8ea] p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-[#424750] mb-5">
            Embudo de empleabilidad
          </h2>
          <div className="space-y-4">
            {FUNNEL_STEPS.map(({ key, label }) => {
              const value = funnel?.[key] ?? 0;
              const pct   = linked > 0 ? Math.round((value / linked) * 100) : 0;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-[#191c1e]">{label}</span>
                    <span className="text-xs font-bold text-[#00386c]">
                      {value}{linked > 0 && <span className="text-[#737781] font-normal"> ({pct}%)</span>}
                    </span>
                  </div>
                  <div className="h-2 bg-[#f2f4f6] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#00386c] to-[#006d37] rounded-full transition-all"
                      style={{ width: `${linked > 0 ? Math.max(pct, value > 0 ? 4 : 0) : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Skills grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl border border-[#e6e8ea] p-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-[#424750] mb-1">
              Demanda del mercado (Cesar)
            </h2>
            <p className="text-xs text-[#737781] mb-5">Skills en vacantes activas de la plataforma</p>
            <SkillBars
              items={data?.marketDemandSkills ?? []}
              countKey="count"
              accent="text-[#006d37]"
              barClass="bg-[#006d37]"
            />
          </div>

          <div className="bg-white rounded-2xl border border-[#e6e8ea] p-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-[#424750] mb-1">
              Skills de nuestros vinculados
            </h2>
            <p className="text-xs text-[#737781] mb-5">Perfiles asociados a tu universidad</p>
            <SkillBars
              items={data?.graduateSkills ?? []}
              countKey="count"
              accent="text-[#00386c]"
              barClass="bg-[#00386c]"
            />
          </div>
        </div>

        {/* Brechas */}
        {(data?.skillsGap ?? []).length > 0 && (
          <div className="bg-white rounded-2xl border border-[#e6e8ea] p-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-[#424750] mb-1">
              Brechas detectadas
            </h2>
            <p className="text-xs text-[#737781] mb-5">
              Skills demandadas en el mercado con poca presencia en tus vinculados
            </p>
            <div className="flex flex-wrap gap-2">
              {(data?.skillsGap ?? []).map(g => (
                <span
                  key={g.skill}
                  className="px-3 py-1.5 bg-[#fff3cd] text-[#7c5c00] rounded-full text-xs font-bold capitalize"
                >
                  {g.skill} ({g.marketCount})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Link empleabilidad */}
        <Link
          href="/institution/empleabilidad"
          className="flex items-center justify-between bg-white rounded-2xl border border-[#e6e8ea] p-5 hover:border-[#00386c]/20 hover:shadow-md transition group"
        >
          <div>
            <p className="font-headline font-bold text-[#191c1e] group-hover:text-[#00386c] transition">
              Ver empleabilidad por carrera y tendencias
            </p>
            <p className="text-xs text-[#737781] mt-0.5">Contrataciones, postulaciones y áreas de contratación</p>
          </div>
          <ChevronRight className="w-5 h-5 text-[#737781] group-hover:text-[#00386c] flex-shrink-0" />
        </Link>
      </div>
    </div>
  );
}