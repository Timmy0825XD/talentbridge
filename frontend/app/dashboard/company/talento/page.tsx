"use client";

import { useAuth } from "@/src/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useKeywords } from "@/src/hooks/queries";
import {
  useCandidateSearch,
  CandidateSearchParams,
} from "@/src/hooks/queries/use-candidates";
import TalentBridgeLoader from "@/src/components/ui/TalentBridgeLoader";
import {
  Search, User, Star,
  ChevronRight, ChevronLeft, AlertCircle,
  GraduationCap, Wrench, X, Zap, Users,
  BookOpen, Filter, BarChart2,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const WORKMODE_LABEL: Record<string, string> = {
  REMOTE: "Remoto", ONSITE: "Presencial", HYBRID: "Híbrido",
  remote: "Remoto", onsite: "Presencial", hybrid: "Híbrido",
};

const WORKMODE_COLOR: Record<string, string> = {
  REMOTE: "bg-[#dbeafe] text-[#1e40af]",
  ONSITE: "bg-[#dcfce7] text-[#15803d]",
  HYBRID: "bg-[#fef9c3] text-[#854d0e]",
  remote: "bg-[#dbeafe] text-[#1e40af]",
  onsite: "bg-[#dcfce7] text-[#15803d]",
  hybrid: "bg-[#fef9c3] text-[#854d0e]",
};

function ScoreArc({ score, dark = false }: { score: number; dark?: boolean }) {
  const pct   = Math.min(100, Math.max(0, score));
  const color = pct >= 70 ? "#6bfe9c" : pct >= 40 ? "#a6c8ff" : "#ffb4ab";
  const darkColor = pct >= 70 ? "#006d37" : pct >= 40 ? "#1a4f8b" : "#ba1a1a";
  const finalColor = dark ? color : darkColor;
  const bg    = dark ? "rgba(255,255,255,0.15)" : (pct >= 70 ? "#dcfce7" : pct >= 40 ? "#dbeafe" : "#fee2e2");
  const label = pct >= 70 ? "Alto" : pct >= 40 ? "Medio" : "Bajo";

  return (
    <div className="flex flex-col items-center gap-1 flex-shrink-0">
      <div className="relative w-14 h-14">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r="22" fill={bg} stroke={dark ? "rgba(255,255,255,0.2)" : "#e6e8ea"} strokeWidth="2.5" />
          <circle cx="28" cy="28" r="22" fill="none"
            stroke={finalColor} strokeWidth="2.5" strokeLinecap="round"
            strokeDasharray="138.2"
            strokeDashoffset={138.2 - (138.2 * pct) / 100}
            style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(.4,0,.2,1)" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[13px] font-black"
          style={{ color: dark ? "white" : finalColor }}>{Math.round(pct)}</span>
      </div>
      <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: dark ? "rgba(255,255,255,0.7)" : finalColor }}>{label}</span>
    </div>
  );
}

function SkillPill({ skill, highlight }: { skill: string; highlight?: boolean }) {
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all ${
      highlight
        ? "bg-[#006d37] text-white"
        : "bg-[#f2f4f6] text-[#424750] hover:bg-[#e6e8ea]"
    }`}>
      {skill}
    </span>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function TalentoPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const enabled = !!user && user.role === "COMPANY";

  const [search, setSearch]           = useState("");
  const [skillInput, setSkillInput]   = useState("");
  const [skills, setSkills]           = useState<string[]>([]);
  const [career, setCareer]           = useState("");
  const [workMode, setWorkMode]       = useState("");
  const [minScore, setMinScore]       = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage]               = useState(1);
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [activeParams, setActiveParams] = useState<CandidateSearchParams>({ page: 1, limit: 12 });

  const { data, isLoading: searching, isError } = useCandidateSearch(activeParams, enabled);
  const { data: keywords = [] }                 = useKeywords(enabled);

  const candidates   = data?.candidates ?? [];
  const pagination   = data?.pagination;
  const selected     = candidates.find(c => c.id === selectedId) ?? candidates[0] ?? null;
  const techKeywords = (keywords as { id: string; name: string; type: string }[])
    .filter(k => k.type === "TECHNICAL");

  useEffect(() => {
    if (!isLoading && user?.role !== "COMPANY") router.replace("/dashboard/candidate");
  }, [user, isLoading, router]);

  function addSkill(skill: string) {
    if (!skill.trim() || skills.includes(skill.trim())) return;
    setSkills(prev => [...prev, skill.trim()]);
    setSkillInput("");
  }
  function removeSkill(skill: string) { setSkills(prev => prev.filter(s => s !== skill)); }

  function handleSearch() {
    const params: CandidateSearchParams = { page: 1, limit: 12 };
    if (search)            params.search   = search;
    if (skills.length > 0) params.skills   = skills.join(",");
    if (career)            params.career   = career;
    if (workMode)          params.workMode = workMode;
    if (minScore)          params.minScore = minScore;
    setPage(1);
    setSelectedId(null);
    setActiveParams(params);
    setShowFilters(false);
  }

  function clearFilters() {
    setSearch(""); setSkills([]); setSkillInput("");
    setCareer(""); setWorkMode(""); setMinScore("");
    setPage(1);
    setSelectedId(null);
    setActiveParams({ page: 1, limit: 12 });
  }

  function goToPage(nextPage: number) {
    setPage(nextPage);
    setSelectedId(null);
    setActiveParams(prev => ({ ...prev, page: nextPage }));
  }

  const hasFilters      = !!(search || skills.length > 0 || career || workMode || minScore);
  const activeFiltersN  = [search, skills.length > 0, career, workMode, minScore].filter(Boolean).length;

  const inp = "w-full bg-white border border-[#e6e8ea] focus:border-[#006d37] focus:ring-2 focus:ring-[#006d37]/10 rounded-xl px-4 py-2.5 text-sm text-[#191c1e] placeholder:text-[#b0b7c3] outline-none transition-all";

  if (isLoading || !user) return <TalentBridgeLoader />;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-[#f7f9fb] overflow-hidden">

      {/* ── Top header ── */}
      <div className="relative bg-white border-b border-[#e6e8ea] shrink-0 overflow-hidden">
        {/* Decorative side accent */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#006d37] via-[#6bfe9c] to-[#006d37]" />

        <div className="px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#006d37]">
                  TalentBridge
                </span>
                <span className="w-1 h-1 rounded-full bg-[#006d37]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#737781]">
                  Directorio
                </span>
              </div>
              <h1 className="text-2xl font-black text-[#191c1e] tracking-tight leading-none"
                style={{ fontFamily: "'Syne', 'Manrope', sans-serif" }}>
                Buscar Talento
              </h1>
            </div>
          </div>

          {/* Stats chips */}
          <div className="flex items-center gap-2">
            {pagination && (
              <div className="flex items-center gap-1.5 bg-[#f2f4f6] px-3.5 py-2 rounded-xl">
                <Users className="w-3.5 h-3.5 text-[#006d37]" />
                <span className="text-xs font-black text-[#191c1e]">{pagination.total}</span>
                <span className="text-xs text-[#737781] font-medium">candidatos</span>
              </div>
            )}
            {hasFilters && (
              <button onClick={clearFilters}
                className="flex items-center gap-1.5 bg-[#ffdad6] text-[#93000a] px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-[#ffb4ab] transition-colors">
                <X className="w-3 h-3" /> Limpiar
              </button>
            )}
          </div>
        </div>

        {/* ── Search bar ── */}
        <div className="px-8 pb-4 flex gap-3">
          <div className="flex-1 flex items-center bg-[#f7f9fb] border border-[#e6e8ea] rounded-2xl overflow-hidden focus-within:border-[#006d37] focus-within:ring-2 focus-within:ring-[#006d37]/10 transition-all">
            <Search className="w-4 h-4 text-[#737781] ml-4 shrink-0" />
            <input
              type="text" value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="Nombre, carrera, habilidad..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-[#191c1e] px-3 py-3 text-sm font-medium placeholder:text-[#b0b7c3] outline-none"
            />
            {search && (
              <button onClick={() => setSearch("")} className="mr-3 text-[#737781] hover:text-[#191c1e]">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button onClick={() => setShowFilters(!showFilters)}
            className={`relative flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm transition-all border ${
              showFilters || hasFilters
                ? "bg-[#006d37] text-white border-[#006d37] shadow-lg shadow-[#006d37]/20"
                : "bg-white text-[#424750] border-[#e6e8ea] hover:border-[#006d37]/40"
            }`}>
            <Filter className="w-4 h-4" />
            Filtros
            {activeFiltersN > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#6bfe9c] text-[#003d1f] text-[9px] font-black rounded-full flex items-center justify-center">
                {activeFiltersN}
              </span>
            )}
          </button>

          <button onClick={handleSearch}
            className="bg-[#006d37] text-white px-6 py-3 rounded-2xl font-black text-sm tracking-wider uppercase hover:bg-[#00743a] active:scale-95 transition-all shadow-lg shadow-[#006d37]/25">
            Buscar
          </button>
        </div>

        {/* ── Filters panel ── */}
        {showFilters && (
          <div className="mx-8 mb-4 bg-[#f7f9fb] border border-[#e6e8ea] rounded-2xl p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Skills */}
              <div className="sm:col-span-2 lg:col-span-4">
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#737781] mb-2">
                  Habilidades requeridas
                </label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); } }}
                    placeholder="ej. React, Python, Diseño UX..."
                    list="skill-suggestions" className={inp} />
                  <datalist id="skill-suggestions">
                    {techKeywords.slice(0, 20).map(k => <option key={k.id} value={k.name} />)}
                  </datalist>
                  <button onClick={() => addSkill(skillInput)}
                    className="px-4 py-2.5 bg-[#006d37] text-white rounded-xl text-sm font-black hover:bg-[#00743a] transition-colors">
                    +
                  </button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {skills.map(s => (
                      <span key={s} className="flex items-center gap-1.5 bg-[#006d37] text-white text-xs font-bold px-3 py-1.5 rounded-full">
                        {s}
                        <button onClick={() => removeSkill(s)} className="hover:text-[#ffdad6] transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#737781] mb-2">Carrera</label>
                <input type="text" value={career} onChange={e => setCareer(e.target.value)}
                  placeholder="ej. Ing. Sistemas" className={inp} />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#737781] mb-2">Modalidad</label>
                <select value={workMode} onChange={e => setWorkMode(e.target.value)} className={`${inp} cursor-pointer`}>
                  <option value="">Todas</option>
                  <option value="REMOTE">Remoto</option>
                  <option value="ONSITE">Presencial</option>
                  <option value="HYBRID">Híbrido</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#737781] mb-2">Score mínimo</label>
                <input type="number" min={0} max={100} value={minScore}
                  onChange={e => setMinScore(e.target.value)} placeholder="ej. 60" className={inp} />
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-[#e6e8ea]">
              <button onClick={clearFilters}
                className="text-sm text-[#737781] hover:text-[#ba1a1a] font-bold transition-colors">
                Limpiar todo
              </button>
              <button onClick={handleSearch}
                className="bg-[#006d37] text-white px-6 py-2.5 rounded-xl font-black text-sm hover:bg-[#00743a] transition-all">
                Aplicar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Error ── */}
      {isError && (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <AlertCircle className="w-10 h-10 text-[#ba1a1a]" />
          <p className="text-[#93000a] font-bold">No se pudieron cargar los candidatos.</p>
          <button onClick={handleSearch}
            className="px-6 py-2.5 bg-[#006d37] text-white rounded-xl text-sm font-bold hover:opacity-90">
            Reintentar
          </button>
        </div>
      )}

      {/* ── Master / Detail ── */}
      {!isError && (
        <div className="flex-1 flex overflow-hidden p-4 gap-4 min-h-0">

          {/* ── LEFT: Candidate list ── */}
          <div className="w-[340px] shrink-0 flex flex-col gap-3 min-h-0">

            {/* Count */}
            <div className="flex items-center justify-between shrink-0 px-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#737781]">
                Resultados
              </span>
              {pagination && (
                <span className="text-xs font-black text-[#006d37] bg-[#dcfce7] px-2.5 py-0.5 rounded-full">
                  {pagination.total} candidato{pagination.total !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Skeleton */}
            {searching && (
              <div className="space-y-2.5 overflow-y-auto">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 animate-pulse border border-[#f2f4f6]">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-[#f2f4f6] rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-[#f2f4f6] rounded-lg w-3/4" />
                        <div className="h-2.5 bg-[#f7f9fb] rounded-lg w-1/2" />
                      </div>
                      <div className="w-14 h-14 bg-[#f7f9fb] rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty */}
            {!searching && candidates.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-[#e6e8ea] py-12 px-6">
                <div className="w-16 h-16 bg-[#f2f4f6] rounded-2xl flex items-center justify-center mb-4">
                  <Users className="w-7 h-7 text-[#c2c6d1]" />
                </div>
                <p className="font-bold text-[#191c1e] text-sm mb-1">Sin resultados</p>
                <p className="text-xs text-[#737781] mb-4">Intenta con otros filtros o términos de búsqueda.</p>
                <button onClick={clearFilters}
                  className="text-xs text-[#006d37] font-black hover:underline underline-offset-2">
                  Ver todos →
                </button>
              </div>
            )}

            {/* Cards */}
            {!searching && (
              <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
                {candidates.map(candidate => {
                  const score    = candidate.profileScore?.totalScore ?? 0;
                  const isActive = selected?.id === candidate.id;
                  const scoreColor = score >= 70 ? "text-[#006d37]" : score >= 40 ? "text-[#1a4f8b]" : "text-[#ba1a1a]";

                  return (
                    <article key={candidate.id} onClick={() => setSelectedId(candidate.id)}
                      className={`rounded-2xl p-3.5 cursor-pointer transition-all border ${
                        isActive
                          ? "bg-white border-[#006d37] shadow-lg shadow-[#006d37]/10"
                          : "bg-white border-[#e6e8ea] hover:border-[#006d37]/30 hover:shadow-sm"
                      }`}>
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-base shrink-0 shadow-sm overflow-hidden ${
                          isActive
                            ? "bg-gradient-to-br from-[#006d37] to-[#00743a]"
                            : "bg-gradient-to-br from-[#424750] to-[#737781]"
                        }`}>
                          {candidate.photoUrl
                            ? <img src={candidate.photoUrl} alt={candidate.fullName ?? ""} className="w-full h-full object-cover" />
                            : (candidate.fullName ?? "?")[0].toUpperCase()
                          }
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className={`font-black text-sm leading-tight truncate ${isActive ? "text-[#006d37]" : "text-[#191c1e]"}`}>
                            {candidate.fullName ?? "Candidato"}
                          </p>
                          <p className="text-[11px] text-[#737781] truncate mt-0.5">
                            {candidate.career ?? "Sin carrera"}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            {candidate.workMode && (
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${WORKMODE_COLOR[candidate.workMode] ?? "bg-[#f2f4f6] text-[#424750]"}`}>
                                {WORKMODE_LABEL[candidate.workMode] ?? candidate.workMode}
                              </span>
                            )}
                            {candidate.skills.slice(0, 1).map(s => (
                              <span key={s} className="text-[9px] font-bold px-2 py-0.5 bg-[#f2f4f6] text-[#424750] rounded-full truncate max-w-[80px]">
                                {s}
                              </span>
                            ))}
                            {candidate.skills.length > 1 && (
                              <span className="text-[9px] text-[#737781] font-bold">+{candidate.skills.length - 1}</span>
                            )}
                          </div>
                        </div>

                        {/* Score */}
                        <div className="shrink-0 flex flex-col items-center">
                          <span className={`text-xl font-black leading-none ${scoreColor}`}>
                            {Math.round(score)}
                          </span>
                          <span className="text-[8px] font-bold text-[#737781] uppercase tracking-widest mt-0.5">pts</span>
                        </div>

                        {isActive && <ChevronRight className="w-4 h-4 text-[#006d37] shrink-0" />}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && !searching && (
              <div className="flex items-center justify-between pt-3 border-t border-[#e6e8ea] shrink-0">
                <button onClick={() => goToPage(Math.max(1, page - 1))} disabled={page === 1}
                  className="flex items-center gap-1 text-xs font-black text-[#424750] hover:text-[#006d37] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft className="w-3.5 h-3.5" /> Ant.
                </button>
                <span className="text-xs text-[#737781] font-bold">{page} / {pagination.totalPages}</span>
                <button onClick={() => goToPage(Math.min(pagination.totalPages, page + 1))} disabled={page === pagination.totalPages}
                  className="flex items-center gap-1 text-xs font-black text-[#424750] hover:text-[#006d37] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  Sig. <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* ── RIGHT: Candidate detail ── */}
          <div className="flex-1 bg-white rounded-2xl border border-[#e6e8ea] overflow-hidden flex flex-col min-w-0 shadow-sm">
            {!selected ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#f2f4f6] to-[#e6e8ea] flex items-center justify-center mb-5">
                  <User className="w-10 h-10 text-[#c2c6d1]" />
                </div>
                <h3 className="font-black text-xl text-[#191c1e] mb-2"
                  style={{ fontFamily: "'Syne', sans-serif" }}>
                  Selecciona un candidato
                </h3>
                <p className="text-sm text-[#737781] max-w-xs">
                  Haz clic en cualquier perfil de la lista para ver sus detalles.
                </p>
              </div>
            ) : (
              <>
                {/* ── Hero banner ── */}
                <div className="relative shrink-0 bg-gradient-to-r from-[#003d1f] via-[#006d37] to-[#1a4f8b] overflow-hidden">
                  {/* Pattern overlay */}
                  <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="hero-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1.5" fill="white" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#hero-dots)" />
                  </svg>

                  {/* Avatar + name row — todo dentro del banner */}
                  <div className="relative flex items-center justify-between px-8 py-5 gap-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm ring-2 ring-white/30 overflow-hidden flex items-center justify-center shrink-0 shadow-lg">
                        {selected.photoUrl
                          ? <img src={selected.photoUrl} alt={selected.fullName ?? ""} className="w-full h-full object-cover" />
                          : <span className="text-2xl font-black text-white">{(selected.fullName ?? "?")[0].toUpperCase()}</span>
                        }
                      </div>

                      <div>
                        <h2 className="text-xl font-black text-white tracking-tight leading-none"
                          style={{ fontFamily: "'Syne', 'Manrope', sans-serif" }}>
                          {selected.fullName ?? "Candidato"}
                        </h2>
                        <div className="flex flex-wrap items-center gap-2.5 mt-1.5">
                          {selected.career && (
                            <span className="flex items-center gap-1.5 text-xs text-white/80 font-semibold">
                              <GraduationCap className="w-3.5 h-3.5 text-[#6bfe9c]" />
                              {selected.career}
                            </span>
                          )}
                          {selected.university?.name && (
                            <span className="flex items-center gap-1.5 text-xs text-white/80 font-semibold">
                              <BookOpen className="w-3.5 h-3.5 text-[#a6c8ff]" />
                              {selected.university.name}
                            </span>
                          )}
                          {selected.workMode && (
                            <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider bg-white/20 text-white border border-white/20">
                              {WORKMODE_LABEL[selected.workMode] ?? selected.workMode}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                      {/* Score + reputation */}
                      <div className="flex items-center gap-3 shrink-0">
                        {selected.profileScore && (
                          <ScoreArc score={selected.profileScore.totalScore} dark />
                        )}
                        {selected.reputationAvg !== null && selected.ratingCount > 0 && (
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-[#fbbf24]/60 flex flex-col items-center justify-center">
                              <span className="text-sm font-black text-white leading-none">
                                {selected.reputationAvg.toFixed(1)}
                              </span>
                              <Star className="w-3 h-3 text-[#fbbf24] fill-[#fbbf24]" />
                            </div>
                            <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">
                              {selected.ratingCount} op.
                            </span>
                          </div>
                        )}
                      </div>
                  </div>
                </div>

                {/* ── Scrollable content ── */}
                <div className="flex-1 overflow-y-auto">
                  <div className="px-8 py-5 space-y-5">

                    {/* Skills técnicas */}
                    {selected.skills.length > 0 && (
                      <div className="rounded-2xl border border-[#e6e8ea] overflow-hidden">
                        <div className="flex items-center gap-2.5 px-5 py-3 bg-[#f7f9fb] border-b border-[#e6e8ea]">
                          <div className="w-6 h-6 bg-[#006d37]/10 rounded-lg flex items-center justify-center">
                            <Wrench className="w-3.5 h-3.5 text-[#006d37]" />
                          </div>
                          <p className="text-[10px] font-black text-[#424750] uppercase tracking-widest">
                            Habilidades técnicas
                          </p>
                          <span className="ml-auto text-[10px] font-bold text-[#737781] bg-[#e6e8ea] px-2 py-0.5 rounded-full">
                            {selected.skills.length}
                          </span>
                        </div>
                        <div className="p-5 bg-white flex flex-wrap gap-2">
                          {selected.skills.map(s => <SkillPill key={s} skill={s} highlight />)}
                        </div>
                      </div>
                    )}

                    {/* Soft skills */}
                    {selected.softSkills.length > 0 && (
                      <div className="rounded-2xl border border-[#e6e8ea] overflow-hidden">
                        <div className="flex items-center gap-2.5 px-5 py-3 bg-[#f7f9fb] border-b border-[#e6e8ea]">
                          <div className="w-6 h-6 bg-[#6bfe9c]/20 rounded-lg flex items-center justify-center">
                            <Zap className="w-3.5 h-3.5 text-[#006d37]" />
                          </div>
                          <p className="text-[10px] font-black text-[#424750] uppercase tracking-widest">
                            Habilidades blandas
                          </p>
                        </div>
                        <div className="p-5 bg-white flex flex-wrap gap-2">
                          {selected.softSkills.map(s => <SkillPill key={s} skill={s} />)}
                        </div>
                      </div>
                    )}

                    {/* Score breakdown si existe */}
                    {selected.profileScore?.breakdown && (
                      <div className="rounded-2xl border border-[#e6e8ea] overflow-hidden">
                        <div className="flex items-center gap-2.5 px-5 py-3 bg-[#f7f9fb] border-b border-[#e6e8ea]">
                          <div className="w-6 h-6 bg-[#1a4f8b]/10 rounded-lg flex items-center justify-center">
                            <BarChart2 className="w-3.5 h-3.5 text-[#1a4f8b]" />
                          </div>
                          <p className="text-[10px] font-black text-[#424750] uppercase tracking-widest">
                            Desglose de puntaje
                          </p>
                        </div>
                        <div className="p-5 bg-white grid grid-cols-2 gap-3">
                          {Object.entries(selected.profileScore.breakdown).map(([key, val]) => {
                            const labels: Record<string, string> = {
                              skills: "Habilidades", experience: "Experiencia",
                              education: "Educación", certs: "Certificados",
                              reputation: "Reputación", languages: "Idiomas", completion: "Completitud",
                            };
                            const pct = Math.min(Math.round(val as number), 100);
                            return (
                              <div key={key} className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-semibold text-[#424750]">{labels[key] ?? key}</span>
                                  <span className="text-[11px] font-black text-[#191c1e]">{pct}</span>
                                </div>
                                <div className="h-1.5 bg-[#f2f4f6] rounded-full overflow-hidden">
                                  <div className="h-full rounded-full bg-gradient-to-r from-[#006d37] to-[#6bfe9c] transition-all duration-700"
                                    style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    <div className="relative rounded-2xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#006d37] to-[#1a4f8b]" />
                      <div className="absolute inset-0 opacity-10">
                        <svg width="100%" height="100%"><defs><pattern id="cta-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="0.5"/></pattern></defs>
                          <rect width="100%" height="100%" fill="url(#cta-grid)" /></svg>
                      </div>
                      <div className="relative flex items-center justify-between p-5 gap-4">
                        <div>
                          <p className="font-black text-white text-sm leading-tight">
                            ¿Te interesa este candidato?
                          </p>
                          <p className="text-xs text-white/70 mt-1 max-w-xs">
                            Publica una vacante o selecciona un postulante para iniciar un contrato.
                          </p>
                        </div>
                        <Link href="/dashboard/company/vacantes"
                          className="shrink-0 flex items-center gap-2 bg-[#6bfe9c] text-[#003d1f] px-5 py-2.5 rounded-xl text-xs font-black hover:bg-white transition-all whitespace-nowrap shadow-lg">
                          Ver vacantes <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}