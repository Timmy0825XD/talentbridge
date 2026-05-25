"use client";

import { useState } from "react";
import api from "@/src/lib/api";
import { X, Save, Loader2, CheckCircle2 } from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Application {
  id: string;
  status?: string;
  candidate: { id: string; fullName: string | null };
  job: { id: string; title: string };
}

interface CreateContractFormProps {
  applications: Application[];
  onSuccess: () => void;
  onCancel: () => void;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function CreateContractForm({
  applications,
  onSuccess,
  onCancel,
}: CreateContractFormProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const [form, setForm] = useState({
    title:        "",
    description:  "",
    deliverables: "",
    // FIX: el backend espera jobId y candidateId (no candidateProfileId)
    // Estos se llenan automáticamente al seleccionar la postulación
    jobId:        "",
    candidateId:  "",
    totalAmount:  "",
    paymentScheme:"",
    startDate:    "",
    endDate:      "",
  });

  const inp = "w-full bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#006d37] focus:ring-0 rounded-lg px-4 py-3 text-sm text-[#191c1e] placeholder:text-[#737781] outline-none transition-all";
  const lbl = "block text-xs font-semibold uppercase tracking-wider text-[#424750] mb-2";

  // Cuando el usuario elige una postulación, extrae jobId y candidateId
  function handleApplicationSelect(applicationId: string) {
    const app = applications.find(a => a.id === applicationId);
    if (app) {
      setForm(p => ({
        ...p,
        jobId:       app.job.id,
        candidateId: app.candidate.id, // ← el backend necesita el id del CandidateProfile
      }));
    } else {
      setForm(p => ({ ...p, jobId: "", candidateId: "" }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.jobId || !form.candidateId) {
      setError("Debes seleccionar una postulación para vincular el contrato.");
      return;
    }
    setSaving(true); setError("");
    try {
      // FIX: enviamos candidateId (no candidateProfileId)
      await api.post("/contracts", {
        jobId:        form.jobId,
        candidateId:  form.candidateId,
        title:        form.title,
        description:  form.description  || undefined,
        deliverables: form.deliverables || undefined,
        totalAmount: form.totalAmount ? Number(form.totalAmount) : 0,
        paymentScheme:form.paymentScheme|| undefined,
        startDate:    form.startDate    || undefined,
        endDate:      form.endDate      || undefined,
      });
      onSuccess();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error ?? "Error al crear el contrato.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-8 py-10">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onCancel}
          className="p-2 hover:bg-[#f2f4f6] rounded-xl transition-colors text-[#424750]">
          <X className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-[#191c1e] font-headline">Nuevo contrato</h1>
          <p className="text-sm text-[#424750]">Formaliza el trabajo con un candidato seleccionado.</p>
        </div>
      </div>

      {error && (
        <div className="bg-[#ffdad6] text-[#93000a] text-sm font-medium px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Sección 1 — Postulación */}
        <div className="bg-white rounded-2xl border border-[#e6e8ea] p-6 space-y-5">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#424750] pb-3 border-b border-[#f2f4f6]">
            Candidato y vacante *
          </h2>

          {applications.length === 0 ? (
            <div className="text-center py-6 border-2 border-dashed border-[#e6e8ea] rounded-xl">
              <p className="text-sm text-[#737781] font-medium">
                No tienes candidatos seleccionados aún.
              </p>
              <p className="text-xs text-[#b0b4bc] mt-1">
                Ve a una vacante → postulantes, cambia el estado a "Seleccionado"
                y luego regresa aquí para crear el contrato.
              </p>
            </div>
          ) : (
            <div>
              <label className={lbl}>Selecciona una postulación *</label>
              <select
                required
                defaultValue=""
                onChange={e => handleApplicationSelect(e.target.value)}
                className={`${inp} cursor-pointer`}
              >
                <option value="" disabled>— Elige candidato y vacante —</option>
                {applications.map(app => (
                  <option key={app.id} value={app.id}>
                    {app.candidate.fullName ?? "Candidato"} · {app.job.title}
                  </option>
                ))}
              </select>

              {/* Confirmación visual cuando ya hay candidato seleccionado */}
              {form.candidateId && (
                <p className="text-xs text-[#006d37] font-semibold mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Candidato vinculado correctamente
                </p>
              )}

              <p className="text-xs text-[#737781] mt-2">
                Solo aparecen candidatos en estado "Seleccionado" de tus vacantes.
              </p>
            </div>
          )}
        </div>

        {/* Sección 2 — Info básica */}
        <div className="bg-white rounded-2xl border border-[#e6e8ea] p-6 space-y-5">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#424750] pb-3 border-b border-[#f2f4f6]">
            Información del contrato
          </h2>

          <div>
            <label className={lbl}>Título del contrato *</label>
            <input type="text" required value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="e.j. Desarrollo de landing page — Q3 2025"
              className={inp} />
          </div>

          <div>
            <label className={lbl}>Descripción</label>
            <textarea rows={3} value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Describe el alcance general del trabajo, objetivos y contexto..."
              className={`${inp} resize-none`} />
          </div>

          <div>
            <label className={lbl}>Entregables</label>
            <textarea rows={3} value={form.deliverables}
              onChange={e => setForm(p => ({ ...p, deliverables: e.target.value }))}
              placeholder="e.j. API REST documentada, 5 componentes React, informe final..."
              className={`${inp} resize-none`} />
          </div>
        </div>

        {/* Sección 3 — Condiciones económicas */}
        <div className="bg-white rounded-2xl border border-[#e6e8ea] p-6 space-y-5">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#424750] pb-3 border-b border-[#f2f4f6]">
            Condiciones económicas y fechas
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Monto total (COP)</label>
              <input type="number" min={1} value={form.totalAmount}
                onChange={e => setForm(p => ({ ...p, totalAmount: e.target.value }))}
                placeholder="e.j. 2000000" className={inp} />
            </div>

            <div>
              <label className={lbl}>Esquema de pago</label>
              <input type="text" value={form.paymentScheme}
                onChange={e => setForm(p => ({ ...p, paymentScheme: e.target.value }))}
                placeholder="e.j. 50% inicio, 50% al entregar"
                className={inp} />
            </div>

            <div>
              <label className={lbl}>Fecha de inicio</label>
              <input type="date" value={form.startDate}
                onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                className={inp} />
            </div>

            <div>
              <label className={lbl}>Fecha de finalización</label>
              <input type="date" value={form.endDate}
                onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                className={inp} />
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onCancel}
            className="px-6 py-3 rounded-full font-bold text-sm text-[#424750] hover:bg-[#f2f4f6] transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={saving || applications.length === 0}
            className="flex items-center gap-2 bg-gradient-to-br from-[#006d37] to-[#00743a] text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider shadow-lg shadow-[#006d37]/20 disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 transition-all">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Creando..." : "Crear contrato"}
          </button>
        </div>
      </form>
    </div>
  );
}