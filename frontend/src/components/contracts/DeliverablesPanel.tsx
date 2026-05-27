"use client";

import { useEffect, useState } from "react";
import api from "@/src/lib/api";
import { Deliverable, DeliverableStatus } from "@/src/types/api";
import {
  PackageCheck, Plus, Upload, CheckCircle2, XCircle,
  Clock, Send, AlertCircle, Loader2, X, Calendar,
  FileText, ExternalLink, ChevronDown, ChevronUp,
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface DeliverablesPanelProps {
  contractId: string;
  contractStatus: string;   // PENDING_CANDIDATE | ACTIVE | COMPLETED | CANCELLED
  role: "COMPANY" | "CANDIDATE";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_META: Record<DeliverableStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDING: {
    label: "Pendiente",
    color: "text-[#424750]",
    bg: "bg-[#f2f4f6]",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  SUBMITTED: {
    label: "Enviado — en revisión",
    color: "text-[#7c5c00]",
    bg: "bg-[#fff3cd]",
    icon: <Send className="w-3.5 h-3.5" />,
  },
  APPROVED: {
    label: "Aprobado",
    color: "text-[#005228]",
    bg: "bg-[#6bfe9c]/20",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  REJECTED: {
    label: "Rechazado",
    color: "text-[#93000a]",
    bg: "bg-[#ffdad6]",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Subcomponente: fila de entregable ────────────────────────────────────────

interface DeliverableRowProps {
  item: Deliverable;
  role: "COMPANY" | "CANDIDATE";
  contractActive: boolean;
  onAction: () => void; // recarga la lista tras cualquier acción
}

function DeliverableRow({ item, role, contractActive, onAction }: DeliverableRowProps) {
  const [expanded, setExpanded]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewing, setReviewing]   = useState(false);
  const [msg, setMsg]               = useState("");
  const [notes, setNotes]           = useState("");
  const [feedback, setFeedback]     = useState("");

  const meta = STATUS_META[item.status];
  const inp  = "w-full bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#006d37] focus:ring-0 rounded-lg px-4 py-3 text-sm text-[#191c1e] placeholder:text-[#737781] outline-none transition-all resize-none";

  // Candidato envía entregable
  async function handleSubmit(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setSubmitting(true); setMsg("");
    const fd = new FormData();
    if (file) fd.append("file", file);
    if (notes) fd.append("candidateNotes", notes);
    try {
      await api.post(`/contracts/deliverables/${item.id}/submit`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMsg("Entregable enviado correctamente.");
      setNotes("");
      setTimeout(() => { setMsg(""); onAction(); }, 2000);
    } catch (err: unknown) {
      const er = err as { response?: { data?: { error?: string } } };
      setMsg(er.response?.data?.error ?? "Error al enviar el entregable.");
    } finally {
      setSubmitting(false);
      if (e.target) e.target.value = "";
    }
  }

  // Empresa aprueba o rechaza
  async function handleReview(status: "APPROVED" | "REJECTED") {
    setReviewing(true); setMsg("");
    try {
      await api.patch(`/contracts/deliverables/${item.id}/review`, {
        status,
        companyFeedback: feedback || undefined,
      });
      setMsg(status === "APPROVED" ? "Entregable aprobado." : "Entregable rechazado.");
      setFeedback("");
      setTimeout(() => { setMsg(""); onAction(); }, 2000);
    } catch (err: unknown) {
      const er = err as { response?: { data?: { error?: string } } };
      setMsg(er.response?.data?.error ?? "Error al revisar el entregable.");
    } finally {
      setReviewing(false);
    }
  }

  const canSubmit  = role === "CANDIDATE" && contractActive && (item.status === "PENDING" || item.status === "REJECTED");
  const canReview  = role === "COMPANY"   && item.status === "SUBMITTED";

  return (
    <div className={`rounded-xl border transition-all ${
      item.status === "SUBMITTED" ? "border-[#ffc107]/40 bg-[#fffdf0]" : "border-[#e6e8ea] bg-white"
    }`}>
      {/* Cabecera clickeable */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center justify-between gap-4 p-4 text-left"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <PackageCheck className="w-4 h-4 text-[#737781] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-[#191c1e] truncate">{item.title}</p>
            {item.dueDate && (
              <p className="text-xs text-[#737781] flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3" /> Fecha límite: {formatDate(item.dueDate)}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${meta.bg} ${meta.color}`}>
            {meta.icon} {meta.label}
          </span>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-[#737781]" />
            : <ChevronDown className="w-4 h-4 text-[#737781]" />}
        </div>
      </button>

      {/* Contenido expandido */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-[#f2f4f6] pt-4">

          {/* Descripción */}
          {item.description && (
            <p className="text-sm text-[#424750] leading-relaxed">{item.description}</p>
          )}

          {/* Archivo enviado */}
          {item.fileUrl && (
            <a href={item.fileUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#006d37] hover:underline">
              <FileText className="w-3.5 h-3.5" />
              Ver archivo enviado
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {/* Notas del candidato */}
          {item.candidateNotes && (
            <div className="bg-[#f7f9fb] rounded-lg p-3">
              <p className="text-xs font-bold text-[#424750] uppercase tracking-wider mb-1">Notas del candidato</p>
              <p className="text-sm text-[#424750]">{item.candidateNotes}</p>
            </div>
          )}

          {/* Feedback de la empresa */}
          {item.companyFeedback && (
            <div className={`rounded-lg p-3 ${item.status === "APPROVED" ? "bg-[#6bfe9c]/10" : "bg-[#ffdad6]/50"}`}>
              <p className="text-xs font-bold text-[#424750] uppercase tracking-wider mb-1">Retroalimentación</p>
              <p className="text-sm text-[#424750]">{item.companyFeedback}</p>
            </div>
          )}

          {/* Mensaje de acción */}
          {msg && (
            <div className={`px-4 py-3 rounded-xl text-sm font-semibold ${
              msg.toLowerCase().includes("error")
                ? "bg-[#ffdad6] text-[#93000a]"
                : "bg-[#6bfe9c]/20 text-[#005228]"
            }`}>
              {msg}
            </div>
          )}

          {/* ── ACCIONES CANDIDATO ── */}
          {canSubmit && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-[#424750] uppercase tracking-wider">
                {item.status === "REJECTED" ? "Reenviar entregable" : "Enviar entregable"}
              </p>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Notas opcionales para la empresa..."
                className={inp}
              />
              <label className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold cursor-pointer transition-all ${
                submitting
                  ? "bg-[#f2f4f6] text-[#737781] cursor-not-allowed"
                  : "bg-[#00386c] text-white hover:opacity-90"
              }`}>
                {submitting
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Upload className="w-4 h-4" />}
                {submitting ? "Enviando..." : "Adjuntar archivo y enviar"}
                <input
                  type="file"
                  className="hidden"
                  disabled={submitting}
                  onChange={handleSubmit}
                />
              </label>
              <p className="text-xs text-[#737781]">Puedes enviar sin archivo si solo quieres agregar notas.</p>
            </div>
          )}

          {/* Enviar sin archivo (solo notas) */}
          {canSubmit && (
            <button
              type="button"
              disabled={submitting}
              onClick={async () => {
                setSubmitting(true); setMsg("");
                const fd = new FormData();
                if (notes) fd.append("candidateNotes", notes);
                try {
                  await api.post(`/contracts/deliverables/${item.id}/submit`, fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                  });
                  setMsg("Entregable enviado correctamente.");
                  setNotes("");
                  setTimeout(() => { setMsg(""); onAction(); }, 2000);
                } catch (err: unknown) {
                  const er = err as { response?: { data?: { error?: string } } };
                  setMsg(er.response?.data?.error ?? "Error al enviar.");
                } finally {
                  setSubmitting(false);
                }
              }}
              className="text-xs text-[#737781] font-semibold hover:text-[#00386c] transition-colors underline underline-offset-2"
            >
              Enviar solo con notas (sin archivo)
            </button>
          )}

          {/* ── ACCIONES EMPRESA ── */}
          {canReview && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-[#424750] uppercase tracking-wider">Revisar entregable</p>
              <textarea
                rows={2}
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Retroalimentación para el candidato (opcional)..."
                className={inp}
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={reviewing}
                  onClick={() => handleReview("APPROVED")}
                  className="flex items-center gap-2 bg-gradient-to-br from-[#006d37] to-[#00743a] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition-all disabled:opacity-60"
                >
                  {reviewing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Aprobar
                </button>
                <button
                  type="button"
                  disabled={reviewing}
                  onClick={() => handleReview("REJECTED")}
                  className="flex items-center gap-2 bg-[#ffdad6] text-[#93000a] px-5 py-2.5 rounded-full text-sm font-bold hover:bg-[#ba1a1a] hover:text-white transition-all disabled:opacity-60"
                >
                  {reviewing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                  Rechazar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function DeliverablesPanel({ contractId, contractStatus, role }: DeliverablesPanelProps) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");

  // Crear hito (solo empresa)
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem]   = useState({ title: "", description: "", dueDate: "" });
  const [saving, setSaving]     = useState(false);
  const [formMsg, setFormMsg]   = useState("");

  const contractActive = contractStatus === "ACTIVE";
  const inp = "w-full bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#006d37] focus:ring-0 rounded-lg px-4 py-3 text-sm text-[#191c1e] placeholder:text-[#737781] outline-none transition-all";
  const lbl = "block text-xs font-semibold uppercase tracking-wider text-[#424750] mb-2";

  useEffect(() => {
    loadDeliverables();
  }, [contractId]);

  async function loadDeliverables() {
    setLoading(true); setError("");
    try {
      const res = await api.get<Deliverable[]>(`/contracts/${contractId}/deliverables`);
      setDeliverables(res.data);
    } catch {
      setError("No se pudieron cargar los entregables.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItem.title.trim()) return;
    setSaving(true); setFormMsg("");
    try {
      await api.post(`/contracts/${contractId}/deliverables`, {
        title:       newItem.title,
        description: newItem.description || undefined,
        dueDate:     newItem.dueDate     || undefined,
      });
      setFormMsg("Hito creado correctamente.");
      setNewItem({ title: "", description: "", dueDate: "" });
      setShowForm(false);
      setTimeout(() => setFormMsg(""), 3000);
      await loadDeliverables();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setFormMsg(e.response?.data?.error ?? "Error al crear el hito.");
    } finally {
      setSaving(false);
    }
  }

  // Resumen de estados
  const pending  = deliverables.filter(d => d.status === "PENDING").length;
  const submitted = deliverables.filter(d => d.status === "SUBMITTED").length;
  const approved  = deliverables.filter(d => d.status === "APPROVED").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="w-6 h-6 border-2 border-[#006d37]/20 border-t-[#006d37] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <AlertCircle className="w-8 h-8 text-[#ba1a1a]" />
        <p className="text-sm text-[#93000a] font-semibold">{error}</p>
        <button onClick={loadDeliverables}
          className="text-xs font-bold text-[#00386c] hover:underline">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Header del panel */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-[#424750]">
            Entregables / Hitos
          </h2>
          {deliverables.length > 0 && (
            <p className="text-xs text-[#737781] mt-0.5">
              {approved}/{deliverables.length} aprobados
              {submitted > 0 && ` · ${submitted} en revisión`}
              {pending > 0  && ` · ${pending} pendientes`}
            </p>
          )}
        </div>
        {role === "COMPANY" && contractActive && !showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 bg-[#006d37] text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-[#00743a] transition-colors">
            <Plus className="w-3.5 h-3.5" /> Nuevo hito
          </button>
        )}
      </div>

      {/* Mensaje global del panel */}
      {formMsg && (
        <div className={`px-4 py-3 rounded-xl text-sm font-semibold ${
          formMsg.toLowerCase().includes("error")
            ? "bg-[#ffdad6] text-[#93000a]"
            : "bg-[#6bfe9c]/20 text-[#005228]"
        }`}>
          {formMsg}
        </div>
      )}

      {/* Formulario crear hito (empresa) */}
      {showForm && role === "COMPANY" && (
        <form onSubmit={handleCreateItem} className="bg-[#f7f9fb] rounded-2xl border border-[#e6e8ea] p-5 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-sm text-[#191c1e]">Nuevo hito</h3>
            <button type="button" onClick={() => setShowForm(false)}
              className="p-1 text-[#737781] hover:text-[#191c1e] rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div>
            <label className={lbl}>Título *</label>
            <input type="text" required value={newItem.title}
              onChange={e => setNewItem(p => ({ ...p, title: e.target.value }))}
              placeholder="ej. Entrega de diseños finales"
              className={inp} />
          </div>
          <div>
            <label className={lbl}>Descripción</label>
            <textarea rows={2} value={newItem.description}
              onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))}
              placeholder="Describe qué debe incluir este entregable..."
              className={`${inp} resize-none`} />
          </div>
          <div>
            <label className={lbl}>Fecha límite</label>
            <input type="date" value={newItem.dueDate}
              onChange={e => setNewItem(p => ({ ...p, dueDate: e.target.value }))}
              className={inp} />
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2 rounded-full text-sm font-semibold text-[#424750] hover:bg-[#e6e8ea] transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 bg-[#006d37] text-white px-6 py-2 rounded-full text-sm font-bold hover:opacity-90 disabled:opacity-60">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              {saving ? "Creando..." : "Crear hito"}
            </button>
          </div>
        </form>
      )}

      {/* Lista vacía */}
      {deliverables.length === 0 && !showForm ? (
        <div className="text-center py-10 border-2 border-dashed border-[#e6e8ea] rounded-xl">
          <PackageCheck className="w-8 h-8 text-[#c2c6d1] mx-auto mb-3" />
          <p className="text-sm text-[#737781] font-medium">
            {role === "COMPANY"
              ? "Aún no hay hitos. Crea el primero para que el candidato sepa qué debe entregar."
              : "La empresa aún no ha definido los hitos de este contrato."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {deliverables.map(item => (
            <DeliverableRow
              key={item.id}
              item={item}
              role={role}
              contractActive={contractActive}
              onAction={loadDeliverables}
            />
          ))}
        </div>
      )}
    </div>
  );
}