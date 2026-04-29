'use client';

import { useAuth } from '@/src/context/auth-context';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/src/lib/api';
import {ArrowLeft, Users, Star, TrendingUp, FileText, Mail, MapPin,GraduationCap, Briefcase, Award,CheckCircle2, XCircle, Clock, Eye, Loader2, UserCheck,BarChart3, Languages, Layers, BadgeCheck,} from 'lucide-react';

interface ScoreBreakdown {
  skills: number;
  experience: number;
  education: number;
  certs: number;
  reputation: number;
  languages: number;
  completion: number;
}

interface ProfileScore {
  totalScore: number;
  breakdown: ScoreBreakdown;
}

interface CandidateProfile {
  fullName: string | null;
  headline: string | null;
  bio: string | null;
  city: string | null;
  skills: string[];
  softSkills: string[];
  languages: Record<string, string>[];
  certifications: { name: string; issuer?: string; year?: number }[];
  cvUrl: string | null;
  profileScore: ProfileScore | null;
}

interface Applicant {
  id: string;
  status: string;
  scoreAtApply: number | null;
  createdAt: string;
  candidate: {
    id: string;
    user: { email: string };
    fullName: string | null;
    headline: string | null;
    city: string | null;
    skills: string[];
    cvUrl: string | null;
    profileScore: ProfileScore | null;
  };
}

interface Job {
  id: string;
  title: string;
  area: string | null;
  skills: string[];
  _count: { applications: number };
}


const STATUS_META: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  RECEIVED:  { label: 'Recibida',    color: 'text-[#424750]', bg: 'bg-[#e6e8ea]',    dot: 'bg-[#737781]' },
  REVIEWING: { label: 'En revisión', color: 'text-[#00386c]', bg: 'bg-[#a6c8ff]/20', dot: 'bg-[#1a4f8b]' },
  SELECTED:  { label: 'Seleccionado',color: 'text-[#005228]', bg: 'bg-[#6bfe9c]/20', dot: 'bg-[#006d37]' },
  REJECTED:  { label: 'Rechazado',   color: 'text-[#93000a]', bg: 'bg-[#ffdad6]',    dot: 'bg-[#ba1a1a]' },
};

const BREAKDOWN_META: { key: keyof ScoreBreakdown; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'skills',     label: 'Habilidades',  icon: <Layers className="w-3.5 h-3.5" />,     color: '#006d37' },
  { key: 'experience', label: 'Experiencia',  icon: <Briefcase className="w-3.5 h-3.5" />,  color: '#1a4f8b' },
  { key: 'education',  label: 'Educación',    icon: <GraduationCap className="w-3.5 h-3.5" />, color: '#424f60' },
  { key: 'certs',      label: 'Certificados', icon: <Award className="w-3.5 h-3.5" />,       color: '#7c5c00' },
  { key: 'reputation', label: 'Reputación',   icon: <Star className="w-3.5 h-3.5" />,        color: '#8b1a4f' },
  { key: 'languages',  label: 'Idiomas',      icon: <Languages className="w-3.5 h-3.5" />,   color: '#00536c' },
  { key: 'completion', label: 'Completitud',  icon: <BadgeCheck className="w-3.5 h-3.5" />,  color: '#4f3a8b' },
];

const NEXT_STATUS: Record<string, string[]> = {
  RECEIVED:  ['REVIEWING', 'REJECTED'],
  REVIEWING: ['SELECTED', 'REJECTED'],
  SELECTED:  [],
  REJECTED:  [],
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const r = (size / 2) - 6;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 75 ? '#006d37' : score >= 50 ? '#1a4f8b' : '#ba1a1a';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e6e8ea" strokeWidth={5} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={5}
        strokeDasharray={`${fill} ${circ - fill}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
      <text
        x={size/2} y={size/2}
        textAnchor="middle" dominantBaseline="central"
        style={{ transform: `rotate(90deg) translateX(0)`, transformOrigin: `${size/2}px ${size/2}px`, fill: color, fontSize: size * 0.22, fontWeight: 800, fontFamily: 'Manrope' }}
      >
        {score}
      </text>
    </svg>
  );
}


export default function PostulantesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob]               = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState<Applicant | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [filterStatus, setFilterStatus]   = useState('ALL');
  const [success, setSuccess]       = useState('');

  const [fullProfile, setFullProfile] = useState<CandidateProfile | null>(null);

  useEffect(() => {
    if (!isLoading && user?.role !== 'COMPANY') router.replace('/dashboard/candidate');
  }, [user, isLoading, router]);

  useEffect(() => { if (user) loadData() }, [user, jobId]);

  async function loadData() {
    try {
      const [jobRes, appRes] = await Promise.all([
        api.get(`/jobs/${jobId}`),
        api.get(`/jobs/${jobId}/applicants`),
      ]);
      setJob(jobRes.data);
      setApplicants(appRes.data);
      if (appRes.data.length > 0) selectApplicant(appRes.data[0]);
    } finally {
      setLoading(false);
    }
  }

  async function selectApplicant(applicant: Applicant) {
    setSelected(applicant);
    setFullProfile(null);
    setDetailLoading(true);
    try {
      const res = await api.get(`/ranking/${applicant.candidate.user ? applicant.candidate.id : applicant.candidate.id}`);
      setFullProfile({
        fullName:       applicant.candidate.fullName,
        headline:       applicant.candidate.headline,
        bio:            null,
        city:           applicant.candidate.city,
        skills:         applicant.candidate.skills,
        softSkills:     [],
        languages:      [],
        certifications: [],
        cvUrl:          applicant.candidate.cvUrl,
        profileScore:   res.data?.score ?? applicant.candidate.profileScore,
      });
    } catch {
      setFullProfile({
        fullName:       applicant.candidate.fullName,
        headline:       applicant.candidate.headline,
        bio:            null,
        city:           applicant.candidate.city,
        skills:         applicant.candidate.skills,
        softSkills:     [],
        languages:      [],
        certifications: [],
        cvUrl:          applicant.candidate.cvUrl,
        profileScore:   applicant.candidate.profileScore,
      });
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleStatusChange(applicationId: string, newStatus: string) {
    setStatusLoading(true);
    try {
      await api.patch(`/applications/${applicationId}/status`, { status: newStatus });
      setApplicants(prev =>
        prev.map(a => a.id === applicationId ? { ...a, status: newStatus } : a)
      );
      if (selected?.id === applicationId) setSelected(prev => prev ? { ...prev, status: newStatus } : prev);
      setSuccess(`Estado actualizado a "${STATUS_META[newStatus]?.label}".`);
      setTimeout(() => setSuccess(''), 3500);
    } catch {}
    finally { setStatusLoading(false); }
  }

  const filtered = filterStatus === 'ALL' ? applicants : applicants.filter(a => a.status === filterStatus);

  const matchedSkills = (skills: string[]) => job ? skills.filter(s => job.skills.map(js => js.toLowerCase()).includes(s.toLowerCase())) : [];

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
        <span className="w-8 h-8 border-2 border-[#006d37]/20 border-t-[#006d37] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-[#f7f9fb] overflow-hidden">
      <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-[#e6e8ea] shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard/company/vacantes')} className="p-2 hover:bg-[#f2f4f6] rounded-xl transition-colors text-[#424750]">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-[#191c1e] font-headline leading-tight"> {job?.title ?? 'Vacante'} </h1>
            <p className="text-sm text-[#737781] mt-0.5">
              <span className="font-semibold text-[#006d37]">{applicants.length}</span> postulante{applicants.length !== 1 ? 's' : ''} en total
              {job?.area ? ` · ${job.area}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#6bfe9c]/20 text-[#005228] px-4 py-2 rounded-full text-xs font-bold">
            <Users className="w-3.5 h-3.5" />
            {applicants.filter(a => a.status === 'SELECTED').length} seleccionados
          </div>
          <div className="flex items-center gap-1.5 bg-[#a6c8ff]/20 text-[#00386c] px-4 py-2 rounded-full text-xs font-bold">
            <Eye className="w-3.5 h-3.5" />
            {applicants.filter(a => a.status === 'REVIEWING').length} en revisión
          </div>
        </div>
      </div>

      {success && (
        <div className="mx-8 mt-4 bg-[#6bfe9c]/20 text-[#005228] text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2 shrink-0">
          <CheckCircle2 className="w-4 h-4" />
          {success}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden px-8 py-6 gap-6 min-h-0">
        <div className="w-[340px] shrink-0 flex flex-col gap-3">
          <div className="flex gap-1.5 flex-wrap">
            {['ALL', 'RECEIVED', 'REVIEWING', 'SELECTED', 'REJECTED'].map(s => {
              const count = s === 'ALL' ? applicants.length : applicants.filter(a => a.status === s).length;
              const meta  = s !== 'ALL' ? STATUS_META[s] : null;
              return (
                <button key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    filterStatus === s
                      ? 'bg-[#006d37] text-white shadow-sm'
                      : 'bg-white border border-[#e6e8ea] text-[#424750] hover:bg-[#f7f9fb]'
                  }`}>
                  {s === 'ALL' ? 'Todos' : meta?.label} ({count})
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <Users className="w-10 h-10 text-[#c2c6d1] mb-3" />
                <p className="text-sm text-[#737781] font-medium">Sin postulantes en este estado</p>
              </div>
            ) : (
              filtered.map(applicant => {
                const meta  = STATUS_META[applicant.status];
                const score = applicant.scoreAtApply ?? applicant.candidate.profileScore?.totalScore ?? null;
                const isActive = selected?.id === applicant.id;
                const matched = matchedSkills(applicant.candidate.skills);

                return (
                  <div key={applicant.id}
                    onClick={() => selectApplicant(applicant)}
                    className={`rounded-xl p-4 cursor-pointer transition-all border ${
                      isActive
                        ? 'bg-white border-[#006d37] shadow-md shadow-[#006d37]/10'
                        : 'bg-white border-[#e6e8ea] hover:border-[#c2c6d1] hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#006d37] to-[#1a4f8b] flex items-center justify-center text-white font-bold text-base shrink-0">
                        {(applicant.candidate.fullName ?? '?')[0].toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className={`font-bold text-sm leading-tight truncate ${isActive ? 'text-[#006d37]' : 'text-[#191c1e]'}`}>
                            {applicant.candidate.fullName ?? 'Sin nombre'}
                          </h3>
                          {score !== null && (
                            <span className={`shrink-0 text-xs font-extrabold px-2 py-0.5 rounded-full ${
                              score >= 75 ? 'bg-[#6bfe9c]/20 text-[#005228]'
                              : score >= 50 ? 'bg-[#a6c8ff]/20 text-[#00386c]'
                              : 'bg-[#ffdad6] text-[#93000a]'
                            }`}>
                              {score.toFixed(0)}pts
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[#424750] truncate mt-0.5">
                          {applicant.candidate.headline ?? 'Sin titular'}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                            {meta.label}
                          </span>
                          <span className="text-[10px] text-[#737781]">
                            {matched.length}/{job?.skills.length ?? 0} skills
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl border border-[#e6e8ea] overflow-hidden flex flex-col min-w-0">
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <div className="w-20 h-20 rounded-full bg-[#f2f4f6] flex items-center justify-center mb-4">
                <UserCheck className="w-9 h-9 text-[#c2c6d1]" />
              </div>
              <h3 className="font-bold text-lg text-[#191c1e] font-headline">Selecciona un candidato</h3>
              <p className="text-sm text-[#737781] mt-1 max-w-xs">
                Haz clic en cualquier postulante para ver su perfil completo y gestionar su estado.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-8 py-4 border-b border-[#f2f4f6] bg-white/95 backdrop-blur-sm shrink-0">
                <div className="flex gap-2 flex-wrap">
                  {NEXT_STATUS[selected.status]?.map(nextStatus => {
                    const meta = STATUS_META[nextStatus];
                    const isPositive = nextStatus === 'SELECTED' || nextStatus === 'REVIEWING';
                    return (
                      <button key={nextStatus}
                        disabled={statusLoading}
                        onClick={() => handleStatusChange(selected.id, nextStatus)}
                        className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-50 ${
                          isPositive
                            ? 'bg-gradient-to-br from-[#006d37] to-[#00743a] text-white shadow-lg shadow-[#006d37]/20 hover:opacity-90'
                            : 'border border-[#e6e8ea] text-[#424750] hover:bg-[#f7f9fb]'
                        }`}>
                        {statusLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                        {nextStatus === 'REVIEWING' && <Eye className="w-3.5 h-3.5" />}
                        {nextStatus === 'SELECTED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {nextStatus === 'REJECTED' && <XCircle className="w-3.5 h-3.5" />}
                        {meta.label}
                      </button>
                    );
                  })}
                </div>

                <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold ${STATUS_META[selected.status].bg} ${STATUS_META[selected.status].color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META[selected.status].dot}`} />
                  {STATUS_META[selected.status].label}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {detailLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <span className="w-7 h-7 border-2 border-[#006d37]/20 border-t-[#006d37] rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="p-8 space-y-8 max-w-3xl mx-auto">
                    <div className="flex items-start gap-6">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#006d37] to-[#1a4f8b] flex items-center justify-center text-white font-extrabold text-3xl font-headline shrink-0">
                        {(selected.candidate.fullName ?? '?')[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-3xl font-extrabold text-[#191c1e] font-headline tracking-tight">
                          {selected.candidate.fullName ?? 'Sin nombre'}
                        </h2>
                        <p className="text-[#006d37] font-semibold mt-1">
                          {selected.candidate.headline ?? 'Sin titular'}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-[#424750]">
                          {selected.candidate.city && (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-[#737781]" />
                              {selected.candidate.city}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-4 h-4 text-[#737781]" />
                            {selected.candidate.user?.email ?? '—'}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-[#737781]" />
                            Postulado el {formatDate(selected.createdAt)}
                          </span>
                          {selected.candidate.cvUrl && (
                            <a href={selected.candidate.cvUrl} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-[#006d37] font-semibold hover:underline underline-offset-2">
                              <FileText className="w-4 h-4" />
                              Ver CV
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {fullProfile?.profileScore && (
                      <div className="bg-[#f7f9fb] rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-5">
                          <BarChart3 className="w-5 h-5 text-[#006d37]" />
                          <h3 className="font-bold text-[#191c1e] font-headline">Análisis de compatibilidad</h3>
                        </div>

                        <div className="flex items-center gap-8">
                          <div className="flex flex-col items-center shrink-0">
                            <ScoreRing score={Math.round(fullProfile.profileScore.totalScore)} size={90} />
                            <p className="text-xs text-[#737781] mt-2 font-semibold">Puntaje global</p>
                          </div>

                          <div className="flex-1 grid grid-cols-1 gap-2.5">
                            {BREAKDOWN_META.map(({ key, label, icon, color }) => {
                              const val = fullProfile.profileScore!.breakdown[key] ?? 0;
                              return (
                                <div key={key} className="flex items-center gap-3">
                                  <div className="flex items-center gap-1.5 w-32 shrink-0">
                                    <span style={{ color }}>{icon}</span>
                                    <span className="text-xs text-[#424750] font-medium">{label}</span>
                                  </div>
                                  <div className="flex-1 h-1.5 bg-[#e6e8ea] rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full transition-all duration-700"
                                      style={{ width: `${Math.min(val, 100)}%`, backgroundColor: color }}
                                    />
                                  </div>
                                  <span className="text-xs font-bold w-8 text-right" style={{ color }}>
                                    {val.toFixed(0)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {job && selected.candidate.skills.length > 0 && (
                          <div className="mt-5 pt-5 border-t border-[#e6e8ea]">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#424750] mb-3">
                              Skills coincidentes con la vacante
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {selected.candidate.skills.map(skill => {
                                const matches = job.skills.map(s => s.toLowerCase()).includes(skill.toLowerCase());
                                return (
                                  <span key={skill}
                                    className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                                      matches
                                        ? 'bg-[#6bfe9c]/20 text-[#005228] ring-1 ring-[#006d37]/20'
                                        : 'bg-[#f2f4f6] text-[#424750]'
                                    }`}>
                                    {matches && <span className="mr-1">✓</span>}
                                    {skill}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!fullProfile?.profileScore && selected.candidate.skills.length > 0 && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-[#424750] mb-3">Habilidades</p>
                        <div className="flex flex-wrap gap-2">
                          {selected.candidate.skills.map(skill => {
                            const matches = job?.skills.map(s => s.toLowerCase()).includes(skill.toLowerCase());
                            return (
                              <span key={skill}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                                  matches
                                    ? 'bg-[#6bfe9c]/20 text-[#005228]'
                                    : 'bg-[#f2f4f6] text-[#424750]'
                                }`}>
                                {skill}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {selected.scoreAtApply !== null && (
                      <div className="bg-[#a6c8ff]/10 rounded-xl px-5 py-4 flex items-center gap-3 border border-[#a6c8ff]/30">
                        <TrendingUp className="w-5 h-5 text-[#00386c] shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-[#00386c]">Puntaje al momento de postularse</p>
                          <p className="text-sm text-[#424750] mt-0.5">
                            {selected.scoreAtApply.toFixed(1)} puntos — este valor no cambia aunque el perfil sea actualizado después.
                          </p>
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}