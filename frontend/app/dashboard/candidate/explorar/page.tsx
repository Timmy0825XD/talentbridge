"use client";

import { useAuth } from "@/src/context/auth-context";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCandidateProfile, useJobsList, useMyApplications, useMyRanking,
} from "@/src/hooks/queries";
import { ProfileScoreResponse } from "@/src/types/api";
import TalentBridgeLoader from "@/src/components/ui/TalentBridgeLoader";
import { publicLinks } from "@/src/content/site-links";
import Link from "next/link";
import {
  Search, CheckCircle2, MapPin, Clock, Briefcase, AlertCircle,
  Loader2, SlidersHorizontal, X, ChevronDown, ChevronUp,
  Banknote, Building2, Wifi, Star, BookOpen,
} from "lucide-react";

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
const TYPE_LABEL: Record<string,string>     = { FORMAL:"Tiempo completo", FREELANCE:"Freelance" };
const WORKMODE_LABEL: Record<string,string> = { REMOTE:"Remoto", ONSITE:"Presencial", HYBRID:"Híbrido" };

function calcMatch(myScore: ProfileScoreResponse|null, jobSkills: string[], mySkills: string[]): number {
  if (jobSkills.length === 0) return myScore ? Math.round(myScore.totalScore) : 0;
  if (mySkills.length === 0)  return 0;
  return Math.round(jobSkills.filter(s => mySkills.map(m=>m.toLowerCase()).includes(s.toLowerCase())).length / jobSkills.length * 100);
}

const QUICK_FILTERS = [
  { key:"",          label:"Todos" },
  { key:"REMOTE",    label:"Remoto" },
  { key:"FORMAL",    label:"Tiempo completo" },
  { key:"FREELANCE", label:"Freelance" },
  { key:"ONSITE",    label:"Presencial" },
];

function matchColor(pct: number) {
  if (pct >= 70) return { bg:"bg-[#6bfe9c]/20", text:"text-[#005228]" };
  if (pct >= 40) return { bg:"bg-[#a6c8ff]/20", text:"text-[#00386c]" };
  return { bg:"bg-[#ffdad6]/40", text:"text-[#ba1a1a]" };
}

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({ job, isApplied, matchPct }: { job: Job; isApplied: boolean; matchPct: number }) {
  const mc = matchColor(matchPct);
  return (
    <Link href={`/dashboard/candidate/explorar/${job.id}`}>
      <article className="group relative rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden bg-white border border-[#e6e8ea] hover:border-[#00386c]/20 hover:shadow-lg hover:shadow-[#00386c]/8 hover:-translate-y-0.5 h-full flex flex-col">
        <div className="h-1 w-full bg-[#e6e8ea] group-hover:bg-gradient-to-r group-hover:from-[#00386c] group-hover:to-[#1a4f8b] transition-all duration-300" />
        <div className="p-4 sm:p-5 flex flex-col flex-1">
          <div className="flex items-start justify-between mb-3 gap-2">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#00386c] to-[#1a4f8b] flex items-center justify-center shadow-md flex-shrink-0">
              <span className="text-base sm:text-lg font-black text-white">{(job.company?.companyName ?? "?")[0].toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {isApplied ? (
                <span className="flex items-center gap-1 bg-[#6bfe9c]/20 text-[#005228] px-2 py-0.5 rounded-full text-[10px] font-bold">
                  <CheckCircle2 className="w-3 h-3" /> Aplicado
                </span>
              ) : (timeAgo(job.createdAt).includes("h") || timeAgo(job.createdAt).includes("m")) ? (
                <span className="bg-[#a6c8ff]/30 text-[#00386c] px-2 py-0.5 rounded-full text-[10px] font-bold">Nuevo</span>
              ) : null}
              {matchPct > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${mc.bg} ${mc.text}`}>{matchPct}%</span>
              )}
            </div>
          </div>

          <h3 className="font-headline font-bold text-sm sm:text-[15px] text-[#191c1e] mb-0.5 leading-snug line-clamp-2 group-hover:text-[#00386c] transition-colors">
            {job.title}
          </h3>
          <p className="text-[#737781] text-xs font-medium mb-2 flex items-center gap-1 flex-wrap">
            <Building2 className="w-3 h-3 flex-shrink-0" />
            <span className="truncate max-w-[120px] sm:max-w-none">{job.company?.companyName ?? "Empresa"}</span>
            {job.company?.city && (
              <><span className="hidden sm:inline">·</span><MapPin className="w-3 h-3 hidden sm:inline" /><span className="hidden sm:inline">{job.company.city}</span></>
            )}
          </p>
          <p className="text-[#737781] text-xs leading-relaxed line-clamp-2 mb-3 hidden sm:block">{job.description}</p>

          <div className="flex flex-wrap gap-1 mb-3">
            <span className="px-2 py-0.5 bg-[#f2f4f6] text-[#424750] rounded-md text-[10px] font-semibold">{TYPE_LABEL[job.type] ?? job.type}</span>
            <span className="px-2 py-0.5 bg-[#f2f4f6] text-[#424750] rounded-md text-[10px] font-semibold flex items-center gap-1">
              {job.workMode === "REMOTE" && <Wifi className="w-2.5 h-2.5" />}
              {WORKMODE_LABEL[job.workMode] ?? job.workMode}
            </span>
          </div>

          <div className="mt-auto flex items-center justify-between pt-3 border-t border-[#f2f4f6]">
            <span className="text-xs font-bold text-[#006d37] flex items-center gap-1">
              <Banknote className="w-3 h-3" />{formatBudget(job.budgetMin, job.budgetMax)}
            </span>
            <span className="text-[#737781] text-[10px] flex items-center gap-1">
              <Clock className="w-3 h-3" />{timeAgo(job.createdAt)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── Filter Panel (shared for sidebar + drawer) ────────────────────────────────
function FilterPanel({
  filterArea, setFilterArea, filterBudgetMin, setFilterBudgetMin,
  filterBudgetMax, setFilterBudgetMax, filterType, setFilterType,
  filterWorkMode, setFilterWorkMode, onApply, onClear, hasActive,
}: {
  filterArea: string; setFilterArea: (v:string)=>void;
  filterBudgetMin: string; setFilterBudgetMin: (v:string)=>void;
  filterBudgetMax: string; setFilterBudgetMax: (v:string)=>void;
  filterType: string; setFilterType: (v:string)=>void;
  filterWorkMode: string; setFilterWorkMode: (v:string)=>void;
  onApply: ()=>void; onClear: ()=>void; hasActive: boolean;
}) {
  const [openBudget, setOpenBudget] = useState(true);
  const [openArea,   setOpenArea]   = useState(true);
  const [openType,   setOpenType]   = useState(true);
  const [openMode,   setOpenMode]   = useState(true);

  const inp = "w-full bg-[#f7f9fb] border border-[#e6e8ea] focus:border-[#00386c] focus:ring-0 rounded-xl px-3 py-2 text-sm text-[#191c1e] placeholder:text-[#c2c6d1] outline-none transition-all";

  const AccordionHeader = ({ label, open, toggle }: { label:string; open:boolean; toggle:()=>void }) => (
    <button onClick={toggle} className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-[#191c1e] hover:bg-[#f7f9fb] transition-colors">
      {label}
      {open ? <ChevronUp className="w-4 h-4 text-[#737781]" /> : <ChevronDown className="w-4 h-4 text-[#737781]" />}
    </button>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold uppercase tracking-widest text-[#737781] flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5" /> Filtros
        </span>
        {hasActive && (
          <button onClick={onClear} className="text-xs text-[#ba1a1a] font-bold hover:underline flex items-center gap-1">
            <X className="w-3 h-3" /> Limpiar
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#e6e8ea] overflow-hidden">
        <AccordionHeader label="Tipo de empleo" open={openType} toggle={() => setOpenType(!openType)} />
        {openType && (
          <div className="px-4 pb-4 border-t border-[#f2f4f6] space-y-2 pt-3">
            {[{ v:"", l:"Todos" }, { v:"FORMAL", l:"Tiempo completo" }, { v:"FREELANCE", l:"Freelance" }].map(({ v, l }) => (
              <label key={v} className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setFilterType(v)}>
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${filterType===v ? "bg-[#00386c] border-[#00386c]" : "border-[#c2c6d1] group-hover:border-[#00386c]"}`}>
                  {filterType===v && <div className="w-2 h-2 rounded-sm bg-white" />}
                </div>
                <span className="text-xs font-semibold text-[#424750]">{l}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#e6e8ea] overflow-hidden">
        <AccordionHeader label="Modalidad" open={openMode} toggle={() => setOpenMode(!openMode)} />
        {openMode && (
          <div className="px-4 pb-4 border-t border-[#f2f4f6] space-y-2 pt-3">
            {[{ v:"", l:"Todas" }, { v:"REMOTE", l:"Remoto" }, { v:"ONSITE", l:"Presencial" }, { v:"HYBRID", l:"Híbrido" }].map(({ v, l }) => (
              <label key={v} className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setFilterWorkMode(v)}>
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${filterWorkMode===v ? "bg-[#006d37] border-[#006d37]" : "border-[#c2c6d1] group-hover:border-[#006d37]"}`}>
                  {filterWorkMode===v && <div className="w-2 h-2 rounded-sm bg-white" />}
                </div>
                <span className="text-xs font-semibold text-[#424750]">{l}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#e6e8ea] overflow-hidden">
        <AccordionHeader label="Área / Categoría" open={openArea} toggle={() => setOpenArea(!openArea)} />
        {openArea && (
          <div className="px-4 pb-4 border-t border-[#f2f4f6] pt-3">
            <input type="text" value={filterArea} onChange={e => setFilterArea(e.target.value)}
              placeholder="ej. Desarrollo Web..." className={inp} />
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#e6e8ea] overflow-hidden">
        <AccordionHeader label="Presupuesto (COP)" open={openBudget} toggle={() => setOpenBudget(!openBudget)} />
        {openBudget && (
          <div className="px-4 pb-4 border-t border-[#f2f4f6] space-y-2.5 pt-3">
            <div>
              <label className="text-[10px] font-bold text-[#737781] uppercase tracking-wider">Mínimo</label>
              <input type="number" value={filterBudgetMin} onChange={e => setFilterBudgetMin(e.target.value)} placeholder="1.000.000" className={`${inp} mt-1`} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#737781] uppercase tracking-wider">Máximo</label>
              <input type="number" value={filterBudgetMax} onChange={e => setFilterBudgetMax(e.target.value)} placeholder="5.000.000" className={`${inp} mt-1`} />
            </div>
          </div>
        )}
      </div>

      <button onClick={onApply}
        className="w-full py-3 bg-gradient-to-r from-[#00386c] to-[#1a4f8b] text-white rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-md shadow-[#00386c]/20">
        Aplicar filtros
      </button>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ExplorarPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const enabled = !!user && user.role !== "COMPANY";

  const [jobParams, setJobParams]             = useState<Record<string,string>|undefined>(undefined);
  const [appliedIds, setAppliedIds]           = useState<Set<string>>(new Set());
  const [search, setSearch]                   = useState("");
  const [quickFilter, setQuickFilter]         = useState("");
  const [filterArea, setFilterArea]           = useState("");
  const [filterBudgetMin, setFilterBudgetMin] = useState("");
  const [filterBudgetMax, setFilterBudgetMax] = useState("");
  const [filterType, setFilterType]           = useState("");
  const [filterWorkMode, setFilterWorkMode]   = useState("");
  const [drawerOpen, setDrawerOpen]           = useState(false);

  const { data: jobsRaw=[], isLoading: jobsLoading, isFetching: jobsFetching, isError: jobsError } = useJobsList(jobParams, enabled);
  const { data: profile, isLoading: profileLoading } = useCandidateProfile(enabled, user?.userId);
  const { data: myApps=[], isLoading: appsLoading }  = useMyApplications(enabled, user?.userId);
  const { data: myScore=null }                        = useMyRanking(enabled, user?.userId);

  const jobs = jobsRaw as Job[];
  const mySkills: string[] = (profile?.skills as string[]|undefined) ?? [];
  const initialLoading = jobsLoading && profileLoading && appsLoading;

  useEffect(() => {
    if (!isLoading && user?.role === "COMPANY") router.replace("/dashboard/company");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (myApps.length > 0) setAppliedIds(new Set(myApps.map((a:{jobId:string}) => a.jobId)));
  }, [myApps]);

  // Cierra drawer al hacer scroll en mobile
  useEffect(() => {
    if (drawerOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  function buildParams(qf?: string): Record<string,string> {
    const af = qf !== undefined ? qf : quickFilter;
    const p: Record<string,string> = {};
    if (search)          p.search    = search;
    if (filterArea)      p.area      = filterArea;
    if (filterBudgetMin) p.budgetMin = filterBudgetMin;
    if (filterBudgetMax) p.budgetMax = filterBudgetMax;
    if (filterType)      p.type      = filterType;
    if (filterWorkMode)  p.workMode  = filterWorkMode;
    if (af) {
      if (["REMOTE","ONSITE","HYBRID"].includes(af)) { p.workMode = af; delete p.type; }
      else if (af) { p.type = af; delete p.workMode; }
    }
    return p;
  }

  function handleSearch(qf?: string) {
    const p = buildParams(qf);
    setJobParams(Object.keys(p).length > 0 ? p : undefined);
  }

  function clearFilters() {
    setQuickFilter(""); setFilterArea(""); setFilterBudgetMin(""); setFilterBudgetMax("");
    setFilterType(""); setFilterWorkMode(""); setSearch("");
    setJobParams(undefined);
  }

  const hasActiveFilters = !!(quickFilter||filterArea||filterBudgetMin||filterBudgetMax||filterType||filterWorkMode||search);
  const activeCount = [quickFilter, filterArea, filterBudgetMin, filterBudgetMax, filterType, filterWorkMode].filter(Boolean).length;

  if (isLoading || !user || initialLoading) return <TalentBridgeLoader />;

  if (jobsError && jobs.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f7f9fb] text-center px-8">
        <AlertCircle className="w-10 h-10 text-[#ba1a1a]" />
        <p className="text-[#93000a] font-semibold">No se pudieron cargar las vacantes.</p>
        <button onClick={() => queryClient.invalidateQueries({ queryKey: ["jobs"] })}
          className="px-6 py-2 bg-[#00386c] text-white rounded-full text-sm font-bold hover:opacity-90 transition">Reintentar</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb]">

      {/* ── Mobile filter drawer overlay ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          {/* Drawer */}
          <div className="absolute left-0 top-0 bottom-0 w-[300px] bg-[#f7f9fb] overflow-y-auto p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[#191c1e] text-sm">Filtrar vacantes</h2>
              <button onClick={() => setDrawerOpen(false)} className="p-1.5 hover:bg-[#e6e8ea] rounded-lg transition-colors">
                <X className="w-4 h-4 text-[#424750]" />
              </button>
            </div>
            <FilterPanel
              filterArea={filterArea} setFilterArea={setFilterArea}
              filterBudgetMin={filterBudgetMin} setFilterBudgetMin={setFilterBudgetMin}
              filterBudgetMax={filterBudgetMax} setFilterBudgetMax={setFilterBudgetMax}
              filterType={filterType} setFilterType={v => { setFilterType(v); setQuickFilter(""); }}
              filterWorkMode={filterWorkMode} setFilterWorkMode={v => { setFilterWorkMode(v); setQuickFilter(""); }}
              onApply={() => { handleSearch(); setDrawerOpen(false); }}
              onClear={clearFilters} hasActive={hasActiveFilters}
            />
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-r from-[#00386c] via-[#0c4783] to-[#00386c] overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.8"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
          <p className="text-[#a6c8ff] text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
            <Star className="w-3.5 h-3.5" /> Oportunidades disponibles
          </p>
          <h1 className="font-headline font-extrabold text-2xl sm:text-4xl text-white tracking-tight mb-1 leading-tight">
            Descubre tu próxima<br className="hidden sm:block" />
            <span className="text-[#6bfe9c]"> oportunidad profesional</span>
          </h1>
          <p className="text-[#a6c8ff] text-xs sm:text-sm mt-2 max-w-lg">Conectamos el talento del Cesar con empresas que buscan perfiles calificados.</p>

          {/* Search bar */}
          <div className="mt-5 flex gap-2 max-w-2xl">
            <div className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex items-center px-3 focus-within:bg-white/15 transition-all">
              <Search className="w-4 h-4 text-white/50 flex-shrink-0" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Busca por rol, habilidad o empresa..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-white/40 py-3 px-2.5 text-sm outline-none min-w-0"
              />
              {search && (
                <button onClick={() => { setSearch(""); handleSearch(); }}>
                  <X className="w-4 h-4 text-white/50 hover:text-white transition-colors" />
                </button>
              )}
            </div>
            <button onClick={() => handleSearch()}
              className="bg-[#006d37] hover:bg-[#005228] text-white px-4 sm:px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg flex items-center gap-2 whitespace-nowrap">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Buscar</span>
            </button>
          </div>

          {/* Quick filters */}
          <div className="flex gap-1.5 sm:gap-2 mt-3 flex-wrap">
            {QUICK_FILTERS.map(f => (
              <button key={f.key} onClick={() => { setQuickFilter(f.key); handleSearch(f.key); }}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all ${
                  quickFilter===f.key ? "bg-[#6bfe9c] text-[#00210c] shadow-md" : "bg-white/10 text-white/70 hover:bg-white/20 border border-white/10"
                }`}>
                {f.label}
              </button>
            ))}
            {jobsFetching && (
              <span className="flex items-center gap-1.5 text-white/50 text-xs ml-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">Actualizando...</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 py-5 sm:py-6">

        {/* Mobile toolbar */}
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <p className="text-sm text-[#737781] font-medium">
            <span className="font-bold text-[#191c1e]">{jobs.length}</span> vacante{jobs.length !== 1 ? "s" : ""}
            {hasActiveFilters && <span className="text-[#00386c] ml-1">· filtros activos</span>}
          </p>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-[#ba1a1a] font-bold flex items-center gap-1">
                <X className="w-3 h-3" /> Limpiar
              </button>
            )}
            <button onClick={() => setDrawerOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                hasActiveFilters
                  ? "bg-[#00386c] text-white border-[#00386c]"
                  : "bg-white text-[#424750] border-[#e6e8ea]"
              }`}>
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filtros
              {activeCount > 0 && (
                <span className="bg-[#6bfe9c] text-[#003d1f] text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  {activeCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-5 sm:gap-6">

          {/* ── Sidebar (desktop only) ── */}
          <aside className="hidden lg:block w-60 xl:w-64 flex-shrink-0">
            <FilterPanel
              filterArea={filterArea} setFilterArea={setFilterArea}
              filterBudgetMin={filterBudgetMin} setFilterBudgetMin={setFilterBudgetMin}
              filterBudgetMax={filterBudgetMax} setFilterBudgetMax={setFilterBudgetMax}
              filterType={filterType} setFilterType={v => { setFilterType(v); setQuickFilter(""); }}
              filterWorkMode={filterWorkMode} setFilterWorkMode={v => { setFilterWorkMode(v); setQuickFilter(""); }}
              onApply={() => handleSearch()} onClear={clearFilters} hasActive={hasActiveFilters}
            />
          </aside>

          {/* ── Job grid ── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Desktop count bar */}
            <div className="hidden lg:flex items-center justify-between">
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
              <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center bg-white rounded-2xl border border-[#e6e8ea]">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#f2f4f6] rounded-2xl flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6 sm:w-7 sm:h-7 text-[#c2c6d1]" />
                </div>
                <p className="font-headline font-bold text-base sm:text-lg text-[#191c1e]">Sin resultados</p>
                <p className="text-sm text-[#737781] mt-1 mb-4">No hay vacantes con ese criterio.</p>
                <button onClick={clearFilters}
                  className="px-5 py-2 bg-[#00386c] text-white rounded-full text-sm font-bold hover:opacity-90 transition">
                  Ver todas las vacantes
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {jobs.map(job => (
                  <JobCard key={job.id} job={job} isApplied={appliedIds.has(job.id)}
                    matchPct={calcMatch(myScore, job.skills, mySkills)} />
                ))}
              </div>
            )}

            {/* Info footer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 pb-4">
              {[
                { icon: <Star className="w-4 h-4" />, title: "¿Cómo funciona el match?", desc: "El % de coincidencia compara tus skills con las de la vacante.", href: publicLinks.candidates },
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
        </div>
      </div>
    </div>
  );
}