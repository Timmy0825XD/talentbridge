"use client";

import { useAuth } from "@/src/context/auth-context";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/src/lib/api";
import DeliverablesPanel from "@/src/components/contracts/DeliverablesPanel";
import RatingsPanel from "@/src/components/contracts/RatingsPanel";
import TalentBridgeLoader from "@/src/components/ui/TalentBridgeLoader";
import { publicLinks } from "@/src/content/site-links";
import {
  ArrowLeft, FileText, Clock, CheckCircle2, XCircle,
  Users, Briefcase, Calendar, DollarSign, AlertCircle,
  Loader2, ExternalLink, Upload, Plus, X, Download, ChevronRight
} from "lucide-react";
import { toast } from '@/src/lib/toast';

interface Payment { id:string; amount:number; description:string|null; status:string; receiptUrl:string|null; createdAt:string; }
interface Contract {
  id:string; status:string; title:string; description:string|null;
  startDate:string|null; endDate:string|null; totalAmount:number|null;
  paymentScheme:string|null; contractFileUrl:string|null;
  confirmedAt:string|null; cancelledAt:string|null; createdAt:string;
  candidate:{ fullName:string|null; user:{ email:string } }|null;
  job:{ id:string; title:string }|null;
  payments:Payment[];
  paidAmount?:number; pendingAmount?:number; remainingAmount?:number;
  _count?:{ payments:number; deliverableItems:number };
}

const STATUS_META: Record<string,{ label:string; color:string; bg:string; icon:React.ReactNode }> = {
  PENDING_CANDIDATE: { label:"Esperando al candidato", color:"text-[#7c5c00]", bg:"bg-[#fff3cd]",    icon:<Clock className="w-4 h-4"/> },
  ACTIVE:            { label:"Activo",                 color:"text-[#005228]", bg:"bg-[#6bfe9c]/20", icon:<CheckCircle2 className="w-4 h-4"/> },
  COMPLETED:         { label:"Completado",              color:"text-[#00386c]", bg:"bg-[#a6c8ff]/20", icon:<CheckCircle2 className="w-4 h-4"/> },
  CANCELLED:         { label:"Cancelado",               color:"text-[#93000a]", bg:"bg-[#ffdad6]",    icon:<XCircle className="w-4 h-4"/> },
};

function formatDate(iso:string|null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO",{ day:"numeric", month:"long", year:"numeric" });
}
function formatShort(iso:string) {
  return new Date(iso).toLocaleDateString("es-CO",{ day:"numeric", month:"short" });
}

export default function ContratoEmpresaDetallePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const contractId = params.id as string;

  const [contract,          setContract]          = useState<Contract|null>(null);
  const [loading,           setLoading]           = useState(true);
  const [error,             setError]             = useState("");
  const [uploadingFile,     setUploadingFile]     = useState(false);
  const [completing,        setCompleting]        = useState(false);
  const [cancelling,        setCancelling]        = useState(false);
  const [showPayForm,       setShowPayForm]       = useState(false);
  const [payForm,           setPayForm]           = useState({ amount:"", description:"" });
  const [savingPay,         setSavingPay]         = useState(false);
  const [uploadingReceipt,  setUploadingReceipt]  = useState<string|null>(null);
  const [downloadingReport, setDownloadingReport] = useState(false);

  useEffect(() => {
    if (!isLoading && user?.role !== "COMPANY") router.replace("/dashboard/candidate");
  }, [user, isLoading, router]);

  useEffect(() => { if (user) loadContract(); }, [user, contractId]);

  async function loadContract() {
    setLoading(true); setError("");
    try { const res = await api.get(`/contracts/${contractId}`); setContract(res.data); }
    catch { setError("No se pudo cargar el contrato."); }
    finally { setLoading(false); }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.type !== "application/pdf") { toast.error("Solo se permiten archivos PDF."); return; }
    if (file.size > 10*1024*1024) { toast.error("El archivo no puede superar 10MB."); return; }
    setUploadingFile(true);
    const fd = new FormData(); fd.append("file", file);
    try {
      await api.post(`/contracts/${contractId}/file`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success('Documento subido correctamente.');
      await loadContract();
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { error?: string } } };
      toast.error(ex.response?.data?.error ?? 'Error al subir el archivo.');
    } finally { setUploadingFile(false); if (e.target) e.target.value = ""; }
  }

  async function handleComplete() {
    setCompleting(true);
    try {
      await api.patch(`/contracts/${contractId}/complete`);
      toast.success('Contrato marcado como completado.');
      await loadContract();
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { error?: string } } };
      toast.error(ex.response?.data?.error ?? 'Error al completar.');
    } finally { setCompleting(false); }
  }

  async function handleCancel() {
    if (!confirm("¿Cancelar este contrato? Esta acción no se puede deshacer.")) return;
    setCancelling(true);
    try {
      await api.patch(`/contracts/${contractId}/cancel`);
      toast.success('Contrato cancelado.');
      await loadContract();
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { error?: string } } };
      toast.error(ex.response?.data?.error ?? 'Error al cancelar.');
    } finally { setCancelling(false); }
  }

  async function handleAddPayment(e: React.FormEvent) {
    e.preventDefault(); if (!payForm.amount) return;
    setSavingPay(true);
    try {
      await api.post(`/contracts/${contractId}/payments`, { amount: Number(payForm.amount), description: payForm.description || undefined });
      toast.success('Pago registrado correctamente.');
      setPayForm({ amount: "", description: "" }); setShowPayForm(false);
      await loadContract();
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { error?: string } } };
      toast.error(ex.response?.data?.error ?? 'Error al registrar el pago.');
    } finally { setSavingPay(false); }
  }

  async function handleReceiptUpload(paymentId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadingReceipt(paymentId);
    const fd = new FormData(); fd.append("receipt", file);
    try {
      await api.post(`/contracts/payments/${paymentId}/receipt`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success('Comprobante subido.');
      await loadContract();
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { error?: string } } };
      toast.error(ex.response?.data?.error ?? 'Error al subir el comprobante.');
    } finally { setUploadingReceipt(null); if (e.target) e.target.value = ""; }
  }

  async function handleDownloadReport() {
    setDownloadingReport(true);
    try {
      const res = await api.get(`/contracts/${contractId}/report`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a"); a.href = url; a.download = `reporte_contrato_${contractId}.pdf`; a.click(); URL.revokeObjectURL(url);
    } catch (err: unknown) {
      toast.error('Error al descargar el reporte.');
    } finally { setDownloadingReport(false); }
  }

  if (isLoading || !user || loading) return <TalentBridgeLoader />;

  if (error || !contract) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f7f9fb] text-center px-8">
      <AlertCircle className="w-10 h-10 text-[#ba1a1a]"/>
      <p className="text-[#93000a] font-semibold">{error || "Contrato no encontrado."}</p>
      <Link href="/dashboard/company/contratos" className="px-6 py-2 bg-[#006d37] text-white rounded-full text-sm font-bold hover:opacity-90">Volver</Link>
    </div>
  );

  const meta      = STATUS_META[contract.status] ?? STATUS_META.CANCELLED;
  const isActive  = contract.status === "ACTIVE";
  const canCancel = contract.status === "PENDING_CANDIDATE" || contract.status === "ACTIVE";
  const totalPaid = contract.payments.filter(p=>p.status==="CONFIRMED").reduce((s,p)=>s+p.amount,0);
  const inp = "w-full bg-[#f7f9fb] border border-[#e6e8ea] rounded-xl py-2.5 px-4 text-sm text-[#191c1e] placeholder:text-[#c2c6d1] outline-none focus:border-[#006d37] focus:ring-2 focus:ring-[#006d37]/8 transition-all";
  const lbl = "block text-[10px] font-bold uppercase tracking-widest text-[#424750] mb-1.5";

  return (
    <div className="min-h-screen bg-[#f7f9fb]">

      {/* Hero */}
      <div className="relative bg-gradient-to-r from-[#005228] via-[#006d37] to-[#00743a] overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="ced-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.8"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#ced-grid)"/>
        </svg>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"/>
        <div className="relative max-w-screen-md mx-auto px-8 py-8">
          <Link href="/dashboard/company/contratos" className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-4 h-4"/> Volver a contratos
          </Link>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-3 ${meta.bg} ${meta.color}`}>
            {meta.icon}{meta.label}
          </div>
          <h1 className="font-headline font-extrabold text-3xl text-white tracking-tight">{contract.title}</h1>
          <p className="text-white/50 text-sm mt-1">Creado el {formatDate(contract.createdAt)}</p>
        </div>
      </div>

      <div className="max-w-screen-md mx-auto px-8 py-8 space-y-5">

        {/* Detalles */}
        <div className="bg-white rounded-2xl border border-[#e6e8ea] overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 bg-[#f7f9fb] border-b border-[#e6e8ea]">
            <div className="w-6 h-6 bg-[#006d37]/10 rounded-lg flex items-center justify-center"><FileText className="w-3.5 h-3.5 text-[#006d37]"/></div>
            <h2 className="text-xs font-bold text-[#424750] uppercase tracking-widest">Detalles del contrato</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {contract.candidate && (
              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-[#737781] mt-0.5 shrink-0"/>
                <div>
                  <p className="text-[10px] text-[#737781] font-semibold uppercase tracking-wider">Candidato</p>
                  <p className="font-bold text-[#191c1e] mt-0.5">{contract.candidate.fullName ?? "—"}</p>
                  <p className="text-[11px] text-[#737781]">{contract.candidate.user.email}</p>
                </div>
              </div>
            )}
            {contract.job && (
              <div className="flex items-start gap-3">
                <Briefcase className="w-4 h-4 text-[#737781] mt-0.5 shrink-0"/>
                <div>
                  <p className="text-[10px] text-[#737781] font-semibold uppercase tracking-wider">Vacante</p>
                  <p className="font-bold text-[#191c1e] mt-0.5">{contract.job.title}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <DollarSign className="w-4 h-4 text-[#737781] mt-0.5 shrink-0"/>
              <div>
                <p className="text-[10px] text-[#737781] font-semibold uppercase tracking-wider">Monto total</p>
                <p className="font-extrabold text-[#191c1e] mt-0.5 text-xl font-headline">
                  {contract.totalAmount ? `$${contract.totalAmount.toLocaleString("es-CO")} COP` : "A convenir"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-[#737781] mt-0.5 shrink-0"/>
              <div>
                <p className="text-[10px] text-[#737781] font-semibold uppercase tracking-wider">Vigencia</p>
                <p className="font-bold text-[#191c1e] mt-0.5">{formatDate(contract.startDate)}{contract.endDate ? ` — ${formatDate(contract.endDate)}` : ""}</p>
              </div>
            </div>
            {contract.paymentScheme && (
              <div>
                <p className="text-[10px] text-[#737781] font-semibold uppercase tracking-wider mb-1">Esquema de pago</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#a6c8ff]/20 text-[#00386c]">
                  {contract.paymentScheme==="SINGLE"?"Pago único":contract.paymentScheme==="MILESTONES"?"Por hitos":"Periódico"}
                </span>
              </div>
            )}
            {contract.paidAmount !== undefined && (
              <div>
                <p className="text-[10px] text-[#737781] font-semibold uppercase tracking-wider mb-1">Pagado</p>
                <p className="font-bold text-[#006d37]">${contract.paidAmount.toLocaleString("es-CO")} COP</p>
              </div>
            )}
          </div>
          {contract.description && (
            <div className="px-6 pb-6 pt-0 border-t border-[#f2f4f6] mt-0 pt-4">
              <p className="text-[10px] text-[#737781] font-semibold uppercase tracking-wider mb-2">Descripción</p>
              <p className="text-sm text-[#424750] leading-relaxed whitespace-pre-line">{contract.description}</p>
            </div>
          )}
        </div>

        {/* PDF */}
        <div className="bg-white rounded-2xl border border-[#e6e8ea] overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 bg-[#f7f9fb] border-b border-[#e6e8ea]">
            <div className="w-6 h-6 bg-[#006d37]/10 rounded-lg flex items-center justify-center"><FileText className="w-3.5 h-3.5 text-[#006d37]"/></div>
            <h2 className="text-xs font-bold text-[#424750] uppercase tracking-widest">Documento del contrato</h2>
          </div>
          <div className="p-6">
            {contract.contractFileUrl ? (
              <div className="flex items-center justify-between p-4 bg-[#f7f9fb] rounded-xl border border-[#e6e8ea]">
                <a href={contract.contractFileUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:text-[#006d37] transition-colors group flex-1">
                  <div className="w-10 h-10 bg-[#006d37] rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-[#006d37]/20">
                    <FileText className="w-5 h-5 text-white"/>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#191c1e] group-hover:text-[#006d37]">Contrato PDF</p>
                    <p className="text-[11px] text-[#737781]">Ver documento completo</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#737781] ml-2"/>
                </a>
                <label className="ml-4 flex items-center gap-1.5 text-xs font-bold text-[#424750] hover:text-[#006d37] cursor-pointer transition-colors bg-white border border-[#e6e8ea] px-3 py-2 rounded-xl hover:border-[#006d37]/30">
                  <Upload className="w-3.5 h-3.5"/> Reemplazar
                  <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} disabled={uploadingFile}/>
                </label>
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-[#e6e8ea] rounded-xl">
                <div className="w-12 h-12 bg-[#f2f4f6] rounded-xl flex items-center justify-center mx-auto mb-3"><FileText className="w-6 h-6 text-[#c2c6d1]"/></div>
                <p className="text-sm text-[#737781] mb-4">Sube el PDF del contrato para que el candidato pueda revisarlo y confirmarlo.</p>
                <label className="inline-flex items-center gap-2 bg-[#006d37] text-white px-6 py-2.5 rounded-full text-sm font-bold cursor-pointer hover:opacity-90 transition-all shadow-md shadow-[#006d37]/20">
                  {uploadingFile ? <Loader2 className="w-4 h-4 animate-spin"/> : <Upload className="w-4 h-4"/>}
                  {uploadingFile ? "Subiendo..." : "Subir PDF del contrato"}
                  <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} disabled={uploadingFile}/>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Pagos */}
        <div className="bg-white rounded-2xl border border-[#e6e8ea] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 bg-[#f7f9fb] border-b border-[#e6e8ea]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#006d37]/10 rounded-lg flex items-center justify-center"><DollarSign className="w-3.5 h-3.5 text-[#006d37]"/></div>
              <h2 className="text-xs font-bold text-[#424750] uppercase tracking-widest">Pagos</h2>
              {contract.totalAmount && (
                <span className="text-[10px] font-bold text-[#006d37] bg-[#6bfe9c]/15 px-2.5 py-0.5 rounded-full border border-[#6bfe9c]/25">
                  ${totalPaid.toLocaleString("es-CO")} / ${contract.totalAmount.toLocaleString("es-CO")} pagados
                </span>
              )}
            </div>
            {isActive && !showPayForm && (
              <button onClick={() => setShowPayForm(true)}
                className="flex items-center gap-1.5 bg-[#006d37] text-white text-xs font-bold px-3.5 py-1.5 rounded-full hover:bg-[#00743a] transition-colors">
                <Plus className="w-3 h-3"/> Registrar pago
              </button>
            )}
          </div>

          <div className="p-6">
            {showPayForm && (
              <form onSubmit={handleAddPayment} className="bg-[#f7f9fb] rounded-xl p-5 mb-5 border border-[#e6e8ea] space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-bold text-sm text-[#191c1e]">Nuevo pago</p>
                  <button type="button" onClick={() => setShowPayForm(false)} className="p-1 text-[#737781] hover:text-[#191c1e] rounded-lg"><X className="w-4 h-4"/></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Monto (COP) *</label>
                    <input type="number" required min={1} value={payForm.amount} onChange={e=>setPayForm(p=>({...p,amount:e.target.value}))} placeholder="ej. 500000" className={inp}/>
                  </div>
                  <div>
                    <label className={lbl}>Descripción</label>
                    <input type="text" value={payForm.description} onChange={e=>setPayForm(p=>({...p,description:e.target.value}))} placeholder="ej. Primer pago — entrega inicial" className={inp}/>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" onClick={() => setShowPayForm(false)} className="px-4 py-2 rounded-xl text-sm font-semibold text-[#424750] hover:bg-[#e6e8ea] transition-colors">Cancelar</button>
                  <button type="submit" disabled={savingPay} className="flex items-center gap-1.5 bg-[#006d37] text-white px-5 py-2 rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-60">
                    {savingPay && <Loader2 className="w-3.5 h-3.5 animate-spin"/>}
                    {savingPay ? "Guardando..." : "Registrar"}
                  </button>
                </div>
              </form>
            )}

            {contract.payments.length===0 ? (
              <div className="text-center py-8 border-2 border-dashed border-[#e6e8ea] rounded-xl">
                <DollarSign className="w-7 h-7 text-[#c2c6d1] mx-auto mb-2"/><p className="text-sm text-[#737781]">Sin pagos registrados aún.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {contract.payments.map(payment => {
                  const isPaid = payment.status==="CONFIRMED";
                  return (
                    <div key={payment.id} className="flex items-center justify-between p-4 bg-[#f7f9fb] rounded-xl border border-[#e6e8ea] gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isPaid?"bg-[#6bfe9c]/20":"bg-[#e6e8ea]"}`}>
                          {isPaid ? <CheckCircle2 className="w-4 h-4 text-[#006d37]"/> : <Clock className="w-4 h-4 text-[#737781]"/>}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-[#191c1e] truncate">{payment.description ?? "Pago"}</p>
                          <p className="text-[11px] text-[#737781]">{formatShort(payment.createdAt)} · <span className={isPaid?"text-[#006d37] font-semibold":""}>{isPaid?"Confirmado":"Pendiente"}</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-extrabold text-[#191c1e] font-headline">${payment.amount.toLocaleString("es-CO")}</span>
                        {payment.receiptUrl ? (
                          <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#006d37] font-bold hover:underline flex items-center gap-1">
                            <FileText className="w-3 h-3"/> Ver
                          </a>
                        ) : (
                          <label className="text-xs text-[#424750] font-bold hover:text-[#006d37] cursor-pointer flex items-center gap-1 transition-colors">
                            {uploadingReceipt===payment.id ? <Loader2 className="w-3 h-3 animate-spin"/> : <Upload className="w-3 h-3"/>}
                            Comprobante
                            <input type="file" className="hidden" onChange={e=>handleReceiptUpload(payment.id,e)} disabled={uploadingReceipt===payment.id}/>
                          </label>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Entregables */}
        <div className="bg-white rounded-2xl border border-[#e6e8ea] p-6">
          <DeliverablesPanel contractId={contractId} contractStatus={contract.status} role="COMPANY"/>
        </div>

        {/* Finalizar */}
        {isActive && (
          <div className="relative bg-gradient-to-r from-[#00386c] to-[#1a4f8b] rounded-2xl p-6 overflow-hidden">
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[80px] font-black text-white opacity-[0.04] select-none leading-none pointer-events-none font-headline">✓</div>
            <div className="relative flex items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-white mb-1">Finalizar contrato</h2>
                <p className="text-sm text-white/60">Marca como completado cuando el trabajo esté terminado y los pagos realizados.</p>
              </div>
              <button onClick={handleComplete} disabled={completing}
                className="shrink-0 flex items-center gap-2 bg-white text-[#00386c] px-6 py-3 rounded-full font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 shadow-lg">
                {completing ? <Loader2 className="w-4 h-4 animate-spin"/> : <CheckCircle2 className="w-4 h-4"/>}
                {completing ? "Procesando..." : "Marcar completado"}
              </button>
            </div>
          </div>
        )}

        {/* Cancelar */}
        {canCancel && (
          <div className="bg-white rounded-2xl border border-[#ffdad6] p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-[#ffdad6] rounded-lg flex items-center justify-center"><XCircle className="w-3.5 h-3.5 text-[#ba1a1a]"/></div>
              <h2 className="text-xs font-bold text-[#93000a] uppercase tracking-widest">Zona de peligro</h2>
            </div>
            <p className="text-sm text-[#737781] mb-4">Cancela este contrato si hubo un cambio de planes. El candidato será notificado.</p>
            <button onClick={handleCancel} disabled={cancelling}
              className="flex items-center gap-2 bg-[#ffdad6] text-[#93000a] px-6 py-2.5 rounded-full font-bold text-sm hover:bg-[#ba1a1a] hover:text-white transition-all disabled:opacity-60">
              {cancelling ? <Loader2 className="w-4 h-4 animate-spin"/> : <XCircle className="w-4 h-4"/>}
              {cancelling ? "Cancelando..." : "Cancelar contrato"}
            </button>
          </div>
        )}

        {/* Reporte */}
        {contract.status==="COMPLETED" && (
          <div className="bg-white rounded-2xl border border-[#e6e8ea] p-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-sm text-[#191c1e] mb-1">Reporte del proyecto</h2>
              <p className="text-xs text-[#737781]">Reporte PDF con resumen ejecutivo, pagos, entregables, calificaciones y recomendaciones.</p>
            </div>
            <button onClick={handleDownloadReport} disabled={downloadingReport}
              className="shrink-0 flex items-center gap-2 bg-gradient-to-br from-[#006d37] to-[#00743a] text-white px-5 py-2.5 rounded-full font-bold text-sm hover:opacity-90 transition-all disabled:opacity-60 shadow-md shadow-[#006d37]/20">
              {downloadingReport ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4"/>}
              {downloadingReport ? "Generando..." : "Descargar PDF"}
            </button>
          </div>
        )}

        {/* Calificaciones */}
        {contract.status==="COMPLETED" && (
          <div className="bg-white rounded-2xl border border-[#e6e8ea] p-6">
            <RatingsPanel contractId={contractId} role="COMPANY"/>
          </div>
        )}

        {/* Footer info */}
        <a href={publicLinks.processes.contracts} target="_blank" rel="noopener noreferrer"
          className="group flex items-center gap-3 p-4 bg-white/60 border border-[#e6e8ea] rounded-2xl hover:border-[#006d37]/20 hover:bg-white hover:shadow-sm transition-all">
          <div className="w-8 h-8 bg-[#006d37]/8 rounded-xl flex items-center justify-center text-[#006d37] shrink-0"><FileText className="w-4 h-4"/></div>
          <div className="flex-1">
            <p className="text-xs font-bold text-[#191c1e] group-hover:text-[#006d37] transition-colors">Guía de contratos</p>
            <p className="text-[10px] text-[#737781]">Cómo funcionan los entregables, pagos y calificaciones.</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#c2c6d1] group-hover:text-[#006d37] transition-colors"/>
        </a>
      </div>
    </div>
  );
}