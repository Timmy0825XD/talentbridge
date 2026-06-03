"use client";

import { useAuth } from "@/src/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { useCompanyDashboard } from "@/src/hooks/queries/use-dashboard";
import { publicLinks } from "@/src/content/site-links";
import TalentBridgeLoader from "@/src/components/ui/TalentBridgeLoader";
import {
  Briefcase, Users, ArrowRight, ChevronRight, Building2,
  Clock, CheckCircle2, AlertCircle, DollarSign, Star,
  TrendingUp, Zap, Plus, Eye,
} from "lucide-react";

function timeAgo(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff/60000), hours = Math.floor(mins/60), days = Math.floor(hours/24);
  if (days > 0)  return `hace ${days}d`;
  if (hours > 0) return `hace ${hours}h`;
  return `hace ${mins}m`;
}

export default function CompanyDashboardPage() {
  const { user, isLoading } = useAuth();
  const router  = useRouter();
  const enabled = !!user && user.role === "COMPANY";
  const { data, isLoading: dashLoading, isError } = useCompanyDashboard(enabled, user?.userId);

  useEffect(() => {
    if (!isLoading && user && user.role !== "COMPANY") router.replace("/dashboard/candidate");
  }, [user, isLoading, router]);

  if (isLoading || !user)       return <TalentBridgeLoader />;
  if (dashLoading && !data)     return <TalentBridgeLoader />;

  if (isError) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f7f9fb] text-center px-8">
      <AlertCircle className="w-10 h-10 text-[#ba1a1a]" />
      <p className="text-[#93000a] font-semibold">No se pudo cargar el dashboard.</p>
      <button onClick={() => window.location.reload()}
        className="px-6 py-2 bg-[#006d37] text-white rounded-full text-sm font-bold hover:opacity-90 transition">
        Reintentar
      </button>
    </div>
  );

  const metrics       = data?.metrics;
  const activeJobs    = data?.activeJobs ?? [];
  const topCandidates = data?.topCandidates ?? [];
  const recentJobs    = [...activeJobs]
    .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#f7f9fb]">

      {/* ── Hero verde ── */}
      <div className="relative bg-gradient-to-r from-[#005228] via-[#006d37] to-[#00743a] overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="co-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.8"/>
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#co-grid)" />
        </svg>
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-[#4ae183]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 rounded-full bg-[#6bfe9c]/8 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute right-16 bottom-0 text-[180px] font-black text-white opacity-[0.03] select-none leading-none pointer-events-none font-headline">TB</div>

        <div className="relative max-w-screen-2xl mx-auto px-8 py-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-[#6bfe9c] text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5" /> Panel de empresa
              </p>
              <h1 className="font-headline font-extrabold text-4xl lg:text-5xl text-white tracking-tight leading-tight">
                ¡Bienvenido<br />
                <span className="text-[#6bfe9c]">de vuelta!</span>
              </h1>
              <p className="text-white/70 text-sm mt-3 max-w-md leading-relaxed">
                {(metrics?.activeJobs ?? 0) > 0
                  ? `Tienes ${metrics?.activeJobs} vacante${(metrics?.activeJobs ?? 0) !== 1 ? "s" : ""} activa${(metrics?.activeJobs ?? 0) !== 1 ? "s" : ""} y ${metrics?.totalApplicants ?? 0} postulante${(metrics?.totalApplicants ?? 0) !== 1 ? "s" : ""} en tu pipeline.`
                  : "Publica tu primera vacante y empieza a recibir postulaciones hoy."}
              </p>
            </div>

            <div className="flex gap-3 flex-wrap">
              {[
                { label: "Vacantes activas",  value: metrics?.activeJobs ?? 0,        icon: <Briefcase className="w-4 h-4" />,    cls: "bg-white/10 border-white/15 text-white" },
                { label: "Postulantes",        value: metrics?.totalApplicants ?? 0,   icon: <Users className="w-4 h-4" />,        cls: "bg-[#6bfe9c]/15 border-[#6bfe9c]/20 text-[#6bfe9c]" },
                { label: "Contratos activos",  value: metrics?.activeContracts ?? 0,   icon: <CheckCircle2 className="w-4 h-4" />, cls: "bg-white/10 border-white/15 text-white" },
              ].map(({ label, value, icon, cls }) => (
                <div key={label} className={`flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-sm ${cls}`}>
                  {icon}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</p>
                    <p className="text-xl font-headline font-extrabold leading-none mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
              <Link href="/dashboard/company/vacantes"
                className="flex items-center gap-2 bg-[#6bfe9c] text-[#00210c] px-5 py-3 rounded-2xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#006d37]/20">
                <Plus className="w-4 h-4" /> Nueva vacante
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-8 py-8 space-y-8">

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { icon: <Briefcase className="w-5 h-5" />, label: "Vacantes activas",  value: String(metrics?.activeJobs ?? 0),   color: "text-[#006d37]", iconBg: "bg-[#6bfe9c]/20", border: "border-[#006d37]/10" },
            { icon: <Users className="w-5 h-5" />,     label: "Postulantes",        value: String(metrics?.totalApplicants ?? 0), color: "text-[#00386c]", iconBg: "bg-[#a6c8ff]/20", border: "border-[#00386c]/10" },
            { icon: <Clock className="w-5 h-5" />,     label: "En selección",       value: String(metrics?.selectingJobs ?? 0),   color: "text-[#7c5c00]", iconBg: "bg-[#fff3cd]",    border: "border-[#ffc107]/20" },
            { icon: <CheckCircle2 className="w-5 h-5" />, label: "Contratos activos", value: String(metrics?.activeContracts ?? 0), color: "text-[#005228]", iconBg: "bg-[#6bfe9c]/20", border: "border-[#006d37]/10" },
            { icon: <DollarSign className="w-5 h-5" />, label: "Costo acumulado",   value: metrics?.accumulatedCost ? `$${(metrics.accumulatedCost/1000000).toFixed(1)}M` : "$0", color: "text-[#00386c]", iconBg: "bg-[#a6c8ff]/20", border: "border-[#00386c]/10" },
          ].map(({ icon, label, value, color, iconBg, border }) => (
            <div key={label} className={`bg-white rounded-2xl p-5 border ${border} hover:shadow-md hover:-translate-y-0.5 transition-all group`}>
              <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center mb-4 ${color} group-hover:scale-110 transition-transform`}>{icon}</div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#737781] mb-1">{label}</p>
              <p className={`text-3xl font-headline font-extrabold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Reputación */}
        {metrics?.avgCandidateRating != null && (
          <div className="bg-white rounded-2xl border border-[#e6e8ea] px-6 py-4 flex items-center gap-4 hover:shadow-md transition-all">
            <div className="w-11 h-11 bg-[#6bfe9c]/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-[#006d37]" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-[#737781] uppercase tracking-wider">Calificación promedio de candidatos</p>
              <div className="flex items-baseline gap-3 mt-0.5">
                <p className="font-extrabold text-[#006d37] text-xl font-headline">{metrics.avgCandidateRating.toFixed(1)}</p>
                <p className="text-[#737781] text-sm">/ 5.0</p>
                <div className="flex gap-0.5">{[1,2,3,4,5].map(i=><Star key={i} className={`w-3.5 h-3.5 ${i<=Math.round(metrics.avgCandidateRating!)?"text-[#C9A84C] fill-[#C9A84C]":"text-[#e0e3e5]"}`}/>)}</div>
              </div>
            </div>
          </div>
        )}

        {/* ── Grid: vacantes recientes + top candidatos ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Vacantes recientes */}
          <section className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-headline font-bold text-[#191c1e]">Vacantes recientes</h2>
                <p className="text-xs text-[#737781] mt-0.5">Tus últimas publicaciones activas</p>
              </div>
              <Link href="/dashboard/company/vacantes" className="flex items-center gap-1 text-sm text-[#006d37] font-bold hover:gap-2 transition-all">
                Ver todas <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {recentJobs.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-[#c2c6d1] p-12 text-center">
                <div className="w-14 h-14 bg-[#f2f4f6] rounded-2xl flex items-center justify-center mx-auto mb-3"><Briefcase className="w-6 h-6 text-[#c2c6d1]" /></div>
                <h3 className="font-bold text-[#191c1e] font-headline mb-1">Sin vacantes publicadas</h3>
                <p className="text-sm text-[#737781] mb-5">Publica tu primera vacante para recibir postulaciones.</p>
                <Link href="/dashboard/company/vacantes" className="inline-flex items-center gap-2 bg-[#006d37] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition">
                  <Plus className="w-4 h-4" /> Publicar vacante
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentJobs.map((job, i) => {
                  const statusColor: Record<string,string> = {
                    ACTIVE:"bg-[#6bfe9c]/20 text-[#005228]", SELECTING:"bg-[#a6c8ff]/20 text-[#00386c]",
                    CLOSED:"bg-[#e6e8ea] text-[#424750]", CANCELLED:"bg-[#ffdad6] text-[#93000a]",
                  };
                  const statusLabel: Record<string,string> = { ACTIVE:"Activa", SELECTING:"En selección", CLOSED:"Cerrada", CANCELLED:"Cancelada" };
                  return (
                    <div key={job.id}
                      className={`group bg-white rounded-2xl border p-5 hover:shadow-lg hover:shadow-[#006d37]/5 hover:border-[#006d37]/15 transition-all ${i===0?"border-[#006d37]/20 ring-1 ring-[#006d37]/10":"border-[#e6e8ea]"}`}>
                      {/* Top strip on first */}
                      {i===0 && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#006d37] to-[#4ae183] rounded-t-2xl" />}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#006d37] to-[#00743a] flex items-center justify-center shadow-md shadow-[#006d37]/20 flex-shrink-0">
                            <Briefcase className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="font-bold text-[#191c1e] font-headline text-base group-hover:text-[#006d37] transition-colors truncate">{job.title}</h3>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColor[job.status]}`}>{statusLabel[job.status]}</span>
                            </div>
                            <p className="text-[#737781] text-xs flex items-center gap-2 flex-wrap">
                              <span>{{ REMOTE:"Remoto", ONSITE:"Presencial", HYBRID:"Híbrido" }[job.workMode]}</span>
                              {job.area && <><span>·</span><span>{job.area}</span></>}
                              <span>·</span><span>Publicada {timeAgo(job.createdAt)}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="text-right">
                            <p className="text-2xl font-headline font-extrabold text-[#191c1e]">{job._count.applications}</p>
                            <p className="text-[10px] font-bold text-[#737781] uppercase tracking-tighter">Postulantes</p>
                          </div>
                          <Link href={`/dashboard/company/vacantes/${job.id}/postulantes`}
                            className="w-9 h-9 bg-[#f2f4f6] rounded-xl flex items-center justify-center text-[#006d37] hover:bg-[#006d37] hover:text-white transition-all">
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Top candidatos */}
          <section className="lg:col-span-5 space-y-4">
            <div>
              <h2 className="text-lg font-headline font-bold text-[#191c1e]">Top candidatos</h2>
              <p className="text-xs text-[#737781] mt-0.5">Mejores perfiles en tus vacantes activas</p>
            </div>

            <div className="bg-gradient-to-br from-[#f7f9fb] to-white rounded-2xl border border-[#e6e8ea] overflow-hidden">
              {topCandidates.length === 0 ? (
                <div className="text-center py-12 px-6">
                  <div className="w-14 h-14 bg-[#f2f4f6] rounded-2xl flex items-center justify-center mx-auto mb-3"><Users className="w-6 h-6 text-[#c2c6d1]" /></div>
                  <p className="text-sm text-[#737781] font-medium">Aún no hay postulantes en tus vacantes activas.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#f2f4f6]">
                  {topCandidates.map((candidate, idx) => {
                    const score = candidate.profileScore?.totalScore ?? candidate.scoreAtApply ?? 0;
                    const scoreColor = score >= 75 ? "#006d37" : score >= 50 ? "#1a4f8b" : "#ba1a1a";
                    const circ = 113, offset = circ - (score/100)*circ;
                    return (
                      <div key={candidate.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#f7f9fb] transition-colors group">
                        {/* Rank number */}
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                          idx===0?"bg-[#C9A84C] text-white":idx===1?"bg-[#737781] text-white":idx===2?"bg-[#cd7f32] text-white":"bg-[#f2f4f6] text-[#737781]"
                        }`}>{idx+1}</div>

                        {/* Avatar */}
                        <div className="relative w-10 h-10 flex-shrink-0">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006d37] to-[#1a4f8b] flex items-center justify-center overflow-hidden">
                            {candidate.photoUrl
                              ? <img src={candidate.photoUrl} alt={candidate.fullName??""} className="w-full h-full object-cover" />
                              : <span className="text-white font-black text-base">{(candidate.fullName??"?")[0].toUpperCase()}</span>}
                          </div>
                          {score >= 70 && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#006d37] text-white rounded-full flex items-center justify-center border-2 border-white">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-[#191c1e] truncate group-hover:text-[#006d37] transition-colors">{candidate.fullName ?? "Sin nombre"}</p>
                          <p className="text-xs text-[#737781] truncate">{candidate.career ?? "Sin carrera"}</p>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {candidate.skills.slice(0,2).map(s=>(
                              <span key={s} className="text-[9px] bg-[#00386c]/10 text-[#00386c] px-1.5 py-0.5 rounded font-bold">{s}</span>
                            ))}
                            {candidate.skills.length > 2 && <span className="text-[9px] text-[#737781]">+{candidate.skills.length-2}</span>}
                          </div>
                        </div>

                        {/* Score ring */}
                        <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
                          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 40 40">
                            <circle cx="20" cy="20" r="18" fill="transparent" stroke="#e6e8ea" strokeWidth="2" />
                            <circle cx="20" cy="20" r="18" fill="transparent" stroke={scoreColor} strokeWidth="2"
                              strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
                          </svg>
                          <span className="text-[10px] font-bold" style={{color:scoreColor}}>{Math.round(score)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="px-5 py-3 border-t border-[#f2f4f6]">
                <Link href="/dashboard/company/talento" className="flex items-center justify-center gap-1.5 text-[#006d37] text-xs font-bold hover:underline underline-offset-4 transition-all">
                  Ver todos los candidatos <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* CTA perfil empresa */}
            <div className="relative bg-gradient-to-br from-[#006d37] to-[#00743a] rounded-2xl p-7 text-white overflow-hidden">
              <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />
              <div className="absolute top-0 right-0 text-[100px] font-black text-white opacity-[0.04] select-none leading-none pointer-events-none font-headline">%</div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-[#6bfe9c]" />
                  <span className="text-[#6bfe9c] text-xs font-bold uppercase tracking-widest">Tip de la plataforma</span>
                </div>
                <h3 className="text-xl font-headline font-extrabold mb-2 leading-tight">Completa tu perfil</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-5">
                  Las empresas con perfil completo reciben un <span className="text-[#6bfe9c] font-bold">40% más</span> de postulaciones calificadas.
                </p>
                <Link href="/profile/company" className="inline-flex items-center gap-2 bg-white text-[#006d37] px-5 py-2.5 rounded-full font-bold text-sm hover:shadow-xl transition-all">
                  <Building2 className="w-4 h-4" /> Completar perfil
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* ── CTA banner explorar talento ── */}
        <div className="relative bg-gradient-to-r from-[#005228] via-[#006d37] to-[#005228] rounded-2xl p-8 overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="cta2-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.8"/></pattern></defs>
            <rect width="100%" height="100%" fill="url(#cta2-grid)" />
          </svg>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[120px] font-black text-white opacity-[0.04] select-none leading-none pointer-events-none hidden lg:block">TB</div>
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2"><Eye className="w-4 h-4 text-[#6bfe9c]" /><span className="text-white/60 text-xs font-bold uppercase tracking-widest">Buscar talento</span></div>
              <h2 className="text-2xl font-headline font-extrabold text-white">Encuentra el perfil ideal</h2>
              <p className="text-white/60 mt-1 text-sm">Explora candidatos verificados del Cesar con scores de empleabilidad.</p>
            </div>
            <Link href="/dashboard/company/talento"
              className="flex-shrink-0 flex items-center gap-2 bg-[#6bfe9c] text-[#00210c] px-8 py-3.5 rounded-full font-headline font-bold tracking-wide uppercase hover:opacity-90 active:scale-95 transition-all text-sm shadow-lg shadow-[#006d37]/20 whitespace-nowrap">
              Explorar talento <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Info footer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-4">
          {[
            { icon: <Building2 className="w-4 h-4" />, title: "Para empresas", desc: "Cómo sacar el máximo a TalentBridge.", href: publicLinks.companies },
            { icon: <Users className="w-4 h-4" />, title: "Buscar talento", desc: "Tips para encontrar el perfil ideal.", href: publicLinks.howItWorks },
            { icon: <DollarSign className="w-4 h-4" />, title: "Gestión de contratos", desc: "Cómo funcionan los contratos digitales.", href: publicLinks.processes.contracts },
          ].map(({ icon, title, desc, href }) => (
            <a key={title} href={href} target="_blank" rel="noopener noreferrer"
              className="group flex items-start gap-3 p-4 bg-white/60 border border-[#e6e8ea] rounded-2xl hover:border-[#006d37]/20 hover:bg-white hover:shadow-sm transition-all">
              <div className="w-8 h-8 bg-[#006d37]/8 rounded-xl flex items-center justify-center flex-shrink-0 text-[#006d37]">{icon}</div>
              <div>
                <p className="text-xs font-bold text-[#191c1e] group-hover:text-[#006d37] transition-colors">{title}</p>
                <p className="text-[10px] text-[#737781] mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}