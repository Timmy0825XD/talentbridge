"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ArrowLeft, Mail } from "lucide-react";
import api from "@/src/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    setError(null);

    if (!email) {
      setError("Por favor ingresa tu correo.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      // Siempre mostramos éxito — el backend no revela si el correo existe
      setSent(true);
    } catch {
      // Igual mostramos éxito por seguridad
      setSent(true);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb] p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-10 md:p-14">

        {/* Icono */}
        <div className="w-16 h-16 bg-[#f2f4f6] rounded-2xl flex items-center justify-center mb-8 mx-auto">
          <Mail className="w-8 h-8 text-[#00386c]" />
        </div>

        {!sent ? (
          <>
            {/* Header */}
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-[#191c1e] mb-3 font-headline">
                ¿Olvidaste tu contraseña?
              </h2>
              <p className="text-[#424750] leading-relaxed">
                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-[#ffdad6] text-[#93000a] text-sm font-medium px-4 py-3 rounded-xl mb-6 text-center">
                {error}
              </div>
            )}

            {/* Input */}
            <div className="space-y-2 mb-6">
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-[#424750] ml-1">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                placeholder="nombre@universidad.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="w-full bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#006d37] focus:ring-0 rounded-lg p-4 transition-all text-[#191c1e] placeholder:text-[#737781] outline-none"
              />
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-4 bg-[#00386c] hover:bg-[#1a4f8b] text-white font-bold rounded-full transition-all shadow-lg shadow-[#00386c]/10 flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed mb-4"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  ENVIAR ENLACE
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>

            {/* Volver */}
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
            {/* Estado: enviado */}
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-[#191c1e] font-headline">
                Revisa tu correo
              </h2>
              <p className="text-[#424750] leading-relaxed">
                Si existe una cuenta con{" "}
                <span className="font-semibold text-[#00386c]">{email}</span>,
                recibirás un enlace para restablecer tu contraseña en los
                próximos minutos.
              </p>
              <div className="bg-[#6bfe9c]/20 text-[#005228] text-sm font-medium px-4 py-3 rounded-xl">
                El enlace expira en 15 minutos.
              </div>
            </div>

            <Link
              href="/auth/login"
              className="mt-10 w-full py-4 bg-[#00386c] hover:bg-[#1a4f8b] text-white font-bold rounded-full transition-all flex items-center justify-center gap-2 group"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver al inicio de sesión
            </Link>
          </>
        )}
      </div>
    </div>
  );
}