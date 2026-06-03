"use client";

import { useAuth } from "@/src/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import api from "@/src/lib/api";
import { useCandidateProfile, useKeywords, useUniversities } from "@/src/hooks/queries";
import InfoCallout from "@/src/components/info/InfoCallout";
import UniversitySelect from "@/src/components/profile/UniversitySelect";
import {
  ArrowLeft, Save, Upload, X, FileText, User, GraduationCap,
  Briefcase, Wrench, Plus, Globe, Award, FolderGit2, Camera,
  Loader2, ChevronRight, Bell, BellOff,
} from "lucide-react";
import { toast } from '@/src/lib/toast';

interface Keyword      { id: string; name: string; type: string; }
interface Certification { name: string; issuer: string; year: string; }
interface Project       { name: string; description: string; url: string; }
interface Language      { language: string; level: string; }

const EMPTY_KEYWORDS: Keyword[] = [];

const EMPTY_FORM = {
  fullName:            "",
  phone:               "",
  summary:             "",
  career:              "",
  universityId:        null as string | null,
  semester:            "",
  graduationYear:      "",
  workMode:            "remote" as "remote" | "onsite" | "hybrid",
  salaryExpected:      "",
  skills:              [] as string[],
  softSkills:          [] as string[],
  languages:           [] as Language[],
  certifications:      [] as Certification[],
  projects:            [] as Project[],
  cvUrl:               "",
  photoUrl:            "",
  notificationsEnabled: true,
};

const LANGUAGE_LEVELS = ["Básico", "Intermedio", "Avanzado", "Nativo"];

const NAV_SECTIONS = [
  { id: "hero",     label: "Mi perfil",             icon: User },
  { id: "academic", label: "Información académica", icon: GraduationCap },
  { id: "work",     label: "Preferencias",          icon: Briefcase },
  { id: "skills",   label: "Habilidades",           icon: Wrench },
  { id: "langs",    label: "Idiomas",               icon: Globe },
  { id: "certs",    label: "Certificaciones",       icon: Award },
  { id: "projects", label: "Proyectos",             icon: FolderGit2 },
  { id: "cv",       label: "Hoja de vida",          icon: FileText },
  { id: "notifs",   label: "Notificaciones",        icon: Bell },
];

function SkillInput({ value, onChange, onAdd, placeholder, suggestions }: {
  value: string; onChange: (v: string) => void;
  onAdd: (v: string) => void; placeholder: string; suggestions: Keyword[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const filtered = value.trim().length > 0
    ? suggestions.filter(k => k.name.toLowerCase().includes(value.toLowerCase())).slice(0, 7)
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="flex gap-2">
        <input type="text" value={value}
          onChange={e => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (value.trim()) { onAdd(value.trim()); setOpen(false); }
            }
          }}
          placeholder={placeholder}
          className="flex-1 bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#006d37] focus:ring-0 rounded-xl px-4 py-3 text-sm text-[#191c1e] placeholder:text-[#b0b4bc] outline-none transition-all" />
        <button type="button"
          onClick={() => { if (value.trim()) { onAdd(value.trim()); setOpen(false); } }}
          className="px-5 py-2.5 bg-[#00386c] text-white rounded-xl font-semibold text-sm hover:bg-[#1a4f8b] transition-colors">
          +
        </button>
      </div>
      {open && (filtered.length > 0 || value.trim()) && (
        <div className="absolute z-30 mt-1.5 w-full bg-white border border-[#e6e8ea] rounded-2xl shadow-xl overflow-hidden">
          {filtered.map(k => (
            <button key={k.id} type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => { onAdd(k.name); onChange(""); setOpen(false); }}
              className="w-full text-left px-4 py-3 text-sm text-[#191c1e] hover:bg-[#f7f9fb] transition-colors flex items-center justify-between group">
              <span className="font-medium">{k.name}</span>
              <span className="text-[10px] text-[#737781] bg-[#f2f4f6] px-2 py-0.5 rounded-full font-bold uppercase">
                {k.type === "TECHNICAL" ? "Técnica" : "Blanda"}
              </span>
            </button>
          ))}
          {value.trim() && !filtered.some(k => k.name.toLowerCase() === value.toLowerCase()) && (
            <button type="button" onMouseDown={e => e.preventDefault()}
              onClick={() => { onAdd(value.trim()); onChange(""); setOpen(false); }}
              className="w-full text-left px-4 py-3 text-sm text-[#006d37] font-semibold hover:bg-[#f7f9fb] transition-colors border-t border-[#f2f4f6] flex items-center gap-2">
              <Plus className="w-3.5 h-3.5" /> Agregar &quot;{value.trim()}&quot;
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function CandidateProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm]                     = useState(EMPTY_FORM);
  const [skillInput, setSkillInput]         = useState("");
  const [softInput, setSoftInput]           = useState("");
  const [saving, setSaving]                 = useState(false);
  const [uploading, setUploading]           = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  // Toggle notificaciones
  const [togglingNotifs, setTogglingNotifs] = useState(false);

  const { data: profileData } = useCandidateProfile(!!user, user?.userId);
  const { data: keywordsData } = useKeywords(!!user);
  const { data: universitiesData } = useUniversities(!!user);
  const keywords = (keywordsData as Keyword[] | undefined) ?? EMPTY_KEYWORDS;
  const universities = universitiesData ?? [];

  useEffect(() => {
    if (!isLoading && !user) router.replace("/auth/login");
    if (!isLoading && user?.role === "COMPANY") router.replace("/profile/company");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!profileData) return;
    const d = profileData;
    setForm({
      fullName:       d.fullName       ?? "",
      phone:          d.phone          ?? "",
      summary:        d.summary        ?? "",
      career:         d.career         ?? "",
      universityId:   d.universityId   ?? d.university?.id ?? null,
      semester:       d.semester       != null ? String(d.semester) : "",
      graduationYear: d.graduationYear != null ? String(d.graduationYear) : "",
      workMode:       d.workMode       ?? "remote",
      salaryExpected: d.salaryExpected != null ? String(d.salaryExpected) : "",
      skills:         d.skills         ?? [],
      softSkills:     d.softSkills     ?? [],
      languages:      d.languages      ?? [],
      certifications: (d.certifications ?? []).map((c: Certification) => ({
        name: c.name ?? "", issuer: c.issuer ?? "", year: c.year != null ? String(c.year) : "",
      })),
      projects: (d.projects ?? []).map((p: Project) => ({
        name: p.name ?? "", description: p.description ?? "", url: p.url ?? "",
      })),
      cvUrl:               d.cvUrl               ?? "",
      photoUrl:            d.photoUrl            ?? "",
      notificationsEnabled: d.notificationsEnabled ?? true,
    });
  }, [profileData]);

  function set<K extends keyof typeof EMPTY_FORM>(field: K, value: typeof EMPTY_FORM[K]) {
    setForm(prev => ({ ...prev, [field]: value }));
  }
  function addSkill(tag: string, field: "skills" | "softSkills") {
    if (!tag || form[field].includes(tag)) return;
    set(field, [...form[field], tag]);
  }
  function removeSkill(tag: string, field: "skills" | "softSkills") {
    set(field, form[field].filter(t => t !== tag));
  }
  function addLanguage() { set("languages", [...form.languages, { language: "", level: "Básico" }]); }
  function updateLanguage(i: number, f: keyof Language, v: string) {
    set("languages", form.languages.map((l, idx) => idx === i ? { ...l, [f]: v } : l));
  }
  function removeLanguage(i: number) { set("languages", form.languages.filter((_, idx) => idx !== i)); }
  function addCert() { set("certifications", [...form.certifications, { name: "", issuer: "", year: "" }]); }
  function updateCert(i: number, f: keyof Certification, v: string) {
    set("certifications", form.certifications.map((c, idx) => idx === i ? { ...c, [f]: v } : c));
  }
  function removeCert(i: number) { set("certifications", form.certifications.filter((_, idx) => idx !== i)); }
  function addProject() { set("projects", [...form.projects, { name: "", description: "", url: "" }]); }
  function updateProject(i: number, f: keyof Project, v: string) {
    set("projects", form.projects.map((p, idx) => idx === i ? { ...p, [f]: v } : p));
  }
  function removeProject(i: number) { set("projects", form.projects.filter((_, idx) => idx !== i)); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload: Record<string, unknown> = {
      fullName:      form.fullName,
      phone:         form.phone         || undefined,
      summary:       form.summary       || undefined,
      career:        form.career        || undefined,
      universityId:  form.universityId  || null,
      workMode:      form.workMode,
      salaryExpected: form.salaryExpected ? Number(form.salaryExpected) : undefined,
      skills:        form.skills,
      softSkills:    form.softSkills,
      languages:     form.languages.filter(l => l.language.trim()),
      certifications: form.certifications.filter(c => c.name.trim()).map(c => ({
        ...c, year: c.year ? Number(c.year) : undefined,
      })),
      projects: form.projects.filter(p => p.name.trim()),
    };
    if (user?.role === "STUDENT"  && form.semester)       payload.semester       = Number(form.semester);
    if (user?.role === "GRADUATE" && form.graduationYear) payload.graduationYear = Number(form.graduationYear);
  try {
    await api.put("/profile/candidate", payload);
    toast.success('Perfil guardado correctamente.');
  } catch (err: unknown) {
    const e = err as { response?: { data?: { error?: string } } };
    toast.error(e.response?.data?.error ?? 'Error al guardar el perfil.');
  } finally { setSaving(false); }
  }

  async function handleCvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Solo se permiten archivos PDF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("El archivo no puede superar 5MB.");
      return;
    }
    setUploading(true);
    const fd = new FormData(); fd.append("cv", file);
  try {
    const res = await api.post("/profile/candidate/cv", fd, { headers: { "Content-Type": "multipart/form-data" } });
    set("cvUrl", res.data.cvUrl ?? "");
    toast.success('CV subido exitosamente.');
    if (fileInputRef.current) fileInputRef.current.value = "";
  } catch (err: unknown) {
    const e = err as { response?: { data?: { error?: string } } };
    toast.error(e.response?.data?.error ?? 'Error al subir el archivo.');
  } finally { setUploading(false); }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Solo JPG, PNG o WebP.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("La imagen no puede superar 2MB.");
      return;
    }
    setPhotoUploading(true);
    const fd = new FormData(); fd.append("photo", file);
    try {
      const res = await api.post("/profile/candidate/photo", fd, { headers: { "Content-Type": "multipart/form-data" } });
      set("photoUrl", res.data.photoUrl ?? "");
      toast.success('Foto actualizada.');
      if (photoInputRef.current) photoInputRef.current.value = "";
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error ?? 'Error al subir la foto.');
    } finally { setPhotoUploading(false); }
  }

  // FIX P3: toggle notificaciones vía endpoint dedicado
  async function handleToggleNotifications() {
    const newValue = !form.notificationsEnabled;
    setTogglingNotifs(true);
    try {
      await api.patch("/notifications/preferences", { enabled: newValue });
      set("notificationsEnabled", newValue);
      toast.success(newValue ? 'Notificaciones activadas.' : 'Notificaciones desactivadas.');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error ?? 'Error al actualizar preferencias.');
    } finally { setTogglingNotifs(false); }
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
        <span className="w-8 h-8 border-2 border-[#00386c]/20 border-t-[#00386c] rounded-full animate-spin" />
      </div>
    );
  }

  const inp = "w-full bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#006d37] focus:ring-0 rounded-xl px-4 py-3 text-sm text-[#191c1e] placeholder:text-[#b0b4bc] outline-none transition-all";
  const lbl = "block text-xs font-bold uppercase tracking-widest text-[#737781] mb-2";
  const techKeywords = keywords.filter(k => k.type === "TECHNICAL");
  const softKeywords = keywords.filter(k => k.type === "SOFT");

  const selectedUniversityName = universities.find(u => u.id === form.universityId)?.name
    ?? (profileData?.university?.name ?? null);

  const totalFields  = 8;
  const filledFields = [
    form.fullName, form.summary, form.career, form.universityId,
    form.skills.length > 0, form.cvUrl, form.photoUrl,
    form.certifications.length > 0 || form.projects.length > 0,
  ].filter(Boolean).length;
  const profilePct = Math.round((filledFields / totalFields) * 100);

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      {/* Hero banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#00386c] to-[#1a4f8b]">
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path d="M44.7,-76.4C58.3,-69.2,70.1,-57.4,77.6,-43.3C85.2,-29.2,88.4,-12.7,86.6,3.3C84.8,19.3,77.9,34.7,68.2,48.2C58.5,61.7,46,73.3,31.4,78.1C16.8,82.9,0.1,80.9,-16.1,76.4C-32.3,71.9,-48.1,64.9,-60.1,53.2C-72.1,41.5,-80.4,25,-82.9,7.6C-85.3,-9.8,-82,-28.1,-72.4,-42.1C-62.7,-56.1,-46.8,-65.8,-31.6,-72.1C-16.4,-78.4,-1.8,-81.4,14.6,-80.6C30.9,-79.8,44.7,-76.4,44.7,-76.4Z" fill="#FFFFFF" transform="translate(100 100)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-screen-xl mx-auto px-8 py-12">
          <Link href="/dashboard/candidate"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm font-semibold mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver al dashboard
          </Link>

          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            <div className="relative flex-shrink-0">
              <div className="w-36 h-36 rounded-3xl border-4 border-white/20 overflow-hidden shadow-2xl">
                {form.photoUrl ? (
                  <img src={form.photoUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/10 flex items-center justify-center">
                    <User className="w-16 h-16 text-white/40" />
                  </div>
                )}
              </div>
              <button type="button" onClick={() => photoInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#6bfe9c] text-[#005228] rounded-full flex items-center justify-center shadow-lg hover:bg-[#4ae183] transition-colors"
                title="Cambiar foto">
                <Camera className="w-4 h-4" />
              </button>
              <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoUpload} disabled={photoUploading} className="hidden" />
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-[#6bfe9c]/20 text-[#6bfe9c] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-3">
                {user.role === "STUDENT" ? "Estudiante" : "Egresado"} · Disponible
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2 font-headline">
                {form.fullName || "Tu nombre aquí"}
              </h1>
              <p className="text-white/60 text-lg font-medium">
                {form.career || "Carrera"}{selectedUniversityName ? ` · ${selectedUniversityName}` : ""}
              </p>
              <div className="flex flex-wrap gap-3 mt-6 justify-center md:justify-start">
                {form.cvUrl && (
                  <a href={form.cvUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#6bfe9c] text-[#005228] px-6 py-2.5 rounded-full font-bold text-sm hover:opacity-90 transition-all active:scale-95">
                    <FileText className="w-4 h-4" /> Ver CV
                  </a>
                )}
                <button type="button" onClick={() => photoInputRef.current?.click()}
                  disabled={photoUploading}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-6 py-2.5 rounded-full font-bold text-sm border border-white/20 hover:bg-white/20 transition-all active:scale-95 disabled:opacity-50">
                  {photoUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                  {photoUploading ? "Subiendo..." : "Cambiar foto"}
                </button>
              </div>
            </div>

            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="42" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                  <circle cx="48" cy="48" r="42" fill="transparent"
                    stroke="#6bfe9c" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - profilePct / 100)}`}
                    style={{ transition: "stroke-dashoffset 0.8s ease" }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white">{profilePct}%</span>
                  <span className="text-[9px] font-bold text-[#6bfe9c] uppercase tracking-tighter">Perfil</span>
                </div>
              </div>
              <p className="text-white/50 text-xs text-center max-w-[120px]">
                Completa tu perfil para mayor visibilidad
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sidebar */}
        <aside className="lg:col-span-3 space-y-4 lg:sticky lg:top-6 self-start">
          <nav className="bg-white rounded-2xl border border-[#e6e8ea] overflow-hidden shadow-sm">
            <p className="px-5 pt-5 pb-3 text-[10px] font-black uppercase tracking-widest text-[#b0b4bc]">Secciones</p>
            {NAV_SECTIONS.map(({ id, label, icon: Icon }) => (
              <a key={id} href={`#${id}`}
                className="flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-[#424750] hover:bg-[#f7f9fb] hover:text-[#00386c] transition-colors border-t border-[#f7f9fb] group">
                <span className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-[#b0b4bc] group-hover:text-[#006d37] transition-colors" />
                  {label}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#c2c6d1] group-hover:text-[#00386c] transition-colors" />
              </a>
            ))}
          </nav>

          <div className="bg-white rounded-2xl border border-[#e6e8ea] p-5 shadow-sm space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#b0b4bc]">Resumen</p>
            {[
              { label: "Skills técnicas", value: form.skills.length },
              { label: "Skills blandas",  value: form.softSkills.length },
              { label: "Certificaciones", value: form.certifications.length },
              { label: "Proyectos",       value: form.projects.length },
              { label: "Idiomas",         value: form.languages.length },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-[#737781] font-medium">{label}</span>
                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                  value > 0 ? "bg-[#6bfe9c]/20 text-[#005228]" : "bg-[#f2f4f6] text-[#c2c6d1]"
                }`}>{value}</span>
              </div>
            ))}
          </div>

          <InfoCallout
            title="Entiende tu score"
            description="Tu puntuación se calcula según habilidades, experiencia, educación y más. Sube tu % completando tu perfil."
            href="/info/candidatos"
            linkLabel="Saber más"
          />
        </aside>

        {/* Contenido principal */}
        <div className="lg:col-span-9 space-y-6">

          <form id="hero" onSubmit={handleSave} className="space-y-6">

            {/* Información básica */}
            <div className="bg-white rounded-3xl border border-[#e6e8ea] overflow-hidden shadow-sm">
              <div className="bg-[#f7f9fb] px-8 py-5 border-b border-[#e6e8ea] flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#00386c] flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-black text-[#191c1e] text-base font-headline">Información básica</h2>
                  <p className="text-xs text-[#737781]">Tu nombre y presentación profesional</p>
                </div>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={lbl}>Nombre completo <span className="text-[#ba1a1a]">*</span></label>
                  <input type="text" required value={form.fullName}
                    onChange={e => set("fullName", e.target.value)}
                    placeholder="e.j. Juan Mario López Guerra" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Teléfono</label>
                  <input type="tel" value={form.phone}
                    onChange={e => set("phone", e.target.value)}
                    placeholder="e.j. 3001234567" className={inp} />
                </div>
                <div className="md:col-span-2">
                  <label className={lbl}>Resumen profesional</label>
                  <textarea rows={4} value={form.summary}
                    onChange={e => set("summary", e.target.value)}
                    placeholder="Cuéntale a las empresas quién eres y qué puedes ofrecerles..."
                    className={`${inp} resize-none`} />
                </div>
              </div>
            </div>

            {/* Información académica */}
            <div id="academic" className="bg-white rounded-3xl border border-[#e6e8ea] overflow-hidden shadow-sm">
              <div className="bg-[#f7f9fb] px-8 py-5 border-b border-[#e6e8ea] flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#006d37] flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-black text-[#191c1e] text-base font-headline">Información académica</h2>
                  <p className="text-xs text-[#737781]">Tu formación universitaria</p>
                </div>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={lbl}>Universidad</label>
                  <UniversitySelect
                    value={form.universityId}
                    onChange={id => set("universityId", id)}
                    universities={universities}
                    placeholder="Buscar universidad..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={lbl}>Carrera</label>
                  <input type="text" value={form.career}
                    onChange={e => set("career", e.target.value)}
                    placeholder="e.j. Ingeniería de Sistemas" className={inp} />
                </div>
                {user.role === "STUDENT" && (
                  <div>
                    <label className={lbl}>Semestre actual</label>
                    <input type="number" min={1} max={12} value={form.semester}
                      onChange={e => set("semester", e.target.value)}
                      placeholder="e.j. 7" className={inp} />
                  </div>
                )}
                {user.role === "GRADUATE" && (
                  <div>
                    <label className={lbl}>Año de graduación</label>
                    <input type="number" min={2000} max={new Date().getFullYear()} value={form.graduationYear}
                      onChange={e => set("graduationYear", e.target.value)}
                      placeholder="e.j. 2023" className={inp} />
                  </div>
                )}
              </div>
            </div>

            {/* Preferencias laborales */}
            <div id="work" className="bg-white rounded-3xl border border-[#e6e8ea] overflow-hidden shadow-sm">
              <div className="bg-[#f7f9fb] px-8 py-5 border-b border-[#e6e8ea] flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#00386c] flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-black text-[#191c1e] text-base font-headline">Preferencias laborales</h2>
                  <p className="text-xs text-[#737781]">Cómo y cuánto quieres trabajar</p>
                </div>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={lbl}>Modalidad</label>
                  <select value={form.workMode}
                    onChange={e => set("workMode", e.target.value as typeof form.workMode)}
                    className={`${inp} cursor-pointer`}>
                    <option value="remote">Remoto</option>
                    <option value="hybrid">Híbrido</option>
                    <option value="onsite">Presencial</option>
                  </select>
                </div>
                <div>
                  <label className={lbl}>Pretensión salarial (COP)</label>
                  <input type="number" min={0} value={form.salaryExpected}
                    onChange={e => set("salaryExpected", e.target.value)}
                    placeholder="e.j. 1500000" className={inp} />
                </div>
              </div>
            </div>

            {/* Habilidades */}
            <div id="skills" className="bg-white rounded-3xl border border-[#e6e8ea] overflow-hidden shadow-sm">
              <div className="bg-[#f7f9fb] px-8 py-5 border-b border-[#e6e8ea] flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#006d37] flex items-center justify-center">
                  <Wrench className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-black text-[#191c1e] text-base font-headline">Habilidades</h2>
                  <p className="text-xs text-[#737781]">Escribe para ver sugerencias o agrega nuevas</p>
                </div>
              </div>
              <div className="p-8 space-y-8">
                <div>
                  <label className={lbl}>Habilidades técnicas</label>
                  <SkillInput value={skillInput} onChange={setSkillInput}
                    onAdd={tag => { addSkill(tag, "skills"); setSkillInput(""); }}
                    placeholder="e.j. React, Node.js, Python..." suggestions={techKeywords} />
                  {form.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {form.skills.map(tag => (
                        <span key={tag}
                          className="flex items-center gap-1.5 bg-[#00386c] text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                          {tag}
                          <button type="button" onClick={() => removeSkill(tag, "skills")}
                            className="hover:text-[#ffdad6] transition-colors ml-0.5">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="border-t border-[#f2f4f6] pt-6">
                  <label className={lbl}>Habilidades blandas</label>
                  <SkillInput value={softInput} onChange={setSoftInput}
                    onAdd={tag => { addSkill(tag, "softSkills"); setSoftInput(""); }}
                    placeholder="e.j. Trabajo en equipo, Liderazgo..." suggestions={softKeywords} />
                  {form.softSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {form.softSkills.map(tag => (
                        <span key={tag}
                          className="flex items-center gap-1.5 bg-[#6bfe9c]/20 text-[#005228] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#6bfe9c]/40">
                          {tag}
                          <button type="button" onClick={() => removeSkill(tag, "softSkills")}
                            className="hover:text-[#ba1a1a] transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Idiomas */}
            <div id="langs" className="bg-white rounded-3xl border border-[#e6e8ea] overflow-hidden shadow-sm">
              <div className="bg-[#f7f9fb] px-8 py-5 border-b border-[#e6e8ea] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#00386c] flex items-center justify-center">
                    <Globe className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="font-black text-[#191c1e] text-base font-headline">Idiomas</h2>
                    <p className="text-xs text-[#737781]">Idiomas que manejas y nivel</p>
                  </div>
                </div>
                <button type="button" onClick={addLanguage}
                  className="flex items-center gap-1.5 bg-[#00386c] text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-[#1a4f8b] transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Agregar
                </button>
              </div>
              <div className="p-8">
                {form.languages.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-[#e6e8ea] rounded-2xl">
                    <Globe className="w-10 h-10 text-[#c2c6d1] mx-auto mb-3" />
                    <p className="text-sm text-[#737781] font-medium">Agrega los idiomas que manejas</p>
                    <button type="button" onClick={addLanguage}
                      className="mt-4 text-sm font-bold text-[#00386c] hover:underline flex items-center gap-1 mx-auto">
                      <Plus className="w-3.5 h-3.5" /> Agregar idioma
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {form.languages.map((lang, i) => (
                      <div key={i} className="flex items-end gap-4 p-4 bg-[#f7f9fb] rounded-2xl">
                        <div className="flex-1">
                          <label className={lbl}>Idioma</label>
                          <input type="text" value={lang.language}
                            onChange={e => updateLanguage(i, "language", e.target.value)}
                            placeholder="e.j. Inglés, Francés..." className={inp} />
                        </div>
                        <div className="w-40">
                          <label className={lbl}>Nivel</label>
                          <select value={lang.level}
                            onChange={e => updateLanguage(i, "level", e.target.value)}
                            className={`${inp} cursor-pointer`}>
                            {LANGUAGE_LEVELS.map(l => <option key={l}>{l}</option>)}
                          </select>
                        </div>
                        <button type="button" onClick={() => removeLanguage(i)}
                          className="mb-1 p-2.5 text-[#737781] hover:text-[#ba1a1a] hover:bg-[#ffdad6] rounded-xl transition-colors flex-shrink-0">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Certificaciones */}
            <div id="certs" className="bg-white rounded-3xl border border-[#e6e8ea] overflow-hidden shadow-sm">
              <div className="bg-[#f7f9fb] px-8 py-5 border-b border-[#e6e8ea] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#006d37] flex items-center justify-center">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="font-black text-[#191c1e] text-base font-headline">Certificaciones</h2>
                    <p className="text-xs text-[#737781]">Cursos, diplomas y certificados</p>
                  </div>
                </div>
                <button type="button" onClick={addCert}
                  className="flex items-center gap-1.5 bg-[#006d37] text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-[#00743a] transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Agregar
                </button>
              </div>
              <div className="p-8">
                {form.certifications.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-[#e6e8ea] rounded-2xl">
                    <Award className="w-10 h-10 text-[#c2c6d1] mx-auto mb-3" />
                    <p className="text-sm text-[#737781] font-medium">Agrega tus certificados y diplomas</p>
                    <button type="button" onClick={addCert}
                      className="mt-4 text-sm font-bold text-[#006d37] hover:underline flex items-center gap-1 mx-auto">
                      <Plus className="w-3.5 h-3.5" /> Agregar certificación
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {form.certifications.map((cert, i) => (
                      <div key={i} className="p-5 bg-[#f7f9fb] rounded-2xl relative">
                        <button type="button" onClick={() => removeCert(i)}
                          className="absolute top-4 right-4 p-1.5 text-[#737781] hover:text-[#ba1a1a] hover:bg-[#ffdad6] rounded-xl transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pr-10">
                          <div className="md:col-span-2">
                            <label className={lbl}>Nombre del certificado</label>
                            <input type="text" value={cert.name}
                              onChange={e => updateCert(i, "name", e.target.value)}
                              placeholder="e.j. AWS Certified Developer" className={inp} />
                          </div>
                          <div>
                            <label className={lbl}>Año</label>
                            <input type="number" min={2000} max={new Date().getFullYear()} value={cert.year}
                              onChange={e => updateCert(i, "year", e.target.value)}
                              placeholder="2023" className={inp} />
                          </div>
                          <div className="md:col-span-3">
                            <label className={lbl}>Institución</label>
                            <input type="text" value={cert.issuer}
                              onChange={e => updateCert(i, "issuer", e.target.value)}
                              placeholder="e.j. Coursera, AWS, Google..." className={inp} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Proyectos */}
            <div id="projects" className="bg-white rounded-3xl border border-[#e6e8ea] overflow-hidden shadow-sm">
              <div className="bg-[#f7f9fb] px-8 py-5 border-b border-[#e6e8ea] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#00386c] flex items-center justify-center">
                    <FolderGit2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="font-black text-[#191c1e] text-base font-headline">Proyectos destacados</h2>
                    <p className="text-xs text-[#737781]">Muestra lo que has construido</p>
                  </div>
                </div>
                <button type="button" onClick={addProject}
                  className="flex items-center gap-1.5 bg-[#00386c] text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-[#1a4f8b] transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Agregar
                </button>
              </div>
              <div className="p-8">
                {form.projects.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-[#e6e8ea] rounded-2xl">
                    <FolderGit2 className="w-10 h-10 text-[#c2c6d1] mx-auto mb-3" />
                    <p className="text-sm text-[#737781] font-medium">Muestra tus proyectos destacados</p>
                    <button type="button" onClick={addProject}
                      className="mt-4 text-sm font-bold text-[#00386c] hover:underline flex items-center gap-1 mx-auto">
                      <Plus className="w-3.5 h-3.5" /> Agregar proyecto
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {form.projects.map((proj, i) => (
                      <div key={i}
                        className="group bg-[#f7f9fb] hover:bg-white hover:shadow-lg rounded-2xl p-5 relative transition-all border border-transparent hover:border-[#e6e8ea]">
                        <button type="button" onClick={() => removeProject(i)}
                          className="absolute top-4 right-4 p-1.5 text-[#737781] hover:text-[#ba1a1a] hover:bg-[#ffdad6] rounded-xl transition-colors opacity-0 group-hover:opacity-100">
                          <X className="w-4 h-4" />
                        </button>
                        <div className="space-y-3 pr-8">
                          <div>
                            <label className={lbl}>Nombre del proyecto</label>
                            <input type="text" value={proj.name}
                              onChange={e => updateProject(i, "name", e.target.value)}
                              placeholder="e.j. TalentBridge..." className={inp} />
                          </div>
                          <div>
                            <label className={lbl}>Descripción</label>
                            <textarea rows={2} value={proj.description}
                              onChange={e => updateProject(i, "description", e.target.value)}
                              placeholder="¿Qué hace? ¿Qué tecnologías usaste?"
                              className={`${inp} resize-none`} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Botón guardar */}
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving}
                className="bg-gradient-to-br from-[#00386c] to-[#1a4f8b] text-white px-12 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-xl shadow-[#00386c]/20 hover:shadow-[#00386c]/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-3">
                {saving
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Save className="w-4 h-4" />}
                {saving ? "Guardando..." : "Guardar perfil"}
              </button>
            </div>
          </form>

          {/* Hoja de vida */}
          <div id="cv" className="bg-white rounded-3xl border border-[#e6e8ea] overflow-hidden shadow-sm">
            <div className="bg-[#f7f9fb] px-8 py-5 border-b border-[#e6e8ea] flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#006d37] flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-black text-[#191c1e] text-base font-headline">Hoja de Vida</h2>
                <p className="text-xs text-[#737781]">Solo PDF · máx 5MB · reemplaza el anterior al subir uno nuevo</p>
              </div>
            </div>
            <div className="p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                  className="flex items-center gap-2 bg-gradient-to-br from-[#006d37] to-[#00743a] text-white font-bold text-sm px-7 py-3.5 rounded-full shadow-lg shadow-[#006d37]/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? "Subiendo..." : "Subir CV"}
                </button>
                {form.cvUrl && (
                  <a href={form.cvUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-bold text-[#006d37] hover:underline underline-offset-4 px-4 py-3.5 bg-[#6bfe9c]/10 rounded-full">
                    <FileText className="w-4 h-4" /> Ver CV actual
                  </a>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept=".pdf"
                onChange={handleCvUpload} disabled={uploading} className="hidden" />
            </div>
          </div>

          {/* FIX P3: Sección notificaciones */}
          <div id="notifs" className="bg-white rounded-3xl border border-[#e6e8ea] overflow-hidden shadow-sm">
            <div className="bg-[#f7f9fb] px-8 py-5 border-b border-[#e6e8ea] flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#00386c] flex items-center justify-center">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-black text-[#191c1e] text-base font-headline">Notificaciones</h2>
                <p className="text-xs text-[#737781]">Recibe alertas por Telegram cuando haya vacantes nuevas</p>
              </div>
            </div>
            <div className="p-8">

              <div className="flex items-center justify-between p-5 bg-[#f7f9fb] rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    form.notificationsEnabled ? "bg-[#6bfe9c]/20" : "bg-[#f2f4f6]"
                  }`}>
                    {form.notificationsEnabled
                      ? <Bell className="w-5 h-5 text-[#006d37]" />
                      : <BellOff className="w-5 h-5 text-[#737781]" />}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#191c1e]">
                      Notificaciones por Telegram
                    </p>
                    <p className="text-xs text-[#737781] mt-0.5">
                      {form.notificationsEnabled
                        ? "Activadas — recibirás alertas de nuevas vacantes"
                        : "Desactivadas — no recibirás alertas"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleNotifications}
                  disabled={togglingNotifs}
                  className={`relative w-14 h-7 rounded-full transition-all duration-300 disabled:opacity-60 focus:outline-none ${
                    form.notificationsEnabled ? "bg-[#006d37]" : "bg-[#c2c6d1]"
                  }`}
                  aria-label={form.notificationsEnabled ? "Desactivar notificaciones" : "Activar notificaciones"}
                >
                  <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                    form.notificationsEnabled ? "left-7" : "left-0.5"
                  }`} />
                  {togglingNotifs && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                    </span>
                  )}
                </button>
              </div>

              <p className="text-xs text-[#737781] mt-4 leading-relaxed">
                Para recibir notificaciones debes vincular tu cuenta de Telegram con el bot de TalentBridge.
                Activa las notificaciones y luego inicia una conversación con el bot.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}