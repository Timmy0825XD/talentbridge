"use client";

import { useAuth } from "@/src/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useKeywords } from "@/src/hooks/queries";
import {
  useCandidateSearch,
  CandidateSearchItem,
  CandidateSearchParams,
} from "@/src/hooks/queries/use-candidates";
import InfoCallout from "@/src/components/info/InfoCallout";
import {
  Search, SlidersHorizontal, User, Star, Briefcase,
  MapPin, ChevronRight, ChevronLeft, AlertCircle,
  GraduationCap, Wrench, X,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const WORKMODE_LABEL: Record<string, string> = {
  REMOTE:  "Remoto",
  ONSITE:  "Presencial",
  HYBRID:  "Híbrido",
  remote:  "Remoto",
  onsite:  "Presencial",
  hybrid:  "Híbrido",
};

function ScoreRing({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score));
  const color = pct >= 70 ? "#006d37" : pct >= 40 ? "#1a4f8b" : "#ba1a1a";
  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="20" fill="transparent" stroke="#e6e8ea" strokeWidth="3" />
        <circle cx="24" cy="24" r="20" fill="transparent"
          stroke={color} strokeWidth="3" strokeLinecap="round"
          strokeDasharray="125.6"
          strokeDashoffset={125.6 - (125.6 * pct) / 100}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#191c1e]">
        {Math.round(pct)}
      </span>
    </div>
  );
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function TalentoPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const enabled = !!user && user.role === "COMPANY";

  // Filtros
  const [search, setSearch]         = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills]         = useState<string[]>([]);
  const [career, setCareer]         = useState("");
  const [workMode, setWorkMode]     = useState("");
  const [minScore, setMinScore]     = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage]             = useState(1);

  // Candidato seleccionado (panel derecho)
  const [selected, setSelected] = useState<CandidateSearchItem | null>(null);

  // Params activos para la query
  const [activeParams, setActiveParams] = useState<CandidateSearchParams>({ page: 1, limit: 12 });

  const { data, isLoading: searching, isError } = useCandidateSearch(activeParams, enabled);
  const { data: keywords = [] } = useKeywords(enabled);

  const candidates  = data?.candidates ?? [];
  const pagination  = data?.pagination;
  const techKeywords = (keywords as { id: string; name: string; type: string }[])
    .filter(k => k.type === "TECHNICAL");

  useEffect(() => {
    if (!isLoading && user?.role !== "COMPANY") router.replace("/dashboard/candidate");
  }, [user, isLoading, router]);

  // Cuando cambia la página, actualizar params
  useEffect(() => {
    setActiveParams(p => ({ ...p, page }));
  }, [page]);

  // Seleccionar primero automáticamente
  useEffect(() => {
    if (candidates.length > 0 && !selected) setSelected(candidates[0]);
    else if (candidates.length > 0 && selected && !candidates.find(c => c.id === selected.id)) {
      setSelected(candidates[0]);
    } else if (candidates.length === 0) setSelected(null);
  }, [candidates]);

  function addSkill(skill: string) {
    if (!skill.trim() || skills.includes(skill.trim())) return;
    setSkills(prev => [...prev, skill.trim()]);
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    setSkills(prev => prev.filter(s => s !== skill));
  }

  function handleSearch() {
    const params: CandidateSearchParams = { page: 1, limit: 12 };
    if (search)           params.search   = search;
    if (skills.length > 0) params.skills  = skills.join(",");
    if (career)           params.career   = career;
    if (workMode)         params.workMode = workMode;
    if (minScore)         params.minScore = minScore;
    setPage(1);
    setActiveParams(params);
    setShowFilters(false);
  }

  function clearFilters() {
    setSearch(""); setSkills([]); setSkillInput("");
    setCareer(""); setWorkMode(""); setMinScore("");
    setPage(1);
    setActiveParams({ page: 1, limit: 12 });
  }

  const hasFilters = !!(search || skills.length > 0 || career || workMode || minScore);
  const inp = "w-full bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#006d37] focus:ring-0 rounded-lg px-4 py-2.5 text-sm text-[#191c1e] placeholder:text-[#737781] outline-none transition-all";

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
        <span className="w-8 h-8 border-2 border-[#006d37]/20 border-t-[#006d37] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-8 py-6">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-extrabold text-[#006d37] font-headline tracking-tight">
          Buscar Talento
        </h1>
        <p className="text-[#424750] mt-1">
          Encuentra candidatos que se ajusten a tus necesidades.
        </p>
      </div>

      {/* Barra de búsqueda */}
      <section className="mb-6 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 bg-white rounded-xl shadow-sm flex items-center p-1 focus-within:ring-2 focus-within:ring-[#006d37]/10 transition-all">
            <div className="flex items-center px-4 text-[#737781]">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="Busca por nombre, carrera o habilidad..."
              className="flex-1 border-none focus:ring-0 bg-transparent text-[#191c1e] py-3 text-base font-medium placeholder:text-[#c2c6d1] outline-none"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all border ${
              showFilters || hasFilters
                ? "bg-[#006d37] text-white border-[#006d37]"
                : "bg-white text-[#424750] border-[#e6e8ea] hover:border-[#006d37]"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {hasFilters && (
              <span className="bg-white/30 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {[search, skills.length > 0, career, workMode, minScore].filter(Boolean).length}
              </span>
            )}
          </button>

          <button
            onClick={handleSearch}
            className="bg-gradient-to-br from-[#006d37] to-[#00743a] text-white px-6 py-3 rounded-xl font-bold text-sm tracking-widest uppercase hover:opacity-90 active:scale-95 transition-all"
          >
            Buscar
          </button>
        </div>

        {/* Filtros expandibles */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-[#e6e8ea] p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* Skills */}
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#424750] mb-2">
                  Habilidades requeridas
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); } }}
                    placeholder="ej. React, Python, Diseño UX..."
                    list="skill-suggestions"
                    className={inp}
                  />
                  <datalist id="skill-suggestions">
                    {techKeywords.slice(0, 20).map(k => (
                      <option key={k.id} value={k.name} />
                    ))}
                  </datalist>
                  <button type="button" onClick={() => addSkill(skillInput)}
                    className="px-4 py-2 bg-[#006d37] text-white rounded-lg text-sm font-bold hover:bg-[#00743a] transition-colors">
                    +
                  </button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {skills.map(s => (
                      <span key={s}
                        className="flex items-center gap-1.5 bg-[#006d37] text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                        {s}
                        <button onClick={() => removeSkill(s)}
                          className="hover:text-[#ffdad6] transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Carrera */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#424750] mb-2">Carrera</label>
                <input type="text" value={career} onChange={e => setCareer(e.target.value)}
                  placeholder="ej. Ingeniería de Sistemas"
                  className={inp} />
              </div>

              {/* Modalidad */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#424750] mb-2">Modalidad</label>
                <select value={workMode} onChange={e => setWorkMode(e.target.value)}
                  className={`${inp} cursor-pointer`}>
                  <option value="">Todas</option>
                  <option value="REMOTE">Remoto</option>
                  <option value="ONSITE">Presencial</option>
                  <option value="HYBRID">Híbrido</option>
                </select>
              </div>

              {/* Score mínimo */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#424750] mb-2">
                  Score mínimo
                </label>
                <input type="number" min={0} max={100} value={minScore}
                  onChange={e => setMinScore(e.target.value)}
                  placeholder="ej. 60"
                  className={inp} />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#f2f4f6]">
              <button onClick={clearFilters}
                className="text-sm text-[#737781] hover:text-[#ba1a1a] font-semibold transition-colors">
                Limpiar filtros
              </button>
              <button onClick={handleSearch}
                className="bg-gradient-to-br from-[#006d37] to-[#00743a] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:opacity-90 transition-all">
                Aplicar filtros
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Error */}
      {isError && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertCircle className="w-10 h-10 text-[#ba1a1a]" />
          <p className="text-[#93000a] font-semibold">No se pudieron cargar los candidatos.</p>
          <button onClick={handleSearch}
            className="px-6 py-2 bg-[#006d37] text-white rounded-full text-sm font-bold hover:opacity-90">
            Reintentar
          </button>
        </div>
      )}

      {/* Layout master/detail */}
      {!isError && (
        <div className="flex gap-6 h-[calc(100vh-320px)] min-h-[560px]">

          {/* Lista candidatos */}
          <aside className="w-full md:w-[400px] flex flex-col gap-3 overflow-y-auto pr-1">
            <InfoCallout
              title="Busca talento activamente"
              description="Explora candidatos por palabras clave, skills o carrera. Contacta a los que mejor se ajusten."
            />

            <div className="flex items-center justify-between mb-1 flex-shrink-0">
              <p className="text-xs font-bold text-[#737781] uppercase tracking-widest">
                Candidatos
              </p>
              {pagination && (
                <span className="text-xs font-semibold text-[#006d37]">
                  {pagination.total} resultado{pagination.total !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Skeleton */}
            {searching && (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#e6e8ea] rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-[#e6e8ea] rounded w-3/4" />
                        <div className="h-2.5 bg-[#f2f4f6] rounded w-1/2" />
                      </div>
                      <div className="w-12 h-12 bg-[#f2f4f6] rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Vacío */}
            {!searching && candidates.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <User className="w-10 h-10 text-[#c2c6d1] mb-3" />
                <p className="text-sm text-[#737781] font-medium">
                  No se encontraron candidatos con ese criterio.
                </p>
                <button onClick={clearFilters}
                  className="mt-4 text-xs text-[#006d37] font-bold hover:underline">
                  Ver todos los candidatos
                </button>
              </div>
            )}

            {/* Cards */}
            {!searching && candidates.map(candidate => {
              const score    = candidate.profileScore?.totalScore ?? 0;
              const isActive = selected?.id === candidate.id;

              return (
                <article key={candidate.id}
                  onClick={() => setSelected(candidate)}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    isActive
                      ? "bg-white border-2 border-[#006d37]/20 shadow-lg"
                      : "bg-[#f2f4f6] border border-transparent hover:bg-white hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-[#006d37]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {candidate.photoUrl ? (
                        <img src={candidate.photoUrl} alt={candidate.fullName ?? ""}
                          className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-black text-[#006d37]">
                          {(candidate.fullName ?? "?")[0].toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[#191c1e] truncate">
                        {candidate.fullName ?? "Candidato"}
                      </p>
                      <p className="text-xs text-[#737781] truncate">
                        {candidate.career ?? "Sin carrera registrada"}
                      </p>
                      {candidate.workMode && (
                        <span className="text-[10px] font-semibold text-[#424750] bg-[#e6e8ea] px-2 py-0.5 rounded-full mt-1 inline-block">
                          {WORKMODE_LABEL[candidate.workMode] ?? candidate.workMode}
                        </span>
                      )}
                    </div>

                    {/* Score ring */}
                    <ScoreRing score={score} />
                  </div>

                  {/* Skills preview */}
                  {candidate.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {candidate.skills.slice(0, 3).map(s => (
                        <span key={s}
                          className="text-[10px] font-semibold text-[#424750] bg-[#e6e8ea] px-2 py-0.5 rounded-md">
                          {s}
                        </span>
                      ))}
                      {candidate.skills.length > 3 && (
                        <span className="text-[10px] font-semibold text-[#737781]">
                          +{candidate.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </article>
              );
            })}

            {/* Paginación */}
            {pagination && pagination.totalPages > 1 && !searching && (
              <div className="flex items-center justify-between pt-3 border-t border-[#e6e8ea] flex-shrink-0 mt-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 text-xs font-bold text-[#424750] hover:text-[#006d37] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Anterior
                </button>
                <span className="text-xs text-[#737781] font-semibold">
                  {page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="flex items-center gap-1 text-xs font-bold text-[#424750] hover:text-[#006d37] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </aside>

          {/* Detalle candidato */}
          <main className="hidden md:flex flex-1 flex-col bg-white rounded-2xl border border-[#e6e8ea] overflow-hidden">
            {!selected ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                <User className="w-12 h-12 text-[#c2c6d1] mb-4" />
                <h3 className="font-bold text-lg text-[#191c1e] font-headline">
                  Selecciona un candidato
                </h3>
                <p className="text-sm text-[#737781] mt-1">
                  Haz clic en cualquier perfil para ver sus detalles.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {/* Banner */}
                <div className="h-28 bg-gradient-to-r from-[#006d37] to-[#00743a] relative flex-shrink-0">
                  <div className="absolute bottom-0 left-0 p-6 translate-y-10 flex items-end gap-5">
                    <div className="w-20 h-20 rounded-2xl bg-white shadow-xl ring-4 ring-white overflow-hidden flex items-center justify-center flex-shrink-0">
                      {selected.photoUrl ? (
                        <img src={selected.photoUrl} alt={selected.fullName ?? ""}
                          className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl font-black text-[#006d37]">
                          {(selected.fullName ?? "?")[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-16 space-y-6">
                  {/* Nombre y datos básicos */}
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h2 className="text-2xl font-extrabold text-[#191c1e] font-headline tracking-tight">
                        {selected.fullName ?? "Candidato"}
                      </h2>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-[#737781]">
                        {selected.career && (
                          <span className="flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5" />
                            {selected.career}
                          </span>
                        )}
                        {selected.institution && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            {selected.institution}
                          </span>
                        )}
                        {selected.workMode && (
                          <span className="flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5" />
                            {WORKMODE_LABEL[selected.workMode] ?? selected.workMode}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Score y reputación */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                      {selected.profileScore && (
                        <div className="text-center">
                          <ScoreRing score={selected.profileScore.totalScore} />
                          <p className="text-[10px] text-[#737781] font-semibold mt-1">Score</p>
                        </div>
                      )}
                      {selected.reputationAvg !== null && selected.ratingCount > 0 && (
                        <div className="text-center">
                          <div className="w-12 h-12 rounded-full bg-[#6bfe9c]/20 flex items-center justify-center">
                            <span className="text-sm font-black text-[#006d37]">
                              {selected.reputationAvg.toFixed(1)}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#737781] font-semibold mt-1 flex items-center gap-0.5 justify-center">
                            <Star className="w-2.5 h-2.5" />
                            {selected.ratingCount} op.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skills técnicas */}
                  {selected.skills.length > 0 && (
                    <div className="bg-[#f7f9fb] rounded-xl p-4">
                      <p className="text-xs font-bold text-[#424750] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Wrench className="w-3.5 h-3.5" /> Habilidades técnicas
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selected.skills.map(s => (
                          <span key={s}
                            className="px-3 py-1 bg-[#006d37] text-white text-xs font-semibold rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills blandas */}
                  {selected.softSkills.length > 0 && (
                    <div className="bg-[#f7f9fb] rounded-xl p-4">
                      <p className="text-xs font-bold text-[#424750] uppercase tracking-wider mb-3">
                        Habilidades blandas
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selected.softSkills.map(s => (
                          <span key={s}
                            className="px-3 py-1 bg-[#6bfe9c]/20 text-[#005228] text-xs font-semibold rounded-full border border-[#6bfe9c]/40">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA — ir a vacantes */}
                  <div className="bg-[#f7f9fb] rounded-xl p-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-sm text-[#191c1e]">¿Te interesa este candidato?</p>
                      <p className="text-xs text-[#737781] mt-0.5">
                        Publica una vacante y el candidato puede postularse, o marca un postulante como Seleccionado para crear un contrato.
                      </p>
                    </div>
                    <Link href="/dashboard/company/vacantes"
                      className="flex-shrink-0 flex items-center gap-2 bg-[#006d37] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition-all whitespace-nowrap">
                      Ver vacantes <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}