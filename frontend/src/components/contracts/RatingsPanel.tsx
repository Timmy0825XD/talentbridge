"use client";

import { useEffect, useState } from "react";
import api from "@/src/lib/api";
import { Star, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ContractRating {
  id: string;
  overallScore: number;
  comment: string | null;
  // Dimensiones empresa → candidato
  quality?: number;
  deadlines?: number;
  communication?: number;
  attitude?: number;
  // Dimensiones candidato → empresa
  paymentPunctuality?: number;
  instructionClarity?: number;
  workEnvironment?: number;
}

interface RatingsState {
  contractStatus: string;
  ratingsPending: boolean;
  canRateCandidate: boolean;
  canRateCompany: boolean;
  companyRating: ContractRating | null;
  candidateRating: ContractRating | null;
}

interface RatingsPanelProps {
  contractId: string;
  role: "COMPANY" | "CANDIDATE";
}

// ─── Subcomponente: estrellas ─────────────────────────────────────────────────

function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`transition-colors ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110 transition-transform"}`}
        >
          <Star
            className={`w-5 h-5 ${
              star <= (hover || value)
                ? "text-[#ffc107] fill-[#ffc107]"
                : "text-[#c2c6d1]"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Subcomponente: mostrar calificación existente ────────────────────────────

function RatingDisplay({
  rating,
  role,
  title,
}: {
  rating: ContractRating;
  role: "COMPANY" | "CANDIDATE";
  title: string;
}) {
  const dims =
    role === "COMPANY"
      ? [
          { label: "Calidad del trabajo", value: rating.quality },
          { label: "Cumplimiento de plazos", value: rating.deadlines },
          { label: "Comunicación", value: rating.communication },
          { label: "Actitud", value: rating.attitude },
        ]
      : [
          { label: "Puntualidad en pagos", value: rating.paymentPunctuality },
          { label: "Claridad de instrucciones", value: rating.instructionClarity },
          { label: "Ambiente de trabajo", value: rating.workEnvironment },
        ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-[#424750] uppercase tracking-wider">{title}</p>
        <div className="flex items-center gap-2">
          <StarRating value={Math.round(rating.overallScore)} readonly />
          <span className="text-sm font-bold text-[#191c1e]">
            {rating.overallScore.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {dims.filter(d => d.value !== undefined).map(d => (
          <div key={d.label} className="flex items-center justify-between bg-[#f7f9fb] rounded-lg px-3 py-2">
            <span className="text-xs text-[#737781] font-medium">{d.label}</span>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-[#ffc107] fill-[#ffc107]" />
              <span className="text-xs font-bold text-[#191c1e]">{d.value}</span>
            </div>
          </div>
        ))}
      </div>

      {rating.comment && (
        <div className="bg-[#f7f9fb] rounded-lg p-3">
          <p className="text-xs text-[#737781] font-semibold uppercase tracking-wider mb-1">Comentario</p>
          <p className="text-sm text-[#424750] italic">"{rating.comment}"</p>
        </div>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function RatingsPanel({ contractId, role }: RatingsPanelProps) {
  const [state, setState]   = useState<RatingsState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg]   = useState("");

  // Formulario empresa → candidato
  const [quality, setQuality]           = useState(0);
  const [deadlines, setDeadlines]       = useState(0);
  const [communication, setCommunication] = useState(0);
  const [attitude, setAttitude]         = useState(0);
  const [commentCompany, setCommentCompany] = useState("");

  // Formulario candidato → empresa
  const [paymentPunctuality, setPaymentPunctuality] = useState(0);
  const [instructionClarity, setInstructionClarity] = useState(0);
  const [workEnvironment, setWorkEnvironment]       = useState(0);
  const [commentCandidate, setCommentCandidate]     = useState("");

  useEffect(() => {
    loadRatings();
  }, [contractId]);

  async function loadRatings() {
    setLoading(true); setError("");
    try {
      const res = await api.get<RatingsState>(`/contracts/${contractId}/ratings`);
      setState(res.data);
    } catch {
      setError("No se pudieron cargar las calificaciones.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitCompany() {
    if (!quality || !deadlines || !communication || !attitude) {
      setSubmitMsg("Completa todas las dimensiones antes de enviar.");
      return;
    }
    setSubmitting(true); setSubmitMsg("");
    try {
      await api.post(`/contracts/${contractId}/ratings/company`, {
        quality, deadlines, communication, attitude,
        comment: commentCompany || undefined,
      });
      setSubmitMsg("¡Calificación enviada!");
      setTimeout(() => setSubmitMsg(""), 3000);
      await loadRatings();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setSubmitMsg(e.response?.data?.error ?? "Error al enviar la calificación.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitCandidate() {
    if (!paymentPunctuality || !instructionClarity || !workEnvironment) {
      setSubmitMsg("Completa todas las dimensiones antes de enviar.");
      return;
    }
    setSubmitting(true); setSubmitMsg("");
    try {
      await api.post(`/contracts/${contractId}/ratings/candidate`, {
        paymentPunctuality, instructionClarity, workEnvironment,
        comment: commentCandidate || undefined,
      });
      setSubmitMsg("¡Calificación enviada!");
      setTimeout(() => setSubmitMsg(""), 3000);
      await loadRatings();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setSubmitMsg(e.response?.data?.error ?? "Error al enviar la calificación.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <span className="w-6 h-6 border-2 border-[#006d37]/20 border-t-[#006d37] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !state) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <AlertCircle className="w-7 h-7 text-[#ba1a1a]" />
        <p className="text-sm text-[#93000a] font-semibold">{error}</p>
        <button onClick={loadRatings}
          className="text-xs font-bold text-[#006d37] hover:underline">
          Reintentar
        </button>
      </div>
    );
  }

  const canRate = role === "COMPANY" ? state.canRateCandidate : state.canRateCompany;
  const myRating = role === "COMPANY" ? state.companyRating : state.candidateRating;
  const theirRating = role === "COMPANY" ? state.candidateRating : state.companyRating;

  const inp = "w-full bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#006d37] focus:ring-0 rounded-lg px-4 py-3 text-sm text-[#191c1e] placeholder:text-[#737781] outline-none transition-all resize-none";

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-black uppercase tracking-widest text-[#424750]">
          Calificaciones
        </h2>
        {state.ratingsPending && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-[#7c5c00] bg-[#fff3cd] px-3 py-1 rounded-full">
            <Star className="w-3 h-3" /> Pendientes
          </span>
        )}
      </div>

      {/* Mensaje feedback */}
      {submitMsg && (
        <div className={`px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 ${
          submitMsg.includes("Error") || submitMsg.includes("Completa")
            ? "bg-[#ffdad6] text-[#93000a]"
            : "bg-[#6bfe9c]/20 text-[#005228]"
        }`}>
          {submitMsg.includes("¡") && <CheckCircle2 className="w-4 h-4" />}
          {submitMsg}
        </div>
      )}

      {/* Mi calificación — ya enviada */}
      {myRating && (
        <div className="bg-[#f7f9fb] rounded-xl p-4">
          <RatingDisplay
            rating={myRating}
            role={role}
            title={role === "COMPANY" ? "Tu calificación al candidato" : "Tu calificación a la empresa"}
          />
        </div>
      )}

      {/* Formulario para calificar */}
      {canRate && !myRating && (
        <div className="bg-[#f7f9fb] rounded-xl p-5 space-y-4">
          <p className="text-xs font-bold text-[#424750] uppercase tracking-wider">
            {role === "COMPANY"
              ? "Califica al candidato"
              : "Califica a la empresa"}
          </p>
          <p className="text-xs text-[#737781]">
            Tu calificación ayuda a construir la reputación en la plataforma.
          </p>

          {role === "COMPANY" ? (
            <div className="space-y-3">
              {[
                { label: "Calidad del trabajo", value: quality, set: setQuality },
                { label: "Cumplimiento de plazos", value: deadlines, set: setDeadlines },
                { label: "Comunicación", value: communication, set: setCommunication },
                { label: "Actitud", value: attitude, set: setAttitude },
              ].map(({ label, value, set }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-[#424750] font-medium">{label}</span>
                  <StarRating value={value} onChange={set} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#424750] mb-2">
                  Comentario (opcional)
                </label>
                <textarea rows={2} value={commentCompany}
                  onChange={e => setCommentCompany(e.target.value)}
                  placeholder="Comparte tu experiencia trabajando con este candidato..."
                  className={inp} />
              </div>
              <button onClick={handleSubmitCompany} disabled={submitting}
                className="flex items-center gap-2 bg-gradient-to-br from-[#006d37] to-[#00743a] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:opacity-90 disabled:opacity-60 transition-all">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
                {submitting ? "Enviando..." : "Enviar calificación"}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: "Puntualidad en pagos", value: paymentPunctuality, set: setPaymentPunctuality },
                { label: "Claridad de instrucciones", value: instructionClarity, set: setInstructionClarity },
                { label: "Ambiente de trabajo", value: workEnvironment, set: setWorkEnvironment },
              ].map(({ label, value, set }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-[#424750] font-medium">{label}</span>
                  <StarRating value={value} onChange={set} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#424750] mb-2">
                  Comentario (opcional)
                </label>
                <textarea rows={2} value={commentCandidate}
                  onChange={e => setCommentCandidate(e.target.value)}
                  placeholder="Comparte tu experiencia trabajando con esta empresa..."
                  className={inp} />
              </div>
              <button onClick={handleSubmitCandidate} disabled={submitting}
                className="flex items-center gap-2 bg-gradient-to-br from-[#00386c] to-[#1a4f8b] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:opacity-90 disabled:opacity-60 transition-all">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
                {submitting ? "Enviando..." : "Enviar calificación"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Calificación recibida de la otra parte */}
      {theirRating && (
        <div className="bg-white rounded-xl border border-[#e6e8ea] p-4">
          <RatingDisplay
            rating={theirRating}
            role={role === "COMPANY" ? "CANDIDATE" : "COMPANY"}
            title={role === "COMPANY" ? "Calificación del candidato a ti" : "Calificación de la empresa a ti"}
          />
        </div>
      )}

      {/* Estado: contrato no completado */}
      {state.contractStatus !== "COMPLETED" && (
        <div className="text-center py-6 border-2 border-dashed border-[#e6e8ea] rounded-xl">
          <Star className="w-7 h-7 text-[#c2c6d1] mx-auto mb-2" />
          <p className="text-sm text-[#737781] font-medium">
            Las calificaciones estarán disponibles cuando el contrato sea completado.
          </p>
        </div>
      )}
    </div>
  );
}