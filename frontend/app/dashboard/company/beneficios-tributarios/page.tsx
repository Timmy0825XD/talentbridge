"use client";

import { useAuth } from "@/src/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/src/lib/api";
import TalentBridgeLoader from "@/src/components/ui/TalentBridgeLoader";
import { publicLinks } from "@/src/content/site-links";
import {
  Calculator, DollarSign, AlertCircle, Loader2,
  ChevronDown, ChevronUp, CheckCircle2, Sparkles, ChevronRight,
} from "lucide-react";

interface TaxBenefit { title:string; description:string; article?:string; }
interface TaxSimulationResult {
  estimatedAnnualSaving: number;
  breakdown: { label:string; amount:number; description?:string }[];
  disclaimer: string;
}

export default function BeneficiosTributariosPage() {
  const { user, isLoading } = useAuth();
  const router  = useRouter();
  const enabled = !!user && user.role === "COMPANY";

  const [benefits,       setBenefits]       = useState<TaxBenefit[]>([]);
  const [loadingBenefits,setLoadingBenefits]= useState(true);
  const [showBenefits,   setShowBenefits]   = useState(false);
  const [monthlySalary,  setMonthlySalary]  = useState("");
  const [hireAge,        setHireAge]        = useState("");
  const [simulating,     setSimulating]     = useState(false);
  const [result,         setResult]         = useState<TaxSimulationResult|null>(null);
  const [simError,       setSimError]       = useState("");

  useEffect(() => {
    if (!isLoading && user?.role !== "COMPANY") router.replace("/dashboard/candidate");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!enabled) return;
    api.get<TaxBenefit[] | { benefits: TaxBenefit[] }>("/tax/benefits")
      .then(res => {
        const d = res.data;
        setBenefits(Array.isArray(d) ? d : (d as { benefits: TaxBenefit[] }).benefits ?? []);
      })
      .catch(() => {})
      .finally(() => setLoadingBenefits(false));
  }, [enabled]);

  async function handleSimulate() {
    if (!monthlySalary) { setSimError("Ingresa el salario mensual."); return; }
    setSimulating(true); setSimError(""); setResult(null);
    try {
      const res = await api.post<TaxSimulationResult>("/tax/simulate", {
        monthlySalary: Number(monthlySalary),
        hireAge: hireAge ? Number(hireAge) : undefined,
      });
      setResult(res.data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setSimError(e.response?.data?.error ?? "Error al simular. Intenta de nuevo.");
    } finally { setSimulating(false); }
  }

  if (isLoading || !user) return <TalentBridgeLoader />;

  const inp = "w-full bg-[#f7f9fb] border border-[#e6e8ea] rounded-xl py-3 px-4 text-sm text-[#191c1e] placeholder:text-[#c2c6d1] outline-none focus:border-[#006d37] focus:ring-2 focus:ring-[#006d37]/8 transition-all";
  const lbl = "block text-[10px] font-bold uppercase tracking-widest text-[#424750] mb-1.5";

  return (
    <div className="min-h-screen bg-[#f7f9fb]">

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-r from-[#005228] via-[#006d37] to-[#00743a] overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="bt-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.8"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#bt-grid)"/>
        </svg>
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#4ae183]/10 blur-3xl pointer-events-none"/>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"/>
        <div className="relative max-w-screen-md mx-auto px-8 py-10">
          <p className="text-[#6bfe9c] text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5"/> Beneficios fiscales
          </p>
          <h1 className="font-headline font-extrabold text-4xl text-white tracking-tight mb-1">
            Beneficios Tributarios
          </h1>
          <p className="text-white/60 text-sm max-w-lg">
            Estima el ahorro fiscal al contratar talento universitario del Cesar. Deducciones de hasta el <span className="text-[#6bfe9c] font-bold">130%</span> del salario en renta.
          </p>
        </div>
      </div>

      <div className="max-w-screen-md mx-auto px-8 py-8 space-y-5">

        {/* Simulador */}
        <div className="bg-white rounded-2xl border border-[#e6e8ea] overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 bg-[#f7f9fb] border-b border-[#e6e8ea]">
            <div className="w-8 h-8 bg-[#6bfe9c]/20 rounded-xl flex items-center justify-center">
              <Calculator className="w-4 h-4 text-[#006d37]"/>
            </div>
            <div>
              <h2 className="font-bold text-sm text-[#191c1e]">Simulador de ahorro fiscal</h2>
              <p className="text-[10px] text-[#737781]">Aproximación educativa — no constituye asesoría fiscal</p>
            </div>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Salario mensual (COP) *</label>
                <input type="number" min={0} value={monthlySalary}
                  onChange={e=>setMonthlySalary(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&handleSimulate()}
                  placeholder="ej. 2.500.000" className={inp}/>
              </div>
              <div>
                <label className={lbl}>Edad del empleado <span className="text-[#737781] font-normal normal-case">(opcional)</span></label>
                <input type="number" min={18} max={100} value={hireAge}
                  onChange={e=>setHireAge(e.target.value)}
                  placeholder="ej. 24" className={inp}/>
                <p className="text-[10px] text-[#737781] mt-1">Algunos beneficios aplican por rango de edad</p>
              </div>
            </div>

            {simError && (
              <div className="flex items-center gap-2 bg-[#ffdad6] text-[#93000a] text-sm font-semibold px-4 py-3 rounded-xl border border-[#ffdad6]">
                <AlertCircle className="w-4 h-4 shrink-0"/>{simError}
              </div>
            )}

            <button onClick={handleSimulate} disabled={simulating}
              className="flex items-center gap-2 bg-gradient-to-br from-[#006d37] to-[#00743a] text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-60 shadow-lg shadow-[#006d37]/20">
              {simulating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Calculator className="w-4 h-4"/>}
              {simulating ? "Calculando..." : "Calcular ahorro estimado"}
            </button>
          </div>
        </div>

        {/* Resultado */}
        {result && (
          <div className="relative bg-gradient-to-br from-[#005228] via-[#006d37] to-[#00743a] rounded-2xl overflow-hidden">
            <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
              <defs><pattern id="res-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="0.8"/></pattern></defs>
              <rect width="100%" height="100%" fill="url(#res-grid)"/>
            </svg>
            <div className="absolute right-6 bottom-4 text-[100px] font-black text-white opacity-[0.04] select-none leading-none pointer-events-none font-headline">$</div>
            <div className="relative p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="w-5 h-5 text-[#6bfe9c]"/>
                <h2 className="font-bold text-white text-lg">Resultado de la simulación</h2>
              </div>

              {/* Big number */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center border border-white/15">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#6bfe9c]/80 mb-1">Ahorro anual estimado</p>
                <p className="text-5xl font-headline font-extrabold text-white">${result.estimatedAnnualSaving.toLocaleString("es-CO")}</p>
                <p className="text-white/50 text-xs mt-1">COP</p>
              </div>

              {/* Breakdown */}
              {result.breakdown.length > 0 && (
                <div className="space-y-2">
                  {result.breakdown.map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/8 rounded-xl px-4 py-3 border border-white/10">
                      <div>
                        <p className="text-sm font-semibold text-white">{item.label}</p>
                        {item.description && <p className="text-[11px] text-white/50">{item.description}</p>}
                      </div>
                      <p className="font-bold text-[#6bfe9c] text-sm shrink-0 ml-3">${item.amount.toLocaleString("es-CO")}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-white/8 rounded-xl px-4 py-3 border border-white/10">
                <p className="text-[11px] text-white/60 leading-relaxed">⚠️ {result.disclaimer}</p>
              </div>
            </div>
          </div>
        )}

        {/* Marco legal */}
        <div className="bg-white rounded-2xl border border-[#e6e8ea] overflow-hidden">
          <button onClick={() => setShowBenefits(p => !p)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#f7f9fb] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#6bfe9c]/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-[#006d37]"/>
              </div>
              <div className="text-left">
                <p className="font-bold text-sm text-[#191c1e]">Marco legal de beneficios</p>
                <p className="text-[10px] text-[#737781]">Artículos del Estatuto Tributario aplicables</p>
              </div>
            </div>
            {showBenefits ? <ChevronUp className="w-4 h-4 text-[#737781]"/> : <ChevronDown className="w-4 h-4 text-[#737781]"/>}
          </button>

          {showBenefits && (
            <div className="px-6 pb-6 border-t border-[#f2f4f6] pt-5 space-y-3">
              {loadingBenefits ? (
                <div className="flex items-center justify-center py-6">
                  <span className="w-5 h-5 border-2 border-[#006d37]/20 border-t-[#006d37] rounded-full animate-spin"/>
                </div>
              ) : benefits.length===0 ? (
                <p className="text-sm text-[#737781] text-center py-4">No hay información de beneficios disponible.</p>
              ) : (
                benefits.map((b, i) => (
                  <div key={i} className="bg-[#f7f9fb] rounded-xl p-4 border border-[#e6e8ea]">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="font-bold text-sm text-[#191c1e]">{b.title}</p>
                      {b.article && (
                        <span className="text-[9px] font-bold text-[#006d37] bg-[#6bfe9c]/20 px-2 py-0.5 rounded-full shrink-0 border border-[#6bfe9c]/25">{b.article}</span>
                      )}
                    </div>
                    <p className="text-xs text-[#424750] leading-relaxed">{b.description}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <a href={publicLinks.companies} target="_blank" rel="noopener noreferrer"
          className="group flex items-center gap-3 p-4 bg-white/60 border border-[#e6e8ea] rounded-2xl hover:border-[#006d37]/20 hover:bg-white hover:shadow-sm transition-all">
          <div className="w-8 h-8 bg-[#006d37]/8 rounded-xl flex items-center justify-center text-[#006d37] shrink-0"><Sparkles className="w-4 h-4"/></div>
          <div className="flex-1">
            <p className="text-xs font-bold text-[#191c1e] group-hover:text-[#006d37] transition-colors">Guía para empresas</p>
            <p className="text-[10px] text-[#737781]">Cómo aprovechar TalentBridge y sus beneficios al máximo.</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#c2c6d1] group-hover:text-[#006d37] transition-colors"/>
        </a>
      </div>
    </div>
  );
}