'use client';

import { useAuth } from '@/src/context/auth-context';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/src/lib/api';
import TalentBridgeLoader from "@/src/components/ui/TalentBridgeLoader";
import {
  ArrowLeft, Users, Star, TrendingUp, FileText, Mail, MapPin,
  GraduationCap, Briefcase, Award, CheckCircle2, XCircle, Clock,
  Eye, Loader2, UserCheck, BarChart3, Languages, Layers, BadgeCheck,
  Sparkles, AlertTriangle, ChevronRight, Search, ChevronLeft,
} from 'lucide-react';
import { toast } from '@/src/lib/toast';

interface ScoreBreakdown {
  skills: number; experience: number; education: number;
  certs: number; reputation: number; languages: number; completion: number;
}
interface ProfileScore { totalScore: number; breakdown: ScoreBreakdown; }
interface CandidateProfile {
  fullName: string | null; headline: string | null; bio: string | null;
  city: string | null; skills: string[]; softSkills: string[];
  languages: Record<string, string>[]; certifications: { name: string; issuer?: string; year?: number }[];
  cvUrl: string | null; profileScore: ProfileScore | null;
}
interface Applicant {
  id: string; status: string; scoreAtApply: number | null;
  aiReasons: string[]; aiGaps: string[]; createdAt: string;
  candidate: {
    id: string; user: { email: string }; fullName: string | null;
    headline: string | null; city: string | null; skills: string[];
    cvUrl: string | null; profileScore: ProfileScore | null;
  };
}
interface Job { id: string; title: string; area: string | null; skills: string[]; _count: { applications: number }; }

const STATUS_META: Record<string, { label: string; color: string; bg: string; dot: string; border: string }> = {
  RECEIVED:  { label: 'Recibida',     color: 'text-[#424750]', bg: 'bg-[#f2f4f6]',    dot: 'bg-[#737781]', border: 'border-[#e6e8ea]' },
  REVIEWING: { label: 'En revisión',  color: 'text-[#00386c]', bg: 'bg-[#a6c8ff]/20', dot: 'bg-[#1a4f8b]', border: 'border-[#a6c8ff]/30' },
  SELECTED:  { label: 'Seleccionado', color: 'text-[#005228]', bg: 'bg-[#6bfe9c]/20', dot: 'bg-[#006d37]', border: 'border-[#6bfe9c]/30' },
  REJECTED:  { label: 'Rechazado',    color: 'text-[#93000a]', bg: 'bg-[#ffdad6]',    dot: 'bg-[#ba1a1a]', border: 'border-[#ffdad6]' },
};

const BREAKDOWN_META: { key: keyof ScoreBreakdown; label: string; icon: React.ReactNode; color: string; bg: string }[] = [
  { key: 'skills',     label: 'Habilidades',  icon: <Layers className="w-3 h-3" />,        color: '#006d37', bg: '#6bfe9c22' },
  { key: 'experience', label: 'Experiencia',  icon: <Briefcase className="w-3 h-3" />,     color: '#1a4f8b', bg: '#a6c8ff22' },
  { key: 'education',  label: 'Educación',    icon: <GraduationCap className="w-3 h-3" />, color: '#424f60', bg: '#e6e8ea66' },
  { key: 'certs',      label: 'Certificados', icon: <Award className="w-3 h-3" />,          color: '#7c5c00', bg: '#fff3cd66' },
  { key: 'reputation', label: 'Reputación',   icon: <Star className="w-3 h-3" />,           color: '#8b1a4f', bg: '#fce7f388' },
  { key: 'languages',  label: 'Idiomas',      icon: <Languages className="w-3 h-3" />,      color: '#00536c', bg: '#cffafe44' },
  { key: 'completion', label: 'Completitud',  icon: <BadgeCheck className="w-3 h-3" />,     color: '#4f3a8b', bg: '#ede9fe44' },
];

const NEXT_STATUS: Record<string, string[]> = {
  RECEIVED: ['REVIEWING','REJECTED'], REVIEWING: ['SELECTED','REJECTED'],
  SELECTED: [], REJECTED: [],
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', { day:'numeric', month:'short', year:'numeric' });
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 75 ? { text:'text-[#005228]', bg:'bg-[#6bfe9c]/20', ring:'ring-[#006d37]/20' }
    : score >= 50 ? { text:'text-[#00386c]', bg:'bg-[#a6c8ff]/20', ring:'ring-[#00386c]/20' }
    : { text:'text-[#93000a]', bg:'bg-[#ffdad6]', ring:'ring-[#ba1a1a]/20' };
  return (
    <div className={`flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ring-2 ${color.bg} ${color.ring} flex-shrink-0`}>
      <span className={`text-base sm:text-lg font-extrabold font-headline leading-none ${color.text}`}>{Math.round(score)}</span>
      <span className={`text-[9px] font-bold uppercase tracking-wider ${color.text} opacity-70`}>pts</span>
    </div>
  );
}

function ScoreRing({ score, size=80 }: { score:number; size?:number }) {
  const r=size/2-6, circ=2*Math.PI*r, fill=(score/100)*circ;
  const color=score>=75?'#006d37':score>=50?'#1a4f8b':'#ba1a1a';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform:'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e6e8ea" strokeWidth={5} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${fill} ${circ-fill}`} strokeLinecap="round"
        style={{ transition:'stroke-dasharray 0.8s ease' }} />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        style={{ transform:`rotate(90deg)`, transformOrigin:`${size/2}px ${size/2}px`,
          fill:color, fontSize:size*0.22, fontWeight:800, fontFamily:'Manrope' }}>
        {score}
      </text>
    </svg>
  );
}

export default function PostulantesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const jobId  = params.id as string;

  const [job,           setJob]           = useState<Job|null>(null);
  const [applicants,    setApplicants]    = useState<Applicant[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [selected,      setSelected]      = useState<Applicant|null>(null);
  const [fullProfile,   setFullProfile]   = useState<CandidateProfile|null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [filterStatus,  setFilterStatus]  = useState('ALL');
  const [searchQuery,   setSearchQuery]   = useState('');
  // Mobile: 'list' | 'detail'
  const [mobileView,    setMobileView]    = useState<'list'|'detail'>('list');

  useEffect(() => {
    if (!isLoading && user?.role !== 'COMPANY') router.replace('/dashboard/candidate');
  }, [user, isLoading, router]);

  useEffect(() => { if (user) loadData(); }, [user, jobId]);

  async function loadData() {
    try {
      const [jobRes, appRes] = await Promise.all([api.get(`/jobs/${jobId}`), api.get(`/jobs/${jobId}/applicants`)]);
      setJob(jobRes.data);
      setApplicants(appRes.data);
      if (appRes.data.length > 0) selectApplicant(appRes.data[0]);
    } finally { setLoading(false); }
  }

  function selectApplicant(applicant: Applicant) {
    setSelected(applicant);
    setFullProfile({
      fullName: applicant.candidate.fullName, headline: applicant.candidate.headline,
      bio: null, city: applicant.candidate.city, skills: applicant.candidate.skills,
      softSkills: [], languages: [], certifications: [],
      cvUrl: applicant.candidate.cvUrl, profileScore: applicant.candidate.profileScore,
    });
  }

  function handleSelectMobile(applicant: Applicant) {
    selectApplicant(applicant);
    setMobileView('detail');
  }

  async function handleStatusChange(applicationId: string, newStatus: string) {
    setStatusLoading(true);
    try {
      await api.patch(`/applications/${applicationId}/status`, { status: newStatus });
      setApplicants(prev => prev.map(a => a.id === applicationId ? { ...a, status: newStatus } : a));
      if (selected?.id === applicationId) setSelected(prev => prev ? { ...prev, status: newStatus } : prev);
      toast.success(`Estado actualizado a "${STATUS_META[newStatus]?.label}".`);
    } catch {
      toast.error('No se pudo actualizar el estado.');
    } finally { setStatusLoading(false); }
  }

  const filtered = applicants
    .filter(a => filterStatus==='ALL' || a.status===filterStatus)
    .filter(a => !searchQuery || (a.candidate.fullName??'').toLowerCase().includes(searchQuery.toLowerCase())
      || (a.candidate.headline??'').toLowerCase().includes(searchQuery.toLowerCase()));

  if (isLoading || !user || loading) return <TalentBridgeLoader />;

  // ── Shared detail panel content ──────────────────────────────────────────────
  const DetailContent = () => !selected ? (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 sm:p-12">
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#f2f4f6] to-[#e6e8ea] flex items-center justify-center mb-4">
        <UserCheck className="w-8 h-8 sm:w-10 sm:h-10 text-[#c2c6d1]" />
      </div>
      <h3 className="font-bold text-lg sm:text-xl text-[#191c1e] font-headline mb-2">Selecciona un candidato</h3>
      <p className="text-sm text-[#737781] max-w-xs">Haz clic en cualquier postulante para ver su perfil completo.</p>
    </div>
  ) : (
    <>
      {/* Hero banner */}
      <div className="relative bg-gradient-to-r from-[#f7f9fb] to-white border-b border-[#f2f4f6] shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between px-4 sm:px-8 py-4 sm:py-5 gap-3">
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#006d37] to-[#1a4f8b] flex items-center justify-center text-white font-extrabold text-lg sm:text-2xl font-headline shadow-lg">
                {(selected.candidate.fullName ?? '?')[0].toUpperCase()}
              </div>
              {(selected.scoreAtApply ?? selected.candidate.profileScore?.totalScore ?? 0) >= 70 && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-[#006d37] text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  <CheckCircle2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-2xl font-extrabold text-[#191c1e] font-headline tracking-tight truncate">
                {selected.candidate.fullName ?? 'Sin nombre'}
              </h2>
              <p className="text-[#006d37] font-semibold text-xs sm:text-sm mt-0.5 truncate">
                {selected.candidate.headline ?? 'Sin titular'}
              </p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5">
                {selected.candidate.city && (
                  <span className="flex items-center gap-1 text-xs text-[#737781]">
                    <MapPin className="w-3 h-3" />{selected.candidate.city}
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-[#737781]">
                  <Clock className="w-3 h-3" />{formatDate(selected.createdAt)}
                </span>
                <span className="hidden sm:flex items-center gap-1 text-xs text-[#737781]">
                  <Mail className="w-3 h-3" />{selected.candidate.user?.email ?? '—'}
                </span>
                {selected.candidate.cvUrl && (
                  <a href={selected.candidate.cvUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-bold text-[#006d37] hover:underline bg-[#6bfe9c]/15 px-2 py-0.5 rounded-full border border-[#6bfe9c]/30">
                    <FileText className="w-3 h-3" /> CV
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            {(selected.scoreAtApply ?? selected.candidate.profileScore?.totalScore) != null && (
              <ScoreBadge score={selected.scoreAtApply ?? selected.candidate.profileScore!.totalScore} />
            )}
            <div className="flex flex-col gap-1.5 sm:gap-2">
              {NEXT_STATUS[selected.status]?.map(nextStatus => {
                const isPositive = nextStatus==='SELECTED'||nextStatus==='REVIEWING';
                return (
                  <button key={nextStatus} disabled={statusLoading}
                    onClick={() => handleStatusChange(selected.id, nextStatus)}
                    className={`flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 ${
                      isPositive
                        ? 'bg-gradient-to-br from-[#006d37] to-[#00743a] text-white shadow-md hover:opacity-90'
                        : 'border border-[#e6e8ea] text-[#737781] hover:bg-[#f2f4f6] hover:text-[#93000a] hover:border-[#ffdad6]'
                    }`}>
                    {statusLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                    {nextStatus==='REVIEWING' && <Eye className="w-3 h-3" />}
                    {nextStatus==='SELECTED'  && <CheckCircle2 className="w-3 h-3" />}
                    {nextStatus==='REJECTED'  && <XCircle className="w-3 h-3" />}
                    {STATUS_META[nextStatus].label}
                  </button>
                );
              })}
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold border ${STATUS_META[selected.status].bg} ${STATUS_META[selected.status].color} ${STATUS_META[selected.status].border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META[selected.status].dot}`} />
                {STATUS_META[selected.status].label}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">

          {/* Score breakdown */}
          {fullProfile?.profileScore && (
            <div className="bg-[#f7f9fb] rounded-2xl p-4 sm:p-5 border border-[#e6e8ea]">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-7 h-7 bg-[#006d37]/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-[#006d37]" />
                </div>
                <h3 className="font-bold text-[#191c1e] font-headline text-xs sm:text-sm">Análisis de compatibilidad</h3>
                <span className="ml-auto text-[10px] font-bold text-[#737781] bg-[#e6e8ea] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {Math.round(fullProfile.profileScore.totalScore)}pts
                </span>
              </div>
              <div className="flex gap-4 sm:gap-6">
                <div className="shrink-0 flex flex-col items-center justify-center">
                  <ScoreRing score={Math.round(fullProfile.profileScore.totalScore)} size={64} />
                  <p className="text-[10px] text-[#737781] mt-1 font-semibold">Puntaje</p>
                </div>
                <div className="flex-1 grid grid-cols-1 gap-1.5 sm:gap-2">
                  {BREAKDOWN_META.map(({ key, label, icon, color, bg }) => {
                    const val = fullProfile.profileScore!.breakdown[key] ?? 0;
                    const pct = Math.min(Math.round(val), 100);
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 w-24 sm:w-28 shrink-0">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                            <span style={{ color }}>{icon}</span>
                          </div>
                          <span className="text-[10px] sm:text-[11px] text-[#424750] font-medium truncate">{label}</span>
                        </div>
                        <div className="flex-1 h-1.5 sm:h-2 bg-[#e6e8ea] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width:`${pct}%`, background: color }} />
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-bold w-6 sm:w-7 text-right shrink-0" style={{ color }}>{pct}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* IA Assessment */}
          {((selected.aiReasons?.length > 0) || (selected.aiGaps?.length > 0)) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {selected.aiReasons?.length > 0 && (
                <div className="rounded-2xl border border-[#6bfe9c]/30 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 bg-[#6bfe9c]/10 border-b border-[#6bfe9c]/20">
                    <Sparkles className="w-4 h-4 text-[#006d37]" />
                    <h4 className="font-bold text-xs text-[#005228] uppercase tracking-widest">Fortalezas · IA</h4>
                  </div>
                  <ul className="p-3 sm:p-4 space-y-2 bg-white">
                    {selected.aiReasons.map((reason, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[#191c1e] leading-relaxed">
                        <div className="w-4 h-4 rounded-full bg-[#6bfe9c]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5 text-[#006d37]" />
                        </div>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {selected.aiGaps?.length > 0 && (
                <div className="rounded-2xl border border-[#ffdad6] overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 bg-[#ffdad6]/50 border-b border-[#ffdad6]">
                    <AlertTriangle className="w-4 h-4 text-[#ba1a1a]" />
                    <h4 className="font-bold text-xs text-[#93000a] uppercase tracking-widest">Brechas · IA</h4>
                  </div>
                  <ul className="p-3 sm:p-4 space-y-2 bg-white">
                    {selected.aiGaps.map((gap, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[#191c1e] leading-relaxed">
                        <div className="w-4 h-4 rounded-full bg-[#ffdad6] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <XCircle className="w-2.5 h-2.5 text-[#ba1a1a]" />
                        </div>
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Skills match */}
          {selected.candidate.skills.length > 0 && (
            <div className="rounded-2xl border border-[#e6e8ea] overflow-hidden">
              <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-[#f7f9fb] border-b border-[#e6e8ea]">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#006d37]" />
                  <h3 className="font-bold text-xs text-[#424750] uppercase tracking-widest">Skills vs. vacante</h3>
                </div>
                <span className="text-[11px] font-bold text-[#006d37] bg-[#6bfe9c]/15 px-2.5 py-1 rounded-full border border-[#6bfe9c]/25">
                  {selected.candidate.skills.filter(s => job?.skills.map(js=>js.toLowerCase()).includes(s.toLowerCase())).length}/{job?.skills.length??0} match
                </span>
              </div>
              <div className="p-4 sm:p-5 bg-white flex flex-wrap gap-1.5 sm:gap-2">
                {selected.candidate.skills.map(skill => {
                  const matches = job?.skills.map(s=>s.toLowerCase()).includes(skill.toLowerCase());
                  return (
                    <span key={skill} className={`flex items-center gap-1 text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border ${
                      matches ? 'bg-[#6bfe9c]/15 text-[#005228] border-[#6bfe9c]/30' : 'bg-[#f7f9fb] text-[#737781] border-[#e6e8ea]'
                    }`}>
                      {matches && <CheckCircle2 className="w-3 h-3" />}{skill}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Score al postularse */}
          {selected.scoreAtApply !== null && (
            <div className="flex items-center gap-3 bg-[#a6c8ff]/10 rounded-xl px-4 py-3 border border-[#a6c8ff]/25">
              <div className="w-8 h-8 bg-[#a6c8ff]/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-[#00386c]" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[#00386c] uppercase tracking-wider">Puntaje al postularse</p>
                <p className="text-xs text-[#424750] mt-0.5">
                  <span className="font-bold text-[#00386c]">{selected.scoreAtApply.toFixed(1)} pts</span> — No cambia aunque el perfil sea actualizado.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-[#f2f4f6] overflow-hidden">

      {/* ── Top header ── */}
      <div className="relative bg-gradient-to-r from-[#005228] via-[#006d37] to-[#00743a] shrink-0 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="pp-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.8"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#pp-grid)" />
        </svg>
        <div className="relative flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard/company/vacantes')}
              className="p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-colors text-white flex-shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <p className="text-[#6bfe9c] text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Revisión de postulantes</p>
              <h1 className="text-sm sm:text-xl font-extrabold text-white font-headline leading-tight truncate max-w-[180px] sm:max-w-none">
                {job?.title ?? 'Vacante'}
              </h1>
            </div>
          </div>
          {/* Stats — hidden on mobile to save space */}
          <div className="hidden sm:flex items-center gap-2">
            {[
              { label: "Total",         value: applicants.length,                                    bg: "bg-white/10 border-white/15 text-white" },
              { label: "Seleccionados", value: applicants.filter(a=>a.status==='SELECTED').length,   bg: "bg-[#6bfe9c]/20 border-[#6bfe9c]/30 text-[#6bfe9c]" },
              { label: "En revisión",   value: applicants.filter(a=>a.status==='REVIEWING').length,  bg: "bg-[#a6c8ff]/15 border-[#a6c8ff]/20 text-[#a6c8ff]" },
              { label: "Rechazados",    value: applicants.filter(a=>a.status==='REJECTED').length,   bg: "bg-white/5 border-white/10 text-white/60" },
            ].map(({ label, value, bg }) => (
              <div key={label} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-sm ${bg}`}>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</p>
                <p className="text-base font-extrabold font-headline leading-none">{value}</p>
              </div>
            ))}
          </div>
          {/* Mobile: compact stats */}
          <div className="flex sm:hidden items-center gap-1.5">
            <span className="bg-white/10 border border-white/15 text-white text-xs font-bold px-2.5 py-1 rounded-xl">
              {applicants.length} total
            </span>
            <span className="bg-[#6bfe9c]/20 border border-[#6bfe9c]/30 text-[#6bfe9c] text-xs font-bold px-2.5 py-1 rounded-xl">
              {applicants.filter(a=>a.status==='SELECTED').length} sel.
            </span>
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="flex sm:hidden border-t border-white/10">
          <button onClick={() => setMobileView('list')}
            className={`flex-1 py-2.5 text-xs font-bold transition-all ${mobileView==='list' ? 'bg-white/15 text-white' : 'text-white/60'}`}>
            Lista ({filtered.length})
          </button>
          <button onClick={() => setMobileView('detail')}
            className={`flex-1 py-2.5 text-xs font-bold transition-all ${mobileView==='detail' ? 'bg-white/15 text-white' : 'text-white/60'}`}>
            {selected ? selected.candidate.fullName?.split(' ')[0] ?? 'Detalle' : 'Detalle'}
          </button>
        </div>
      </div>

      {/* ── Desktop: side by side / Mobile: tab view ── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* ── LEFT: List ── */}
        <div className={`flex flex-col gap-3 p-3 sm:p-4 w-full sm:w-[320px] sm:shrink-0 overflow-hidden ${mobileView === 'detail' ? 'hidden sm:flex' : 'flex'}`}>
          {/* Search */}
          <div className="relative shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737781]" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar candidato..."
              className="w-full bg-white border border-[#e6e8ea] rounded-xl py-2.5 pl-9 pr-4 text-sm text-[#191c1e] placeholder:text-[#c2c6d1] outline-none focus:border-[#006d37] transition-all"
            />
          </div>

          {/* Filter pills — scroll horizontal */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide shrink-0">
            {[{k:'ALL',l:'Todos'},{k:'RECEIVED',l:'Recibidas'},{k:'REVIEWING',l:'Revisión'},{k:'SELECTED',l:'Selec.'},{k:'REJECTED',l:'Rechazo'}].map(({k,l}) => {
              const count = k==='ALL' ? applicants.length : applicants.filter(a=>a.status===k).length;
              return (
                <button key={k} onClick={() => setFilterStatus(k)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                    filterStatus===k ? 'bg-[#006d37] text-white shadow-sm' : 'bg-white border border-[#e6e8ea] text-[#424750]'
                  }`}>
                  {l} <span className="opacity-60">({count})</span>
                </button>
              );
            })}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 min-h-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center bg-white rounded-2xl border border-[#e6e8ea]">
                <Users className="w-8 h-8 text-[#c2c6d1] mb-2" />
                <p className="text-sm text-[#737781] font-medium">Sin resultados</p>
              </div>
            ) : filtered.map(applicant => {
              const meta    = STATUS_META[applicant.status];
              const score   = applicant.scoreAtApply ?? applicant.candidate.profileScore?.totalScore ?? null;
              const active  = selected?.id === applicant.id;
              const matched = applicant.candidate.skills.filter(s => job?.skills.map(js=>js.toLowerCase()).includes(s.toLowerCase())).length;

              return (
                <div key={applicant.id}
                  onClick={() => { selectApplicant(applicant); setMobileView('detail'); }}
                  className={`rounded-2xl p-3 sm:p-3.5 cursor-pointer transition-all border ${
                    active ? 'bg-white border-[#006d37] shadow-lg shadow-[#006d37]/10' : 'bg-white border-[#e6e8ea] hover:border-[#006d37]/20 hover:shadow-sm'
                  }`}>
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                      active ? 'bg-gradient-to-br from-[#006d37] to-[#00743a]' : 'bg-gradient-to-br from-[#424750] to-[#737781]'
                    }`}>
                      {(applicant.candidate.fullName ?? '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p className={`font-bold text-sm leading-tight truncate ${active?'text-[#006d37]':'text-[#191c1e]'}`}>
                          {applicant.candidate.fullName ?? 'Sin nombre'}
                        </p>
                        {score !== null && (
                          <span className={`shrink-0 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                            score>=75?'bg-[#6bfe9c]/20 text-[#005228]':score>=50?'bg-[#a6c8ff]/20 text-[#00386c]':'bg-[#ffdad6] text-[#93000a]'
                          }`}>{score.toFixed(0)}</span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#737781] truncate">{applicant.candidate.headline ?? 'Sin titular'}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${meta.bg} ${meta.color} ${meta.border}`}>
                          <span className={`w-1 h-1 rounded-full ${meta.dot}`} />{meta.label}
                        </span>
                        <span className="text-[10px] text-[#737781] font-semibold">{matched}/{job?.skills.length??0} skills</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#c2c6d1] shrink-0 mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT: Detail ── */}
        <div className={`flex-1 bg-white overflow-hidden flex flex-col min-w-0 sm:rounded-none sm:border-l sm:border-[#e6e8ea] ${mobileView === 'list' ? 'hidden sm:flex' : 'flex'}`}>
          {/* Mobile back button */}
          {mobileView === 'detail' && selected && (
            <button onClick={() => setMobileView('list')}
              className="flex sm:hidden items-center gap-2 px-4 py-3 text-xs font-bold text-[#006d37] border-b border-[#f2f4f6] bg-[#f7f9fb]">
              <ChevronLeft className="w-4 h-4" /> Volver a la lista
            </button>
          )}
          <DetailContent />
        </div>
      </div>
    </div>
  );
}