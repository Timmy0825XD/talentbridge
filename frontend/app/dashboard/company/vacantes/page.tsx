'use client';

import { useAuth } from '@/src/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/src/lib/api';
import { Plus, Users, TrendingUp, Clock, MoreVertical, CircleDot, CheckCircle2, XCircle, PauseCircle, ArrowUpRight, Edit2 } from 'lucide-react';
import JobForm from './_components/JobForm';

interface Job {
  id: string;
  title: string;
  type: string;
  status: string;
  workMode: string;
  area: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  createdAt: string;
  _count: { applications: number };
}

const STATUS_META: Record<string, { label: string; color: string; bg: string; dot: string; icon: React.ReactNode }> = {
  ACTIVE:    { label: 'Activa',       color: 'text-[#005228]', bg: 'bg-[#6bfe9c]/20', dot: 'bg-[#006d37]', icon: <CircleDot className="w-3 h-3" /> },
  SELECTING: { label: 'En selección', color: 'text-[#00386c]', bg: 'bg-[#a6c8ff]/20', dot: 'bg-[#1a4f8b]', icon: <PauseCircle className="w-3 h-3" /> },
  CLOSED:    { label: 'Cerrada',      color: 'text-[#424750]', bg: 'bg-[#e6e8ea]',    dot: 'bg-[#737781]', icon: <CheckCircle2 className="w-3 h-3" /> },
  CANCELLED: { label: 'Cancelada',    color: 'text-[#93000a]', bg: 'bg-[#ffdad6]',    dot: 'bg-[#ba1a1a]', icon: <XCircle className="w-3 h-3" /> },
};

const WORK_MODE_LABELS: Record<string, string> = {
  REMOTE: 'Remoto', ONSITE: 'Presencial', HYBRID: 'Híbrido',
};

const TYPE_LABELS: Record<string, string> = {
  FORMAL: 'Contrato formal', FREELANCE: 'Freelance',
};

const FILTER_TABS = [
  { key: 'ALL',       label: 'Todas' },
  { key: 'ACTIVE',    label: 'Activas' },
  { key: 'SELECTING', label: 'En selección' },
  { key: 'CLOSED',    label: 'Cerradas' },
  { key: 'CANCELLED', label: 'Canceladas' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}


export default function VacantesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [success, setSuccess] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && user?.role !== 'COMPANY') router.replace('/dashboard/candidate');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) loadJobs();
  }, [user]);

  async function loadJobs() {
    try {
      const res = await api.get('/jobs/company/mine');
      setJobs(res.data);
    } finally {
      setLoadingJobs(false);
    }
  }

  async function handleStatusChange(jobId: string, status: string) {
    try {
      await api.patch(`/jobs/${jobId}/status`, { status });
      loadJobs();
    } catch {}
    setOpenMenuId(null);
  }

  function handleFormSuccess(msg: string) {
    setShowForm(false);
    setEditingJob(null);
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 4000);
    loadJobs();
  }

  function handleCancel() {
    setShowForm(false);
    setEditingJob(null);
  }

  const filtered = activeFilter === 'ALL' ? jobs : jobs.filter(j => j.status === activeFilter);
  const totalApplicants = jobs.reduce((s, j) => s + j._count.applications, 0);
  const activeCount = jobs.filter(j => j.status === 'ACTIVE').length;

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
        <span className="w-8 h-8 border-2 border-[#006d37]/20 border-t-[#006d37] rounded-full animate-spin" />
      </div>
    );
  }

  if (showForm) {
    return (
      <JobForm
        editingJob={editingJob}
        onSuccess={() => handleFormSuccess(editingJob ? 'Vacante actualizada exitosamente.' : '¡Vacante publicada exitosamente!')}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-8 py-10">
      <div className="flex items-end justify-between mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-[#006d37] font-headline tracking-tight">Mis Vacantes</h1>
          <p className="text-[#424750] mt-1">Gestiona tu pipeline de talento y oportunidades activas.</p>
        </div>
        <button
          onClick={() => { setEditingJob(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-gradient-to-br from-[#006d37] to-[#00743a] text-white px-6 py-3.5 rounded-full font-bold text-sm uppercase tracking-wider shadow-lg shadow-[#006d37]/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Nueva vacante
        </button>
      </div>

      {success && (
        <div className="bg-[#6bfe9c]/20 text-[#005228] text-sm font-medium px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <div className="bg-white rounded-2xl border border-[#e6e8ea] p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#424750]">Activas</span>
            <div className="w-9 h-9 rounded-full bg-[#6bfe9c]/20 flex items-center justify-center">
              <CircleDot className="w-4 h-4 text-[#006d37]" />
            </div>
          </div>
          <div className="text-4xl font-extrabold font-headline">{activeCount}</div>
          <div className="mt-2 flex items-center gap-1 text-[#006d37] text-xs font-semibold">
            <TrendingUp className="w-3 h-3" />
            {jobs.length} totales publicadas
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e6e8ea] p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#424750]">Postulantes</span>
            <div className="w-9 h-9 rounded-full bg-[#a6c8ff]/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-[#00386c]" />
            </div>
          </div>
          <div className="text-4xl font-extrabold font-headline">{totalApplicants}</div>
          <div className="mt-2 text-[#424750] text-xs font-semibold">En todas tus vacantes</div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e6e8ea] p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#424750]">En selección</span>
            <div className="w-9 h-9 rounded-full bg-[#e6e8ea] flex items-center justify-center">
              <Clock className="w-4 h-4 text-[#424750]" />
            </div>
          </div>
          <div className="text-4xl font-extrabold font-headline">
            {jobs.filter(j => j.status === 'SELECTING').length}
          </div>
          <div className="mt-2 text-[#424750] text-xs font-semibold">Vacantes en proceso</div>
        </div>
      </div>


      <div className="flex gap-2 mb-8 flex-wrap">
        {FILTER_TABS.map(tab => {
          const count = tab.key === 'ALL' ? jobs.length : jobs.filter(j => j.status === tab.key).length;
          return (
            <button key={tab.key} onClick={() => setActiveFilter(tab.key)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                activeFilter === tab.key
                  ? 'bg-[#006d37] text-white shadow-md'
                  : 'bg-[#f2f4f6] text-[#424750] hover:bg-[#e6e8ea]'
              }`}>
              {tab.label}
              <span className={`ml-1.5 text-xs ${activeFilter === tab.key ? 'opacity-70' : 'text-[#737781]'}`}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>


      {loadingJobs ? (
        <div className="flex justify-center py-20">
          <span className="w-8 h-8 border-2 border-[#006d37]/20 border-t-[#006d37] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(job => {
            const meta = STATUS_META[job.status];
            return (
              <div key={job.id}
                className="bg-white rounded-2xl border border-[#e6e8ea] p-6 hover:shadow-lg hover:shadow-[#00386c]/5 transition-all group flex flex-col">

                <div className="flex items-start justify-between mb-5">
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${meta.bg} ${meta.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                    {meta.label}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditingJob(job); setShowForm(true); }}
                      className="p-1.5 text-[#737781] hover:text-[#006d37] hover:bg-[#006d37]/10 rounded-lg transition-colors"
                      title="Editar vacante"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === job.id ? null : job.id)}
                        className="p-1.5 text-[#737781] hover:text-[#191c1e] hover:bg-[#f2f4f6] rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenuId === job.id && (
                        <div className="absolute right-0 top-8 z-20 bg-white border border-[#e6e8ea] rounded-xl shadow-lg py-1 min-w-[160px]">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#737781] px-3 py-2">
                            Cambiar estado
                          </p>
                          {Object.entries(STATUS_META).map(([key, m]) => (
                            <button key={key}
                              onClick={() => handleStatusChange(job.id, key)}
                              className={`w-full text-left px-3 py-2 text-xs font-semibold transition-colors hover:bg-[#f7f9fb] flex items-center gap-2 ${m.color} ${job.status === key ? 'opacity-40 pointer-events-none' : ''}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
                              {m.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <h3 className="font-bold text-xl text-[#191c1e] font-headline mb-1 group-hover:text-[#00386c] transition-colors line-clamp-2">
                  {job.title}
                </h3>
                <p className="text-xs text-[#424750] mb-5">
                  {TYPE_LABELS[job.type]} · {WORK_MODE_LABELS[job.workMode]}
                  {job.area ? ` · ${job.area}` : ''}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-[#f7f9fb] rounded-xl p-3">
                    <p className="text-[10px] text-[#737781] mb-0.5">Postulantes</p>
                    <p className="text-2xl font-extrabold font-headline text-[#00386c]">{job._count.applications}</p>
                  </div>
                  <div className="bg-[#f7f9fb] rounded-xl p-3">
                    <p className="text-[10px] text-[#737781] mb-0.5">Publicada</p>
                    <p className="text-2xl font-extrabold font-headline text-[#00386c]">{formatDate(job.createdAt)}</p>
                  </div>
                </div>

                {job.budgetMin && (
                  <div className="text-xs text-[#424750] font-semibold mb-5">
                    ${job.budgetMin.toLocaleString('es-CO')} — ${job.budgetMax?.toLocaleString('es-CO')} COP
                  </div>
                )}

                <div className="mt-auto pt-4 border-t border-[#f2f4f6] flex items-center justify-between">
                  <span className="text-xs text-[#737781]">
                    {job._count.applications > 0
                      ? `${job._count.applications} candidato${job._count.applications !== 1 ? 's' : ''}`
                      : 'Sin postulantes aún'}
                  </span>
                  <Link
                    href={`/dashboard/company/vacantes/${job.id}/postulantes`}
                    className="flex items-center gap-1 text-xs font-bold text-[#006d37] hover:underline underline-offset-4 transition-all"
                  >
                    Ver postulantes
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}


          <div
            onClick={() => { setEditingJob(null); setShowForm(true); }}
            className="bg-white rounded-2xl border-2 border-dashed border-[#c2c6d1] flex flex-col items-center justify-center p-10 text-center min-h-[300px] cursor-pointer hover:border-[#006d37] hover:bg-[#f7f9fb] transition-all group"
          >
            <div className="w-16 h-16 rounded-full bg-[#f2f4f6] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-[#006d37]/10">
              <Plus className="w-7 h-7 text-[#006d37]" />
            </div>
            <h4 className="font-bold text-lg text-[#00386c] font-headline mb-1">¿Necesitas más talento?</h4>
            <p className="text-sm text-[#737781] max-w-[180px]">
              Publica una nueva vacante y empieza a recibir postulaciones hoy.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}