"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
import api from "@/src/lib/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ newPassword: "", confirm: "" });

  // Si no hay token en la URL redirige a forgot-password
  useEffect(() => {
    if (!token) router.replace("/auth/forgot-password");
  }, [token, router]);

  async function handleReset() {
    setError(null);

    if (!form.newPassword || !form.confirm) {
      setError("Por favor completa todos los campos.");
      return;
    }
    if (form.newPassword !== form.confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (form.newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/reset-password", {
        token,
        newPassword: form.newPassword,
      });
      setSuccess(true);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(
        axiosErr.response?.data?.error ??
          "El enlace es inválido o ha expirado. Solicita uno nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb] p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-10 md:p-14">

        {/* Icono */}
        <div className="w-16 h-16 bg-[#f2f4f6] rounded-2xl flex items-center justify-center mb-8 mx-auto">
          <span className="text-3xl">🔑</span>
        </div>

        {!success ? (
          <>
            {/* Header */}
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-[#191c1e] mb-3 font-headline">
                Nueva contraseña
              </h2>
              <p className="text-[#424750] leading-relaxed">
                Elige una contraseña segura de al menos 8 caracteres.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-[#ffdad6] text-[#93000a] text-sm font-medium px-4 py-3 rounded-xl mb-6 text-center">
                {error}{" "}
                {error.includes("expirado") && (
                  <Link href="/auth/forgot-password" className="underline font-bold">
                    Solicitar nuevo enlace
                  </Link>
                )}
              </div>
            )}

            <div className="space-y-5 mb-6">

              {/* Nueva contraseña */}
              <div className="space-y-1">
                <label htmlFor="newPassword" className="text-xs font-semibold uppercase tracking-wider text-[#424750] ml-1">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={form.newPassword}
                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                    className="w-full bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#006d37] focus:ring-0 rounded-lg p-4 pr-12 transition-all text-[#191c1e] placeholder:text-[#737781] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737781] hover:text-[#00386c] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirmar */}
              <div className="space-y-1">
                <label htmlFor="confirm" className="text-xs font-semibold uppercase tracking-wider text-[#424750] ml-1">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    id="confirm"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repite tu contraseña"
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && handleReset()}
                    className="w-full bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#006d37] focus:ring-0 rounded-lg p-4 pr-12 transition-all text-[#191c1e] placeholder:text-[#737781] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737781] hover:text-[#00386c] transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={handleReset}
              disabled={isLoading}
              className="w-full py-4 bg-[#00386c] hover:bg-[#1a4f8b] text-white font-bold rounded-full transition-all shadow-lg shadow-[#00386c]/10 flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed mb-4"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  CAMBIAR CONTRASEÑA
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>

            <Link
              href="/auth/login"
              className="w-full py-3 text-[#424750] text-sm font-medium flex items-center justify-center gap-2 hover:text-[#00386c] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio de sesión
            </Link>
          </>
        ) : (
          <>
            {/* Estado: éxito */}
            <div className="text-center space-y-4">
              <div className="text-5xl mb-2">✅</div>
              <h2 className="text-3xl font-bold text-[#191c1e] font-headline">
                ¡Contraseña actualizada!
              </h2>
              <p className="text-[#424750] leading-relaxed">
                Tu contraseña fue cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
            </div>

            <Link
              href="/auth/login"
              className="mt-10 w-full py-4 bg-[#00386c] hover:bg-[#1a4f8b] text-white font-bold rounded-full transition-all flex items-center justify-center gap-2 group"
            >
              IR AL LOGIN
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}