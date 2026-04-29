'use client';

import { useState } from 'react';
import api from '@/src/lib/api';
import { X, Save, SlidersHorizontal } from 'lucide-react';

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

interface JobFormState {
  title: string;
  description: string;
  type: string;
  workMode: string;
  area: string;
  skills: string[];
  budgetMin: string;
  budgetMax: string;
  duration: string;
  deadline: string;
  deliverables: string;
}

interface JobFormProps {
  editingJob: Job | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const DEFAULT_WEIGHTS = {
  skillsWeight: 0.30, experienceWeight: 0.25, educationWeight: 0.15,
  certsWeight: 0.10,  reputationWeight: 0.10, languagesWeight: 0.05,
  completionWeight: 0.05,
};

const WEIGHT_LABELS: Record<string, string> = {
  skillsWeight:     'Habilidades técnicas',
  experienceWeight: 'Experiencia y proyectos',
  educationWeight:  'Formación académica',
  certsWeight:      'Certificaciones',
  reputationWeight: 'Reputación',
  languagesWeight:  'Idiomas',
  completionWeight: 'Completitud del perfil',
};

export default function JobForm({ editingJob, onSuccess, onCancel }: JobFormProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showWeights, setShowWeights] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const [form, setForm] = useState<JobFormState>({
    title: editingJob?.title ?? '',
    description: (editingJob as any)?.description ?? '',
    type: editingJob?.type ?? 'FORMAL',
    workMode: editingJob?.workMode ?? 'REMOTE',
    area: editingJob?.area ?? '',
    skills: (editingJob as any)?.skills ?? [],
    budgetMin: editingJob?.budgetMin?.toString() ?? '',
    budgetMax: editingJob?.budgetMax?.toString() ?? '',
    duration: (editingJob as any)?.duration ?? '',
    deadline: (editingJob as any)?.deadline?.slice(0, 10) ?? '',
    deliverables: (editingJob as any)?.deliverables ?? '',
  });

  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);

  const totalWeight  = Object.values(weights).reduce((a, b) => a + b, 0);
  const weightsValid = Math.abs(totalWeight - 1.0) < 0.01;

  const inputCls = "w-full bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#006d37] focus:ring-0 rounded-lg px-4 py-3 text-sm text-[#191c1e] placeholder:text-[#737781] outline-none transition-all";
  const labelCls = "block text-xs font-semibold uppercase tracking-wider text-[#424750] mb-2";

  function addSkill() {
    const tag: string = skillInput.trim();
    if (tag && !form.skills.includes(tag))
    setForm(p => ({ ...p, skills: [...p.skills, tag] }));
    setSkillInput('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.skills.length === 0) { setError('Agrega al menos una habilidad requerida.'); return; }
    if (showWeights && !weightsValid) {
      setError(`Los pesos deben sumar 1.0. Actualmente suman ${totalWeight.toFixed(2)}.`); return;
    }

    setSaving(true); setError('');
    const payload: Record<string, unknown> = {
      ...form,
      budgetMin:    form.budgetMin    ? Number(form.budgetMin)    : undefined,
      budgetMax:    form.budgetMax    ? Number(form.budgetMax)    : undefined,
      deadline:     form.deadline     || undefined,
      area:         form.area         || undefined,
      duration:     form.duration     || undefined,
      deliverables: form.deliverables || undefined,
    };
    if (showWeights) payload.rankWeights = weights;

    try {
      if (editingJob) {
        await api.put(`/jobs/${editingJob.id}`, payload);
      } else {
        await api.post('/jobs', payload);
      }
      onSuccess();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error ?? (editingJob ? 'Error al guardar los cambios.' : 'Error al publicar la vacante.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onCancel}
          className="p-2 hover:bg-[#f2f4f6] rounded-xl transition-colors text-[#424750] cursor-pointer">
          <X className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-[#191c1e] font-headline"> {editingJob ? 'Editar vacante' : 'Nueva vacante'} </h1>
          <p className="text-sm text-[#424750]">  {editingJob ? 'Modifica los datos de la vacante.' : 'Completa los detalles de la vacante.'} </p>
        </div>
      </div>

      {error && (
        <div className="bg-[#ffdad6] text-[#93000a] text-sm font-medium px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        <div className="bg-white rounded-2xl border border-[#e6e8ea] p-6 space-y-5">
          <h2 className="text-sm font-bold text-[#191c1e] uppercase tracking-widest pb-2 border-b border-[#f2f4f6]"> Información básica </h2>
          <div>
            <label className={labelCls}>Título de la vacante *</label>
            <input type="text" required value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="ej. Desarrollador Backend Node.js"
              className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Descripción *</label>
            <textarea required rows={4} value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Describe el rol, responsabilidades y lo que buscan en el candidato..."
              className={`${inputCls} resize-none`} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Tipo</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className={`${inputCls} cursor-pointer`}>
                <option value="FORMAL">Contrato formal</option>
                <option value="FREELANCE">Freelance</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Modalidad</label>
              <select value={form.workMode} onChange={e => setForm(p => ({ ...p, workMode: e.target.value }))}
                className={`${inputCls} cursor-pointer`}>
                <option value="REMOTE">Remoto</option>
                <option value="ONSITE">Presencial</option>
                <option value="HYBRID">Híbrido</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Área</label>
              <input type="text" value={form.area}
                onChange={e => setForm(p => ({ ...p, area: e.target.value }))}
                placeholder="ej. Desarrollo Web"
                className={inputCls} />
            </div>
          </div>
        </div>


        <div className="bg-white rounded-2xl border border-[#e6e8ea] p-6 space-y-5">
          <h2 className="text-sm font-bold text-[#191c1e] uppercase tracking-widest pb-2 border-b border-[#f2f4f6]"> Condiciones </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Presupuesto mínimo (COP)</label>
              <input type="number" value={form.budgetMin}
                onChange={e => setForm(p => ({ ...p, budgetMin: e.target.value }))}
                placeholder="ej. 1500000" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Presupuesto máximo (COP)</label>
              <input type="number" value={form.budgetMax}
                onChange={e => setForm(p => ({ ...p, budgetMax: e.target.value }))}
                placeholder="ej. 3000000" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Duración</label>
              <input type="text" value={form.duration}
                onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
                placeholder="ej. 3 meses, indefinido" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Fecha límite</label>
              <input type="date" value={form.deadline}
                onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))}
                className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Entregables esperados</label>
            <textarea rows={2} value={form.deliverables}
              onChange={e => setForm(p => ({ ...p, deliverables: e.target.value }))}
              placeholder="ej. API REST documentada, componentes React, informe final..."
              className={`${inputCls} resize-none`} />
          </div>
        </div>


        <div className="bg-white rounded-2xl border border-[#e6e8ea] p-6 space-y-4">
          <h2 className="text-sm font-bold text-[#191c1e] uppercase tracking-widest pb-2 border-b border-[#f2f4f6]"> Habilidades requeridas * </h2>
          <div className="flex gap-2">
            <input type="text" value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
              placeholder="Escribe una habilidad y presiona Enter..."
              className={`${inputCls} flex-1`} />
            <button type="button" onClick={addSkill}
              className="px-4 py-2 bg-[#006d37]/10 text-[#006d37] rounded-lg font-semibold text-sm hover:bg-[#006d37]/20 transition-colors">
              Agregar
            </button>
          </div>
          {form.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {form.skills.map(tag => (
                <span key={tag}
                  className="flex items-center gap-1.5 bg-[#006d37]/10 text-[#006d37] text-xs font-semibold px-3 py-1.5 rounded-full">
                  {tag}
                  <button type="button"
                    onClick={() => setForm(p => ({ ...p, skills: p.skills.filter(s => s !== tag) }))}
                    className="hover:text-[#ba1a1a] transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#737781] italic">Aún no has agregado habilidades.</p>
          )}
        </div>


        <div className="bg-white rounded-2xl border border-[#e6e8ea] overflow-hidden">
          <button type="button" onClick={() => setShowWeights(!showWeights)}
            className="w-full flex items-center justify-between px-6 py-4 text-sm font-semibold text-[#424750] hover:bg-[#f7f9fb] transition-colors">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#006d37]" />
              Personalizar pesos del ranking
              <span className="text-xs font-normal text-[#737781] ml-1">— opcional</span>
            </div>
            <span className="text-[#737781] text-xs">{showWeights ? '▲ Ocultar' : '▼ Mostrar'}</span>
          </button>
          {showWeights && (
            <div className="px-6 pb-6 border-t border-[#f2f4f6] space-y-4 pt-5">
              <p className="text-xs text-[#737781]">
                Deben sumar exactamente 1.0. Actualmente:{' '}
                <span className={`font-bold ${weightsValid ? 'text-[#006d37]' : 'text-[#ba1a1a]'}`}>
                  {totalWeight.toFixed(2)}
                </span>
              </p>
              {Object.entries(weights).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#424750]">{WEIGHT_LABELS[key]}</label>
                    <span className="text-xs font-bold text-[#00386c]">{(value * 100).toFixed(0)}%</span>
                  </div>
                  <input type="range" min={0} max={1} step={0.05} value={value}
                    onChange={e => setWeights(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                    className="w-full accent-[#006d37]" />
                </div>
              ))}
            </div>
          )}
        </div>


        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onCancel} className="px-6 py-3 rounded-full font-bold text-sm text-[#424750] hover:bg-[#f2f4f6] transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-br from-[#006d37] to-[#00743a] text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider shadow-lg shadow-[#006d37]/20 disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 transition-all">
            {saving
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Save className="w-4 h-4" />}
            {saving ? 'Guardando...' : editingJob ? 'Guardar cambios' : 'Publicar vacante'}
          </button>
        </div>

      </form>
    </div>
  );
}