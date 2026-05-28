"use client";

import { useAuth } from "@/src/context/auth-context";
import { useEffect, useState } from "react";
import api from "@/src/lib/api";
import { Plus, Save, X, Loader2, AlertCircle, CheckCircle2, Building2 } from "lucide-react";

interface Institution {
  id: string;
  institutionName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  isActive: boolean;
  createdAt: string;
  user: {
    id: string;
    email: string;
    isActive: boolean;
    isVerified?: boolean;
  };
}

interface InstitutionResponse {
  message: string;
  institution: Institution;
}

const EMPTY_FORM = {
  institutionName: "",
  email: "",
  password: "",
  contactEmail: "",
  contactPhone: "",
};

export default function AdminInstitucionesPage() {
  const { user } = useAuth();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [msg, setMsg]                   = useState("");
  const [showForm, setShowForm]         = useState(false);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [saving, setSaving]             = useState(false);
  const [editingId, setEditingId]       = useState<string | null>(null);
  const [editName, setEditName]         = useState("");

  useEffect(() => {
    if (user) load();
  }, [user]);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/admin/institutions");
      setInstitutions(res.data);
    } catch { setError("No se pudieron cargar las instituciones."); }
    finally { setLoading(false); }
  }

  async function handleCreate() {
    if (!form.institutionName.trim() || !form.email.trim() || !form.password.trim()) {
      setMsg("Completa nombre, correo y contraseña."); setTimeout(() => setMsg(""), 3000);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        institutionName: form.institutionName.trim(),
        email:           form.email.trim(),
        password:        form.password,
        contactEmail:    form.contactEmail.trim() || undefined,
        contactPhone:    form.contactPhone.trim() || undefined,
      };
      const res = await api.post<InstitutionResponse>("/admin/institutions", payload);
      setInstitutions(prev => [res.data.institution, ...prev]);
      setForm(EMPTY_FORM); setShowForm(false);
      setMsg("Institución creada."); setTimeout(() => setMsg(""), 3000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setMsg(e.response?.data?.error ?? "Error al crear."); setTimeout(() => setMsg(""), 3000);
    } finally { setSaving(false); }
  }

  async function handleEdit(id: string) {
    if (!editName.trim()) return;
    try {
      const res = await api.patch<InstitutionResponse>(`/admin/institutions/${id}`, { institutionName: editName.trim() });
      setInstitutions(prev => prev.map(i => i.id === id ? res.data.institution : i));
      setEditingId(null);
      setMsg("Institución actualizada."); setTimeout(() => setMsg(""), 3000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setMsg(e.response?.data?.error ?? "Error al actualizar."); setTimeout(() => setMsg(""), 3000);
    }
  }

  const inp = "w-full bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#191c1e] focus:ring-0 rounded-lg px-4 py-3 text-sm text-[#191c1e] outline-none transition-all";

  return (
    <div className="px-8 py-10">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#191c1e] font-headline">Instituciones</h1>
          <p className="text-[#424750] mt-1">Gestiona las instituciones educativas de la plataforma</p>
        </div>
        <button onClick={() => setShowForm(p => !p)}
          className="flex items-center gap-2 bg-[#191c1e] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:opacity-80 transition">
          <Plus className="w-4 h-4" /> Nueva institución
        </button>
      </div>

      {msg && <div className="mb-4 px-4 py-3 rounded-xl text-sm font-semibold bg-[#6bfe9c]/20 text-[#005228]">{msg}</div>}
      {error && <div className="mb-4 flex items-center gap-2 bg-[#ffdad6] text-[#93000a] px-4 py-3 rounded-xl text-sm"><AlertCircle className="w-4 h-4" />{error}</div>}

      {showForm && (
        <div className="bg-white rounded-2xl border border-[#e6e8ea] p-5 mb-6 flex gap-3 items-end">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
            <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#424750] mb-2">Nombre</label>
              <input type="text" value={form.institutionName} onChange={e => setForm(p => ({ ...p, institutionName: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && handleCreate()}
              placeholder="ej. Universidad Popular del Cesar" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#424750] mb-2">Correo de acceso</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleCreate()}
                placeholder="universidad@talentbridge.co" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#424750] mb-2">Contraseña</label>
              <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleCreate()}
                placeholder="Mínimo 8 caracteres" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#424750] mb-2">Correo contacto</label>
              <input type="email" value={form.contactEmail} onChange={e => setForm(p => ({ ...p, contactEmail: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleCreate()}
                placeholder="contacto@universidad.edu.co" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#424750] mb-2">Teléfono contacto</label>
              <input type="tel" value={form.contactPhone} onChange={e => setForm(p => ({ ...p, contactPhone: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleCreate()}
                placeholder="+57 300 000 0000" className={inp} />
            </div>
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
          {institutions.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-[#c2c6d1] p-12 text-center">
              <Building2 className="w-10 h-10 text-[#c2c6d1] mx-auto mb-3" />
              <p className="text-sm text-[#737781]">No hay instituciones registradas.</p>
            </div>
          ) : institutions.map(inst => (
            <div key={inst.id} className="bg-white rounded-xl border border-[#e6e8ea] p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-[#f2f4f6] rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-[#424750]" />
              </div>
              {editingId === inst.id ? (
                <div className="flex-1 flex gap-3 items-center">
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleEdit(inst.id)}
                    className={`${inp} flex-1`} autoFocus />
                  <button onClick={() => handleEdit(inst.id)}
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
                    <p className="font-semibold text-[#191c1e] truncate">{inst.institutionName}</p>
                    <p className="text-xs text-[#737781] flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-[#006d37]" /> {inst.user.email}
                    </p>
                    {inst.contactEmail && (
                      <p className="text-xs text-[#737781] truncate mt-0.5">Contacto: {inst.contactEmail}</p>
                    )}
                  </div>
                  <button onClick={() => { setEditingId(inst.id); setEditName(inst.institutionName); }}
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