"use client";

import { useState } from "react";
import api from "@/src/lib/api";
import { PaymentScheme } from "@/src/types/api";
import { X, Save, Loader2, CheckCircle2, Plus, Trash2 } from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Application {
  id: string;
  status?: string;
  candidate: { id: string; fullName: string | null };
  job: { id: string; title: string };
}

interface DeliverableItem {
  title: string;
  description: string;
  dueDate: string;
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
    title:         "",
    description:   "",
    deliverables:  "",
    jobId:         "",
    candidateId:   "",
    totalAmount:   "",
    paymentScheme: "" as PaymentScheme | "",
    startDate:     "",
    endDate:       "",
  });

  // Hitos opcionales
  const [items, setItems] = useState<DeliverableItem[]>([]);

  const inp = "w-full bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#006d37] focus:ring-0 rounded-lg px-4 py-3 text-sm text-[#191c1e] placeholder:text-[#737781] outline-none transition-all";
  const lbl = "block text-xs font-semibold uppercase tracking-wider text-[#424750] mb-2";

  function handleApplicationSelect(applicationId: string) {
    const app = applications.find(a => a.id === applicationId);
    if (app) {
      setForm(p => ({ ...p, jobId: app.job.id, candidateId: app.candidate.id }));
    } else {
      setForm(p => ({ ...p, jobId: "", candidateId: "" }));
    }
  }

  function addItem() {
    setItems(prev => [...prev, { title: "", description: "", dueDate: "" }]);
  }

  function updateItem(index: number, field: keyof DeliverableItem, value: string) {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }

  function removeItem(index: number) {
    setItems(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.jobId || !form.candidateId) {
      setError("Debes seleccionar una postulación para vincular el contrato.");
      return;
    }

    // FIX P0: validar fechas obligatorias
    if (!form.startDate || !form.endDate) {
      setError("Las fechas de inicio y finalización son obligatorias.");
      return;
    }
    if (form.endDate <= form.startDate) {
      setError("La fecha de finalización debe ser posterior a la de inicio.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload: Record<string, unknown> = {
        jobId:        form.jobId,
        candidateId:  form.candidateId,
        title:        form.title,
        startDate:    form.startDate,
        endDate:      form.endDate,
        totalAmount:  form.totalAmount ? Number(form.totalAmount) : 0,
      };
      if (form.description)   payload.description   = form.description;
      if (form.deliverables)  payload.deliverables  = form.deliverables;
      if (form.paymentScheme) payload.paymentScheme = form.paymentScheme;
      if (items.length > 0) {
        payload.items = items
          .filter(it => it.title.trim())
          .map(it => ({
            title:       it.title,
            description: it.description || undefined,
            dueDate:     it.dueDate     || undefined,
          }));
      }

      await api.post("/contracts", payload);
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
              placeholder="ej. Desarrollo de landing page — Q3 2025"
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
            <label className={lbl}>Entregables (resumen)</label>
            <textarea rows={3} value={form.deliverables}
              onChange={e => setForm(p => ({ ...p, deliverables: e.target.value }))}
              placeholder="ej. API REST documentada, 5 componentes React, informe final..."
              className={`${inp} resize-none`} />
          </div>
        </div>

        {/* Sección 3 — Condiciones económicas y fechas */}
        <div className="bg-white rounded-2xl border border-[#e6e8ea] p-6 space-y-5">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#424750] pb-3 border-b border-[#f2f4f6]">
            Condiciones económicas y fechas
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Monto total (COP)</label>
              <input type="number" min={1} value={form.totalAmount}
                onChange={e => setForm(p => ({ ...p, totalAmount: e.target.value }))}
                placeholder="ej. 2000000" className={inp} />
            </div>

            {/* FIX P0: select en vez de input texto */}
            <div>
              <label className={lbl}>Esquema de pago</label>
              <select
                value={form.paymentScheme}
                onChange={e => setForm(p => ({ ...p, paymentScheme: e.target.value as PaymentScheme | "" }))}
                className={`${inp} cursor-pointer`}
              >
                <option value="">— Selecciona esquema —</option>
                <option value="SINGLE">Pago único</option>
                <option value="MILESTONES">Por hitos</option>
                <option value="PERIODIC">Periódico</option>
              </select>
            </div>

            {/* FIX P0: fechas con required */}
            <div>
              <label className={lbl}>Fecha de inicio *</label>
              <input type="date" required value={form.startDate}
                onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                className={inp} />
            </div>

            <div>
              <label className={lbl}>Fecha de finalización *</label>
              <input type="date" required value={form.endDate}
                onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                className={inp} />
            </div>
          </div>
        </div>

        {/* Sección 4 — Hitos opcionales */}
        <div className="bg-white rounded-2xl border border-[#e6e8ea] p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#f2f4f6]">
            <h2 className="text-xs font-black uppercase tracking-widest text-[#424750]">
              Hitos de entregables <span className="text-[#737781] font-normal normal-case">(opcional)</span>
            </h2>
            <button type="button" onClick={addItem}
              className="flex items-center gap-1.5 text-xs font-bold text-[#006d37] hover:text-[#004d25] transition-colors">
              <Plus className="w-3.5 h-3.5" /> Agregar hito
            </button>
          </div>

          {items.length === 0 ? (
            <p className="text-xs text-[#737781] text-center py-3">
              Sin hitos aún. Los puedes agregar después desde el detalle del contrato.
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="bg-[#f7f9fb] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#424750] uppercase tracking-wider">
                      Hito {index + 1}
                    </span>
                    <button type="button" onClick={() => removeItem(index)}
                      className="text-[#ba1a1a] hover:text-[#93000a] transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input type="text" placeholder="Título del hito *" value={item.title}
                    onChange={e => updateItem(index, "title", e.target.value)}
                    className={inp} />
                  <input type="text" placeholder="Descripción (opcional)" value={item.description}
                    onChange={e => updateItem(index, "description", e.target.value)}
                    className={inp} />
                  <div>
                    <label className="block text-xs text-[#737781] mb-1">Fecha límite (opcional)</label>
                    <input type="date" value={item.dueDate}
                      onChange={e => updateItem(index, "dueDate", e.target.value)}
                      className={inp} />
                  </div>
                </div>
              ))}
            </div>
          )}
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