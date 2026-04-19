"use client";

import { useAuth } from "@/src/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import api from "@/src/lib/api";
import { ArrowLeft, Save, Upload, X, FileText, User, GraduationCap, Briefcase, Wrench } from "lucide-react";

const EMPTY_FORM = {
  fullName: "",
  phone: "",
  summary: "",
  career: "",
  institution: "",
  semester: "",
  graduationYear: "",
  workMode: "remote" as "remote" | "onsite" | "hybrid",
  salaryExpected: "",
  skills: [] as string[],
  softSkills: [] as string[],
  cvUrl: "",
};

const sections = [
  { id: "basic", label: "Información básica", icon: User },
  { id: "academic", label: "Información académica", icon: GraduationCap },
  { id: "work", label: "Preferencias laborales", icon: Briefcase },
  { id: "skills", label: "Habilidades", icon: Wrench },
  { id: "cv", label: "Hoja de vida", icon: FileText },
];

export default function CandidateProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [skillInput, setSkillInput] = useState("");
  const [softSkillInput, setSoftSkillInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [cvError, setCvError] = useState("");
  const [cvSuccess, setCvSuccess] = useState("");

  useEffect(() => {
    if (!isLoading && !user) router.replace("/auth/login");
    if (!isLoading && user?.role === "COMPANY") router.replace("/profile/company");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    api.get("/profile/candidate").then((res) => {
      const d = res.data;
      setForm({
        fullName: d.fullName ?? "",
        phone: d.phone ?? "",
        summary: d.summary ?? "",
        career: d.career ?? "",
        institution: d.institution ?? "",
        semester: d.semester != null ? String(d.semester) : "",
        graduationYear: d.graduationYear != null ? String(d.graduationYear) : "",
        workMode: d.workMode ?? "remote",
        salaryExpected: d.salaryExpected != null ? String(d.salaryExpected) : "",
        skills: d.skills ?? [],
        softSkills: d.softSkills ?? [],
        cvUrl: d.cvUrl ?? "",
      });
    }).catch(() => {});
  }, [user]);

  function set<K extends keyof typeof EMPTY_FORM>(field: K, value: typeof EMPTY_FORM[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addTag(field: "skills" | "softSkills", value: string, clear: () => void) {
    const tag = value.trim();
    if (!tag || form[field].includes(tag)) return;
    set(field, [...form[field], tag]);
    clear();
  }

  function removeTag(field: "skills" | "softSkills", tag: string) {
    set(field, form[field].filter((t) => t !== tag));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");

    const payload: Record<string, unknown> = {
      fullName: form.fullName,
      phone: form.phone || undefined,
      summary: form.summary || undefined,
      career: form.career || undefined,
      institution: form.institution || undefined,
      workMode: form.workMode,
      salaryExpected: form.salaryExpected ? Number(form.salaryExpected) : undefined,
      skills: form.skills,
      softSkills: form.softSkills,
    };

    if (user?.role === "STUDENT" && form.semester) payload.semester = Number(form.semester);
    if (user?.role === "GRADUATE" && form.graduationYear) payload.graduationYear = Number(form.graduationYear);

    try {
      await api.put("/profile/candidate", payload);
      setSaveSuccess("Perfil guardado correctamente.");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setSaveError(e.response?.data?.error ?? "Error al guardar el perfil.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCvError("");
    setCvSuccess("");

    if (file.type !== "application/pdf") { setCvError("Solo se permiten archivos PDF."); return; }
    if (file.size > 5 * 1024 * 1024) { setCvError("El archivo no puede superar los 5MB."); return; }

    setUploading(true);
    const formData = new FormData();
    formData.append("cv", file);

    try {
      const res = await api.post("/profile/candidate/cv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set("cvUrl", res.data.cvUrl ?? "");
      setCvSuccess("CV subido exitosamente.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setCvError(e.response?.data?.error ?? "Error al subir el archivo.");
    } finally {
      setUploading(false);
    }
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
        <span className="w-8 h-8 border-2 border-[#00386c]/20 border-t-[#00386c] rounded-full animate-spin" />
      </div>
    );
  }

  const input = "w-full bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#006d37] focus:ring-0 rounded-lg px-4 py-3 text-sm text-[#191c1e] placeholder:text-[#737781] outline-none transition-all";
  const label = "block text-xs font-semibold uppercase tracking-wider text-[#424750] mb-2";

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <div className="max-w-screen-xl mx-auto px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">

        <aside className="lg:col-span-3 space-y-6">
          <Link
            href="/dashboard/candidate"
            className="flex items-center gap-2 text-sm font-semibold text-[#424750] hover:text-[#00386c] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al dashboard
          </Link>

          <div className="bg-white rounded-2xl p-6 border border-[#e6e8ea] text-center space-y-3">
            <div className="w-20 h-20 rounded-2xl bg-[#00386c] flex items-center justify-center mx-auto"> <GraduationCap className="w-10 h-10 text-white" /> </div>
            <div>
              <p className="font-bold text-[#191c1e]"> {form.fullName || "Tu nombre"} </p>
              <p className="text-xs text-[#424750] mt-1"> {user.role === "STUDENT" ? "Estudiante" : "Egresado"} </p>
            </div>
            {form.cvUrl && (
              <a
                href={form.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#006d37] hover:underline"
              >
                <FileText className="w-3.5 h-3.5" />
                Ver CV actual
              </a>
            )}
          </div>

          <nav className="bg-white rounded-2xl border border-[#e6e8ea] overflow-hidden">
            {sections.map(({ id, label: sLabel, icon: Icon }) => (
              <a
                key={id}
                href={`#${id}`}
                className="flex items-center gap-3 px-5 py-4 text-sm font-semibold text-[#424750] hover:bg-[#f2f4f6] hover:text-[#00386c] transition-colors border-b border-[#f2f4f6] last:border-0"
              >
                <Icon className="w-4 h-4" />
                {sLabel}
              </a>
            ))}
          </nav>
        </aside>

        <div className="lg:col-span-9 space-y-6">

          <div>
            <h1 className="text-3xl font-extrabold text-[#00386c] font-headline"> Mi Perfil Profesional </h1>
            <p className="text-[#424750] text-sm mt-1"> Completa tu perfil para aumentar tu visibilidad ante las empresas. </p>
          </div>

          {saveError && (
            <div className="bg-[#ffdad6] text-[#93000a] text-sm font-medium px-4 py-3 rounded-xl"> {saveError} </div>
          )}
          {saveSuccess && (
            <div className="bg-[#6bfe9c]/20 text-[#005228] text-sm font-medium px-4 py-3 rounded-xl"> {saveSuccess} </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">

            <section id="basic" className="bg-white rounded-2xl border border-[#e6e8ea] p-8">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#f2f4f6]">
                <div className="w-8 h-8 rounded-lg bg-[#00386c]/10 flex items-center justify-center"> <User className="w-4 h-4 text-[#00386c]" /> </div>
                <h2 className="font-bold text-[#191c1e]">Información básica</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={label}>
                    Nombre completo <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    placeholder="e.j. Juan Mario López Guerra"
                    className={input}
                  />
                </div>
                <div>
                  <label className={label}>Teléfono</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="e.j. 3001234567"
                    className={input}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={label}>Resumen profesional</label>
                  <textarea
                    rows={3}
                    value={form.summary}
                    onChange={(e) => set("summary", e.target.value)}
                    placeholder="Cuéntale a las empresas quién eres y qué puedes ofrecerles..."
                    className={`${input} resize-none`}
                  />
                </div>
              </div>
            </section>

            <section id="academic" className="bg-white rounded-2xl border border-[#e6e8ea] p-8">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#f2f4f6]">
                <div className="w-8 h-8 rounded-lg bg-[#006d37]/10 flex items-center justify-center"> <GraduationCap className="w-4 h-4 text-[#006d37]" /> </div>
                <h2 className="font-bold text-[#191c1e]">Información académica</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={label}>Institución</label>
                  <input
                    type="text"
                    value={form.institution}
                    onChange={(e) => set("institution", e.target.value)}
                    placeholder="e.j. Universidad Popular del Cesar"
                    className={input}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={label}>Carrera</label>
                  <input
                    type="text"
                    value={form.career}
                    onChange={(e) => set("career", e.target.value)}
                    placeholder="e.j. Ingeniería de Sistemas"
                    className={input}
                  />
                </div>
                {user.role === "STUDENT" && (
                  <div>
                    <label className={label}>Semestre actual</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={form.semester}
                      onChange={(e) => set("semester", e.target.value)}
                      placeholder="e.j. 7"
                      className={input}
                    />
                  </div>
                )}
                {user.role === "GRADUATE" && (
                  <div>
                    <label className={label}>Año de graduación</label>
                    <input
                      type="number"
                      min={2000}
                      max={new Date().getFullYear()}
                      value={form.graduationYear}
                      onChange={(e) => set("graduationYear", e.target.value)}
                      placeholder="e.j. 2023"
                      className={input}
                    />
                  </div>
                )}
              </div>
            </section>

            <section id="work" className="bg-white rounded-2xl border border-[#e6e8ea] p-8">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#f2f4f6]">
                <div className="w-8 h-8 rounded-lg bg-[#00386c]/10 flex items-center justify-center"> <Briefcase className="w-4 h-4 text-[#00386c]" /> </div>
                <h2 className="font-bold text-[#191c1e]">Preferencias laborales</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={label}>Modalidad de trabajo</label>
                  <select
                    value={form.workMode}
                    onChange={(e) => set("workMode", e.target.value as typeof form.workMode)}
                    className={`${input} cursor-pointer`}
                  >
                    <option value="remote">Remoto</option>
                    <option value="hybrid">Híbrido</option>
                    <option value="onsite">Presencial</option>
                  </select>
                </div>
                <div>
                  <label className={label}>Pretensión salarial (COP)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.salaryExpected}
                    onChange={(e) => set("salaryExpected", e.target.value)}
                    placeholder="e.j. 1.500.000"
                    className={input}
                  />
                </div>
              </div>
            </section>

            <section id="skills" className="bg-white rounded-2xl border border-[#e6e8ea] p-8">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#f2f4f6]">
                <div className="w-8 h-8 rounded-lg bg-[#006d37]/10 flex items-center justify-center"> <Wrench className="w-4 h-4 text-[#006d37]" /> </div>
                <h2 className="font-bold text-[#191c1e]">Habilidades</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className={label}>
                    Habilidades técnicas
                    <span className="text-[#737781] font-normal normal-case tracking-normal ml-2">
                      — escribe y presiona Enter
                    </span>
                  </label>
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag("skills", skillInput, () => setSkillInput(""));
                      }
                    }}
                    placeholder="e.j. React, Node.js, TypeScript..."
                    className={input}
                  />
                  {form.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {form.skills.map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1.5 bg-[#00386c]/10 text-[#00386c] text-xs font-semibold px-3 py-1.5 rounded-full"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag("skills", tag)}
                            className="hover:text-[#ba1a1a] transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className={label}>
                    Habilidades blandas
                    <span className="text-[#737781] font-normal normal-case tracking-normal ml-2">
                      — escribe y presiona Enter
                    </span>
                  </label>
                  <input
                    type="text"
                    value={softSkillInput}
                    onChange={(e) => setSoftSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag("softSkills", softSkillInput, () => setSoftSkillInput(""));
                      }
                    }}
                    placeholder="e.j. Trabajo en equipo, Comunicación..."
                    className={input}
                  />
                  {form.softSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {form.softSkills.map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1.5 bg-[#6bfe9c]/30 text-[#005228] text-xs font-semibold px-3 py-1.5 rounded-full"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag("softSkills", tag)}
                            className="hover:text-[#ba1a1a] transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-br from-[#00386c] to-[#1a4f8b] text-white px-10 py-3.5 rounded-full font-bold text-sm uppercase tracking-widest shadow-lg shadow-[#00386c]/10 hover:shadow-[#00386c]/20 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? "Guardando..." : "Guardar perfil"}
              </button>
            </div>
          </form>

          <section id="cv" className="bg-white rounded-2xl border border-[#e6e8ea] p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#f2f4f6]">
              <div className="w-8 h-8 rounded-lg bg-[#00386c]/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-[#00386c]" />
              </div>
              <div>
                <h2 className="font-bold text-[#191c1e]">Hoja de Vida (CV)</h2>
                <p className="text-xs text-[#737781] mt-0.5">
                  Solo PDF · máximo 5MB · al subir uno nuevo reemplaza el anterior
                </p>
              </div>
            </div>

            {cvError && (
              <div className="mb-4 bg-[#ffdad6] text-[#93000a] text-sm font-medium px-4 py-3 rounded-xl">
                {cvError}
              </div>
            )}
            {cvSuccess && (
              <div className="mb-4 bg-[#6bfe9c]/20 text-[#005228] text-sm font-medium px-4 py-3 rounded-xl">
                {cvSuccess}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 bg-[#f2f4f6] hover:bg-[#e6e8ea] text-[#00386c] font-bold text-sm px-6 py-3 rounded-full transition-colors disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {uploading ? "Subiendo..." : "Subir CV"}
              </button>

              {form.cvUrl && (
                <a
                  href={form.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-semibold text-[#006d37] hover:underline underline-offset-4"
                >
                  <FileText className="w-4 h-4" />
                  Ver CV actual
                </a>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleCvUpload}
              disabled={uploading}
              className="hidden"
            />
          </section>
        </div>
      </div>
    </div>
  );
}