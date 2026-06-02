"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, ArrowLeft, Mail, Lock, Sparkles, Zap, Star, CheckCircle2, Building2 } from "lucide-react";
import { useAuth } from "@/src/context/auth-context";
import api from "@/src/lib/api";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [form, setForm]                 = useState({ email: "", password: "" });
  const [mouseOffset, setMouseOffset]   = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      setMouseOffset({ x, y });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

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
      const axiosErr = err as { response?: { data?: { error?: string; code?: string; userId?: string } } };
      const data = axiosErr.response?.data;
      if (data?.code === "NOT_VERIFIED" && data?.userId) {
        router.push(`/auth/verify-otp?userId=${data.userId}`);
        return;
      }
      setError(data?.error ?? "Error al iniciar sesión.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @keyframes blob {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50%      { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50%      { transform: translateY(-12px) rotate(1deg); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes dot-pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40%           { opacity: 1; transform: scale(1); }
        }
        .blob       { animation: blob 12s ease-in-out infinite; }
        .a-slide    { animation: slide-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .a-slide-d1 { animation: slide-in 0.7s 0.1s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .a-slide-d2 { animation: slide-in 0.7s 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .a-slide-d3 { animation: slide-in 0.7s 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .a-slide-d4 { animation: slide-in 0.7s 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .a-slide-d5 { animation: slide-in 0.7s 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .a-fade     { animation: fade-in 1.2s ease forwards; opacity: 0; }
        .shimmer-green {
          background: linear-gradient(90deg, #6bfe9c 0%, #4ae183 30%, #ffffff 50%, #4ae183 70%, #6bfe9c 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .grid-pattern {
          background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>

      <div className="min-h-screen flex items-stretch bg-[#f7f9fb] overflow-hidden">

        {/* ═══════ LEFT: Brand panel ═══════ */}
        <section className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#00386c] via-[#0c4783] to-[#1a4f8b] overflow-hidden">

          {/* Grid pattern */}
          <div className="absolute inset-0 grid-pattern" />

          {/* Animated blobs that follow mouse */}
          <div
            className="absolute top-[15%] right-[10%] w-[400px] h-[400px] bg-gradient-to-br from-[#6bfe9c]/20 to-transparent blob blur-3xl pointer-events-none"
            style={{ transform: `translate(${mouseOffset.x}px, ${mouseOffset.y}px)`, transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}
          />
          <div
            className="absolute bottom-[10%] left-[5%] w-[350px] h-[350px] bg-gradient-to-tr from-[#1a4f8b]/40 to-transparent blob blur-3xl pointer-events-none"
            style={{ transform: `translate(${-mouseOffset.x}px, ${-mouseOffset.y}px)`, transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}
          />

          {/* Big TB watermark */}
          <div className="absolute -right-12 -bottom-20 text-[400px] font-black text-white opacity-[0.025] select-none leading-none pointer-events-none font-headline">
            TB
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-between p-16 w-full">

            {/* Top: brand */}
            <div className="a-slide flex items-center gap-3">
              <div className="w-11 h-11 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-sm">TB</span>
              </div>
              <span className="text-white font-extrabold text-xl font-headline tracking-tight">
                TalentBridge
              </span>
            </div>

            {/* Middle: main copy */}
            <div className="space-y-8 max-w-lg">
              <div className="a-slide-d1 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold text-[#6bfe9c] uppercase tracking-widest">
                <Sparkles className="w-3 h-3" /> Conectando talento del Cesar
              </div>

              <h1 className="a-slide-d2 font-headline text-5xl xl:text-6xl font-extrabold text-white leading-[1.05] tracking-tight">
                Tu próximo
                <br />
                capítulo
                <br />
                <span className="shimmer-green">empieza aquí.</span>
              </h1>

              <p className="a-slide-d3 text-[#a6c8ff] text-lg leading-relaxed">
                Inicia sesión para acceder a oportunidades reales, gestionar tus postulaciones y construir tu futuro profesional.
              </p>

              {/* Mini feature cards */}
              <div className="a-slide-d4 grid grid-cols-3 gap-3 pt-2">
                {[
                  { icon: <Zap />,       label: "IA Match"   },
                  { icon: <Star />,      label: "Verificado" },
                  { icon: <Building2 />, label: "Empresas"   },
                ].map(({ icon, label }) => (
                  <div key={label} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-3 py-3 text-center">
                    <div className="text-[#6bfe9c] flex justify-center mb-1.5 [&>svg]:w-4 [&>svg]:h-4">{icon}</div>
                    <p className="text-white/80 text-[10px] font-bold uppercase tracking-wider">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom: testimonial card */}
            <div className="a-slide-d5">
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex -space-x-2">
                    {["#6bfe9c","#a6c8ff","#C9A84C","#4ae183"].map((c, i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-[#00386c] flex items-center justify-center text-[#00386c] text-[9px] font-black"
                        style={{ background: c, zIndex: 4 - i }}>
                        {["EG","AN","MA","LP"][i]}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-[#C9A84C] text-[#C9A84C]" />)}
                    </div>
                    <p className="text-white/60 text-[10px] mt-0.5">500+ candidatos confían</p>
                  </div>
                </div>
                <p className="text-white/85 text-sm leading-relaxed italic">
                  &ldquo;TalentBridge me conectó con mi primer trabajo formal en menos de 2 semanas. Cambió mi carrera.&rdquo;
                </p>
                <p className="text-[#6bfe9c] text-xs font-bold mt-2">— Egresada, Ing. Sistemas · UPC</p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ RIGHT: Form ═══════ */}
        <section className="w-full lg:w-1/2 flex items-center justify-center bg-[#f7f9fb] p-6 md:p-12 lg:p-16 relative">

          {/* Subtle background decoration */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-[#6bfe9c]/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-[#00386c]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative w-full max-w-md">

            {/* Back link */}
            <Link href="/"
              className="a-slide inline-flex items-center gap-2 text-[#737781] hover:text-[#00386c] mb-10 group transition-colors">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-semibold">Volver al inicio</span>
            </Link>

            {/* Mobile brand */}
            <div className="lg:hidden mb-10 a-slide flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-[#00386c] to-[#1a4f8b] rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-black text-xs">TB</span>
              </div>
              <span className="text-xl font-extrabold font-headline text-[#00386c] tracking-tight">
                TalentBridge
              </span>
            </div>

            {/* Heading */}
            <div className="a-slide-d1 mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6bfe9c]/15 border border-[#6bfe9c]/30 text-[#006d37] text-[10px] font-bold uppercase tracking-widest mb-4">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#6bfe9c] opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#006d37]" />
                </span>
                Iniciar sesión
              </div>
              <h2 className="font-headline text-4xl font-extrabold text-[#191c1e] mb-2 tracking-tight leading-tight">
                Bienvenido de
                <br />
                <span className="bg-gradient-to-r from-[#00386c] to-[#1a4f8b] bg-clip-text text-transparent">vuelta.</span>
              </h2>
              <p className="text-[#737781] text-sm">
                Ingresa tus credenciales para acceder a tu perfil.
              </p>
            </div>

            {/* Form */}
            <div className="space-y-5">

              {/* Email */}
              <div className="a-slide-d2 space-y-2">
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-[#424750]">
                  Correo electrónico
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737781] group-focus-within:text-[#00386c] transition-colors" />
                  <input
                    id="email" name="email" type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="nombre@universidad.edu"
                    className="w-full bg-white border border-[#e6e8ea] rounded-2xl py-3.5 pl-11 pr-4 focus:border-[#00386c] focus:ring-4 focus:ring-[#00386c]/8 transition-all text-sm text-[#191c1e] placeholder:text-[#c2c6d1] outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="a-slide-d3 space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-[#424750]">
                    Contraseña
                  </label>
                  <Link href="/auth/forgot-password"
                    className="text-xs font-bold text-[#00386c] hover:text-[#006d37] transition-colors">
                    ¿Olvidaste?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737781] group-focus-within:text-[#00386c] transition-colors" />
                  <input
                    id="password" name="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    className="w-full bg-white border border-[#e6e8ea] rounded-2xl py-3.5 pl-11 pr-12 focus:border-[#00386c] focus:ring-4 focus:ring-[#00386c]/8 transition-all text-sm text-[#191c1e] placeholder:text-[#c2c6d1] outline-none"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737781] hover:text-[#00386c] transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="a-slide-d3 flex items-center">
                <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                  <input type="checkbox"
                    className="w-4 h-4 rounded border-[#c2c6d1] text-[#006d37] focus:ring-[#006d37]/20 transition-all cursor-pointer" />
                  <span className="text-xs font-semibold text-[#424750] group-hover:text-[#191c1e] transition-colors">
                    Mantener sesión iniciada
                  </span>
                </label>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-[#ffdad6] text-[#93000a] text-sm font-semibold px-4 py-3 rounded-2xl flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#ba1a1a] mt-2 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="button" onClick={handleLogin} disabled={isLoading}
                className="a-slide-d4 group relative w-full bg-gradient-to-br from-[#00386c] to-[#1a4f8b] text-white font-bold py-4 rounded-2xl shadow-xl shadow-[#00386c]/20 hover:shadow-[#00386c]/30 hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 text-sm uppercase tracking-wider overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="relative">Ingresando...</span>
                  </>
                ) : (
                  <>
                    <span className="relative">Iniciar sesión</span>
                    <ArrowRight className="relative w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="a-slide-d5 flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-[#e6e8ea]" />
                <span className="text-[10px] font-bold text-[#c2c6d1] uppercase tracking-widest">o</span>
                <div className="flex-1 h-px bg-[#e6e8ea]" />
              </div>

              {/* Register CTA */}
              <Link href="/auth/register"
                className="a-slide-d5 group flex items-center justify-center gap-2 w-full bg-white border-2 border-[#e6e8ea] hover:border-[#006d37]/30 text-[#191c1e] hover:text-[#006d37] font-bold py-3.5 rounded-2xl transition-all text-sm">
                ¿Nuevo en TalentBridge?
                <span className="text-[#006d37] font-black group-hover:underline underline-offset-4">
                  Crea una cuenta
                </span>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="a-slide-d5 mt-10 flex items-center justify-center gap-5 text-[10px] text-[#c2c6d1] font-semibold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-[#006d37]" /> Seguro
              </span>
              <span className="w-1 h-1 rounded-full bg-[#e6e8ea]" />
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#C9A84C]" /> Privado
              </span>
              <span className="w-1 h-1 rounded-full bg-[#e6e8ea]" />
              <span>© 2026 TalentBridge</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}