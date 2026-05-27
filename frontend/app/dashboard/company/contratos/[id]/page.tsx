"use client";

import { useAuth } from "@/src/context/auth-context";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/src/lib/api";
import DeliverablesPanel from "@/src/components/contracts/DeliverablesPanel";
import {
  ArrowLeft, FileText, Clock, CheckCircle2, XCircle,
  Users, Briefcase, Calendar, DollarSign, AlertCircle,
  Loader2, ExternalLink, Upload, Plus, X,
} from "lucide-react";

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
  paymentScheme: string | null;
  contractFileUrl: string | null;
  confirmedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  candidate: { fullName: string | null; user: { email: string } } | null;
  job: { id: string; title: string } | null;
  payments: Payment[];
  deliverableItems?: import("@/src/types/api").Deliverable[];
  paidAmount?: number;
  pendingAmount?: number;
  remainingAmount?: number;
  _count?: { payments: number; deliverableItems: number };
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  PENDING_CANDIDATE: { label: "Esperando al candidato", color: "text-[#7c5c00]", bg: "bg-[#fff3cd]" },
  ACTIVE:            { label: "Activo",                 color: "text-[#005228]", bg: "bg-[#6bfe9c]/20" },
  COMPLETED:         { label: "Completado",              color: "text-[#00386c]", bg: "bg-[#a6c8ff]/20" },
  CANCELLED:         { label: "Cancelado",               color: "text-[#93000a]", bg: "bg-[#ffdad6]" },
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
}

export default function ContratoEmpresaDetallePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const contractId = params.id as string;

  const [contract, setContract]           = useState<Contract | null>(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileMsg, setFileMsg]             = useState("");
  const [completing, setCompleting]       = useState(false);
  const [completeMsg, setCompleteMsg]     = useState("");
  const [cancelling, setCancelling]       = useState(false);
  const [cancelMsg, setCancelMsg]         = useState("");
  const [showPayForm, setShowPayForm]     = useState(false);
  const [payForm, setPayForm]             = useState({ amount: "", description: "" });
  const [savingPay, setSavingPay]         = useState(false);
  const [payMsg, setPayMsg]               = useState("");
  const [uploadingReceipt, setUploadingReceipt] = useState<string | null>(null);
  const [receiptMsg, setReceiptMsg]       = useState("");

  useEffect(() => {
    if (!isLoading && user?.role !== "COMPANY") router.replace("/dashboard/candidate");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) loadContract();
  }, [user, contractId]);

  async function loadContract() {
    setLoading(true); setError("");
    try {
      const res = await api.get(`/contracts/${contractId}`);
      setContract(res.data);
    } catch {
      setError("No se pudo cargar el contrato.");
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.type !== "application/pdf") { setFileMsg("Solo se permiten archivos PDF."); return; }
    if (file.size > 10 * 1024 * 1024)   { setFileMsg("El archivo no puede superar 10MB."); return; }
    setUploadingFile(true); setFileMsg("");
    const fd = new FormData(); fd.append("file", file);
    try {
      await api.post(`/contracts/${contractId}/file`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      setFileMsg("Documento subido correctamente.");
      setTimeout(() => setFileMsg(""), 4000);
      await loadContract();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setFileMsg(e.response?.data?.error ?? "Error al subir el archivo.");
    } finally {
      setUploadingFile(false);
      if (e.target) e.target.value = "";
    }
  }

  async function handleComplete() {
    setCompleting(true); setCompleteMsg("");
    try {
      await api.patch(`/contracts/${contractId}/complete`);
      setCompleteMsg("Contrato marcado como completado.");
      setTimeout(() => setCompleteMsg(""), 4000);
      await loadContract();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setCompleteMsg(e.response?.data?.error ?? "Error al completar el contrato.");
    } finally {
      setCompleting(false);
    }
  }

  async function handleCancel() {
    if (!confirm("¿Estás seguro de que quieres cancelar este contrato? Esta acción no se puede deshacer.")) return;
    setCancelling(true); setCancelMsg("");
    try {
      await api.patch(`/contracts/${contractId}/cancel`);
      setCancelMsg("Contrato cancelado.");
      setTimeout(() => setCancelMsg(""), 4000);
      await loadContract();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setCancelMsg(e.response?.data?.error ?? "Error al cancelar el contrato.");
    } finally {
      setCancelling(false);
    }
  }

  async function handleAddPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!payForm.amount) return;
    setSavingPay(true); setPayMsg("");
    try {
      await api.post(`/contracts/${contractId}/payments`, {
        amount:      Number(payForm.amount),
        description: payForm.description || undefined,
      });
      setPayMsg("Pago registrado correctamente.");
      setPayForm({ amount: "", description: "" });
      setShowPayForm(false);
      setTimeout(() => setPayMsg(""), 4000);
      await loadContract();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setPayMsg(e.response?.data?.error ?? "Error al registrar el pago.");
    } finally {
      setSavingPay(false);
    }
  }

  async function handleReceiptUpload(paymentId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadingReceipt(paymentId); setReceiptMsg("");
    const fd = new FormData(); fd.append("receipt", file);
    try {
      await api.post(`/contracts/payments/${paymentId}/receipt`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setReceiptMsg("Comprobante subido.");
      setTimeout(() => setReceiptMsg(""), 4000);
      await loadContract();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setReceiptMsg(e.response?.data?.error ?? "Error al subir el comprobante.");
    } finally {
      setUploadingReceipt(null);
      if (e.target) e.target.value = "";
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
        <span className="w-8 h-8 border-2 border-[#006d37]/20 border-t-[#006d37] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f7f9fb] text-center px-8">
        <AlertCircle className="w-10 h-10 text-[#ba1a1a]" />
        <p className="text-[#93000a] font-semibold">{error || "Contrato no encontrado."}</p>
        <Link href="/dashboard/company/contratos"
          className="px-6 py-2 bg-[#006d37] text-white rounded-full text-sm font-bold hover:opacity-90">
          Volver a contratos
        </Link>
      </div>
    );
  }

  const meta      = STATUS_META[contract.status] ?? STATUS_META.CANCELLED;
  const isActive  = contract.status === "ACTIVE";
  const canCancel = contract.status === "PENDING_CANDIDATE" || contract.status === "ACTIVE";
  const totalPaid = contract.payments
    .filter(p => p.status === "CONFIRMED")
    .reduce((sum, p) => sum + p.amount, 0);

  const inp = "w-full bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#006d37] focus:ring-0 rounded-lg px-4 py-3 text-sm text-[#191c1e] placeholder:text-[#737781] outline-none transition-all";
  const lbl = "block text-xs font-semibold uppercase tracking-wider text-[#424750] mb-2";

  return (
    <div className="max-w-screen-md mx-auto px-8 py-10">

      <Link href="/dashboard/company/contratos"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#424750] hover:text-[#006d37] transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Volver a contratos
      </Link>

      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-4 ${meta.bg} ${meta.color}`}>
        {contract.status === "ACTIVE"            && <CheckCircle2 className="w-4 h-4" />}
        {contract.status === "PENDING_CANDIDATE" && <Clock className="w-4 h-4" />}
        {contract.status === "COMPLETED"         && <CheckCircle2 className="w-4 h-4" />}
        {contract.status === "CANCELLED"         && <XCircle className="w-4 h-4" />}
        {meta.label}
      </div>

      <h1 className="text-3xl font-extrabold text-[#191c1e] font-headline tracking-tight mb-2">
        {contract.title}
      </h1>
      <p className="text-sm text-[#737781] mb-8">Creado el {formatDate(contract.createdAt)}</p>

      {/* Mensajes globales */}
      {[completeMsg, cancelMsg, payMsg, fileMsg, receiptMsg].map((msg, i) =>
        msg ? (
          <div key={i} className={`mb-4 px-5 py-3.5 rounded-2xl text-sm font-semibold ${
            msg.toLowerCase().includes("error") || msg.includes("Solo")
              ? "bg-[#ffdad6] text-[#93000a]"
              : "bg-[#6bfe9c]/20 text-[#005228]"
          }`}>{msg}</div>
        ) : null
      )}

      <div className="space-y-5">

        {/* Detalles */}
        <div className="bg-white rounded-2xl border border-[#e6e8ea] p-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#424750] mb-5">Detalles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {contract.candidate && (
              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-[#737781] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-[#737781] font-semibold uppercase tracking-wider">Candidato</p>
                  <p className="font-bold text-[#191c1e] mt-0.5">{contract.candidate.fullName ?? "—"}</p>
                  <p className="text-xs text-[#737781]">{contract.candidate.user.email}</p>
                </div>
              </div>
            )}
            {contract.job && (
              <div className="flex items-start gap-3">
                <Briefcase className="w-4 h-4 text-[#737781] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-[#737781] font-semibold uppercase tracking-wider">Vacante</p>
                  <p className="font-bold text-[#191c1e] mt-0.5">{contract.job.title}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <DollarSign className="w-4 h-4 text-[#737781] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-[#737781] font-semibold uppercase tracking-wider">Monto total</p>
                <p className="font-extrabold text-[#191c1e] mt-0.5 text-lg font-headline">
                  {contract.totalAmount ? `$${contract.totalAmount.toLocaleString("es-CO")} COP` : "A convenir"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-[#737781] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-[#737781] font-semibold uppercase tracking-wider">Vigencia</p>
                <p className="font-bold text-[#191c1e] mt-0.5">
                  {formatDate(contract.startDate)}
                  {contract.endDate ? ` — ${formatDate(contract.endDate)}` : ""}
                </p>
              </div>
            </div>
          </div>
          {/* Campos enriquecidos — esquema de pago, montos, fechas */}
          <div className="mt-5 pt-5 border-t border-[#f2f4f6] grid grid-cols-1 sm:grid-cols-3 gap-4">
            {contract.paymentScheme && (
              <div>
                <p className="text-xs text-[#737781] font-semibold uppercase tracking-wider mb-1">Esquema de pago</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#a6c8ff]/20 text-[#00386c]">
                  {contract.paymentScheme === "SINGLE" ? "Pago único"
                    : contract.paymentScheme === "MILESTONES" ? "Por hitos"
                    : "Periódico"}
                </span>
              </div>
            )}
            {contract.paidAmount !== undefined && (
              <div>
                <p className="text-xs text-[#737781] font-semibold uppercase tracking-wider mb-1">Pagado</p>
                <p className="font-bold text-[#006d37]">${contract.paidAmount.toLocaleString("es-CO")} COP</p>
              </div>
            )}
            {contract.remainingAmount !== undefined && (
              <div>
                <p className="text-xs text-[#737781] font-semibold uppercase tracking-wider mb-1">Pendiente</p>
                <p className="font-bold text-[#191c1e]">${contract.remainingAmount.toLocaleString("es-CO")} COP</p>
              </div>
            )}
          </div>
          {(contract.confirmedAt || contract.cancelledAt) && (
            <div className="mt-4 flex flex-wrap gap-4">
              {contract.confirmedAt && (
                <p className="text-xs text-[#737781]">
                  Confirmado el{" "}
                  <span className="font-semibold text-[#005228]">{new Date(contract.confirmedAt).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}</span>
                </p>
              )}
              {contract.cancelledAt && (
                <p className="text-xs text-[#737781]">
                  Cancelado el{" "}
                  <span className="font-semibold text-[#93000a]">{new Date(contract.cancelledAt).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}</span>
                </p>
              )}
            </div>
          )}
          {contract.description && (
            <div className="mt-5 pt-5 border-t border-[#f2f4f6]">
              <p className="text-xs text-[#737781] font-semibold uppercase tracking-wider mb-2">Descripción</p>
              <p className="text-sm text-[#424750] leading-relaxed whitespace-pre-line">{contract.description}</p>
            </div>
          )}
        </div>

        {/* Documento PDF */}
        <div className="bg-white rounded-2xl border border-[#e6e8ea] p-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#424750] mb-4">
            Documento del contrato
          </h2>
          {contract.contractFileUrl ? (
            <div className="flex items-center justify-between p-4 bg-[#f7f9fb] rounded-xl">
              <a href={contract.contractFileUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-[#006d37] transition-colors group flex-1">
                <div className="w-10 h-10 bg-[#006d37] rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm text-[#191c1e] group-hover:text-[#006d37]">Contrato PDF</p>
                  <p className="text-xs text-[#737781]">Ver documento completo</p>
                </div>
                <ExternalLink className="w-4 h-4 text-[#737781] ml-2" />
              </a>
              <label className="ml-4 flex items-center gap-1.5 text-xs font-bold text-[#424750] hover:text-[#006d37] cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" /> Reemplazar
                <input type="file" accept=".pdf" className="hidden"
                  onChange={handleFileUpload} disabled={uploadingFile} />
              </label>
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-[#e6e8ea] rounded-xl">
              <FileText className="w-8 h-8 text-[#c2c6d1] mx-auto mb-3" />
              <p className="text-sm text-[#737781] mb-4">
                Sube el PDF del contrato para que el candidato pueda revisarlo.
              </p>
              <label className="inline-flex items-center gap-2 bg-[#006d37] text-white px-6 py-2.5 rounded-full text-sm font-bold cursor-pointer hover:opacity-90 transition-all">
                {uploadingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploadingFile ? "Subiendo..." : "Subir PDF del contrato"}
                <input type="file" accept=".pdf" className="hidden"
                  onChange={handleFileUpload} disabled={uploadingFile} />
              </label>
            </div>
          )}
        </div>

        {/* Pagos */}
        <div className="bg-white rounded-2xl border border-[#e6e8ea] p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-[#424750]">Pagos</h2>
              {contract.totalAmount && (
                <p className="text-xs text-[#737781] mt-1">
                  Pagado:{" "}
                  <span className="font-bold text-[#006d37]">${totalPaid.toLocaleString("es-CO")} COP</span>
                  {" "}de ${contract.totalAmount.toLocaleString("es-CO")} COP
                </p>
              )}
            </div>
            {isActive && !showPayForm && (
              <button onClick={() => setShowPayForm(true)}
                className="flex items-center gap-1.5 bg-[#006d37] text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-[#00743a] transition-colors">
                <Plus className="w-3.5 h-3.5" /> Registrar pago
              </button>
            )}
          </div>

          {showPayForm && (
            <form onSubmit={handleAddPayment} className="bg-[#f7f9fb] rounded-2xl p-5 mb-5 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm text-[#191c1e]">Nuevo pago</h3>
                <button type="button" onClick={() => setShowPayForm(false)}
                  className="p-1 text-[#737781] hover:text-[#191c1e] rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Monto (COP) *</label>
                  <input type="number" required min={1} value={payForm.amount}
                    onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))}
                    placeholder="e.j. 500000" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Descripción</label>
                  <input type="text" value={payForm.description}
                    onChange={e => setPayForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="e.j. Primer pago — entrega inicial" className={inp} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowPayForm(false)}
                  className="px-5 py-2 rounded-full text-sm font-semibold text-[#424750] hover:bg-[#e6e8ea] transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={savingPay}
                  className="flex items-center gap-2 bg-[#006d37] text-white px-6 py-2 rounded-full text-sm font-bold hover:opacity-90 disabled:opacity-60">
                  {savingPay ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  {savingPay ? "Guardando..." : "Registrar pago"}
                </button>
              </div>
            </form>
          )}

          {contract.payments.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-[#e6e8ea] rounded-xl">
              <DollarSign className="w-8 h-8 text-[#c2c6d1] mx-auto mb-2" />
              <p className="text-sm text-[#737781]">Sin pagos registrados aún.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contract.payments.map(payment => {
                const isPaid = payment.status === "CONFIRMED";
                return (
                  <div key={payment.id}
                    className="flex items-center justify-between p-4 bg-[#f7f9fb] rounded-xl gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isPaid ? "bg-[#6bfe9c]/20" : "bg-[#e6e8ea]"
                      }`}>
                        {isPaid
                          ? <CheckCircle2 className="w-4 h-4 text-[#006d37]" />
                          : <Clock className="w-4 h-4 text-[#737781]" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[#191c1e] truncate">
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
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="font-extrabold text-[#191c1e] font-headline">
                        ${payment.amount.toLocaleString("es-CO")}
                      </span>
                      {payment.receiptUrl ? (
                        <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-[#006d37] font-bold hover:underline flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" /> Ver
                        </a>
                      ) : (
                        <label className="text-xs text-[#424750] font-bold hover:text-[#006d37] cursor-pointer flex items-center gap-1 transition-colors">
                          {uploadingReceipt === payment.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Upload className="w-3.5 h-3.5" />}
                          Comprobante
                          <input type="file" className="hidden"
                            onChange={e => handleReceiptUpload(payment.id, e)}
                            disabled={uploadingReceipt === payment.id} />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Entregables */}
        <div className="bg-white rounded-2xl border border-[#e6e8ea] p-6">
          <DeliverablesPanel
            contractId={contractId}
            contractStatus={contract.status}
            role="COMPANY"
            initialDeliverables={contract.deliverableItems}
          />
        </div>

        {/* Finalizar contrato */}
        {isActive && (
          <div className="bg-white rounded-2xl border border-[#e6e8ea] p-6">
            <h2 className="text-xs font-black uppercase tracking-widest text-[#424750] mb-3">
              Finalizar contrato
            </h2>
            <p className="text-sm text-[#737781] mb-4">
              Una vez que el trabajo esté terminado y los pagos realizados, puedes
              marcar el contrato como completado.
            </p>
            <button onClick={handleComplete} disabled={completing}
              className="flex items-center gap-2 bg-gradient-to-br from-[#00386c] to-[#1a4f8b] text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider shadow-lg shadow-[#00386c]/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
              {completing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {completing ? "Procesando..." : "Marcar como completado"}
            </button>
          </div>
        )}

        {/* Cancelar contrato — visible si PENDING_CANDIDATE o ACTIVE */}
        {canCancel && (
          <div className="bg-white rounded-2xl border border-[#ffdad6] p-6">
            <h2 className="text-xs font-black uppercase tracking-widest text-[#93000a] mb-3">
              Zona de peligro
            </h2>
            <p className="text-sm text-[#737781] mb-4">
              Cancela este contrato si hubo un cambio de planes. El candidato será notificado.
            </p>
            <button onClick={handleCancel} disabled={cancelling}
              className="flex items-center gap-2 bg-[#ffdad6] text-[#93000a] px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-[#ba1a1a] hover:text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed">
              {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              {cancelling ? "Cancelando..." : "Cancelar contrato"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}