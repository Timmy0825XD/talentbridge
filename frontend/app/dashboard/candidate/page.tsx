"use client";

import { useAuth } from "@/src/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { useCandidateDashboard } from "@/src/hooks/queries/use-dashboard";
import { useCandidateProfile, useJobsList } from "@/src/hooks/queries";
import {
  Send, ArrowRight, GraduationCap, FileText, Pencil,
  Briefcase, CheckCircle2, Clock, AlertCircle, Star,
  DollarSign, TrendingUp, Zap, ChevronRight, Eye,
  MapPin, Banknote, Wifi, Building2, Sparkles, BookOpen,
} from "lucide-react";
import TalentBridgeLoader from "@/src/components/ui/TalentBridgeLoader";
import { publicLinks } from "@/src/content/site-links";

const APP_STATUS_STEP: Record<string, number> = {
  RECEIVED: 1, REVIEWING: 2, SELECTED: 3, REJECTED: 0,
};
const CONTRACT_STATUS_LABEL: Record<string, string> = {
  PENDING_CANDIDATE: "Pendiente", ACTIVE: "Activo",
  COMPLETED: "Completado", CANCELLED: "Cancelado",
};
const TYPE_LABEL: Record<string, string>     = { FORMAL: "Tiempo completo", FREELANCE: "Freelance" };
const WORKMODE_LABEL: Record<string, string> = { REMOTE: "Remoto", ONSITE: "Presencial", HYBRID: "Híbrido" };

function formatBudget(min: number | null, max: number | null): string {
  if (!min && !max) return "A convenir";
  if (min && max)   return `$${(min/1000000).toFixed(1)}M – $${(max/1000000).toFixed(1)}M`;
  if (min)          return `Desde $${(min/1000000).toFixed(1)}M`;
  return "A convenir";
}

function AppStatusBar({ status }: { status: string }) {
  const step     = APP_STATUS_STEP[status] ?? 1;
  const rejected = status === "REJECTED";
  const steps    = ["Recibida", "En revisión", "Seleccionado"];
  if (rejected) return (
    <div className="mt-2">
      <span className="text-[10px] font-bold text-[#ba1a1a] bg-[#ffdad6] px-2 py-0.5 rounded-full">Rechazada</span>
    </div>
  );
  return (
    <div className="mt-2">
      <div className="flex items-center">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
              i+1 < step ? "bg-[#006d37]" : i+1 === step ? "bg-[#00386c] ring-2 ring-[#00386c]/30" : "bg-[#e0e3e5]"
            }`} />
            {i < steps.length-1 && <div className={`flex-1 h-0.5 mx-0.5 ${i+1 < step ? "bg-[#006d37]" : "bg-[#e0e3e5]"}`} />}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1">
        {steps.map((s, i) => (
          <span key={s} className={`text-[9px] font-semibold ${i+1 <= step ? "text-[#00386c]" : "text-[#c2c6d1]"}`}>{s}</span>
        ))}
      </div>
    </div>
  );
}

function ScoreRing({ value, size = 72 }: { value: number; size?: number }) {
  const r = size/2 - 6, circ = 2*Math.PI*r, offset = circ - (circ*value)/100;
  const color = value >= 80 ? "#006d37" : value >= 60 ? "#00386c" : value >= 40 ? "#C9A84C" : "#ba1a1a";
  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e6e8ea" strokeWidth="5" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      </svg>
      <span className="absolute text-[11px] font-black text-white">{value}%</span>
    </div>
  );
}

interface SuggestedJob {
  id: string; title: string; type: string; workMode: string;
  budgetMin: number | null; budgetMax: number | null; skills: string[];
  company: { companyName: string | null; city: string | null };
}

function SuggestedJobCard({ job, mySkills }: { job: SuggestedJob; mySkills: string[] }) {
  const matched  = job.skills.filter(s => mySkills.map(m => m.toLowerCase()).includes(s.toLowerCase())).length;
  const matchPct = job.skills.length > 0 ? Math.round((matched/job.skills.length)*100) : 0;
  const initials = (job.company?.companyName ?? "?")[0].toUpperCase();
  return (
    <Link href={`/dashboard/candidate/explorar/${job.id}`}
      className="group bg-white rounded-2xl border border-[#e6e8ea] p-5 hover:border-[#00386c]/20 hover:shadow-lg hover:shadow-[#00386c]/8 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden relative flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#e6e8ea] group-hover:bg-gradient-to-r group-hover:from-[#00386c] group-hover:to-[#006d37] transition-all duration-300" />
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00386c] to-[#1a4f8b] flex items-center justify-center shadow-md shadow-[#00386c]/20 flex-shrink-0">
          <span className="text-base font-black text-white">{initials}</span>
        </div>
        {matchPct > 0 && (
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
            matchPct >= 70 ? "bg-[#6bfe9c]/20 text-[#005228]"
            : matchPct >= 40 ? "bg-[#a6c8ff]/20 text-[#00386c]"
            : "bg-[#f2f4f6] text-[#737781]"}`}>
            {matchPct}% match
          </span>
        )}
      </div>
      <h4 className="font-headline font-bold text-sm text-[#191c1e] leading-snug mb-1 group-hover:text-[#00386c] transition-colors line-clamp-2">{job.title}</h4>
      <p className="text-[#737781] text-xs mb-3 flex items-center gap-1 flex-shrink-0">
        <Building2 className="w-3 h-3" />{job.company?.companyName ?? "Empresa"}
        {job.company?.city && <><span>·</span><MapPin className="w-3 h-3" />{job.company.city}</>}
      </p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="px-2 py-0.5 bg-[#f2f4f6] text-[#424750] rounded-md text-[10px] font-semibold">{TYPE_LABEL[job.type] ?? job.type}</span>
        <span className="px-2 py-0.5 bg-[#f2f4f6] text-[#424750] rounded-md text-[10px] font-semibold flex items-center gap-1">
          {job.workMode === "REMOTE" && <Wifi className="w-2.5 h-2.5" />}
          {WORKMODE_LABEL[job.workMode] ?? job.workMode}
        </span>
      </div>
      <div className="flex items-center justify-between pt-2.5 border-t border-[#f2f4f6] mt-auto">
        <span className="text-[11px] font-bold text-[#006d37] flex items-center gap-1">
          <Banknote className="w-3 h-3" />{formatBudget(job.budgetMin, job.budgetMax)}
        </span>
        <span className="text-[10px] font-bold text-[#00386c] flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          Ver más <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}

export default function CandidateDashboardPage() {
  const { user, isLoading } = useAuth();
  const router  = useRouter();
  const enabled = !!user && user.role !== "COMPANY";

  const { data, isLoading: dashLoading }  = useCandidateDashboard(enabled, user?.userId);
  const { data: profileData }             = useCandidateProfile(enabled, user?.userId);
  const { data: jobsListData }            = useJobsList(undefined, enabled);

  useEffect(() => {
    if (!isLoading && user?.role === "COMPANY") router.replace("/dashboard/company");
  }, [user, isLoading, router]);

  if (isLoading || !user)       return <TalentBridgeLoader />;
  if (dashLoading && !data)     return <TalentBridgeLoader />;

  const loading         = dashLoading && !data;
  const score           = data?.score ?? null;
  const metrics         = data?.metrics;
  const recentApps      = data?.recentApplications ?? [];
  const activeContracts = data?.activeContracts ?? [];
  const scoreValue      = score ? Math.round(score.totalScore) : null;
  const topSuggestions  = score?.suggestions?.slice(0, 2) ?? [];
  const scoreLabel      = scoreValue === null ? "—"
    : scoreValue >= 80 ? "Excelente" : scoreValue >= 60 ? "Bueno"
    : scoreValue >= 40 ? "Regular"   : "Incompleto";

  const fullName  = (profileData as { fullName?: string } | undefined)?.fullName ?? "";
  const firstName = fullName.trim().split(" ")[0] || (user.role === "GRADUATE" ? "Egresado" : "Estudiante");
  const mySkills: string[] = (profileData as { skills?: string[] } | undefined)?.skills ?? [];

  const allJobs = (jobsListData?.jobs ?? []) as SuggestedJob[];
  const suggestedJobs = [...allJobs]
    .map(j => ({
      job: j,
      match: j.skills.length === 0 ? 0
        : Math.round(j.skills.filter(s => mySkills.map(m => m.toLowerCase()).includes(s.toLowerCase())).length / j.skills.length * 100),
    }))
    .sort((a, b) => b.match - a.match)
    .slice(0, 4)
    .map(x => x.job);

  return (
    <div className="min-h-screen bg-[#f7f9fb]">

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-r from-[#00386c] via-[#0c4783] to-[#00386c] overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="dash-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.8"/>
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#dash-grid)" />
        </svg>
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-[#1a4f8b]/60 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative max-w-screen-2xl mx-auto px-8 py-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-[#a6c8ff] text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-[#6bfe9c]" /> Panel de control
              </p>
              <h1 className="font-headline font-extrabold text-4xl lg:text-5xl text-white tracking-tight leading-tight">
                Hola de nuevo,<br /><span className="text-[#6bfe9c]">{firstName}.</span>
              </h1>
              <p className="text-[#a6c8ff] text-sm mt-3 max-w-md leading-relaxed">
                {loading ? "Cargando tu actividad reciente..." :
                  (metrics?.activeApplications ?? 0) > 0
                    ? `Tienes ${metrics?.activeApplications} postulacion${(metrics?.activeApplications ?? 0) !== 1 ? "es" : ""} activa${(metrics?.activeApplications ?? 0) !== 1 ? "s" : ""}. Tu trayectoria se ve sólida.`
                    : "Tu perfil está listo. Empieza a explorar oportunidades hoy."}
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              {[
                { label: "Postulaciones", value: loading ? "—" : String(metrics?.activeApplications ?? 0), icon: <Send className="w-4 h-4" />, cls: "bg-white/10 border-white/15 text-white" },
                { label: "Contratos",     value: loading ? "—" : String(metrics?.activeContracts ?? 0),    icon: <Briefcase className="w-4 h-4" />, cls: "bg-[#6bfe9c]/15 border-[#6bfe9c]/20 text-[#6bfe9c]" },
                { label: "Mi score",      value: loading ? "—" : scoreValue !== null ? `${scoreValue}%` : "—", icon: <Star className="w-4 h-4" />, cls: "bg-white/10 border-white/15 text-white" },
              ].map(({ label, value, icon, cls }) => (
                <div key={label} className={`flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-sm ${cls}`}>
                  {icon}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</p>
                    <p className="text-xl font-headline font-extrabold leading-none mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
              {(metrics?.pendingContracts ?? 0) > 0 && (
                <Link href="/dashboard/candidate/contratos"
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl border bg-[#ffc107]/15 border-[#ffc107]/30 text-[#ffc107] hover:bg-[#ffc107]/20 transition-all">
                  <Clock className="w-4 h-4" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Pendientes</p>
                    <p className="text-xl font-headline font-extrabold leading-none mt-0.5">{metrics?.pendingContracts}</p>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-8 py-8 space-y-8">

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative bg-gradient-to-br from-[#00386c] to-[#1a4f8b] rounded-2xl p-5 overflow-hidden group hover:shadow-lg hover:shadow-[#00386c]/20 transition-all duration-300">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/5 group-hover:scale-110 transition-transform duration-500" />
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center"><Send className="w-4 h-4 text-[#a6c8ff]" /></div>
              <span className="text-[10px] font-bold text-[#a6c8ff]/70 uppercase tracking-widest">Activo</span>
            </div>
            <p className="text-4xl font-headline font-extrabold text-white leading-none mb-0.5">{loading ? "—" : metrics?.activeApplications ?? 0}</p>
            <p className="text-[#a6c8ff] text-xs font-semibold mb-3">Postulaciones en curso</p>
            <Link href="/dashboard/candidate/postulaciones" className="flex items-center gap-1 text-[11px] text-[#a6c8ff]/70 hover:text-white transition-colors font-bold">
              Ver todas <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="relative bg-white rounded-2xl p-5 border border-[#e6e8ea] overflow-hidden group hover:shadow-lg hover:shadow-[#006d37]/10 hover:border-[#006d37]/20 transition-all duration-300">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-[#6bfe9c]/10 group-hover:scale-110 transition-transform duration-500" />
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#6bfe9c]/20 flex items-center justify-center"><Briefcase className="w-4 h-4 text-[#006d37]" /></div>
              <span className="text-[10px] font-bold text-[#737781] uppercase tracking-widest">Contratos</span>
            </div>
            <p className="text-4xl font-headline font-extrabold text-[#191c1e] leading-none mb-0.5">{loading ? "—" : metrics?.activeContracts ?? 0}</p>
            <p className="text-[#424750] text-xs font-semibold mb-3">Activos ahora mismo</p>
            <Link href="/dashboard/candidate/contratos" className="flex items-center gap-1 text-[11px] text-[#737781] hover:text-[#006d37] transition-colors font-bold">
              Ver contratos <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="relative bg-[#6bfe9c] rounded-2xl p-5 overflow-hidden group hover:shadow-lg hover:shadow-[#006d37]/20 transition-all duration-300">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-[#006d37]/10 group-hover:scale-110 transition-transform duration-500" />
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#006d37]/15 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-[#005228]" /></div>
              <span className="text-[10px] font-bold text-[#005228]/70 uppercase tracking-widest">Mi score</span>
            </div>
            <p className="text-4xl font-headline font-extrabold text-[#00210c] leading-none mb-0.5">{loading ? "—" : scoreValue !== null ? `${scoreValue}%` : "—"}</p>
            <p className="text-[#005228] text-xs font-semibold mb-3">{loading ? "Calculando..." : scoreLabel}</p>
            <Link href="/profile/candidate" className="flex items-center gap-1 text-[11px] text-[#005228]/70 hover:text-[#00210c] transition-colors font-bold">
              Mejorar perfil <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* ── Income + rating ── */}
        {((metrics?.registeredIncome ?? 0) > 0 || metrics?.avgRatingReceived != null) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(metrics?.registeredIncome ?? 0) > 0 && (
              <div className="bg-white rounded-2xl border border-[#e6e8ea] p-5 flex items-center gap-4 hover:shadow-md transition-all">
                <div className="w-11 h-11 bg-[#6bfe9c]/20 rounded-xl flex items-center justify-center flex-shrink-0"><DollarSign className="w-5 h-5 text-[#006d37]" /></div>
                <div>
                  <p className="text-[10px] font-bold text-[#737781] uppercase tracking-wider">Ingresos registrados</p>
                  <p className="font-extrabold text-[#006d37] text-lg font-headline mt-0.5">${(metrics?.registeredIncome ?? 0).toLocaleString("es-CO")} COP</p>
                </div>
              </div>
            )}
            {metrics?.avgRatingReceived != null && (
              <div className="bg-white rounded-2xl border border-[#e6e8ea] p-5 flex items-center gap-4 hover:shadow-md transition-all">
                <div className="w-11 h-11 bg-[#a6c8ff]/20 rounded-xl flex items-center justify-center flex-shrink-0"><Star className="w-5 h-5 text-[#00386c]" /></div>
                <div>
                  <p className="text-[10px] font-bold text-[#737781] uppercase tracking-wider">Reputación recibida</p>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <p className="font-extrabold text-[#00386c] text-lg font-headline">{metrics.avgRatingReceived.toFixed(1)}</p>
                    <p className="text-[#737781] text-xs font-semibold">/ 5.0</p>
                    <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} className={`w-3 h-3 ${i <= Math.round(metrics.avgRatingReceived!) ? "text-[#C9A84C] fill-[#C9A84C]" : "text-[#e0e3e5]"}`} />)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Applications + Profile panel ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-headline font-bold text-[#191c1e]">Postulaciones activas</h2>
                <p className="text-xs text-[#737781] mt-0.5">Estado de tus oportunidades en curso</p>
              </div>
              <Link href="/dashboard/candidate/postulaciones" className="flex items-center gap-1 text-sm text-[#00386c] font-bold hover:gap-2 transition-all">
                Ver todas <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <span className="w-6 h-6 border-2 border-[#00386c]/20 border-t-[#00386c] rounded-full animate-spin" />
              </div>
            ) : recentApps.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#e6e8ea] p-10 text-center">
                <div className="w-14 h-14 bg-[#f2f4f6] rounded-2xl flex items-center justify-center mx-auto mb-3"><Briefcase className="w-6 h-6 text-[#c2c6d1]" /></div>
                <p className="font-headline font-bold text-[#191c1e] mb-1">Sin postulaciones aún</p>
                <p className="text-sm text-[#737781] mb-4">Explora vacantes y aplica a las que encajen con tu perfil.</p>
                <Link href="/dashboard/candidate/explorar" className="inline-flex items-center gap-2 bg-[#00386c] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition">
                  Explorar vacantes <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentApps.slice(0, 4).map(app => (
                  <div key={app.id} className="bg-white rounded-2xl border border-[#e6e8ea] p-4 flex flex-col md:flex-row md:items-center gap-4 hover:border-[#00386c]/20 hover:shadow-md transition-all group">
                    <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-[#00386c] to-[#1a4f8b] rounded-xl flex items-center justify-center shadow-md shadow-[#00386c]/15">
                      <span className="text-base font-black text-white">{(app.job.company?.companyName ?? "?")[0].toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-[#191c1e] truncate group-hover:text-[#00386c] transition-colors">{app.job.title}</h4>
                          <p className="text-[#737781] text-xs mt-0.5 flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" />{app.job.company?.companyName ?? "Empresa"}
                          </p>
                        </div>
                        {app.scoreAtApply !== null && (
                          <span className="text-[11px] font-bold text-[#006d37] bg-[#6bfe9c]/20 px-2.5 py-1 rounded-full flex-shrink-0">
                            {Math.round(app.scoreAtApply)}% match
                          </span>
                        )}
                      </div>
                      <AppStatusBar status={app.status} />
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#c2c6d1] group-hover:text-[#00386c] flex-shrink-0 transition-colors hidden md:block" />
                  </div>
                ))}
                {recentApps.length > 4 && (
                  <Link href="/dashboard/candidate/postulaciones" className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-[#e6e8ea] rounded-2xl text-sm font-bold text-[#00386c] hover:border-[#00386c]/30 hover:shadow-sm transition-all">
                    Ver {recentApps.length - 4} más <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div>
              <h2 className="text-lg font-headline font-bold text-[#191c1e]">Tu perfil</h2>
              <p className="text-xs text-[#737781] mt-0.5">Fortaleza y sugerencias</p>
            </div>
            <div className="bg-gradient-to-br from-[#00386c] to-[#1a4f8b] rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/5" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  {scoreValue !== null ? <ScoreRing value={scoreValue} size={64} /> : <div className="w-16 h-16 flex items-center justify-center text-white/40 text-2xl font-bold">—</div>}
                  <div>
                    <p className="text-white font-headline font-bold text-sm">Fuerza del perfil</p>
                    <p className="text-[#a6c8ff] text-[10px] uppercase tracking-widest font-bold mt-1">{loading ? "Calculando..." : scoreLabel}</p>
                  </div>
                </div>
                {topSuggestions.length > 0 && (
                  <div className="space-y-1.5 mb-4">
                    {topSuggestions.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 bg-white/10 rounded-xl px-3 py-2">
                        <AlertCircle className="w-3 h-3 text-[#6bfe9c] mt-0.5 flex-shrink-0" />
                        <p className="text-[11px] text-white/80 leading-relaxed">{s}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-2">
                  <Link href="/profile/candidate" className="w-full py-2.5 bg-white text-[#00386c] rounded-xl font-bold text-xs hover:bg-[#f2f4f6] transition-colors flex items-center justify-center gap-2">
                    <Pencil className="w-3.5 h-3.5" /> Editar perfil
                  </Link>
                  <Link href="/dashboard/candidate/contratos" className="w-full py-2.5 bg-white/10 border border-white/20 text-white rounded-xl font-bold text-xs hover:bg-white/15 transition-colors flex items-center justify-center gap-2">
                    <FileText className="w-3.5 h-3.5" /> Mis contratos
                    {(metrics?.activeContracts ?? 0) > 0 && (
                      <span className="bg-[#6bfe9c] text-[#00210c] text-[10px] font-bold px-1.5 py-0.5 rounded-full">{metrics?.activeContracts}</span>
                    )}
                  </Link>
                </div>
              </div>
            </div>
            {activeContracts.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-[#737781] uppercase tracking-widest">Contratos activos</p>
                {activeContracts.slice(0, 2).map(c => (
                  <Link key={c.id} href={`/dashboard/candidate/contratos/${c.id}`}
                    className="flex items-center gap-3 bg-white rounded-xl p-3.5 border border-[#e6e8ea] hover:border-[#006d37]/20 hover:shadow-md transition-all group">
                    <div className="w-8 h-8 bg-[#6bfe9c]/20 rounded-lg flex items-center justify-center flex-shrink-0"><CheckCircle2 className="w-4 h-4 text-[#006d37]" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs text-[#191c1e] truncate group-hover:text-[#006d37] transition-colors">{c.title}</p>
                      <p className="text-[10px] text-[#737781] mt-0.5">{CONTRACT_STATUS_LABEL[c.status]}{c.totalAmount ? ` · $${c.totalAmount.toLocaleString("es-CO")}` : ""}</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[#c2c6d1] group-hover:text-[#006d37] flex-shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Recomendado para ti ── */}
        {suggestedJobs.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-headline font-bold text-[#191c1e] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#C9A84C]" /> Recomendado para ti
                </h2>
                <p className="text-xs text-[#737781] mt-0.5">{mySkills.length > 0 ? "Vacantes que coinciden con tus habilidades" : "Vacantes disponibles ahora mismo"}</p>
              </div>
              <Link href="/dashboard/candidate/explorar" className="flex items-center gap-1 text-sm text-[#00386c] font-bold hover:gap-2 transition-all">
                Ver todas <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {suggestedJobs.map(job => <SuggestedJobCard key={job.id} job={job} mySkills={mySkills} />)}
            </div>
          </div>
        )}

        {/* ── CTA banner ── */}
        <div className="relative bg-gradient-to-r from-[#00386c] via-[#0c4783] to-[#00386c] rounded-2xl p-8 overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="cta-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.8"/></pattern></defs>
            <rect width="100%" height="100%" fill="url(#cta-grid)" />
          </svg>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[120px] font-black text-white opacity-[0.04] select-none leading-none pointer-events-none hidden lg:block">TB</div>
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2"><Eye className="w-4 h-4 text-[#6bfe9c]" /><span className="text-[#a6c8ff] text-xs font-bold uppercase tracking-widest">Oportunidades</span></div>
              <h2 className="text-2xl font-headline font-extrabold text-white">
                {(metrics?.activeApplications ?? 0) === 0 ? "Empieza a postularte hoy" : "Sigue explorando oportunidades"}
              </h2>
              <p className="text-[#a6c8ff] mt-1 text-sm">Encuentra vacantes que se ajusten a tu perfil en el Cesar.</p>
            </div>
            <Link href="/dashboard/candidate/explorar"
              className="flex-shrink-0 flex items-center gap-2 bg-[#6bfe9c] text-[#00210c] px-8 py-3.5 rounded-full font-headline font-bold tracking-wide uppercase hover:opacity-90 active:scale-95 transition-all text-sm shadow-lg shadow-[#006d37]/20 whitespace-nowrap">
              Explorar vacantes <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* ── Info footer ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-4">
          {[
            { icon: <BookOpen className="w-4 h-4" />, title: "¿Cómo funciona?", desc: "Aprende el flujo completo de TalentBridge.", href: publicLinks.howItWorks },
            { icon: <Send className="w-4 h-4" />,     title: "Proceso de postulación", desc: "Entiende cada estado de tus aplicaciones.", href: publicLinks.processes.applications },
            { icon: <Briefcase className="w-4 h-4" />, title: "Gestión de contratos", desc: "Cómo funcionan los contratos digitales.", href: publicLinks.processes.contracts },
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