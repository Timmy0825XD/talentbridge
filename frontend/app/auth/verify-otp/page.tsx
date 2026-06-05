"use client";
import { Suspense, useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, RotateCcw, LetterText } from "lucide-react";
import api from "@/src/lib/api";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!userId) router.replace("/auth/register");
  }, [userId, router]);

  function handleDigitChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      inputs.current[5]?.focus();
    }
  }

  async function handleVerify() {
    const code = digits.join("");
    if (code.length < 6) {
      setError("Ingresa el código completo de 6 dígitos.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await api.post("/auth/verify-otp", { userId, code });
      setSuccessMsg("¡Cuenta verificada! Redirigiendo al login...");
      setTimeout(() => router.push("/auth/login"), 1500);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error ?? "Código inválido o expirado.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    setError(null);
    setSuccessMsg(null);
    setIsResending(true);
    try {
      await api.post("/auth/resend-otp", { userId });
      setSuccessMsg("Código reenviado. Revisa tu correo.");
      setDigits(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error ?? "No se pudo reenviar el código.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb] p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-10 md:p-14">

        <div className="w-16 h-16 bg-[#f2f4f6] rounded-2xl flex items-center justify-center mb-8 mx-auto">
          <span className="text-3xl"><LetterText/></span>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[#191c1e] mb-3 font-headline">
            Verifica tu correo
          </h2>
          <p className="text-[#424750] leading-relaxed">
            Te enviamos un código de 6 dígitos. Ingrésalo aquí para activar tu cuenta.
          </p>
        </div>

        {error && (
          <div className="bg-[#ffdad6] text-[#93000a] text-sm font-medium px-4 py-3 rounded-xl mb-6 text-center">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-[#6bfe9c]/20 text-[#005228] text-sm font-medium px-4 py-3 rounded-xl mb-6 text-center">
            {successMsg}
          </div>
        )}

        <div className="flex gap-3 justify-center mb-8" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-12 h-14 text-center text-2xl font-bold bg-[#f2f4f6] rounded-xl border-2 border-transparent focus:border-[#006d37] focus:bg-white transition-all outline-none text-[#191c1e]"
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleVerify}
          disabled={isLoading}
          className="w-full py-4 bg-[#00386c] hover:bg-[#1a4f8b] text-white font-bold rounded-full transition-all shadow-lg shadow-[#00386c]/10 flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed mb-4"
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              VERIFICAR CUENTA
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="w-full py-3 text-[#424750] text-sm font-medium flex items-center justify-center gap-2 hover:text-[#00386c] transition-colors disabled:opacity-50"
        >
          <RotateCcw className="w-4 h-4" />
          {isResending ? "Reenviando..." : "Reenviar código"}
        </button>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
          <span className="w-8 h-8 border-2 border-[#00386c]/30 border-t-[#00386c] rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}