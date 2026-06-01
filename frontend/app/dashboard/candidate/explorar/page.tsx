"use client";

import { useAuth } from "@/src/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCandidateProfile,
  useJobsList,
  useMyApplications,
  useMyRanking,
} from "@/src/hooks/queries";
import { ProfileScoreResponse } from "@/src/types/api";
import TalentBridgeLoader from "@/src/components/ui/TalentBridgeLoader";
import Link from "next/link";
import InfoCallout from "@/src/components/info/InfoCallout";
import {
  Search, CheckCircle2, MapPin, Clock, Briefcase, AlertCircle,
  Loader2, SlidersHorizontal, X, ChevronDown, ChevronUp,
  Banknote, Building2, Wifi, Star,
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  description: string;
  type: string;
  workMode: string;
  area: string | null;
  skills: string[];
  budgetMin: number | null;
  budgetMax: number | null;
  duration: string | null;
  deadline: string | null;
  deliverables: string | null;
  createdAt: string;
  company: { companyName: string | null; city: string | null };
}

function timeAgo(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (days > 0)  return `Hace ${days}d`;
  if (hours > 0) return `Hace ${hours}h`;
  return `Hace ${mins}m`;
}

function formatBudget(min: number | null, max: number | null): string {
  if (!min && !max) return "A convenir";
  if (min && max)   return `$${(min/1000000).toFixed(1)}M – $${(max/1000000).toFixed(1)}M`;
  if (min)          return `Desde $${(min/1000000).toFixed(1)}M`;
  return "A convenir";
}

const TYPE_LABEL: Record<string, string>     = { FORMAL: "Tiempo completo", FREELANCE: "Freelance" };
const WORKMODE_LABEL: Record<string, string> = { REMOTE: "Remoto", ONSITE: "Presencial", HYBRID: "Híbrido" };

function calcMatch(myScore: ProfileScoreResponse | null, jobSkills: string[], mySkills: string[]): number {
  if (jobSkills.length === 0) return myScore ? Math.round(myScore.totalScore) : 0;
  if (mySkills.length === 0)  return 0;
  const matched = jobSkills.filter(s =>
    mySkills.map(m => m.toLowerCase()).includes(s.toLowerCase())
  ).length;
  return Math.round((matched / jobSkills.length) * 100);
}

const QUICK_FILTERS = [
  { key: "",          label: "Todos" },
  { key: "REMOTE",    label: "Remoto" },
  { key: "FORMAL",    label: "Tiempo completo" },
  { key: "FREELANCE", label: "Freelance" },
  { key: "ONSITE",    label: "Presencial" },
];

function matchColor(pct: number) {
  if (pct >= 70) return { bg: "bg-[#6bfe9c]/20", text: "text-[#005228]" };
  if (pct >= 40) return { bg: "bg-[#a6c8ff]/20", text: "text-[#00386c]" };
  return { bg: "bg-[#ffdad6]/40", text: "text-[#ba1a1a]" };
}

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({
  job, isApplied, matchPct,
}: {
  job: Job; isApplied: boolean; matchPct: number;
}) {
  const mc = matchColor(matchPct);

  return (
    <Link href={`/dashboard/candidate/explorar/${job.id}`}>
      <article className="group relative rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden bg-white border border-[#e6e8ea] hover:border-[#00386c]/20 hover:shadow-lg hover:shadow-[#00386c]/8 hover:-translate-y-0.5 h-full">
        {/* Top color strip */}
        <div className="h-1 w-full bg-[#e6e8ea] group-hover:bg-gradient-to-r group-hover:from-[#00386c] group-hover:to-[#1a4f8b] transition-all duration-300" />

        <div className="p-5">
          {/* Header row */}
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#00386c] to-[#1a4f8b] flex items-center justify-center shadow-md shadow-[#00386c]/20 flex-shrink-0">
              <span className="text-lg font-black text-white">
                {(job.company?.companyName ?? "?")[0].toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {isApplied ? (
                <span className="flex items-center gap-1 bg-[#6bfe9c]/20 text-[#005228] px-2.5 py-1 rounded-full text-[11px] font-bold">
                  <CheckCircle2 className="w-3 h-3" /> Aplicado
                </span>
              ) : (timeAgo(job.createdAt).includes("h") || timeAgo(job.createdAt).includes("m")) ? (
                <span className="bg-[#a6c8ff]/30 text-[#00386c] px-2.5 py-1 rounded-full text-[11px] font-bold">Nuevo</span>
              ) : null}
              {matchPct > 0 && (
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${mc.bg} ${mc.text}`}>
                  {matchPct}% match
                </span>
              )}
            </div>
          </div>

          {/* Title + company */}
          <h3 className="font-headline font-bold text-[15px] text-[#191c1e] mb-0.5 leading-snug line-clamp-2 group-hover:text-[#00386c] transition-colors">
            {job.title}
          </h3>
          <p className="text-[#737781] text-xs font-medium mb-3 flex items-center gap-1 flex-wrap">
            <Building2 className="w-3 h-3 flex-shrink-0" />
            {job.company?.companyName ?? "Empresa"}
            {job.company?.city && <><span>·</span><MapPin className="w-3 h-3" />{job.company.city}</>}
          </p>

          {/* Description preview */}
          <p className="text-[#737781] text-xs leading-relaxed line-clamp-2 mb-4">
            {job.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            <span className="px-2.5 py-1 bg-[#f2f4f6] text-[#424750] rounded-lg text-[11px] font-semibold">
              {TYPE_LABEL[job.type] ?? job.type}
            </span>
            <span className="px-2.5 py-1 bg-[#f2f4f6] text-[#424750] rounded-lg text-[11px] font-semibold flex items-center gap-1">
              {job.workMode === "REMOTE" && <Wifi className="w-3 h-3" />}
              {job.workMode === "ONSITE" && <Building2 className="w-3 h-3" />}
              {WORKMODE_LABEL[job.workMode] ?? job.workMode}
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-[#f2f4f6]">
            <span className="text-xs font-bold text-[#006d37] flex items-center gap-1">
              <Banknote className="w-3.5 h-3.5" />
              {formatBudget(job.budgetMin, job.budgetMax)}
            </span>
            <span className="text-[#737781] text-[11px] flex items-center gap-1">
              <Clock className="w-3 h-3" /> {timeAgo(job.createdAt)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── Filter Sidebar ────────────────────────────────────────────────────────────
function FilterSidebar({
  filterArea, setFilterArea,
  filterBudgetMin, setFilterBudgetMin,
  filterBudgetMax, setFilterBudgetMax,
  onApply, onClear, hasActive,
}: {
  filterArea: string; setFilterArea: (v: string) => void;
  filterBudgetMin: string; setFilterBudgetMin: (v: string) => void;
  filterBudgetMax: string; setFilterBudgetMax: (v: string) => void;
  onApply: () => void; onClear: () => void; hasActive: boolean;
}) {
  const [openBudget, setOpenBudget] = useState(true);
  const [openArea,   setOpenArea]   = useState(true);

  return (
    <aside className="w-64 flex-shrink-0 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold uppercase tracking-widest text-[#737781] flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5" /> Filtros
        </span>
        {hasActive && (
          <button onClick={onClear} className="text-xs text-[#ba1a1a] font-bold hover:underline flex items-center gap-1">
            <X className="w-3 h-3" /> Limpiar
          </button>
        )}
      </div>

      {/* Area */}
      <div className="bg-white rounded-2xl border border-[#e6e8ea] overflow-hidden">
        <button
          onClick={() => setOpenArea(!openArea)}
          className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-bold text-[#191c1e] hover:bg-[#f7f9fb] transition-colors"
        >
          Área / Categoría
          {openArea ? <ChevronUp className="w-4 h-4 text-[#737781]" /> : <ChevronDown className="w-4 h-4 text-[#737781]" />}
        </button>
        {openArea && (
          <div className="px-4 pb-4 border-t border-[#f2f4f6]">
            <input
              type="text"
              value={filterArea}
              onChange={e => setFilterArea(e.target.value)}
              placeholder="ej. Desarrollo Web..."
              className="mt-3 w-full bg-[#f7f9fb] border border-[#e6e8ea] focus:border-[#00386c] focus:ring-0 rounded-xl px-3 py-2 text-sm text-[#191c1e] placeholder:text-[#c2c6d1] outline-none transition-all"
            />
          </div>
        )}
      </div>

      {/* Budget */}
      <div className="bg-white rounded-2xl border border-[#e6e8ea] overflow-hidden">
        <button
          onClick={() => setOpenBudget(!openBudget)}
          className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-bold text-[#191c1e] hover:bg-[#f7f9fb] transition-colors"
        >
          Presupuesto (COP)
          {openBudget ? <ChevronUp className="w-4 h-4 text-[#737781]" /> : <ChevronDown className="w-4 h-4 text-[#737781]" />}
        </button>
        {openBudget && (
          <div className="px-4 pb-4 border-t border-[#f2f4f6] space-y-2.5">
            <div className="mt-3">
              <label className="text-[11px] font-bold text-[#737781] uppercase tracking-wider">Mínimo</label>
              <input
                type="number"
                value={filterBudgetMin}
                onChange={e => setFilterBudgetMin(e.target.value)}
                placeholder="1.000.000"
                className="mt-1 w-full bg-[#f7f9fb] border border-[#e6e8ea] focus:border-[#00386c] focus:ring-0 rounded-xl px-3 py-2 text-sm text-[#191c1e] placeholder:text-[#c2c6d1] outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#737781] uppercase tracking-wider">Máximo</label>
              <input
                type="number"
                value={filterBudgetMax}
                onChange={e => setFilterBudgetMax(e.target.value)}
                placeholder="5.000.000"
                className="mt-1 w-full bg-[#f7f9fb] border border-[#e6e8ea] focus:border-[#00386c] focus:ring-0 rounded-xl px-3 py-2 text-sm text-[#191c1e] placeholder:text-[#c2c6d1] outline-none transition-all"
              />
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onApply}
        className="w-full py-3 bg-gradient-to-r from-[#00386c] to-[#1a4f8b] text-white rounded-xl font-bold text-sm tracking-wide hover:opacity-90 active:scale-95 transition-all shadow-md shadow-[#00386c]/20"
      >
        Aplicar filtros
      </button>
    </aside>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ExplorarPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const enabled = !!user && user.role !== "COMPANY";

  const [jobParams, setJobParams]             = useState<Record<string, string> | undefined>(undefined);
  const [appliedIds, setAppliedIds]           = useState<Set<string>>(new Set());
  const [search, setSearch]                   = useState("");
  const [quickFilter, setQuickFilter]         = useState("");
  const [filterArea, setFilterArea]           = useState("");
  const [filterBudgetMin, setFilterBudgetMin] = useState("");
  const [filterBudgetMax, setFilterBudgetMax] = useState("");

  const { data: jobsRaw = [], isLoading: jobsLoading, isFetching: jobsFetching, isError: jobsError } =
    useJobsList(jobParams, enabled);
  const { data: profile, isLoading: profileLoading } = useCandidateProfile(enabled, user?.userId);
  const { data: myApps = [], isLoading: appsLoading } = useMyApplications(enabled, user?.userId);
  const { data: myScore = null } = useMyRanking(enabled, user?.userId);

  const jobs      = jobsRaw as Job[];
  const mySkills: string[] = (profile?.skills as string[] | undefined) ?? [];
  const initialLoading = jobsLoading && profileLoading && appsLoading;

  useEffect(() => {
    if (!isLoading && user?.role === "COMPANY") router.replace("/dashboard/company");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (myApps.length > 0) setAppliedIds(new Set(myApps.map((a: { jobId: string }) => a.jobId)));
  }, [myApps]);

  function buildParams(filterOverride?: string): Record<string, string> {
    const af = filterOverride !== undefined ? filterOverride : quickFilter;
    const p: Record<string, string> = {};
    if (search)          p.search    = search;
    if (filterArea)      p.area      = filterArea;
    if (filterBudgetMin) p.budgetMin = filterBudgetMin;
    if (filterBudgetMax) p.budgetMax = filterBudgetMax;
    if (af) {
      if (["REMOTE","ONSITE","HYBRID"].includes(af)) p.workMode = af;
      else p.type = af;
    }
    return p;
  }

  function handleSearch(filterOverride?: string) {
    const p = buildParams(filterOverride);
    setJobParams(Object.keys(p).length > 0 ? p : undefined);
  }

  function clearFilters() {
    setQuickFilter(""); setFilterArea(""); setFilterBudgetMin(""); setFilterBudgetMax(""); setSearch("");
    setJobParams(undefined);
  }

  const hasActiveFilters = !!(quickFilter || filterArea || filterBudgetMin || filterBudgetMax || search);

  if (isLoading || !user || initialLoading) return <TalentBridgeLoader />;

  if (jobsError && jobs.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f7f9fb] text-center px-8">
        <AlertCircle className="w-10 h-10 text-[#ba1a1a]" />
        <p className="text-[#93000a] font-semibold">No se pudieron cargar las vacantes.</p>
        <button onClick={() => queryClient.invalidateQueries({ queryKey: ["jobs"] })}
          className="px-6 py-2 bg-[#00386c] text-white rounded-full text-sm font-bold hover:opacity-90 transition">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb]">

      {/* ── Hero Header ── */}
      <div className="relative bg-gradient-to-r from-[#00386c] via-[#0c4783] to-[#00386c] overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.8"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative max-w-screen-2xl mx-auto px-8 py-10">
          <p className="text-[#a6c8ff] text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
            <Star className="w-3.5 h-3.5" /> Oportunidades disponibles
          </p>
          <h1 className="font-headline font-extrabold text-4xl text-white tracking-tight mb-1">
            Descubre tu próxima<br />
            <span className="text-[#6bfe9c]">oportunidad profesional</span>
          </h1>
          <p className="text-[#a6c8ff] text-sm mt-2 max-w-lg">
            Conectamos el talento del Cesar con empresas que buscan perfiles calificados.
          </p>

          {/* Search bar */}
          <div className="mt-6 flex gap-3 max-w-2xl">
            <div className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex items-center px-4 focus-within:bg-white/15 focus-within:border-white/40 transition-all">
              <Search className="w-4 h-4 text-white/50 flex-shrink-0" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Busca por rol, habilidad o empresa..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-white/40 py-3 px-3 text-sm outline-none"
              />
              {search && (
                <button onClick={() => { setSearch(""); handleSearch(); }}>
                  <X className="w-4 h-4 text-white/50 hover:text-white transition-colors" />
                </button>
              )}
            </div>
            <button
              onClick={() => handleSearch()}
              className="bg-[#006d37] hover:bg-[#005228] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg flex items-center gap-2 whitespace-nowrap"
            >
              <Search className="w-4 h-4" /> Buscar
            </button>
          </div>

          {/* Quick filter pills */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {QUICK_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => { setQuickFilter(f.key); handleSearch(f.key); }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  quickFilter === f.key
                    ? "bg-[#6bfe9c] text-[#00210c] shadow-md"
                    : "bg-white/10 text-white/70 hover:bg-white/20 border border-white/10"
                }`}
              >
                {f.label}
              </button>
            ))}
            {jobsFetching && (
              <span className="flex items-center gap-1.5 text-white/50 text-xs ml-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Actualizando...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Body: sidebar + grid ── */}
      <div className="max-w-screen-2xl mx-auto px-8 py-6 flex gap-6">

        {/* Filter sidebar */}
        <FilterSidebar
          filterArea={filterArea} setFilterArea={setFilterArea}
          filterBudgetMin={filterBudgetMin} setFilterBudgetMin={setFilterBudgetMin}
          filterBudgetMax={filterBudgetMax} setFilterBudgetMax={setFilterBudgetMax}
          onApply={() => handleSearch()} onClear={clearFilters} hasActive={hasActiveFilters}
        />

        {/* Jobs grid */}
        <div className="flex-1 min-w-0">
          <InfoCallout
            title="¿Cómo funciona el match?"
            description="El porcentaje de coincidencia se calcula comparando las habilidades de la vacante con las de tu perfil."
            href="/info/candidatos"
            linkLabel="Saber más"
          />
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-[#737781] font-medium">
              <span className="font-bold text-[#191c1e]">{jobs.length}</span>{" "}
              vacante{jobs.length !== 1 ? "s" : ""} encontrada{jobs.length !== 1 ? "s" : ""}
              {hasActiveFilters && <span className="ml-1 text-[#00386c]">· filtros activos</span>}
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-[#ba1a1a] font-bold hover:underline flex items-center gap-1">
                <X className="w-3 h-3" /> Limpiar filtros
              </button>
            )}
          </div>

          {jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-[#e6e8ea]">
              <div className="w-16 h-16 bg-[#f2f4f6] rounded-2xl flex items-center justify-center mb-4">
                <Briefcase className="w-7 h-7 text-[#c2c6d1]" />
              </div>
              <p className="font-headline font-bold text-lg text-[#191c1e]">Sin resultados</p>
              <p className="text-sm text-[#737781] mt-1 mb-4">No hay vacantes con ese criterio.</p>
              <button onClick={clearFilters}
                className="px-5 py-2 bg-[#00386c] text-white rounded-full text-sm font-bold hover:opacity-90 transition">
                Ver todas las vacantes
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {jobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  isApplied={appliedIds.has(job.id)}
                  matchPct={calcMatch(myScore, job.skills, mySkills)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}