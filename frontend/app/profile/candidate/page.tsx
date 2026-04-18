'use client';

import { useAuth } from '@/src/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import api from '@/src/lib/api';

type WorkMode = 'remote' | 'onsite' | 'hybrid';

interface ProfileForm {
  fullName: string;
  phone: string;
  summary: string;
  career: string;
  institution: string;
  semester: string;
  graduationYear: string;
  workMode: WorkMode;
  salaryExpected: string;
  skills: string[];
  softSkills: string[];
  cvUrl: string;
}

const EMPTY_FORM: ProfileForm = {
  fullName: '',
  phone: '',
  summary: '',
  career: '',
  institution: '',
  semester: '',
  graduationYear: '',
  workMode: 'remote',
  salaryExpected: '',
  skills: [],
  softSkills: [],
  cvUrl: '',
};

export default function CandidateProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [skillInput, setSkillInput] = useState('');
  const [softSkillInput, setSoftSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [cvError, setCvError] = useState('');
  const [cvSuccess, setCvSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/auth/login');
    if (!isLoading && user?.role === 'COMPANY') router.replace('/profile/company');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    api.get('/profile/candidate').then((res) => {
      const d = res.data;
      setForm({
        fullName: d.fullName ?? '',
        phone: d.phone ?? '',
        summary: d.summary ?? '',
        career: d.career ?? '',
        institution: d.institution ?? '',
        semester: d.semester != null ? String(d.semester) : '',
        graduationYear: d.graduationYear != null ? String(d.graduationYear) : '',
        workMode: d.workMode ?? 'remote',
        salaryExpected: d.salaryExpected != null ? String(d.salaryExpected) : '',
        skills: d.skills ?? [],
        softSkills: d.softSkills ?? [],
        cvUrl: d.cvUrl ?? '',
      });
    }).catch(() => {});
  }, [user]);

  function set<K extends keyof ProfileForm>(field: K, value: ProfileForm[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addTag(field: 'skills' | 'softSkills', value: string, clear: () => void) {
    const tag = value.trim();
    if (!tag || form[field].includes(tag)) return;
    set(field, [...form[field], tag]);
    clear();
  }

  function removeTag(field: 'skills' | 'softSkills', tag: string) {
    set(field, form[field].filter((t) => t !== tag));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');

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

    if (user?.role === 'STUDENT' && form.semester) {
      payload.semester = Number(form.semester);
    }
    if (user?.role === 'GRADUATE' && form.graduationYear) {
      payload.graduationYear = Number(form.graduationYear);
    }

    try {
      await api.put('/profile/candidate', payload);
      setSaveSuccess('Perfil guardado correctamente.');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setSaveError(e.response?.data?.error ?? 'Error al guardar el perfil.');
    } finally {
      setSaving(false);
    }
  }

  async function handleCvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCvError('');
    setCvSuccess('');

    if (file.type !== 'application/pdf') {
      setCvError('Solo se permiten archivos PDF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setCvError('El archivo no puede superar los 5MB.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('cv', file);

    try {
      const res = await api.post('/profile/candidate/cv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      set('cvUrl', res.data.cvUrl ?? '');
      setCvSuccess('CV subido exitosamente.');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setCvError(e.response?.data?.error ?? 'Error al subir el archivo.');
    } finally {
      setUploading(false);
    }
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 text-sm">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Mi Perfil Profesional</h1>
          <p className="text-slate-500 text-sm mt-1">
            Completa tu perfil para aumentar tu puntaje de visibilidad.
          </p>
        </div>

        {saveError && (
          <div className="mb-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">
            {saveError}
          </div>
        )}
        {saveSuccess && (
          <div className="mb-4 bg-emerald-50 text-emerald-700 text-sm px-4 py-3 rounded-lg border border-emerald-200">
            {saveSuccess}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 pb-2 border-b border-slate-100">
              Información básica
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre completo <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => set('fullName', e.target.value)}
                  placeholder="e.j. Juan Mario López Guerra"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="e.j. 3001234567"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Resumen profesional
                </label>
                <textarea
                  rows={3}
                  value={form.summary}
                  onChange={(e) => set('summary', e.target.value)}
                  placeholder="Cuéntale a las empresas quién eres y qué puedes ofrecerles..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 pb-2 border-b border-slate-100">
              Información académica
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Institución</label>
                <input
                  type="text"
                  value={form.institution}
                  onChange={(e) => set('institution', e.target.value)}
                  placeholder="e.j. Universidad Popular del Cesar"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Carrera</label>
                <input
                  type="text"
                  value={form.career}
                  onChange={(e) => set('career', e.target.value)}
                  placeholder="e.j. Ingeniería de Sistemas"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              {user.role === 'STUDENT' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Semestre actual
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={form.semester}
                    onChange={(e) => set('semester', e.target.value)}
                    placeholder="e.j. 7"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              )}
              {user.role === 'GRADUATE' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Año de graduación
                  </label>
                  <input
                    type="number"
                    min={2000}
                    max={new Date().getFullYear()}
                    value={form.graduationYear}
                    onChange={(e) => set('graduationYear', e.target.value)}
                    placeholder="e.j. 2023"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              )}
            </div>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 pb-2 border-b border-slate-100">
              Preferencias laborales
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Modalidad de trabajo
                </label>
                <select
                  value={form.workMode}
                  onChange={(e) => set('workMode', e.target.value as WorkMode)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                >
                  <option value="remote">Remoto</option>
                  <option value="hybrid">Híbrido</option>
                  <option value="onsite">Presencial</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Pretensión salarial (COP)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.salaryExpected}
                  onChange={(e) => set('salaryExpected', e.target.value)}
                  placeholder="e.j. 1500000"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 pb-2 border-b border-slate-100">
              Habilidades
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Habilidades técnicas
                  <span className="text-xs text-slate-400 font-normal ml-1">
                    (escribe y presiona Enter para agregar)
                  </span>
                </label>
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag('skills', skillInput, () => setSkillInput(''));
                    }
                  }}
                  placeholder="e.j. React, Node.js, TypeScript..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {form.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.skills.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag('skills', tag)}
                          className="text-blue-500 hover:text-blue-800 leading-none"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Habilidades blandas
                  <span className="text-xs text-slate-400 font-normal ml-1">
                    (escribe y presiona Enter para agregar)
                  </span>
                </label>
                <input
                  type="text"
                  value={softSkillInput}
                  onChange={(e) => setSoftSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag('softSkills', softSkillInput, () => setSoftSkillInput(''));
                    }
                  }}
                  placeholder="e.j. Trabajo en equipo, Comunicación..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {form.softSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.softSkills.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag('softSkills', tag)}
                          className="text-slate-400 hover:text-slate-700 leading-none"
                        >
                          ×
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
              className="bg-blue-800 text-white px-8 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Guardando...' : 'Guardar perfil'}
            </button>
          </div>
        </form>

        <section className="mt-6 bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-1">
            Hoja de Vida (CV)
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Solo PDF · máximo 5MB · al subir uno nuevo reemplaza el anterior
          </p>

          {cvError && (
            <div className="mb-3 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">
              {cvError}
            </div>
          )}
          {cvSuccess && (
            <div className="mb-3 bg-emerald-50 text-emerald-700 text-sm px-4 py-3 rounded-lg border border-emerald-200">
              {cvSuccess}
            </div>
          )}

          {form.cvUrl && (
            <p className="text-xs text-slate-500 mb-3">
              CV actual:{' '}
              <a
                href={form.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 underline"
              >
                ver archivo
              </a>
            </p>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleCvUpload}
            disabled={uploading}
            className="block text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />
          {uploading && (
            <p className="text-xs text-slate-400 mt-2">Subiendo...</p>
          )}
        </section>
      </div>
    </div>
  );
}