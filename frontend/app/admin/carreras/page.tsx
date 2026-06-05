"use client";

import { useAuth } from "@/src/context/auth-context";
import { useEffect, useState } from "react";
import api from "@/src/lib/api";
import InfoCallout from "@/src/components/info/InfoCallout";
import { Plus, Save, X, Loader2, AlertCircle, CheckCircle2, GraduationCap } from "lucide-react";

interface CareerItem { id: string; name: string; slug: string; isActive: boolean; createdAt: string; }

const EMPTY_FORM = { name: "" };

export default function AdminCarrerasPage() {
  const { user } = useAuth();
  const [careers, setCareers]   = useState<CareerItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [msg, setMsg]           = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName]   = useState("");

  useEffect(() => { if (user) load(); }, [user]);

  async function load() {
    setLoading(true);
    try { const res = await api.get("/admin/careers"); setCareers(res.data); }
    catch { setError("No se pudieron cargar las carreras."); }
    finally { setLoading(false); }
  }

  async function handleCreate() {
    if (!form.name.trim()) { setMsg("Ingresa el nombre de la carrera."); setTimeout(() => setMsg(""), 3000); return; }
    setSaving(true);
    try {
      const res = await api.post("/admin/careers", { name: form.name.trim() });
      setCareers(prev => [res.data.career, ...prev].sort((a, b) => a.name.localeCompare(b.name)));
      setForm(EMPTY_FORM); setShowForm(false);
      setMsg("Carrera creada."); setTimeout(() => setMsg(""), 3000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setMsg(e.response?.data?.error ?? "Error al crear."); setTimeout(() => setMsg(""), 3000);
    } finally { setSaving(false); }
  }

  async function handleEdit(id: string) {
    if (!editName.trim()) return;
    try {
      const res = await api.patch(`/admin/careers/${id}`, { name: editName.trim() });
      setCareers(prev => prev.map(c => c.id === id ? res.data.career : c));
      setEditingId(null); setMsg("Carrera actualizada."); setTimeout(() => setMsg(""), 3000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setMsg(e.response?.data?.error ?? "Error."); setTimeout(() => setMsg(""), 3000);
    }
  }

  async function toggleActive(item: CareerItem) {
    try {
      const res = await api.patch(`/admin/careers/${item.id}`, { isActive: !item.isActive });
      setCareers(prev => prev.map(c => c.id === item.id ? res.data.career : c));
      setMsg(res.data.career.isActive ? "Carrera activada." : "Carrera desactivada."); setTimeout(() => setMsg(""), 3000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setMsg(e.response?.data?.error ?? "Error."); setTimeout(() => setMsg(""), 3000);
    }
  }

  const inp = "w-full bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#006d37] focus:ring-0 rounded-xl px-4 py-3 text-sm outline-none";

  return (
    <div className="px-4 sm:px-8 py-8 lg:py-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#191c1e] font-headline">Carreras</h1>
          <p className="text-[#424750] mt-1 text-sm">Catálogo para perfiles de estudiantes y egresados</p>
        </div>
        <button type="button" onClick={() => setShowForm(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00386c] text-white rounded-xl text-sm font-bold hover:opacity-90">
          <Plus className="w-4 h-4" /> Nueva carrera
        </button>
      </div>

      <InfoCallout
        title="Catálogo de carreras"
        description="Los candidatos solo pueden elegir carreras registradas aquí. Esto mantiene consistencia con el panel institucional y los reportes por programa."
      />

      {msg && (
        <p className={`mb-4 text-sm font-semibold px-4 py-2 rounded-xl ${
          msg.includes("Error") ? "bg-[#ffdad6] text-[#93000a]" : "bg-[#6bfe9c]/20 text-[#005228]"
        }`}>{msg}</p>
      )}
      {error && (
        <div className="mb-4 flex items-center gap-2 text-[#93000a] bg-[#ffdad6] px-4 py-3 rounded-xl text-sm">
          <AlertCircle className="w-4 h-4" />{error}
        </div>
      )}

      {showForm && (
        <div className="mb-6 bg-white border border-[#e6e8ea] rounded-2xl p-6">
          <h2 className="font-bold text-[#191c1e] mb-4">Nueva carrera</h2>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#424750] mb-2">Nombre</label>
          <input type="text" value={form.name} onChange={e => setForm({ name: e.target.value })}
            placeholder="ej. Ingeniería de Sistemas" className={inp} />
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={handleCreate} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#006d37] text-white rounded-xl text-sm font-bold disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar
            </button>
            <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
              className="px-4 py-2 border border-[#e6e8ea] rounded-xl text-sm font-semibold">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[#00386c]" /></div>
      ) : careers.length === 0 ? (
        <p className="text-center text-[#737781] py-12">No hay carreras registradas.</p>
      ) : (
        <div className="space-y-3">
          {careers.map(c => (
            <div key={c.id} className="bg-white border border-[#e6e8ea] rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#a6c8ff]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <GraduationCap className="w-5 h-5 text-[#00386c]" />
                </div>

                {editingId === c.id ? (
                  <div className="flex-1 flex flex-col sm:flex-row gap-3">
                    <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                      className={`${inp} flex-1`} />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleEdit(c.id)}
                        className="p-2 bg-[#006d37] text-white rounded-lg">
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => setEditingId(null)}
                        className="p-2 text-[#737781] rounded-lg border border-[#e6e8ea]">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-[#191c1e] truncate">{c.name}</p>
                        <p className="text-xs text-[#737781]">{c.slug}</p>
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
                        c.isActive ? "bg-[#6bfe9c]/20 text-[#005228]" : "bg-[#f2f4f6] text-[#737781]"
                      }`}>
                        {c.isActive ? "Activa" : "Inactiva"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <button type="button" onClick={() => { setEditingId(c.id); setEditName(c.name); }}
                        className="text-xs font-bold text-[#00386c] px-3 py-1.5 rounded-lg hover:bg-[#a6c8ff]/20">
                        Editar
                      </button>
                      <button type="button" onClick={() => toggleActive(c)}
                        className="text-xs font-bold text-[#424750] px-3 py-1.5 rounded-lg border border-[#e6e8ea] hover:bg-[#f7f9fb]">
                        {c.isActive ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}