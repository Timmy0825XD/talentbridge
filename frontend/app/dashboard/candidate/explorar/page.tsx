"use client";

import { useAuth } from "@/src/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/src/lib/api";
import {
  useCandidateProfile,
  useJobsList,
  useMyApplications,
  useMyRanking,
  queryKeys,
} from "@/src/hooks/queries";
import { ProfileScoreResponse } from "@/src/types/api";
import { Search, CheckCircle2, MapPin, Clock, Briefcase, AlertCircle, Loader2, SlidersHorizontal } from "lucide-react";

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
  company: {
    companyName: string | null;
    city: string | null;
  };
}

function timeAgo(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (days > 0)  return `Hace ${days} día${days > 1 ? "s" : ""}`;
  if (hours > 0) return `Hace ${hours} hora${hours > 1 ? "s" : ""}`;
  return `Hace ${mins} min`;
}

function formatBudget(min: number | null, max: number | null): string {
  if (!min && !max) return "Salario a convenir";
  if (min && max)   return `$${(min/1000000).toFixed(1)}M – $${(max/1000000).toFixed(1)}M COP`;
  if (min)          return `Desde $${(min/1000000).toFixed(1)}M COP`;
  return "Salario a convenir";
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
  { key: "",         label: "Todos" },
  { key: "REMOTE",  label: "Remoto" },
  { key: "FORMAL",  label: "Tiempo completo" },
  { key: "FREELANCE", label: "Freelance" },
  { key: "ONSITE",  label: "Presencial" },
];

export default function ExplorarPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const enabled = !!user && user.role !== "COMPANY";

  const [jobParams, setJobParams] = useState<Record<string, string> | undefined>(undefined);
  const [selected, setSelected]         = useState<Job | null>(null);
  const [applyingId, setApplyingId]     = useState<string | null>(null);
  const [appliedIds, setAppliedIds]     = useState<Set<string>>(new Set());
  const [error, setError]               = useState("");
  const [applyMsg, setApplyMsg]         = useState("");

  const [search, setSearch]             = useState("");
  const [quickFilter, setQuickFilter]   = useState("");
  const [filterArea, setFilterArea]       = useState('');
  const [filterBudgetMin, setFilterBudgetMin] = useState('');
  const [filterBudgetMax, setFilterBudgetMax] = useState('');
  const [showFilters, setShowFilters]     = useState(false);

  const { data: jobsRaw = [], isLoading: jobsLoading, isFetching: jobsFetching, isError: jobsError } =
    useJobsList(jobParams, enabled);
  const { data: profile, isLoading: profileLoading } = useCandidateProfile(enabled, user?.userId);
  const { data: myApps = [], isLoading: appsLoading } = useMyApplications(enabled, user?.userId);
  const { data: myScore = null } = useMyRanking(enabled, user?.userId);

  const jobs = jobsRaw as Job[];
  const mySkills: string[] = (profile?.skills as string[] | undefined) ?? [];

  const initialLoading = jobsLoading && profileLoading && appsLoading;

  useEffect(() => {
    if (!isLoading && user?.role === "COMPANY") {
      router.replace("/dashboard/company");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (myApps.length > 0) {
      setAppliedIds(new Set(myApps.map(a => a.jobId)));
    }
  }, [myApps]);

  useEffect(() => {
    if (jobs.length > 0 && !selected) {
      setSelected(jobs[0]);
    } else if (jobs.length > 0 && selected && !jobs.find(j => j.id === selected.id)) {
      setSelected(jobs[0]);
    } else if (jobs.length === 0) {
      setSelected(null);
    }
  }, [jobs, selected]);

  useEffect(() => {
    if (jobsError) setError("No se pudieron cargar las vacantes. Intenta recargar.");
    else setError("");
  }, [jobsError]);

  function buildParams(filterOverride?: string): Record<string, string> {
    const activeFilter = filterOverride !== undefined ? filterOverride : quickFilter;
    const params: Record<string, string> = {};
    if (search)          params.search    = search;
    if (filterArea)      params.area      = filterArea;
    if (filterBudgetMin) params.budgetMin = filterBudgetMin;
    if (filterBudgetMax) params.budgetMax = filterBudgetMax;
    if (activeFilter) {
      if (['REMOTE', 'ONSITE', 'HYBRID'].includes(activeFilter)) params.workMode = activeFilter;
      else params.type = activeFilter;
    }
    return params;
  }

  function handleSearch(filterOverride?: string) {
    const params = buildParams(filterOverride);
    setJobParams(Object.keys(params).length > 0 ? params : undefined);
  }

  async function handleApply(jobId: string) {
    setApplyingId(jobId);
    setApplyMsg("");
    try {
      await api.post(`/jobs/${jobId}/apply`);
      setAppliedIds(prev => new Set([...prev, jobId]));
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.me });
      setApplyMsg("¡Te postulaste exitosamente!");
      setTimeout(() => setApplyMsg(""), 4000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setApplyMsg(e.response?.data?.error ?? "Error al postularse. Intenta de nuevo.");
      setTimeout(() => setApplyMsg(""), 4000);
    } finally {
      setApplyingId(null);
    }
  }

  function clearFilters() {
    setQuickFilter('');
    setFilterArea('');
    setFilterBudgetMin('');
    setFilterBudgetMax('');
    setSearch('');
    setJobParams(undefined);
    queryClient.invalidateQueries({ queryKey: queryKeys.jobs.list(undefined) });
  }

  const hasActiveFilters = !!(quickFilter || filterArea || filterBudgetMin || filterBudgetMax || search);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
        <span className="w-8 h-8 border-2 border-[#00386c]/20 border-t-[#00386c] rounded-full animate-spin" />
      </div>
    );
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
        <span className="w-8 h-8 border-2 border-[#00386c]/20 border-t-[#00386c] rounded-full animate-spin" />
      </div>
    );
  }

  if (error && jobs.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f7f9fb] text-center px-8">
        <AlertCircle className="w-10 h-10 text-[#ba1a1a]" />
        <p className="text-[#93000a] font-semibold">{error}</p>
        <button onClick={() => queryClient.invalidateQueries({ queryKey: ['jobs'] })}
          className="px-6 py-2 bg-[#00386c] text-white rounded-full text-sm font-bold hover:opacity-90 transition">
          Reintentar
        </button>
      </div>
    );
  }

  const selectedMatch = selected ? calcMatch(myScore, selected.skills, mySkills) : 0;

  return (
    <div className="max-w-screen-2xl mx-auto px-8 py-6">
      <section className="mb-6 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 bg-white rounded-xl shadow-sm flex items-center p-1 focus-within:ring-2 focus-within:ring-[#00386c]/10 transition-all">
            <div className="flex items-center px-4 text-[#737781]"> <Search className="w-5 h-5" /> </div>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Busca roles como 'Desarrollador Frontend'..."
              className="flex-1 border-none focus:ring-0 bg-transparent text-[#191c1e] py-3 text-base font-medium placeholder:text-[#c2c6d1] outline-none"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all border ${
              showFilters || hasActiveFilters ? 'bg-[#00386c] text-white border-[#00386c]' : 'bg-white text-[#424750] border-[#e6e8ea] hover:border-[#00386c]'}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {hasActiveFilters && (
              <span className="bg-white/30 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {[quickFilter, filterArea, filterBudgetMin, filterBudgetMax, search].filter(Boolean).length}
              </span>
            )}
          </button>

          <button
            onClick={() => handleSearch()}
            className="bg-gradient-to-br from-[#00386c] to-[#1a4f8b] text-white px-6 py-3 rounded-xl font-bold text-sm tracking-widest uppercase hover:opacity-90 active:scale-95 transition-all"
          >
            Buscar
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {QUICK_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => { setQuickFilter(f.key); handleSearch(f.key); }}
              className={`px-5 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-colors ${
                quickFilter === f.key
                  ? 'bg-[#6bfe9c] text-[#00743a]'
                  : 'bg-[#f2f4f6] text-[#424750] hover:bg-[#e0e3e5]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {showFilters && (
          <div className="bg-white rounded-xl border border-[#e6e8ea] p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#424750] mb-2"> Área </label>
              <input
                type="text"
                value={filterArea}
                onChange={e => setFilterArea(e.target.value)}
                placeholder="ej. Desarrollo Web, Diseño..."
                className="w-full bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#00386c] focus:ring-0 rounded-lg px-4 py-2.5 text-sm text-[#191c1e] placeholder:text-[#737781] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#424750] mb-2"> Salario mínimo (COP) </label>
              <input
                type="number"
                value={filterBudgetMin}
                onChange={e => setFilterBudgetMin(e.target.value)}
                placeholder="ej. 1000000"
                className="w-full bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#00386c] focus:ring-0 rounded-lg px-4 py-2.5 text-sm text-[#191c1e] placeholder:text-[#737781] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#424750] mb-2"> Salario máximo (COP) </label>
              <input
                type="number"
                value={filterBudgetMax}
                onChange={e => setFilterBudgetMax(e.target.value)}
                placeholder="ej. 5000000"
                className="w-full bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#00386c] focus:ring-0 rounded-lg px-4 py-2.5 text-sm text-[#191c1e] placeholder:text-[#737781] outline-none transition-all"
              />
            </div>

            <div className="sm:col-span-3 flex justify-between items-center pt-2 border-t border-[#f2f4f6]">
              <button onClick={clearFilters} className="text-sm text-[#737781] hover:text-[#ba1a1a] font-semibold transition-colors">
                Limpiar filtros
              </button>
              <button
                onClick={() => { handleSearch(); setShowFilters(false); }}
                className="bg-gradient-to-br from-[#00386c] to-[#1a4f8b] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:opacity-90 transition-all"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        )}
      </section>

      {applyMsg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 
          ${applyMsg.includes("exitosamente") ? "bg-[#6bfe9c]/20 text-[#005228]" : "bg-[#ffdad6] text-[#93000a]"}`}>
          {applyMsg.includes("exitosamente") ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {applyMsg}
        </div>
      )}

      <div className="flex gap-8 h-[calc(100vh-280px)] min-h-[600px]">
        <aside className="w-full md:w-[400px] flex flex-col gap-4 overflow-y-auto pr-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold text-[#737781] uppercase tracking-widest"> Ofertas laborales </h2>
            <span className="text-xs font-semibold text-[#00386c] flex items-center gap-2">
              {jobsFetching && <Loader2 className="w-3 h-3 animate-spin" />}
              {jobs.length} resultado{jobs.length !== 1 ? "s" : ""}
            </span>
          </div>

          {jobs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Briefcase className="w-10 h-10 text-[#c2c6d1] mb-3" />
              <p className="text-sm text-[#737781] font-medium"> No se encontraron vacantes con ese criterio. </p>
              <button onClick={clearFilters} className="mt-4 text-xs text-[#00386c] font-bold hover:underline"> Ver todas las vacantes</button>
            </div>
          )}

          {jobs.map(job => {
            const isActive   = selected?.id === job.id;
            const isApplied  = appliedIds.has(job.id);
            const matchPct   = calcMatch(myScore, job.skills, mySkills);

            return (
              <article
                key={job.id}
                onClick={() => setSelected(job)}
                className={`p-6 rounded-xl cursor-pointer transition-all ${
                  isActive
                    ? "bg-white border-2 border-[#00386c]/20 shadow-lg"
                    : "bg-[#f2f4f6] border border-transparent hover:bg-white hover:shadow-md"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#eceef0] flex items-center justify-center">
                    <span className="text-xl font-black text-[#00386c]"> {(job.company?.companyName ?? "?")[0].toUpperCase()} </span>
                  </div>
                  {isApplied ? (
                    <span className="bg-[#a6c8ff]/30 text-[#00386c] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Aplicado
                    </span>
                  ) : timeAgo(job.createdAt).includes("hora") || timeAgo(job.createdAt).includes("min") ? (
                    <span className="bg-[#6bfe9c] text-[#00743a] px-3 py-1 rounded-full text-xs font-bold">
                      Nuevo
                    </span>
                  ) : null}
                </div>

                <h3 className="font-headline font-bold text-lg text-[#191c1e] mb-1"> {job.title} </h3>
                <p className="text-sm font-medium text-[#737781] mb-4"> {job.company?.companyName ?? "Empresa"} · {job.company?.city ?? "Colombia"} </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-[#e6e8ea] text-[#424750] rounded-md text-xs font-semibold"> {TYPE_LABEL[job.type] ?? job.type} </span>
                  <span className="px-3 py-1 bg-[#e6e8ea] text-[#424750] rounded-md text-xs font-semibold"> {WORKMODE_LABEL[job.workMode] ?? job.workMode} </span>
                  {job.budgetMin && (
                    <span className="px-3 py-1 bg-[#e6e8ea] text-[#424750] rounded-md text-xs font-semibold">
                      {formatBudget(job.budgetMin, job.budgetMax)}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#c2c6d1]/15">
                  <span className="text-xs text-[#737781] italic">{timeAgo(job.createdAt)}</span>
                  <span className={`text-sm font-bold ${isActive ? "text-[#00386c]" : "text-[#c2c6d1]"}`}>
                    {matchPct > 0 ? `${matchPct}% match` : "Ver detalles"}
                  </span>
                </div>
              </article>
            );
          })}
        </aside>

        <main className="hidden md:flex flex-1 flex-col bg-[#f2f4f6] rounded-xl overflow-hidden">
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <Briefcase className="w-12 h-12 text-[#c2c6d1] mb-4" />
              <h3 className="font-bold text-lg text-[#191c1e] font-headline">Selecciona una vacante</h3>
              <p className="text-sm text-[#737781] mt-1">Haz clic en cualquier oferta para ver sus detalles.</p>
            </div>
          ) : (
            <>
              <div className="relative h-44 bg-gradient-to-r from-[#00386c] to-[#1a4f8b] overflow-hidden">
                <div className="absolute bottom-0 left-0 p-8 flex items-end gap-6 w-full translate-y-12">
                  <div className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center shadow-xl ring-8 ring-[#f2f4f6]">
                    <span className="text-4xl font-black text-[#00386c]">
                      {(selected.company?.companyName ?? "?")[0].toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 pt-16">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h1 className="font-headline font-extrabold text-4xl text-[#191c1e] tracking-tight mb-2"> {selected.title} </h1>
                    <div className="flex items-center gap-4 text-[#737781] font-medium text-sm flex-wrap">
                      <span>{selected.company?.companyName ?? "Empresa"}</span>
                      {selected.company?.city && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {selected.company.city}
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {timeAgo(selected.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 flex-shrink-0">
                    {appliedIds.has(selected.id) ? (
                      <div className="flex items-center gap-2 bg-[#6bfe9c]/20 text-[#005228] px-6 py-3 rounded-full font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        Ya te postulaste
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApply(selected.id)}
                        disabled={applyingId === selected.id}
                        className="bg-gradient-to-br from-[#006d37] to-[#4ae183] text-white px-8 py-3 rounded-full font-headline font-bold tracking-widest uppercase shadow-lg shadow-[#006d37]/20 hover:opacity-90 active:scale-95 transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {applyingId === selected.id && (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                        Postularme
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-10">
                  {[
                    { label: "Presupuesto", value: formatBudget(selected.budgetMin, selected.budgetMax) },
                    { label: "Tipo",        value: TYPE_LABEL[selected.type] ?? selected.type },
                    { label: "Modalidad",   value: WORKMODE_LABEL[selected.workMode] ?? selected.workMode },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-white p-5 rounded-xl">
                      <p className="text-xs font-bold text-[#737781] uppercase tracking-wider mb-1">{label}</p>
                      <p className="text-[#191c1e] font-bold text-base">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-headline font-bold text-xl text-[#191c1e] mb-3">Descripción del rol</h3>
                    <p className="text-[#424750] leading-relaxed whitespace-pre-line">{selected.description}</p>
                  </div>

                  {selected.skills.length > 0 && (
                    <div>
                      <h3 className="font-headline font-bold text-xl text-[#191c1e] mb-3">Habilidades requeridas</h3>
                      <div className="flex flex-wrap gap-2">
                        {selected.skills.map(skill => {
                          const tengo = mySkills.map(s => s.toLowerCase()).includes(skill.toLowerCase());
                          return (
                            <span key={skill}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                                tengo
                                  ? "bg-[#6bfe9c]/20 text-[#005228] ring-1 ring-[#006d37]/20"
                                  : "bg-[#e6e8ea] text-[#424750]"
                              }`}>
                              {tengo && <CheckCircle2 className="w-3 h-3" />}
                              {skill}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selected.deliverables && (
                    <div>
                      <h3 className="font-headline font-bold text-xl text-[#191c1e] mb-3">Entregables esperados</h3>
                      <p className="text-[#424750] leading-relaxed">{selected.deliverables}</p>
                    </div>
                  )}

                  <div className="bg-white p-6 rounded-xl flex items-center gap-6 border border-[#c2c6d1]/10">
                    <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="28" fill="transparent" stroke="#e6e8ea" strokeWidth="4" />
                        <circle
                          cx="32" cy="32" r="28"
                          fill="transparent"
                          stroke={selectedMatch >= 70 ? "#006d37" : selectedMatch >= 40 ? "#1a4f8b" : "#ba1a1a"}
                          strokeWidth="4"
                          strokeDasharray="176"
                          strokeDashoffset={176 - (176 * selectedMatch) / 100}
                          strokeLinecap="round"
                          style={{ transition: "stroke-dashoffset 0.6s ease" }}
                        />
                      </svg>
                      <span className="absolute text-xs font-bold text-[#191c1e]">{selectedMatch}%</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#191c1e]">Compatibilidad con tu perfil</h4>
                      <p className="text-sm text-[#737781]">
                        {mySkills.length === 0
                          ? "Completa tu perfil para ver tu compatibilidad con esta vacante."
                          : selectedMatch >= 70
                          ? `Tu perfil coincide con el ${selectedMatch}% de los requisitos. ¡Excelente match!`
                          : `Tu perfil coincide con el ${selectedMatch}% de los requisitos. Completa tu perfil para mejorar tu score.`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}