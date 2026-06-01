"use client";

import { useAuth } from "@/src/context/auth-context";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/src/lib/api";
import DeliverablesPanel from "@/src/components/contracts/DeliverablesPanel";
import RatingsPanel from "@/src/components/contracts/RatingsPanel";
import InfoCallout from "@/src/components/info/InfoCallout";
import {
  ArrowLeft, FileText, Clock, CheckCircle2, XCircle,
  Building2, Briefcase, Calendar, DollarSign, AlertCircle,
  Loader2, ExternalLink, Info,
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Payment {
  id: string;
  amount: number;
  description: string | null;
  status: string;
  receiptUrl: string | null;
  createdAt: string;
}

interface Contract {
  id: string;
  status: string;
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  totalAmount: number | null;
  contractFileUrl: string | null;
  createdAt: string;
  job: { id: string; title: string } | null;
  company: { companyName: string | null; city: string | null } | null;
  payments: Payment[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDING_CANDIDATE: {
    label: "Pendiente de tu confirmación",
    color: "text-[#7c5c00]",
    bg: "bg-[#fff3cd]",
    icon: <Clock className="w-4 h-4" />,
  },
  ACTIVE: {
    label: "Contrato activo",
    color: "text-[#005228]",
    bg: "bg-[#6bfe9c]/20",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  COMPLETED: {
    label: "Contrato completado",
    color: "text-[#00386c]",
    bg: "bg-[#a6c8ff]/20",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  CANCELLED: {
    label: "Contrato cancelado",
    color: "text-[#93000a]",
    bg: "bg-[#ffdad6]",
    icon: <XCircle className="w-4 h-4" />,
  },
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
}

function formatAmount(amount: number | null) {
  if (!amount) return "A convenir";
  return `$${amount.toLocaleString("es-CO")} COP`;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ContratoDetallePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const contractId = params.id as string;

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [confirming, setConfirming] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState("");

  useEffect(() => {
    if (!isLoading && user?.role === "COMPANY") router.replace("/dashboard/company/contratos");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) loadContract();
  }, [user, contractId]);

  async function loadContract() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/contracts/${contractId}`);
      setContract(res.data);
    } catch {
      setError("No se pudo cargar el contrato.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    // FIX P0: guard — no debería llegar aquí si no hay PDF, pero por si acaso
    if (!contract?.contractFileUrl) return;

    setConfirming(true);
    setConfirmMsg("");
    try {
      await api.patch(`/contracts/${contractId}/confirm`);
      setConfirmMsg("¡Contrato confirmado exitosamente! Ya está activo.");
      await loadContract();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setConfirmMsg(e.response?.data?.error ?? "Error al confirmar. Intenta de nuevo.");
    } finally {
      setConfirming(false);
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
        <span className="w-8 h-8 border-2 border-[#00386c]/20 border-t-[#00386c] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f7f9fb] text-center px-8">
        <AlertCircle className="w-10 h-10 text-[#ba1a1a]" />
        <p className="text-[#93000a] font-semibold">{error || "Contrato no encontrado."}</p>
        <Link href="/dashboard/candidate/contratos"
          className="px-6 py-2 bg-[#00386c] text-white rounded-full text-sm font-bold hover:opacity-90 transition">
          Volver a contratos
        </Link>
      </div>
    );
  }

  const meta       = STATUS_META[contract.status] ?? STATUS_META.CANCELLED;
  const isPending  = contract.status === "PENDING_CANDIDATE";
  const hasPDF     = !!contract.contractFileUrl;
  const totalPaid  = contract.payments
    .filter(p => p.status === "CONFIRMED")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="max-w-screen-md mx-auto px-8 py-10">

      {/* Navegación */}
      <Link href="/dashboard/candidate/contratos"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#424750] hover:text-[#00386c] transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Volver a mis contratos
      </Link>

      {/* Badge de estado */}
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-4 ${meta.bg} ${meta.color}`}>
        {meta.icon}
        {meta.label}
      </div>

      {/* Título */}
      <h1 className="text-3xl font-extrabold text-[#191c1e] font-headline tracking-tight mb-2">
        {contract.title}
      </h1>
      <p className="text-sm text-[#737781] mb-8">
        Creado el {formatDate(contract.createdAt)}
      </p>

      {/* CTA de confirmación (solo si está pendiente) */}
      {isPending && (
        <div className="bg-[#fff3cd] border border-[#ffc107]/30 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-3 mb-4">
            <Info className="w-5 h-5 text-[#7c5c00] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-[#7c5c00] mb-1">Acción requerida</h3>
              <p className="text-sm text-[#7c5c00]/80">
                La empresa ha preparado este contrato para ti. Revisa todos los términos
                y si estás de acuerdo, confírmalo para activarlo.
              </p>
            </div>
          </div>

          {/* FIX P0: aviso cuando no hay PDF */}
          {!hasPDF && (
            <div className="mb-4 bg-[#ffdad6] text-[#93000a] text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              La empresa aún no ha subido el documento del contrato. No puedes confirmar hasta entonces.
            </div>
          )}

          {confirmMsg && (
            <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-semibold ${
              confirmMsg.includes("exitosamente")
                ? "bg-[#6bfe9c]/20 text-[#005228]"
                : "bg-[#ffdad6] text-[#93000a]"
            }`}>
              {confirmMsg}
            </div>
          )}

          {/* FIX P0: disabled si no hay PDF */}
          <button
            onClick={handleConfirm}
            disabled={confirming || !hasPDF}
            className="flex items-center gap-2 bg-gradient-to-br from-[#006d37] to-[#00743a] text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider shadow-lg shadow-[#006d37]/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {confirming
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <CheckCircle2 className="w-4 h-4" />}
            {confirming ? "Confirmando..." : "Confirmar y activar contrato"}
          </button>
        </div>
      )}

      {/* Mensaje confirmación exitosa fuera del bloque pending */}
      {confirmMsg && !isPending && (
        <div className="mb-6 bg-[#6bfe9c]/20 text-[#005228] px-5 py-3.5 rounded-2xl text-sm font-semibold">
          ✓ {confirmMsg}
        </div>
      )}

      <InfoCallout
        title="Entregables y pagos"
        description="Sube tus entregables según lo acordado. El pago se libera tras la revisión de la empresa."
        href="/info/procesos/contratos"
        linkLabel="Saber más"
      />

      {/* Detalles del contrato */}
      <div className="space-y-5">

        {/* Info principal */}
        <div className="bg-white rounded-2xl border border-[#e6e8ea] p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-[#424750] mb-5">
            Detalles del contrato
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex items-start gap-3">
              <Building2 className="w-4 h-4 text-[#737781] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-[#737781] font-semibold uppercase tracking-wider">Empresa</p>
                <p className="font-bold text-[#191c1e] mt-0.5">
                  {contract.company?.companyName ?? "—"}
                </p>
                {contract.company?.city && (
                  <p className="text-xs text-[#737781]">{contract.company.city}</p>
                )}
              </div>
            </div>

            {contract.job && (
              <div className="flex items-start gap-3">
                <Briefcase className="w-4 h-4 text-[#737781] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-[#737781] font-semibold uppercase tracking-wider">Vacante relacionada</p>
                  <p className="font-bold text-[#191c1e] mt-0.5">{contract.job.title}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <DollarSign className="w-4 h-4 text-[#737781] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-[#737781] font-semibold uppercase tracking-wider">Monto total</p>
                <p className="font-extrabold text-[#191c1e] mt-0.5 text-lg font-headline">
                  {formatAmount(contract.totalAmount)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-[#737781] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-[#737781] font-semibold uppercase tracking-wider">Vigencia</p>
                <p className="font-bold text-[#191c1e] mt-0.5">
                  {formatDate(contract.startDate)}
                  {contract.endDate ? ` — ${formatDate(contract.endDate)}` : " (sin fecha fin)"}
                </p>
              </div>
            </div>
          </div>

          {contract.description && (
            <div className="mt-5 pt-5 border-t border-[#f2f4f6]">
              <p className="text-xs text-[#737781] font-semibold uppercase tracking-wider mb-2">Descripción</p>
              <p className="text-sm text-[#424750] leading-relaxed whitespace-pre-line">
                {contract.description}
              </p>
            </div>
          )}
        </div>

        {/* Archivo del contrato */}
        <div className="bg-white rounded-2xl border border-[#e6e8ea] p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-[#424750] mb-4">
            Documento del contrato
          </h2>
          {hasPDF ? (
            <a href={contract.contractFileUrl!} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-[#f7f9fb] rounded-xl hover:bg-[#f2f4f6] transition-colors group">
              <div className="w-10 h-10 bg-[#00386c] rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#191c1e] text-sm group-hover:text-[#00386c] transition-colors">
                  Contrato PDF
                </p>
                <p className="text-xs text-[#737781]">Haz clic para ver el documento completo</p>
              </div>
              <ExternalLink className="w-4 h-4 text-[#737781] group-hover:text-[#00386c] transition-colors" />
            </a>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-[#f7f9fb] rounded-xl border-2 border-dashed border-[#e6e8ea]">
              <div className="w-10 h-10 bg-[#e6e8ea] rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-[#737781]" />
              </div>
              <p className="text-sm text-[#737781]">
                La empresa aún no ha subido el PDF del contrato.
              </p>
            </div>
          )}
        </div>

        {/* Entregables */}
        <div className="bg-white rounded-2xl border border-[#e6e8ea] p-6">
          <DeliverablesPanel
            contractId={contractId}
            contractStatus={contract.status}
            role="CANDIDATE"
          />
        </div>

        {/* Pagos */}
        <div className="bg-white rounded-2xl border border-[#e6e8ea] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-black uppercase tracking-widest text-[#424750]">
              Pagos
            </h2>
            {contract.totalAmount && (
              <div className="text-right">
                <p className="text-xs text-[#737781]">Recibido</p>
                <p className="font-extrabold text-[#006d37] font-headline">
                  ${totalPaid.toLocaleString("es-CO")} COP
                </p>
              </div>
            )}
          </div>

          {contract.payments.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-[#e6e8ea] rounded-xl">
              <DollarSign className="w-8 h-8 text-[#c2c6d1] mx-auto mb-2" />
              <p className="text-sm text-[#737781]">Aún no hay pagos registrados.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contract.payments.map(payment => {
                const isPaid = payment.status === "CONFIRMED";
                return (
                  <div key={payment.id}
                    className="flex items-center justify-between p-4 bg-[#f7f9fb] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isPaid ? "bg-[#6bfe9c]/20" : "bg-[#e6e8ea]"
                      }`}>
                        {isPaid
                          ? <CheckCircle2 className="w-4 h-4 text-[#006d37]" />
                          : <Clock className="w-4 h-4 text-[#737781]" />}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[#191c1e]">
                          {payment.description ?? "Pago"}
                        </p>
                        <p className="text-xs text-[#737781]">
                          {formatDate(payment.createdAt)} ·{" "}
                          <span className={isPaid ? "text-[#006d37] font-semibold" : "text-[#737781]"}>
                            {isPaid ? "Confirmado" : "Pendiente"}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-[#191c1e] font-headline">
                        ${payment.amount.toLocaleString("es-CO")}
                      </span>
                      {payment.receiptUrl && (
                        <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-[#006d37] font-bold hover:underline flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" /> Comprobante
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* Calificaciones — visible cuando el contrato está completado */}
        {contract.status === "COMPLETED" && (
          <div className="bg-white rounded-2xl border border-[#e6e8ea] p-6">
            <RatingsPanel contractId={contractId} role="CANDIDATE" />
          </div>
        )}

      </div>
    </div>
  );
}