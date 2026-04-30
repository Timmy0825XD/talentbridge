"use client";

import { useAuth } from "@/src/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/src/lib/api";
import { Briefcase, Users, ArrowRight, ChevronRight, Building2, CircleDot, Clock, CheckCircle2, AlertCircle } from "lucide-react";

interface Job {
  id: string;
  title: string;
  type: string;
  status: string;
  workMode: string;
  area: string | null;
  createdAt: string;
  _count: { applications: number };
}

interface TopCandidate {
  id: string;
  fullName: string | null;
  headline: string | null;
  skills: string[];
  profileScore: { totalScore: number };
}

interface DashboardData {
  jobs: Job[];
  topCandidates: TopCandidate[];
}


function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (days > 0)  return `hace ${days} día${days > 1 ? "s" : ""}`;
  if (hours > 0) return `hace ${hours} hora${hours > 1 ? "s" : ""}`;
  return `hace ${mins} min`;
}


export default function CompanyDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [data, setData]         = useState<DashboardData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    if (!isLoading && user && user.role !== "COMPANY") { router.replace("/dashboard/candidate") }
  }, [user, isLoading, router]);

  useEffect(() => { if (user) loadDashboard() }, [user]);

  async function loadDashboard() {
    setLoading(true);
    setError("");
    try {
      const jobsRes = await api.get<Job[]>("/jobs/company/mine");
      const jobs = jobsRes.data;

      const activeJobs = jobs.filter(j => j.status === "ACTIVE").slice(0, 3);

      let topCandidates: TopCandidate[] = [];

      if (activeJobs.length > 0) {
        const results = await Promise.allSettled(
          activeJobs.map(j => api.get(`/jobs/${j.id}/applicants`))
        );

        const seen = new Set<string>();
        for (const r of results) {
          if (r.status === "fulfilled") {
            for (const applicant of r.value.data) {
              const cid = applicant.candidate?.id;
              if (cid && !seen.has(cid)) {
                seen.add(cid);
                topCandidates.push({
                  id:           cid,
                  fullName:     applicant.candidate.fullName,
                  headline:     applicant.candidate.headline,
                  skills:       applicant.candidate.skills ?? [],
                  profileScore: {totalScore: applicant.scoreAtApply ?? 0},
                });
              }
            }
          }
        }

        topCandidates = topCandidates
          .sort((a, b) => (b.profileScore?.totalScore ?? 0) - (a.profileScore?.totalScore ?? 0))
          .slice(0, 3);
      }

      setData({ jobs, topCandidates });
    } catch {
      setError("No se pudo cargar el dashboard. Intenta recargar la página.");
    } finally {
      setLoading(false);
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
        <span className="w-8 h-8 border-2 border-[#006d37]/20 border-t-[#006d37] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f7f9fb] text-center px-8">
        <AlertCircle className="w-10 h-10 text-[#ba1a1a]" />
        <p className="text-[#93000a] font-semibold">{error}</p>
        <button
          onClick={loadDashboard}
          className="px-6 py-2 bg-[#006d37] text-white rounded-full text-sm font-bold hover:opacity-90 transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const jobs = data?.jobs ?? [];
  const topCandidates = data?.topCandidates ?? [];
  const activeJobs = jobs.filter(j => j.status === "ACTIVE");
  const selectingJobs = jobs.filter(j => j.status === "SELECTING");
  const totalApplicants = jobs.reduce((sum, j) => sum + j._count.applications, 0);
  const recentJobs = [...jobs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <main className="pb-20 px-8 pt-8 max-w-screen-2xl mx-auto">
      <section className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-headline font-extrabold text-[#006d37] tracking-tight mb-4"> ¡Bienvenido de vuelta! </h1>
          <p className="text-[#424750] text-lg leading-relaxed">
            {activeJobs.length > 0 ? (
              <>
                Tienes{" "}
                <span className="text-[#006d37] font-bold">
                  {activeJobs.length} vacante{activeJobs.length !== 1 ? "s" : ""} activa{activeJobs.length !== 1 ? "s" : ""}
                </span>{" "}
                y{" "}
                <span className="text-[#006d37] font-bold">
                  {totalApplicants} postulante{totalApplicants !== 1 ? "s" : ""}
                </span>{" "}
                en tu pipeline.
              </>
            ) : (
              "Publica tu primera vacante y empieza a recibir postulaciones hoy."
            )}
          </p>
        </div>
        <Link
          href="/dashboard/company/vacantes"
          className="bg-gradient-to-br from-[#006d37] to-[#00743a] text-white px-8 py-4 rounded-full font-semibold uppercase tracking-wider flex items-center gap-3 shadow-xl shadow-[#006d37]/20 hover:scale-[1.02] active:scale-95 transition-all text-sm"
        >
          <Briefcase className="w-5 h-5" />
          Gestionar vacantes
        </Link>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">

        <div className="bg-[#f2f4f6] rounded-2xl p-8 flex flex-col justify-between">
          <Briefcase className="w-7 h-7 text-[#006d37]" />
          <div>
            <h3 className="font-medium text-xs tracking-widest uppercase mb-1 mt-4 text-[#424750]">
              Vacantes activas
            </h3>
            <p className="text-4xl font-headline font-extrabold text-[#191c1e]">
              {activeJobs.length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 flex flex-col justify-between border border-[#e6e8ea]">
          <Users className="w-7 h-7 text-[#006d37]" />
          <div>
            <h3 className="font-medium text-xs tracking-widest uppercase mb-1 mt-4 text-[#424750]">
              Total postulantes
            </h3>
            <p className="text-4xl font-headline font-extrabold text-[#191c1e]">
              {totalApplicants}
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 bg-gradient-to-br from-[#006d37] to-[#00743a] rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-[#006d37]/20 rounded-full blur-[100px]" />

          <div className="relative z-10">
            <Clock className="w-7 h-7 text-white" />
            <h3 className="font-medium text-xs tracking-widest uppercase mb-1 mt-4 text-white">
              En selección
            </h3>
            <p className="text-4xl font-headline font-extrabold text-white">
              {selectingJobs.length}
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-white">
              <CircleDot className="w-4 h-4" />
              <span>
                {selectingJobs.length > 0
                  ? `Vacante${selectingJobs.length !== 1 ? "s" : ""} en proceso activo`
                  : "Sin vacantes en selección aún"}
              </span>
            </div>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <section className="lg:col-span-7">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-headline font-bold text-[#191c1e] tracking-tight"> Vacantes recientes </h2>
            <Link href="/dashboard/company/vacantes" className="text-[#006d37] font-semibold text-sm hover:underline flex items-center gap-1">
              Ver todas <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentJobs.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-[#c2c6d1] p-12 text-center">
              <Briefcase className="w-10 h-10 text-[#c2c6d1] mx-auto mb-3" />
              <h3 className="font-bold text-[#191c1e] font-headline mb-1">Sin vacantes publicadas</h3>
              <p className="text-sm text-[#737781] mb-5"> Publica tu primera vacante para empezar a recibir postulaciones.</p>
              <Link
                href="/dashboard/company/vacantes"
                className="inline-flex items-center gap-2 bg-[#006d37] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition"
              >
                <Briefcase className="w-4 h-4" /> Publicar vacante
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentJobs.map((job, i) => {
                const statusLabel: Record<string, string> = {
                  ACTIVE: "Activa", SELECTING: "En selección",
                  CLOSED: "Cerrada", CANCELLED: "Cancelada",
                };
                const statusColor: Record<string, string> = {
                  ACTIVE:    "bg-[#6bfe9c]/30 text-[#00743a]",
                  SELECTING: "bg-[#a6c8ff]/30 text-[#00386c]",
                  CLOSED:    "bg-[#e6e8ea] text-[#424750]",
                  CANCELLED: "bg-[#ffdad6] text-[#93000a]",
                };

                return (
                  <div
                    key={job.id}
                    className={`group rounded-2xl p-8 transition-all duration-300 ${
                      i === 0 ? "bg-white hover:bg-[#f7f9fb] border border-[#e6e8ea]" : "bg-[#f2f4f6]"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-xl font-headline font-bold text-[#191c1e] group-hover:text-[#006d37] transition-colors">
                          {job.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColor[job.status]}`}>
                            {statusLabel[job.status]}
                          </span>
                          <span className="text-[#424750] text-sm">
                            {{ REMOTE: "Remoto", ONSITE: "Presencial", HYBRID: "Híbrido" }[job.workMode]}
                          </span>
                          {job.area && ( <span className="text-[#737781] text-sm">· {job.area}</span>)}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-2xl font-headline font-bold text-[#191c1e]"> {job._count.applications} </p>
                        <p className="text-[10px] font-bold text-[#424750] uppercase tracking-tighter"> Postulantes </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-[#eceef0]">
                      <p className="text-sm text-[#424750] italic"> Publicada {timeAgo(job.createdAt)} </p>
                      <Link
                        href={`/dashboard/company/vacantes/${job.id}/postulantes`}
                        className="p-3 bg-[#f2f4f6] rounded-xl text-[#00386c] hover:bg-[#00386c] hover:text-white transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>


        <section className="lg:col-span-5 space-y-8">
          <div className="bg-[#e6e8ea] rounded-[2rem] p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-headline font-bold text-[#191c1e] tracking-tight"> Top candidatos </h2>
            </div>

            {topCandidates.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-10 h-10 text-[#c2c6d1] mx-auto mb-3" />
                <p className="text-sm text-[#737781] font-medium"> Aún no hay postulantes en tus vacantes activas. </p>
              </div>
            ) : (
              <div className="space-y-4">
                {topCandidates.map((candidate) => {
                  const score = candidate.profileScore?.totalScore ?? 0;
                  const scoreColor = score >= 75 ? "#006d37" : score >= 50 ? "#1a4f8b" : "#ba1a1a";
                  const circ = 113;
                  const offset = circ - (score / 100) * circ;

                  return (
                    <div
                      key={candidate.id}
                      className="flex items-center gap-5 p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-white/50 hover:shadow-lg transition-all cursor-pointer"
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#006d37] to-[#1a4f8b] flex items-center justify-center">
                          <span className="text-white font-black text-lg"> {(candidate.fullName ?? "?")[0].toUpperCase()} </span>
                        </div>

                        {score >= 70 && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#006d37] text-white rounded-full flex items-center justify-center border-2 border-white">
                            <CheckCircle2 className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[#191c1e]"> {candidate.fullName ?? "Sin nombre"} </h4>
                        <p className="text-xs text-[#424750] mb-2 truncate"> {candidate.headline ?? "Sin titular"} </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {candidate.skills.slice(0, 2).map((skill) => (
                            <span key={skill} className="text-[10px] bg-[#00386c]/10 text-[#00386c] px-2 py-0.5 rounded font-bold"> {skill} </span>
                          ))}
                          {candidate.skills.length > 2 && (
                            <span className="text-[10px] text-[#737781]"> +{candidate.skills.length - 2} </span>
                          )}
                        </div>
                      </div>

                      <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 40 40">
                          <circle cx="20" cy="20" r="18" fill="transparent" stroke="#e6e8ea" strokeWidth="2" />
                          <circle cx="20" cy="20" r="18" fill="transparent" stroke={scoreColor} strokeWidth="2" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"/>
                        </svg>
                        <span className="text-[10px] font-bold" style={{ color: scoreColor }}> {Math.round(score)} </span>
                      </div>
                    </div>
                  );
                })}

                <Link
                  href="/dashboard/company/vacantes"
                  className="block w-full py-4 border-2 border-dashed border-[#c2c6d1]/40 rounded-xl text-[#424750] font-semibold text-sm hover:border-[#00386c]/40 hover:text-[#00386c] transition-all text-center"
                >
                  Ver más candidatos
                </Link>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-[#006d37] to-[#00743a] rounded-[2rem] p-10 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-2xl font-headline font-extrabold mb-3"> Completa tu perfil </h3>
              <p className="text-[#6bfe9c]/90 mb-6 text-sm leading-relaxed">
                Las empresas con perfil completo reciben un 40% más de postulaciones
                de candidatos calificados. Agrega tu información corporativa ahora.
              </p>
              <Link
                href="/profile/company"
                className="inline-flex items-center gap-2 bg-white text-[#006d37] px-6 py-3 rounded-full font-bold text-sm tracking-tight hover:shadow-xl transition-all"
              >
                <Building2 className="w-4 h-4" />
                Completar perfil de empresa
              </Link>
            </div>
            <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white/5 rounded-full group-hover:scale-110 transition-transform duration-700" />
          </div>
        </section>
      </div>
    </main>
  );
}