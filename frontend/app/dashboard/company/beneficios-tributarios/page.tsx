"use client";

import { useAuth } from "@/src/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/src/lib/api";
import InfoCallout from "@/src/components/info/InfoCallout";
import { Calculator, DollarSign, AlertCircle, Loader2, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";

interface TaxBenefit {
  title: string;
  description: string;
  article?: string;
}

interface TaxBenefitsResponse {
  benefits: TaxBenefit[];
}

interface TaxSimulationResult {
  estimatedAnnualSaving: number;
  breakdown: {
    label: string;
    amount: number;
    description?: string;
  }[];
  disclaimer: string;
}

export default function BeneficiosTributariosPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const enabled = !!user && user.role === "COMPANY";

  const [benefits, setBenefits]   = useState<TaxBenefit[]>([]);
  const [loadingBenefits, setLoadingBenefits] = useState(true);
  const [showBenefits, setShowBenefits] = useState(false);

  const [monthlySalary, setMonthlySalary] = useState("");
  const [hireAge, setHireAge]             = useState("");
  const [simulating, setSimulating]       = useState(false);
  const [result, setResult]               = useState<TaxSimulationResult | null>(null);
  const [simError, setSimError]           = useState("");

  useEffect(() => {
    if (!isLoading && user?.role !== "COMPANY") router.replace("/dashboard/candidate");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!enabled) return;
    api.get<TaxBenefit[] | TaxBenefitsResponse>("/tax/benefits")
    .then(res => {
        const data = res.data;
        setBenefits(Array.isArray(data) ? data : (data as TaxBenefitsResponse).benefits ?? []);
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
        hireAge:       hireAge ? Number(hireAge) : undefined,
      });
      setResult(res.data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setSimError(e.response?.data?.error ?? "Error al simular. Intenta de nuevo.");
    } finally {
      setSimulating(false);
    }
  }

  const inp = "w-full bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#006d37] focus:ring-0 rounded-lg px-4 py-3 text-sm text-[#191c1e] placeholder:text-[#737781] outline-none transition-all";
  const lbl = "block text-xs font-semibold uppercase tracking-wider text-[#424750] mb-2";

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
        <span className="w-8 h-8 border-2 border-[#006d37]/20 border-t-[#006d37] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-screen-md mx-auto px-8 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-[#006d37] font-headline tracking-tight">
          Beneficios Tributarios
        </h1>
        <p className="text-[#424750] mt-2">
          Estima el ahorro fiscal al contratar talento universitario del Cesar.
        </p>
      </div>

      <InfoCallout
        title="Beneficios tributarios"
        description="Contrata talento joven y accede a deducciones de hasta el 130% del salario en renta."
      />

      {/* Simulador */}
      <div className="bg-white rounded-2xl border border-[#e6e8ea] p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#6bfe9c]/20 rounded-xl flex items-center justify-center">
            <Calculator className="w-5 h-5 text-[#006d37]" />
          </div>
          <div>
            <h2 className="font-bold text-[#191c1e]">Simulador de ahorro</h2>
            <p className="text-xs text-[#737781]">Aproximación educativa — no constituye asesoría fiscal</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className={lbl}>Salario mensual (COP) *</label>
            <input type="number" min={0} value={monthlySalary}
              onChange={e => setMonthlySalary(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSimulate()}
              placeholder="ej. 2500000"
              className={inp} />
          </div>
          <div>
            <label className={lbl}>Edad del empleado (opcional)</label>
            <input type="number" min={18} max={100} value={hireAge}
              onChange={e => setHireAge(e.target.value)}
              placeholder="ej. 24"
              className={inp} />
            <p className="text-xs text-[#737781] mt-1">Algunos beneficios aplican por edad</p>
          </div>
        </div>

        {simError && (
          <div className="flex items-center gap-2 bg-[#ffdad6] text-[#93000a] text-sm font-medium px-4 py-3 rounded-xl mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {simError}
          </div>
        )}

        <button onClick={handleSimulate} disabled={simulating}
          className="flex items-center gap-2 bg-gradient-to-br from-[#006d37] to-[#00743a] text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
          {simulating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
          {simulating ? "Calculando..." : "Calcular ahorro estimado"}
        </button>
      </div>

      {/* Resultado */}
      {result && (
        <div className="bg-gradient-to-br from-[#006d37] to-[#00743a] rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-6 h-6 text-[#6bfe9c]" />
            <h2 className="font-bold text-lg">Resultado de la simulación</h2>
          </div>

          <div className="bg-white/10 rounded-xl p-4 mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[#6bfe9c]/80 mb-1">
              Ahorro anual estimado
            </p>
            <p className="text-4xl font-headline font-extrabold text-white">
              ${result.estimatedAnnualSaving.toLocaleString("es-CO")} COP
            </p>
          </div>

          {result.breakdown.length > 0 && (
            <div className="space-y-2 mb-4">
              {result.breakdown.map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-white/10 rounded-lg px-4 py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    {item.description && (
                      <p className="text-xs text-white/60">{item.description}</p>
                    )}
                  </div>
                  <p className="font-bold text-[#6bfe9c] text-sm flex-shrink-0 ml-3">
                    ${item.amount.toLocaleString("es-CO")}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="bg-white/10 rounded-lg px-4 py-3">
            <p className="text-xs text-white/70 leading-relaxed">
              ⚠️ {result.disclaimer}
            </p>
          </div>
        </div>
      )}

      {/* Marco legal */}
      <div className="bg-white rounded-2xl border border-[#e6e8ea] p-6">
        <button
          onClick={() => setShowBenefits(p => !p)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-[#006d37]" />
            <div className="text-left">
              <p className="font-bold text-[#191c1e]">Marco legal de beneficios</p>
              <p className="text-xs text-[#737781]">Artículos del Estatuto Tributario aplicables</p>
            </div>
          </div>
          {showBenefits
            ? <ChevronUp className="w-5 h-5 text-[#737781]" />
            : <ChevronDown className="w-5 h-5 text-[#737781]" />}
        </button>

        {showBenefits && (
          <div className="mt-5 space-y-4 border-t border-[#f2f4f6] pt-5">
            {loadingBenefits ? (
              <div className="flex items-center justify-center py-6">
                <span className="w-5 h-5 border-2 border-[#006d37]/20 border-t-[#006d37] rounded-full animate-spin" />
              </div>
            ) : benefits.length === 0 ? (
              <p className="text-sm text-[#737781] text-center py-4">
                No hay información de beneficios disponible.
              </p>
            ) : (
              benefits.map((b, i) => (
                <div key={i} className="bg-[#f7f9fb] rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="font-bold text-sm text-[#191c1e]">{b.title}</p>
                    {b.article && (
                      <span className="text-[10px] font-bold text-[#006d37] bg-[#6bfe9c]/20 px-2 py-0.5 rounded-full flex-shrink-0">
                        {b.article}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#424750] leading-relaxed">{b.description}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}