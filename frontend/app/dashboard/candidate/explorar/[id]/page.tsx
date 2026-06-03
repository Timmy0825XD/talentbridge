"use client";

import { useAuth } from "@/src/context/auth-context";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/src/lib/api";
import { useCandidateProfile, useJobDetail, useMyApplications, useMyRanking, queryKeys,} from "@/src/hooks/queries";
import { ProfileScoreResponse } from "@/src/types/api";
import TalentBridgeLoader from "@/src/components/ui/TalentBridgeLoader";
import { publicLinks } from "@/src/content/site-links";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Clock, Briefcase, CheckCircle2,
  Banknote, Building2, Wifi, Loader2, AlertCircle,
  Calendar, Star, ChevronRight, BookOpen,
} from "lucide-react";
import { toast } from "@/src/lib/toast";

interface Job {
  id: string; title: string; description: string; type: string;
  workMode: string; area: string | null; skills: string[];
  budgetMin: number | null; budgetMax: number | null;
  duration: string | null; deadline: string | null; deliverables: string | null;
  createdAt: string;
  company: { companyName: string | null; city: string | null };
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff/60000), hours = Math.floor(mins/60), days = Math.floor(hours/24);
  if (days > 0)  return `Hace ${days} día${days > 1 ? "s" : ""}`;
  if (hours > 0) return `Hace ${hours} hora${hours > 1 ? "s" : ""}`;
  return `Hace ${mins} min`;
}
function formatBudget(min: number | null, max: number | null): string {
  if (!min && !max) return "A convenir";
  if (min && max)   return `$${(min/1000000).toFixed(1)}M – $${(max/1000000).toFixed(1)}M COP`;
  if (min)          return `Desde $${(min/1000000).toFixed(1)}M COP`;
  return "A convenir";
}
const TYPE_LABEL: Record<string,string>     = { FORMAL:"Tiempo completo", FREELANCE:"Freelance" };
const WORKMODE_LABEL: Record<string,string> = { REMOTE:"Remoto", ONSITE:"Presencial", HYBRID:"Híbrido" };

function calcMatch(myScore: ProfileScoreResponse|null, jobSkills: string[], mySkills: string[]): number {
  if (jobSkills.length === 0) return myScore ? Math.round(myScore.totalScore) : 0;
  if (mySkills.length === 0)  return 0;
  return Math.round(jobSkills.filter(s => mySkills.map(m=>m.toLowerCase()).includes(s.toLowerCase())).length / jobSkills.length * 100);
}

export default function ExplorarDetallePage() {
  const { user, isLoading } = useAuth();
  const router    = useRouter();
  const params    = useParams();
  const jobId     = params?.id as string;
  const queryClient = useQueryClient();
  const enabled   = !!user && user.role !== "COMPANY";

  const [applyingId, setApplyingId] = useState<string|null>(null);
  const [isApplied,  setIsApplied]  = useState(false);

  const { data: jobRaw, isLoading: jobLoading } = useJobDetail(jobId, enabled);
  const { data: profile }                        = useCandidateProfile(enabled, user?.userId);
  const { data: myApps = [] }                    = useMyApplications(enabled, user?.userId);
  const { data: myScore = null }                 = useMyRanking(enabled, user?.userId);

  const job      = jobRaw as Job|undefined;
  const mySkills: string[] = (profile?.skills as string[]|undefined) ?? [];

  useEffect(() => {
    if (!isLoading && user?.role === "COMPANY") router.replace("/dashboard/company");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (myApps.length > 0 && jobId) setIsApplied(myApps.some((a:{jobId:string}) => a.jobId === jobId));
  }, [myApps, jobId]);

  async function handleApply() {
    if (!job) return;
    setApplyingId(job.id);
    try {
      await api.post(`/jobs/${job.id}/apply`);
      setIsApplied(true);
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.me });
      toast.success('¡Te postulaste exitosamente!');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error ?? 'Error al postularse. Intenta de nuevo.');
    } finally {
      setApplyingId(null);
    }
  }

  if (isLoading || !user || jobLoading) return <TalentBridgeLoader />;

  if (!job) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f7f9fb] text-center px-8">
      <AlertCircle className="w-10 h-10 text-[#ba1a1a]" />
      <p className="text-[#93000a] font-semibold">No se encontró la vacante.</p>
      <Link href="/dashboard/candidate/explorar" className="px-6 py-2 bg-[#00386c] text-white rounded-full text-sm font-bold hover:opacity-90 transition">
        Volver a explorar
      </Link>
    </div>
  );

  const matchPct = calcMatch(myScore, job.skills, mySkills);
  const initials  = (job.company?.companyName ?? "?")[0].toUpperCase();
  const logoUrl   = (job.company as { logoUrl?: string })?.logoUrl ?? null;

  return (
    <div className="min-h-screen bg-[#f7f9fb]">

      {/* Hero */}
      <div className="relative bg-gradient-to-r from-[#00386c] via-[#0c4783] to-[#00386c] overflow-visible" style={{ paddingBottom: "52px" }}>
        <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="detail-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.8"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#detail-grid)" />
        </svg>
        {!logoUrl && (
          <div className="absolute right-16 top-1/2 -translate-y-1/2 text-[200px] font-black text-white opacity-[0.04] select-none leading-none pointer-events-none">{initials}</div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative max-w-screen-xl mx-auto px-8 pt-6">
          <div className="flex items-center gap-2 text-white/60 text-xs font-medium mb-3">
            <Link href="/dashboard/candidate" className="hover:text-white transition-colors">Inicio</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/dashboard/candidate/explorar" className="hover:text-white transition-colors">Explorar</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/90 truncate max-w-xs">{job.title}</span>
          </div>
          <h1 className="font-headline font-extrabold text-3xl text-white tracking-tight leading-snug mb-3">{job.title}</h1>
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { icon: <Briefcase className="w-3 h-3" />, label: TYPE_LABEL[job.type] ?? job.type },
              { icon: job.workMode === "REMOTE" ? <Wifi className="w-3 h-3" /> : <Building2 className="w-3 h-3" />, label: WORKMODE_LABEL[job.workMode] ?? job.workMode },
              { icon: <Banknote className="w-3 h-3" />, label: formatBudget(job.budgetMin, job.budgetMax) },
              ...(job.company?.city ? [{ icon: <MapPin className="w-3 h-3" />, label: job.company.city }] : []),
            ].map(({ icon, label }) => (
              <span key={label} className="flex items-center gap-1.5 bg-white/10 border border-white/15 text-white/80 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                {icon}{label}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-white shadow-xl ring-4 ring-[#00386c] flex items-center justify-center flex-shrink-0 translate-y-10 overflow-hidden">
                {logoUrl ? <img src={logoUrl} alt={job.company?.companyName ?? ""} className="w-full h-full object-cover" />
                  : <span className="text-3xl font-black text-[#00386c]">{initials}</span>}
              </div>
              <div className="translate-y-10">
                <h2 className="font-headline font-bold text-lg text-white drop-shadow">{job.company?.companyName ?? "Empresa"}</h2>
                <span className="flex items-center gap-1 text-white/70 text-xs mt-0.5"><Clock className="w-3 h-3" />{timeAgo(job.createdAt)}</span>
              </div>
            </div>
            <Link href="/dashboard/candidate/explorar" className="flex items-center gap-2 text-sm text-white/70 hover:text-white font-semibold transition-colors translate-y-2">
              <ArrowLeft className="w-4 h-4" /> Volver
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-8 pb-16 pt-16">

        <div className="flex gap-8 items-start">
          {/* Left */}
          <div className="flex-1 min-w-0 space-y-8">
            <div className="flex flex-wrap gap-2">
              {[TYPE_LABEL[job.type] ?? job.type, WORKMODE_LABEL[job.workMode] ?? job.workMode, ...(job.area ? [job.area] : [])].map(t => (
                <span key={t} className="px-3 py-1.5 bg-[#e0eeff] text-[#00386c] rounded-full text-xs font-bold">{t}</span>
              ))}
            </div>
            <section>
              <h3 className="font-headline font-bold text-xl text-[#191c1e] mb-3 pb-2 border-b border-[#e6e8ea]">Descripción del trabajo</h3>
              <p className="text-[#424750] text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
            </section>
            {job.skills.length > 0 && (
              <section>
                <h3 className="font-headline font-bold text-xl text-[#191c1e] mb-3 pb-2 border-b border-[#e6e8ea]">Habilidades requeridas</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map(skill => {
                    const tengo = mySkills.map(s=>s.toLowerCase()).includes(skill.toLowerCase());
                    return (
                      <span key={skill} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${tengo ? "bg-[#6bfe9c]/20 text-[#005228] ring-1 ring-[#006d37]/20" : "bg-[#f2f4f6] text-[#424750]"}`}>
                        {tengo && <CheckCircle2 className="w-3 h-3" />}{skill}
                      </span>
                    );
                  })}
                </div>
                {mySkills.length === 0 && (
                  <p className="text-xs text-[#737781] mt-3 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" />Completa tu perfil para ver qué habilidades ya tienes.</p>
                )}
              </section>
            )}
            {job.deliverables && (
              <section>
                <h3 className="font-headline font-bold text-xl text-[#191c1e] mb-3 pb-2 border-b border-[#e6e8ea]">Entregables esperados</h3>
                <p className="text-[#424750] text-sm leading-relaxed">{job.deliverables}</p>
              </section>
            )}

            {/* Footer info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { icon: <Star className="w-4 h-4" />, title: "¿Cómo funciona el match?", desc: "El % se calcula comparando tus skills con las de la vacante.", href: publicLinks.candidates },
                { icon: <BookOpen className="w-4 h-4" />, title: "Proceso de postulación", desc: "Entiende cada estado de tus aplicaciones.", href: publicLinks.processes.applications },
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

          {/* Right sticky */}
          <div className="w-80 flex-shrink-0 space-y-4" style={{ position:"sticky", top:88 }}>
            {isApplied ? (
              <div className="w-full flex items-center justify-center gap-2 bg-[#6bfe9c]/20 text-[#005228] px-6 py-4 rounded-2xl font-bold text-sm border border-[#006d37]/20">
                <CheckCircle2 className="w-5 h-5" /> Ya te postulaste a esta vacante
              </div>
            ) : (
              <button onClick={handleApply} disabled={applyingId === job.id}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-[#00386c] to-[#1a4f8b] text-white px-6 py-4 rounded-2xl font-headline font-bold text-base shadow-lg shadow-[#00386c]/25 hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                {applyingId === job.id ? <><Loader2 className="w-5 h-5 animate-spin" />Enviando...</> : <><Briefcase className="w-5 h-5" />Aplicar a este trabajo</>}
              </button>
            )}

            <div className="bg-white rounded-2xl border border-[#e6e8ea] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#f2f4f6]">
                <h3 className="font-headline font-bold text-[#191c1e] text-base">Resumen del trabajo</h3>
              </div>
              <div className="px-5 py-4 space-y-4">
                {[
                  { icon: <Banknote className="w-4 h-4 text-[#00386c]" />, label: "Presupuesto", value: formatBudget(job.budgetMin, job.budgetMax) },
                  { icon: <Briefcase className="w-4 h-4 text-[#00386c]" />, label: "Tipo de empleo", value: TYPE_LABEL[job.type] ?? job.type },
                  { icon: job.workMode === "REMOTE" ? <Wifi className="w-4 h-4 text-[#00386c]" /> : <Building2 className="w-4 h-4 text-[#00386c]" />, label: "Modalidad", value: WORKMODE_LABEL[job.workMode] ?? job.workMode },
                  ...(job.deadline ? [{ icon: <Calendar className="w-4 h-4 text-[#00386c]" />, label: "Fecha límite", value: new Date(job.deadline).toLocaleDateString("es-CO", { day:"numeric", month:"long", year:"numeric" }) }] : []),
                  ...(job.duration  ? [{ icon: <Clock className="w-4 h-4 text-[#00386c]" />, label: "Duración", value: job.duration }] : []),
                  ...(job.area      ? [{ icon: <Star className="w-4 h-4 text-[#00386c]" />, label: "Área", value: job.area }] : []),
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#e0eeff] flex items-center justify-center flex-shrink-0">{icon}</div>
                    <div>
                      <p className="text-[11px] font-bold text-[#737781] uppercase tracking-wider">{label}</p>
                      <p className="text-sm font-bold text-[#191c1e] mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {matchPct > 0 && (
              <div className="bg-white rounded-2xl border border-[#e6e8ea] p-5">
                <h3 className="font-headline font-bold text-[#191c1e] text-sm mb-3">Compatibilidad con tu perfil</h3>
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 flex-shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="24" fill="none" stroke="#e6e8ea" strokeWidth="4"/>
                      <circle cx="28" cy="28" r="24" fill="none"
                        stroke={matchPct >= 70 ? "#006d37" : matchPct >= 40 ? "#00386c" : "#ba1a1a"}
                        strokeWidth="4" strokeDasharray="150.8"
                        strokeDashoffset={150.8-(150.8*matchPct)/100} strokeLinecap="round"
                        style={{ transition:"stroke-dashoffset 0.8s ease" }} />
                    </svg>
                    <span className={`absolute inset-0 flex items-center justify-center text-[11px] font-bold ${matchPct >= 70 ? "text-[#006d37]" : matchPct >= 40 ? "text-[#00386c]" : "text-[#ba1a1a]"}`}>{matchPct}%</span>
                  </div>
                  <p className="text-xs text-[#737781] leading-relaxed">
                    {matchPct >= 70 ? "¡Excelente! Tu perfil encaja muy bien con esta vacante."
                      : matchPct >= 40 ? "Buen match. Considera reforzar algunas habilidades."
                      : "Tu perfil cubre parte de los requisitos. Actualiza tu CV."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}