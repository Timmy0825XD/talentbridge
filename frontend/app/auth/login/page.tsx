"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Eye, EyeOff, ArrowRight, GraduationCap } from "lucide-react";
import { useAuth } from "@/src/context/auth-context";
import api from "@/src/lib/api";

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", password: "" });

  async function handleLogin() {
    setError(null);
 
    if (!form.email || !form.password) {
      setError("Por favor completa todos los campos.");
      return;
    }
 
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      login({ token: res.data.token, role: res.data.role, userId: res.data.userId });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error ?? "Error al iniciar sesión.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-stretch bg-[#f7f9fb]">

      <section className="hidden lg:flex lg:w-1/2 relative bg-[#00386c] overflow-hidden items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSzCXicgM8GpnLqUDdqNefqerpfJuP1Pwsx7ja2PRmiBuMvCGpMuhq-n2nZdC8IANoo1yKoOKi-fQVKCuePIEpgOhGlXKz23HbEAf5GIVBK0XfegVEqJyNPIpmzoKMBBVbgcyD7VNgpuBcWoWiJglMtSSG97GQq1lbH3bRyZpOY_ndJGs8I1Q3GdFZlY4BBRuogFA8EjQzGG43W74EBQ2N78UqcaZWSczsjW6FqJqoHyiT78gpN83Tw-Qtom3F3G1EZVyalGy7Icc"
            alt="Biblioteca universitaria moderna"
            fill
            className="object-cover opacity-40 mix-blend-overlay"
            unoptimized
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-tr from-[#00386c] via-[#00386c]/60 to-transparent z-10" />
        <div className="relative z-20 px-16 max-w-2xl">
          <div className="mb-8">
            <span className="text-[#4ae183] text-sm font-bold tracking-[0.2em] uppercase mb-4 block">
              TalentBridge
            </span>
            <h1 className="font-headline text-6xl font-black text-white leading-tight tracking-tight">
              Elevando Futuros Académicos
            </h1>
          </div>

          <p className="text-[#a6c8ff] text-xl font-light leading-relaxed opacity-90">
            Un puente entre la excelencia académica y el impacto profesional.
            Tu próximo capítulo comienza con conexiones intencionales.
          </p>

          <div className="mt-12 flex items-center gap-6">
            <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32" cy="32" r="28"
                  fill="transparent"
                  stroke="#4ae183"
                  strokeWidth="4"
                  strokeDasharray="176"
                  strokeDashoffset="44"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center"> <GraduationCap className="text-white" /> </div>
            </div>
            <p className="text-white/80 text-sm font-medium"> Enfocados en tu exito. </p>
          </div>
        </div>
      </section>

      <section className="w-full lg:w-1/2 flex items-center justify-center bg-[#f7f9fb] p-8 md:p-16 lg:p-24">
        <div className="w-full max-w-md">

          <div className="lg:hidden mb-12">
            <span className="text-2xl font-black text-[#00386c] font-headline">
              TalentBridge
            </span>
          </div>

          <div className="mb-10">
            <h2 className="font-headline text-3xl font-bold text-[#191c1e] mb-2"> Bienvenido de nuevo </h2>
            <p className="text-[#424750]"> Ingresa tus credenciales para acceder a tu perfil. </p>
          </div>

          <div className="space-y-6">

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-[#424750] ml-1"> Correo institucional </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="nombre@universidad.edu"
                className="w-full bg-[#f2f4f6] border-none rounded-xl py-4 px-4 focus:ring-2 focus:ring-[#00386c]/20 focus:bg-white transition-all duration-300 text-[#191c1e] placeholder:text-[#737781] outline-none"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label htmlFor="password" className="block text-sm font-semibold text-[#424750]"> Contraseña </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm font-medium text-[#00386c] hover:text-[#0c4783] transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  className="w-full bg-[#f2f4f6] border-none rounded-xl py-4 pl-4 pr-12 focus:ring-2 focus:ring-[#00386c]/20 focus:bg-white transition-all duration-300 text-[#191c1e] placeholder:text-[#737781] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737781] hover:text-[#00386c] transition-colors"
                >
                  {showPassword ? ( <EyeOff className="w-5 h-5" /> ) : ( <Eye className="w-5 h-5" /> )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-[#c2c6d1] text-[#006d37] focus:ring-[#006d37]/20 transition-all cursor-pointer"
                />
                <span className="text-sm text-[#424750] group-hover:text-[#191c1e] transition-colors">
                  Mantener sesión iniciada
                </span>
              </label>
            </div>

            <button
              type="button"
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-gradient-to-br from-[#00386c] to-[#1a4f8b] text-white font-headline font-bold py-4 rounded-full shadow-lg shadow-[#00386c]/10 hover:shadow-[#00386c]/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  INICIAR SESIÓN
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="bg-[#ffdad6] text-[#93000a] text-sm font-medium px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <p className="mt-12 text-center text-[#424750] text-sm">
            ¿Nuevo en TalentBridge?
            <Link href="/auth/register" className="text-[#006d37] font-bold hover:underline underline-offset-4 ml-1" >
              Crea una cuenta
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}