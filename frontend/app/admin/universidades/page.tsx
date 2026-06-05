"use client";

import { useAuth } from "@/src/context/auth-context";
import { useEffect, useState } from "react";
import api from "@/src/lib/api";
import InfoCallout from "@/src/components/info/InfoCallout";
import { Plus, Save, X, Loader2, AlertCircle, CheckCircle2, Building2, Copy, KeyRound } from "lucide-react";

interface UniversityUser {
  id: string;
  email: string;
  isActive: boolean;
  isVerified?: boolean;
}

interface UniversityItem {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  institutionProfile: {
    id: string;
    institutionName: string;
    user: UniversityUser;
  } | null;
}

interface CreateUniversityResponse {
  message: string;
  university: UniversityItem;
  generatedCredentials: { email: string; password: string };
}

interface UpdateUniversityResponse {
  message: string;
  university: UniversityItem;
}

const EMPTY_FORM = { name: "" };

export default function AdminUniversidadesPage() {
  const { user } = useAuth();
  const [universities, setUniversities] = useState<UniversityItem[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [msg, setMsg]                   = useState("");
  const [showForm, setShowForm]         = useState(false);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [saving, setSaving]             = useState(false);
  const [editingId, setEditingId]       = useState<string | null>(null);
  const [editName, setEditName]         = useState("");
  const [credentials, setCredentials] = useState<{ email: string; password: string; name: string } | null>(null);

  useEffect(() => {
    if (user) load();
  }, [user]);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/admin/universities");
      setUniversities(res.data);
    } catch { setError("No se pudieron cargar las universidades."); }
    finally { setLoading(false); }
  }

  async function handleCreate() {
    if (!form.name.trim()) {
      setMsg("Ingresa el nombre de la universidad."); setTimeout(() => setMsg(""), 3000);
      return;
    }
    setSaving(true);
    try {
      const res = await api.post<CreateUniversityResponse>("/admin/universities", {
        name: form.name.trim(),
      });
      setUniversities(prev => [res.data.university, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
      setCredentials({
        name: res.data.university.name,
        email: res.data.generatedCredentials.email,
        password: res.data.generatedCredentials.password,
      });
      setMsg("Universidad creada."); setTimeout(() => setMsg(""), 3000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setMsg(e.response?.data?.error ?? "Error al crear."); setTimeout(() => setMsg(""), 3000);
    } finally { setSaving(false); }
  }

  async function handleEdit(id: string) {
    if (!editName.trim()) return;
    try {
      const res = await api.patch<UpdateUniversityResponse>(`/admin/universities/${id}`, { name: editName.trim() });
      setUniversities(prev => prev.map(u => u.id === id ? res.data.university : u));
      setEditingId(null);
      setMsg("Universidad actualizada."); setTimeout(() => setMsg(""), 3000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setMsg(e.response?.data?.error ?? "Error al actualizar."); setTimeout(() => setMsg(""), 3000);
    }
  }

  async function toggleActive(uni: UniversityItem) {
    try {
      const res = await api.patch<UpdateUniversityResponse>(`/admin/universities/${uni.id}`, {
        isActive: !uni.isActive,
      });
      setUniversities(prev => prev.map(u => u.id === uni.id ? res.data.university : u));
      setMsg(res.data.university.isActive ? "Universidad activada." : "Universidad desactivada.");
      setTimeout(() => setMsg(""), 3000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setMsg(e.response?.data?.error ?? "Error al actualizar estado.");
      setTimeout(() => setMsg(""), 3000);
    }
  }

  function copyCredentials(text: string) {
    navigator.clipboard.writeText(text);
    setMsg("Copiado al portapapeles."); setTimeout(() => setMsg(""), 2000);
  }

  const inp = "w-full bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#191c1e] focus:ring-0 rounded-lg px-4 py-3 text-sm text-[#191c1e] outline-none transition-all";

  return (
    <div className="px-8 py-10">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#191c1e] font-headline">Universidades</h1>
          <p className="text-[#424750] mt-1">Catálogo centralizado de instituciones educativas</p>
        </div>
        <button onClick={() => setShowForm(p => !p)}
          className="flex items-center gap-2 bg-[#191c1e] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:opacity-80 transition">
          <Plus className="w-4 h-4" /> Nueva universidad
        </button>
      </div>

      <InfoCallout
        title="Gestión de universidades"
        description="Registra universidades autorizadas. El sistema genera automáticamente el correo institucional y la contraseña inicial."
      />

      {msg && <div className="mb-4 px-4 py-3 rounded-xl text-sm font-semibold bg-[#6bfe9c]/20 text-[#005228]">{msg}</div>}
      {error && <div className="mb-4 flex items-center gap-2 bg-[#ffdad6] text-[#93000a] px-4 py-3 rounded-xl text-sm"><AlertCircle className="w-4 h-4" />{error}</div>}

      {credentials && (
        <div className="mb-6 bg-[#fff8e1] border border-[#ffd54f] rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <KeyRound className="w-5 h-5 text-[#191c1e]" />
                <h3 className="font-bold text-[#191c1e]">Credenciales generadas — {credentials.name}</h3>
              </div>
              <p className="text-sm text-[#424750] mb-3">
                Guarda estas credenciales ahora. No se volverán a mostrar.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#424750] w-24">Correo:</span>
                  <code className="bg-white px-2 py-1 rounded">{credentials.email}</code>
                  <button onClick={() => copyCredentials(credentials.email)} className="p-1 text-[#424750] hover:text-[#191c1e]">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#424750] w-24">Contraseña:</span>
                  <code className="bg-white px-2 py-1 rounded">{credentials.password}</code>
                  <button onClick={() => copyCredentials(credentials.password)} className="p-1 text-[#424750] hover:text-[#191c1e]">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <button onClick={() => setCredentials(null)} className="p-2 text-[#737781] hover:text-[#191c1e]">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl border border-[#e6e8ea] p-5 mb-6 flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#424750] mb-2">Nombre de la universidad</label>
            <input type="text" value={form.name} onChange={e => setForm({ name: e.target.value })}
              onKeyDown={e => e.key === "Enter" && handleCreate()}
              placeholder="ej. Universidad Popular del Cesar" className={inp} />
          </div>
          <button onClick={handleCreate} disabled={saving}
            className="flex items-center gap-2 bg-[#191c1e] text-white px-5 py-3 rounded-full text-sm font-bold hover:opacity-80 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Creando..." : "Crear"}
          </button>
          <button onClick={() => setShowForm(false)} className="p-3 text-[#737781] hover:text-[#191c1e] rounded-xl">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="w-6 h-6 border-2 border-[#424750]/20 border-t-[#424750] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {universities.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-[#c2c6d1] p-12 text-center">
              <Building2 className="w-10 h-10 text-[#c2c6d1] mx-auto mb-3" />
              <p className="text-sm text-[#737781]">No hay universidades registradas.</p>
            </div>
          ) : universities.map(uni => (
            <div key={uni.id} className="bg-white rounded-xl border border-[#e6e8ea] p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-[#f2f4f6] rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-[#424750]" />
              </div>
              {editingId === uni.id ? (
                <div className="flex-1 flex gap-3 items-center">
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleEdit(uni.id)}
                    className={`${inp} flex-1`} autoFocus />
                  <button onClick={() => handleEdit(uni.id)}
                    className="p-2 bg-[#191c1e] text-white rounded-lg hover:opacity-80">
                    <Save className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setEditingId(null)}
                    className="p-2 text-[#737781] hover:text-[#191c1e] rounded-lg">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#191c1e] truncate">{uni.name}</p>
                    <p className="text-xs text-[#737781] flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-[#006d37]" />
                      {uni.institutionProfile?.user.email ?? `${uni.slug}@talentbridge.com`}
                    </p>
                    <p className="text-xs text-[#737781] mt-0.5">
                      Slug: {uni.slug} · {uni.isActive ? "Activa" : "Inactiva"}
                    </p>
                  </div>
                  <button onClick={() => toggleActive(uni)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
                      uni.isActive
                        ? "text-[#93000a] bg-[#ffdad6] hover:bg-[#ffc4bf]"
                        : "text-[#005228] bg-[#6bfe9c]/20 hover:bg-[#6bfe9c]/30"
                    }`}>
                    {uni.isActive ? "Desactivar" : "Activar"}
                  </button>
                  <button onClick={() => { setEditingId(uni.id); setEditName(uni.name); }}
                    className="text-xs font-bold text-[#424750] hover:text-[#191c1e] px-3 py-1.5 bg-[#f2f4f6] rounded-full transition-colors">
                    Editar
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
