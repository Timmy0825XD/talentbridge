'use client';

import { useAuth } from '@/src/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/src/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { useCompanyJobs, queryKeys } from '@/src/hooks/queries';
import TalentBridgeLoader from "@/src/components/ui/TalentBridgeLoader";
import { publicLinks } from "@/src/content/site-links";
import {
  Plus, Users, TrendingUp, Clock, MoreVertical, CircleDot,
  CheckCircle2, XCircle, PauseCircle, ArrowUpRight, Edit2,
  Briefcase, Building2, AlertCircle,
} from 'lucide-react';
import JobForm from './_components/JobForm';
import { toast } from '@/src/lib/toast';

interface Job {
  id: string; title: string; description: string; type: string;
  status: string; workMode: string; area: string | null;
  budgetMin: number | null; budgetMax: number | null;
  createdAt: string; duration: string | null; deadline: string | null;
  deliverables: string | null; skills: string[];
  _count: { applications: number };
  rankConfig: {
    skillsWeight: number; experienceWeight: number; educationWeight: number;
    certsWeight: number; reputationWeight: number; languagesWeight: number; completionWeight: number;
  } | null;
}

const STATUS_META: Record<string, { label: string; color: string; bg: string; dot: string; icon: React.ReactNode; stripe: string }> = {
  ACTIVE:    { label: 'Activa',       color: 'text-[#005228]', bg: 'bg-[#6bfe9c]/20', dot: 'bg-[#006d37]', icon: <CircleDot className="w-3 h-3" />,   stripe: '#006d37' },
  SELECTING: { label: 'En selección', color: 'text-[#00386c]', bg: 'bg-[#a6c8ff]/20', dot: 'bg-[#1a4f8b]', icon: <PauseCircle className="w-3 h-3" />, stripe: '#1a4f8b' },
  CLOSED:    { label: 'Cerrada',      color: 'text-[#424750]', bg: 'bg-[#e6e8ea]',    dot: 'bg-[#737781]', icon: <CheckCircle2 className="w-3 h-3" />, stripe: '#737781' },
  CANCELLED: { label: 'Cancelada',    color: 'text-[#93000a]', bg: 'bg-[#ffdad6]',    dot: 'bg-[#ba1a1a]', icon: <XCircle className="w-3 h-3" />,      stripe: '#ba1a1a' },
};

const WORK_MODE_LABELS: Record<string, string> = { REMOTE: 'Remoto', ONSITE: 'Presencial', HYBRID: 'Híbrido' };
const TYPE_LABELS: Record<string, string>       = { FORMAL: 'Contrato formal', FREELANCE: 'Freelance' };
const FILTER_TABS = [
  { key: 'ALL', label: 'Todas' }, { key: 'ACTIVE', label: 'Activas' },
  { key: 'SELECTING', label: 'En selección' }, { key: 'CLOSED', label: 'Cerradas' }, { key: 'CANCELLED', label: 'Canceladas' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

export default function VacantesPage() {
  const { user, isLoading } = useAuth();
  const router      = useRouter();
  const queryClient = useQueryClient();
  const enabled     = !!user && user.role === 'COMPANY';
  const { data: jobsRaw=[], isLoading: loadingJobs, refetch } = useCompanyJobs(enabled, user?.userId);
  const jobs        = jobsRaw as Job[];

  const [showForm,     setShowForm]     = useState(false);
  const [editingJob,   setEditingJob]   = useState<Job|null>(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [openMenuId,   setOpenMenuId]   = useState<string|null>(null);

  useEffect(() => {
    if (!isLoading && user?.role !== 'COMPANY') router.replace('/dashboard/candidate');
  }, [user, isLoading, router]);

  async function handleStatusChange(jobId: string, status: string) {
    try {
      await api.patch(`/jobs/${jobId}/status`, { status });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.companyMine });
      toast.success(`Estado actualizado a "${STATUS_META[status]?.label}".`);
    } catch {
      toast.error('No se pudo cambiar el estado.');
    }
    setOpenMenuId(null);
  }

  function handleFormSuccess(msg: string) {
    setShowForm(false); setEditingJob(null);
    toast.success(msg);
    queryClient.invalidateQueries({ queryKey: queryKeys.jobs.companyMine });
  }

  const filtered        = activeFilter === 'ALL' ? jobs : jobs.filter(j => j.status === activeFilter);
  const totalApplicants = jobs.reduce((s,j) => s + j._count.applications, 0);
  const activeCount     = jobs.filter(j => j.status === 'ACTIVE').length;

  if (isLoading || !user) return <TalentBridgeLoader />;

  if (showForm) return (
    <JobForm
      editingJob={editingJob}
      onSuccess={() => handleFormSuccess(editingJob ? 'Vacante actualizada exitosamente.' : '¡Vacante publicada exitosamente!')}
      onCancel={() => { setShowForm(false); setEditingJob(null); }}
    />
  );

  return (
    <div className="min-h-screen bg-[#f7f9fb]">

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-r from-[#005228] via-[#006d37] to-[#00743a] overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="vac-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.8"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#vac-grid)" />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="relative max-w-screen-xl mx-auto px-8 py-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-[#6bfe9c] text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5" /> Mis vacantes
              </p>
              <h1 className="font-headline font-extrabold text-4xl text-white tracking-tight">Mis Vacantes</h1>
              <p className="text-white/60 text-sm mt-2">Gestiona tu pipeline de talento y oportunidades activas.</p>
            </div>
            <button onClick={() => { setEditingJob(null); setShowForm(true); }}
              className="flex items-center gap-2 bg-[#6bfe9c] text-[#00210c] px-6 py-3.5 rounded-2xl font-bold text-sm uppercase tracking-wider shadow-lg shadow-[#006d37]/20 hover:opacity-90 active:scale-95 transition-all">
              <Plus className="w-4 h-4" /> Nueva vacante
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-8 py-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Activas",      value: activeCount,                                   icon: <CircleDot className="w-5 h-5" />,  color: "text-[#006d37]", iconBg: "bg-[#6bfe9c]/20", sub: `${jobs.length} totales publicadas` },
            { label: "Postulantes",  value: totalApplicants,                               icon: <Users className="w-5 h-5" />,      color: "text-[#00386c]", iconBg: "bg-[#a6c8ff]/20", sub: "En todas tus vacantes" },
            { label: "En selección", value: jobs.filter(j=>j.status==='SELECTING').length, icon: <Clock className="w-5 h-5" />,      color: "text-[#7c5c00]", iconBg: "bg-[#fff3cd]",    sub: "Vacantes en proceso" },
          ].map(({ label, value, icon, color, iconBg, sub }) => (
            <div key={label} className="bg-white rounded-2xl border border-[#e6e8ea] p-6 hover:shadow-md hover:-translate-y-0.5 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-[#424750]">{label}</span>
                <div className={`w-9 h-9 rounded-full ${iconBg} flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>{icon}</div>
              </div>
              <p className="text-4xl font-extrabold font-headline text-[#191c1e]">{value}</p>
              <p className={`mt-2 flex items-center gap-1 ${color} text-xs font-semibold`}>
                <TrendingUp className="w-3 h-3" />{sub}
              </p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          {FILTER_TABS.map(tab => {
            const count = tab.key==='ALL' ? jobs.length : jobs.filter(j=>j.status===tab.key).length;
            return (
              <button key={tab.key} onClick={() => setActiveFilter(tab.key)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeFilter === tab.key ? 'bg-[#006d37] text-white shadow-md' : 'bg-white text-[#424750] border border-[#e6e8ea] hover:border-[#006d37]/20'
                }`}>
                {tab.label}
                <span className={`ml-1.5 text-xs ${activeFilter===tab.key?"opacity-70":"text-[#737781]"}`}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Grid vacantes */}
        {loadingJobs ? (
          <div className="flex justify-center py-20">
            <span className="w-8 h-8 border-2 border-[#006d37]/20 border-t-[#006d37] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(job => {
              const meta = STATUS_META[job.status];
              return (
                <div key={job.id}
                  className="group bg-white rounded-2xl border border-[#e6e8ea] overflow-hidden hover:shadow-xl hover:shadow-[#006d37]/8 hover:-translate-y-1 transition-all duration-300 flex flex-col relative">
                  {/* Color top bar based on status */}
                  <div className="h-1 w-full transition-all duration-300"
                    style={{ background: `${meta.stripe}` }} />

                  <div className="p-6 flex flex-col flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md"
                          style={{ background: `linear-gradient(135deg, ${meta.stripe}22, ${meta.stripe}11)`, border: `1px solid ${meta.stripe}30` }}>
                          <Briefcase className="w-5 h-5" style={{ color: meta.stripe }} />
                        </div>
                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${meta.bg} ${meta.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} ${job.status==='ACTIVE'?"animate-pulse":""}`} />
                          {meta.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditingJob(job); setShowForm(true); }}
                          className="p-1.5 text-[#737781] hover:text-[#006d37] hover:bg-[#006d37]/10 rounded-lg transition-colors" title="Editar">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <div className="relative">
                          <button onClick={() => setOpenMenuId(openMenuId===job.id?null:job.id)}
                            className="p-1.5 text-[#737781] hover:text-[#191c1e] hover:bg-[#f2f4f6] rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {openMenuId===job.id && (
                            <div className="absolute right-0 top-8 z-20 bg-white border border-[#e6e8ea] rounded-xl shadow-xl py-1 min-w-[160px]">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-[#737781] px-3 py-2">Cambiar estado</p>
                              {Object.entries(STATUS_META).map(([key, m]) => (
                                <button key={key} onClick={() => handleStatusChange(job.id, key)}
                                  className={`w-full text-left px-3 py-2 text-xs font-semibold transition-colors hover:bg-[#f7f9fb] flex items-center gap-2 ${m.color} ${job.status===key?"opacity-40 pointer-events-none":""}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />{m.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Title + meta */}
                    <h3 className="font-headline font-bold text-lg text-[#191c1e] mb-1 group-hover:text-[#006d37] transition-colors line-clamp-2 leading-tight">
                      {job.title}
                    </h3>
                    <p className="text-xs text-[#737781] mb-5 flex items-center gap-1.5 flex-wrap">
                      {TYPE_LABELS[job.type]} · {WORK_MODE_LABELS[job.workMode]}
                      {job.area && <><span>·</span>{job.area}</>}
                    </p>

                    {/* Stats row */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-[#f7f9fb] rounded-xl p-3">
                        <p className="text-[10px] text-[#737781] mb-0.5 font-semibold uppercase tracking-wider">Postulantes</p>
                        <p className="text-2xl font-extrabold font-headline text-[#191c1e]">{job._count.applications}</p>
                      </div>
                      <div className="bg-[#f7f9fb] rounded-xl p-3">
                        <p className="text-[10px] text-[#737781] mb-0.5 font-semibold uppercase tracking-wider">Publicada</p>
                        <p className="text-2xl font-extrabold font-headline text-[#191c1e]">{formatDate(job.createdAt)}</p>
                      </div>
                    </div>

                    {/* Budget */}
                    {job.budgetMin && (
                      <p className="text-xs font-semibold text-[#006d37] mb-4 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-[#006d37]" />
                        ${job.budgetMin.toLocaleString('es-CO')} — ${job.budgetMax?.toLocaleString('es-CO')} COP
                      </p>
                    )}

                    {/* Skills preview */}
                    {job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {job.skills.slice(0,3).map(s=>(
                          <span key={s} className="text-[9px] bg-[#006d37]/8 text-[#006d37] px-2 py-0.5 rounded font-bold">{s}</span>
                        ))}
                        {job.skills.length > 3 && <span className="text-[9px] text-[#737781]">+{job.skills.length-3}</span>}
                      </div>
                    )}

                    {/* Footer CTA */}
                    <div className="mt-auto pt-4 border-t border-[#f2f4f6] flex items-center justify-between">
                      <span className="text-xs text-[#737781]">
                        {job._count.applications > 0
                          ? `${job._count.applications} candidato${job._count.applications!==1?"s":""}`
                          : 'Sin postulantes aún'}
                      </span>
                      <Link href={`/dashboard/company/vacantes/${job.id}/postulantes`}
                        className="flex items-center gap-1 text-xs font-bold text-[#006d37] hover:underline underline-offset-4 group/link">
                        Ver postulantes
                        <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add card */}
            <div onClick={() => { setEditingJob(null); setShowForm(true); }}
              className="bg-white rounded-2xl border-2 border-dashed border-[#c2c6d1] flex flex-col items-center justify-center p-10 text-center min-h-[280px] cursor-pointer hover:border-[#006d37] hover:bg-[#f7f9fb] transition-all group">
              <div className="w-16 h-16 rounded-full bg-[#f2f4f6] flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#6bfe9c]/20 transition-all">
                <Plus className="w-7 h-7 text-[#006d37]" />
              </div>
              <h4 className="font-bold text-lg text-[#00386c] font-headline mb-1">¿Necesitas más talento?</h4>
              <p className="text-sm text-[#737781] max-w-[180px]">Publica una nueva vacante y empieza a recibir postulaciones hoy.</p>
            </div>
          </div>
        )}

        {/* Info footer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 pb-4">
          {[
            { icon: <Building2 className="w-4 h-4" />, title: "Para empresas", desc: "Cómo publicar vacantes y gestionar postulantes.", href: publicLinks.companies },
            { icon: <AlertCircle className="w-4 h-4" />, title: "Proceso de postulación", desc: "Cómo ven los candidatos tus vacantes.", href: publicLinks.processes.applications },
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