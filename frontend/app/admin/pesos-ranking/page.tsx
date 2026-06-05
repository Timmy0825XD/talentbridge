"use client";

import { useAuth } from "@/src/context/auth-context";
import { useEffect, useState } from "react";
import api from "@/src/lib/api";
import InfoCallout from "@/src/components/info/InfoCallout";
import { Save, Loader2, AlertCircle, Info } from "lucide-react";

interface RankingWeights {
  skillsWeight: number;
  experienceWeight: number;
  educationWeight: number;
  certsWeight: number;
  reputationWeight: number;
  languagesWeight: number;
  completionWeight: number;
}

const WEIGHT_LABELS: Record<keyof RankingWeights, string> = {
  skillsWeight:     "Habilidades",
  experienceWeight: "Experiencia",
  educationWeight:  "Educación",
  certsWeight:      "Certificaciones",
  reputationWeight: "Reputación",
  languagesWeight:  "Idiomas",
  completionWeight: "Completitud",
};

const WEIGHT_KEYS: (keyof RankingWeights)[] = [
  "skillsWeight",
  "experienceWeight",
  "educationWeight",
  "certsWeight",
  "reputationWeight",
  "languagesWeight",
  "completionWeight",
];

export default function AdminPesosRankingPage() {
  const { user } = useAuth();
  const [weights, setWeights] = useState<RankingWeights | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [msg, setMsg]         = useState("");

  useEffect(() => {
    if (user) api.get("/admin/ranking-weights")
      .then(res => {
        const d = res.data;
        // Solo extraer los campos de peso, ignorar id, updatedAt, etc.
        setWeights({
          skillsWeight:     d.skillsWeight     ?? 0,
          experienceWeight: d.experienceWeight ?? 0,
          educationWeight:  d.educationWeight  ?? 0,
          certsWeight:      d.certsWeight      ?? 0,
          reputationWeight: d.reputationWeight ?? 0,
          languagesWeight:  d.languagesWeight  ?? 0,
          completionWeight: d.completionWeight ?? 0,
        });
      })
      .catch(() => setError("No se pudieron cargar los pesos."))
      .finally(() => setLoading(false));
  }, [user]);

  function update(key: keyof RankingWeights, val: string) {
    setWeights(p => p ? { ...p, [key]: Number(val) } : p);
  }

  const total = weights
    ? WEIGHT_KEYS.reduce((s, k) => s + Number(weights[k]), 0)
    : 0;
  const totalOk = Math.abs(total - 1.0) < 0.01;

  async function handleSave() {
    if (!weights) return;
    if (!totalOk) { setMsg("Los pesos deben sumar exactamente 1.0"); return; }
    setSaving(true); setMsg("");
    try {
      await api.put("/admin/ranking-weights", weights);
      setMsg("Pesos actualizados correctamente.");
      setTimeout(() => setMsg(""), 4000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setMsg(e.response?.data?.error ?? "Error al guardar.");
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#191c1e] focus:ring-0 rounded-lg px-4 py-3 text-sm text-[#191c1e] outline-none transition-all";

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <span className="w-6 h-6 border-2 border-[#424750]/20 border-t-[#424750] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="px-8 py-10 max-w-screen-sm">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-[#191c1e] font-headline">Pesos de ranking</h1>
        <p className="text-[#424750] mt-1">Configura los pesos globales del score de candidatos</p>
      </div>

      <InfoCallout
        title="Pesos de ranking"
        description="Define la importancia de cada criterio en el score de candidatos. Ajusta habilidades, experiencia, educación y más."
      />

      <div className="flex items-start gap-3 bg-[#a6c8ff]/20 text-[#00386c] px-4 py-3 rounded-xl mb-6 text-sm">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>Los valores deben sumar <strong>1.0</strong>. Ejemplo: 0.20 + 0.20 + 0.20 + 0.10 + 0.10 + 0.05 + 0.20 = 1.05 — ajusta según necesites.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-[#ffdad6] text-[#93000a] px-4 py-3 rounded-xl mb-4 text-sm">
          <AlertCircle className="w-4 h-4" />{error}
        </div>
      )}

      {msg && (
        <div className={`px-4 py-3 rounded-xl text-sm font-semibold mb-4 ${
          msg.includes("Error") || msg.includes("deben")
            ? "bg-[#ffdad6] text-[#93000a]"
            : "bg-[#6bfe9c]/20 text-[#005228]"
        }`}>{msg}</div>
      )}

      {weights && (
        <div className="bg-white rounded-2xl border border-[#e6e8ea] p-6 space-y-4">
          {WEIGHT_KEYS.map(key => (
            <div key={key} className="flex items-center gap-4">
              <label className="text-sm font-semibold text-[#424750] w-40 flex-shrink-0">
                {WEIGHT_LABELS[key]}
              </label>
              <input type="number" min={0} max={1} step={0.01}
                value={weights[key]}
                onChange={e => update(key, e.target.value)}
                className={inp} />
              <span className="text-sm font-bold text-[#737781] w-12 text-right">
                {(weights[key] * 100).toFixed(0)}%
              </span>
            </div>
          ))}

          <div className="flex items-center justify-between pt-4 border-t border-[#f2f4f6]">
            <div>
              <p className="text-xs text-[#737781] font-semibold uppercase tracking-wider">Total</p>
              <p className={`text-2xl font-headline font-extrabold ${totalOk ? "text-[#005228]" : "text-[#93000a]"}`}>
                {total.toFixed(2)}
              </p>
            </div>
            <button onClick={handleSave} disabled={saving || !totalOk}
              className="flex items-center gap-2 bg-[#191c1e] text-white px-6 py-3 rounded-full font-bold text-sm hover:opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Guardando..." : "Guardar pesos"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}