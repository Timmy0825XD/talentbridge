"use client";

import { useAuth } from "@/src/context/auth-context";
import { useState } from "react";
import api from "@/src/lib/api";
import InfoCallout from "@/src/components/info/InfoCallout";
import { UserPlus, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function AdminCrearAdminPage() {
  const { user } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState("");
  const [isError, setIsError]   = useState(false);

  async function handleCreate() {
    if (!email || !password) { setMsg("Completa todos los campos."); setIsError(true); return; }
    setSaving(true); setMsg(""); setIsError(false);
    try {
      await api.post("/admin/admins", { email, password });
      setMsg(`Cuenta admin creada para ${email}.`);
      setEmail(""); setPassword("");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setMsg(e.response?.data?.error ?? "Error al crear la cuenta."); setIsError(true);
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  const inp = "w-full bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#191c1e] focus:ring-0 rounded-lg px-4 py-3 text-sm text-[#191c1e] placeholder:text-[#737781] outline-none transition-all";
  const lbl = "block text-xs font-bold uppercase tracking-wider text-[#424750] mb-2";

  return (
    <div className="px-8 py-10 max-w-screen-sm">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#191c1e] font-headline">Crear administrador</h1>
        <p className="text-[#424750] mt-1">Las cuentas ADMIN e INSTITUTION solo se crean desde aquí</p>
      </div>

      <InfoCallout
        title="Crear administradores"
        description="Genera cuentas de administrador y de institución. Estas cuentas tienen acceso privilegiado a la plataforma."
      />

      <div className="bg-white rounded-2xl border border-[#e6e8ea] p-6 space-y-5">
        <div>
          <label className={lbl}>Correo electrónico *</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="admin@talentbridge.co" className={inp} />
        </div>
        <div>
          <label className={lbl}>Contraseña *</label>
          <div className="relative">
            <input type={showPwd ? "text" : "password"} value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres" className={inp} />
            <button type="button" onClick={() => setShowPwd(p => !p)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737781] hover:text-[#191c1e]">
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {msg && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold ${
            isError ? "bg-[#ffdad6] text-[#93000a]" : "bg-[#6bfe9c]/20 text-[#005228]"
          }`}>
            {isError ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            {msg}
          </div>
        )}

        <button onClick={handleCreate} disabled={saving}
          className="flex items-center gap-2 bg-[#191c1e] text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider hover:opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          {saving ? "Creando..." : "Crear cuenta admin"}
        </button>
      </div>

      <div className="mt-4 bg-[#fff3cd] rounded-xl px-4 py-3 text-xs text-[#7c5c00] leading-relaxed">
        ⚠️ Las cuentas admin tienen acceso completo a la plataforma. Crea solo cuentas para personal autorizado. Las cuentas INSTITUTION se crean igual pero registrando el rol correspondiente.
      </div>
    </div>
  );
}