"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Eye, EyeOff, ArrowRight, ArrowLeft, Mail, Lock,
  Sparkles, Zap, Star, CheckCircle2, Building2,
} from "lucide-react";
import { useAuth } from "@/src/context/auth-context";
import api from "@/src/lib/api";

export default function LoginPage() {
  const { login } = useAuth();
  const router    = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [form, setForm]                 = useState({ email: "", password: "" });
  const [mouse, setMouse]               = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth  - 0.5) * 18,
        y: (e.clientY / window.innerHeight - 0.5) * 18,
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  async function handleLogin() {
    setError(null);
    if (!form.email || !form.password) { setError("Por favor completa todos los campos."); return; }
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      login({ token: res.data.token, role: res.data.role, userId: res.data.userId });
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string; code?: string; userId?: string } } };
      const data = ax.response?.data;
      if (data?.code === "NOT_VERIFIED" && data?.userId) {
        router.push(`/auth/verify-otp?userId=${data.userId}`); return;
      }
      setError(data?.error ?? "Error al iniciar sesión.");
    } finally { setIsLoading(false); }
  }

  return (
    <>
      <style>{`
        @keyframes slide-card-in {
          from { opacity: 0; transform: translateY(32px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes form-in {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes field-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes blob {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50%      { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
        }

        /* ── Fondo animado (nuevo) ── */
        @keyframes bg-orb-1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33%      { transform: translate(40px, -30px) scale(1.08); }
          66%      { transform: translate(-20px, 20px) scale(0.96); }
        }
        @keyframes bg-orb-2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33%      { transform: translate(-35px, 25px) scale(1.05); }
          66%      { transform: translate(30px, -15px) scale(0.98); }
        }
        @keyframes bg-orb-3 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50%      { transform: translate(20px, 30px) scale(1.1); }
        }
        @keyframes bg-dots-drift {
          0%   { background-position: 0px 0px; }
          100% { background-position: 40px 40px; }
        }

        .card-in  { animation: slide-card-in 0.8s cubic-bezier(0.16,1,0.3,1) both; }
        .form-in  { animation: form-in 0.7s 0.1s cubic-bezier(0.16,1,0.3,1) both; }
        .f1 { animation: field-in 0.5s 0.10s cubic-bezier(0.16,1,0.3,1) both; }
        .f2 { animation: field-in 0.5s 0.18s cubic-bezier(0.16,1,0.3,1) both; }
        .f3 { animation: field-in 0.5s 0.26s cubic-bezier(0.16,1,0.3,1) both; }
        .f4 { animation: field-in 0.5s 0.34s cubic-bezier(0.16,1,0.3,1) both; }
        .f5 { animation: field-in 0.5s 0.42s cubic-bezier(0.16,1,0.3,1) both; }
        .f6 { animation: field-in 0.5s 0.50s cubic-bezier(0.16,1,0.3,1) both; }
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
        .blob { animation: blob 14s ease-in-out infinite; }

        /* Orbes del fondo exterior */
        .bg-orb-1 { animation: bg-orb-1 18s ease-in-out infinite; }
        .bg-orb-2 { animation: bg-orb-2 24s ease-in-out infinite; }
        .bg-orb-3 { animation: bg-orb-3 14s ease-in-out infinite; }

        /* Patrón de puntos que se mueve lentamente */
        .bg-dots {
          background-image: radial-gradient(circle, rgba(0,56,108,0.13) 1px, transparent 1px);
          background-size: 28px 28px;
          animation: bg-dots-drift 8s linear infinite;
        }
      `}</style>

      {/* ── Wrapper con fondo animado ── */}
      <div className="min-h-screen flex items-center justify-center p-4 md:p-6 lg:p-10 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #e8edf3 0%, #dde4ed 40%, #e4eae8 100%)" }}>

        {/* Capa de puntos con drift */}
        <div className="bg-dots absolute inset-0 pointer-events-none" />

        {/* Orbe 1 — azul marino grande, esquina superior izquierda */}
        <div
          className="bg-orb-1 absolute pointer-events-none"
          style={{
            top: "-10%", left: "-8%",
            width: "520px", height: "520px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,56,108,0.14) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        {/* Orbe 2 — verde TalentBridge, esquina inferior derecha */}
        <div
          className="bg-orb-2 absolute pointer-events-none"
          style={{
            bottom: "-12%", right: "-6%",
            width: "480px", height: "480px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(74,225,131,0.13) 0%, transparent 70%)",
            filter: "blur(48px)",
          }}
        />

        {/* Orbe 3 — azul claro, centro-derecha */}
        <div
          className="bg-orb-3 absolute pointer-events-none"
          style={{
            top: "30%", right: "12%",
            width: "280px", height: "280px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,56,108,0.08) 0%, transparent 70%)",
            filter: "blur(32px)",
          }}
        />

        {/* Orbe 4 — verde suave, centro-izquierda */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "55%", left: "8%",
            width: "200px", height: "200px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(107,254,156,0.09) 0%, transparent 70%)",
            filter: "blur(28px)",
            animation: "bg-orb-1 20s 3s ease-in-out infinite",
          }}
        />

        {/* ── Main card ── */}
        <div className="card-in w-full max-w-5xl bg-white rounded-3xl shadow-2xl shadow-black/10 overflow-hidden flex flex-col lg:flex-row relative z-10">

          {/* ════ LEFT: Image panel with 3D parallax ════ */}
          <div className="relative lg:w-[44%] flex-shrink-0 overflow-hidden" style={{ minHeight: 500 }}>

            {/* 3D panel wrapper */}
            <div
              className="absolute inset-0"
              style={{
                transformStyle: "preserve-3d",
                transform: `perspective(1200px) rotateY(${mouse.x * 0.04}deg) rotateX(${-mouse.y * 0.03}deg)`,
                transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              {/* Background image */}
              <div className="absolute inset-0">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCm0KssseYAu7hq7n7XjhoLVJ7aqTxO87CKz3M7NwcawdXxR9Jsbpwx1IQWFocD6yXz8dHDFMWWzozefSOivq0Om8pO602d0M7Jl1ad2SApfZzrCBDqsCFQdskgftczLdAkAdWUZBjc2n0_F68oUBjioRlGhJPUeONqAnwgxHiVApPavLnU28cZV_izYIngHUDTzOKgF_1S-7XKZhQzCh4J4IfjprfGc5ufejvOgYBxIkmGZPfnHhs-gGZY0Hf3GgaRVvbkdVJIVRg"
                  alt="Talento universitario" fill
                  className="object-cover" unoptimized
                />
              </div>

              {/* Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#00386c]/80 via-[#00386c]/50 to-transparent" />
              <div className="absolute inset-0 grid-pattern" />

              {/* Animated blob accent */}
              <div
                className="absolute top-[15%] right-[5%] w-64 h-64 bg-[#6bfe9c]/15 blob blur-3xl pointer-events-none"
                style={{ transform: `translate(${mouse.x * 0.6}px, ${mouse.y * 0.6}px)`, transition: "transform 0.8s ease" }}
              />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-between p-10">

                {/* Brand */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/15 backdrop-blur-md border border-white/25 rounded-xl flex items-center justify-center">
                    <span className="text-white font-black text-xs">TB</span>
                  </div>
                  <span className="text-white font-extrabold text-lg font-headline tracking-tight">TalentBridge</span>
                </div>

                {/* Copy */}
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6bfe9c]/20 border border-[#6bfe9c]/30 text-[10px] font-bold text-[#6bfe9c] uppercase tracking-widest">
                    <Sparkles className="w-3 h-3" /> Bienvenido de nuevo
                  </div>

                  <h1 className="font-headline text-4xl xl:text-5xl font-extrabold text-white leading-[1.05] tracking-tight">
                    Tu carrera,
                    <br />
                    tu momento,
                    <br />
                    <span className="shimmer-green">tu futuro.</span>
                  </h1>

                  <p className="text-white/70 text-sm leading-relaxed max-w-xs">
                    Accede a tus postulaciones, contratos y oportunidades que están esperándote.
                  </p>

                  {/* Feature pills */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {[
                      { icon: <Zap className="w-3.5 h-3.5" />,       label: "IA Match"  },
                      { icon: <Star className="w-3.5 h-3.5" />,      label: "Verificado"},
                      { icon: <Building2 className="w-3.5 h-3.5" />, label: "Empresas"  },
                    ].map(({ icon, label }) => (
                      <div key={label} className="bg-white/8 backdrop-blur-md border border-white/12 rounded-xl px-2 py-2.5 text-center">
                        <div className="text-[#6bfe9c] flex justify-center mb-1">{icon}</div>
                        <p className="text-white/75 text-[9px] font-bold uppercase tracking-wider">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Testimonial glass card */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="flex -space-x-2">
                      {["#6bfe9c","#a6c8ff","#C9A84C","#4ae183"].map((c, i) => (
                        <div key={i}
                          className="w-7 h-7 rounded-full border-2 border-white/20 flex items-center justify-center text-[8px] font-black"
                          style={{ background: c, color: "#00210c", zIndex: 4 - i }}>
                          {["EG","AN","MA","LP"][i]}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(i => <Star key={i} className="w-2.5 h-2.5 fill-[#C9A84C] text-[#C9A84C]" />)}
                      </div>
                      <p className="text-white/50 text-[9px] mt-0.5">500+ candidatos activos</p>
                    </div>
                  </div>
                  <p className="text-white/85 text-xs leading-relaxed italic">
                    &ldquo;TalentBridge me conectó con mi primer trabajo formal en menos de 2 semanas.&rdquo;
                  </p>
                  <p className="text-[#6bfe9c] text-[10px] font-bold mt-1.5">— Egresada, Ing. Sistemas · UPC</p>
                </div>
              </div>
            </div>

            {/* Book spine shadow */}
            <div className="absolute right-0 top-0 bottom-0 w-5 pointer-events-none"
              style={{ background: "linear-gradient(to left, rgba(0,0,0,0.18) 0%, transparent 100%)" }} />
          </div>

          {/* ════ RIGHT: Form ════ */}
          <div className="form-in flex-1 flex items-center justify-center px-8 py-10 lg:px-12 lg:py-12 bg-white">
            <div className="w-full max-w-sm">

              {/* Heading row */}
              <div className="f1 flex items-start justify-between mb-7">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6bfe9c]/15 border border-[#6bfe9c]/25 text-[#006d37] text-[10px] font-bold uppercase tracking-widest mb-3">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-[#6bfe9c] opacity-75 animate-ping" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#006d37]" />
                    </span>
                    Iniciar sesión
                  </div>
                  <h2 className="font-headline text-2xl font-extrabold text-[#191c1e] tracking-tight leading-tight">
                    Bienvenido de
                    <br />
                    <span className="bg-gradient-to-r from-[#00386c] to-[#1a4f8b] bg-clip-text text-transparent">vuelta.</span>
                  </h2>
                  <p className="text-[#737781] text-xs mt-1">Ingresa tus credenciales para continuar.</p>
                </div>
                <Link href="/" className="flex items-center gap-1 text-[#737781] hover:text-[#00386c] text-xs font-semibold transition-colors group ml-4 flex-shrink-0 mt-1">
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> Inicio
                </Link>
              </div>

              {/* Mobile brand */}
              <div className="lg:hidden f1 flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-[#00386c] to-[#1a4f8b] rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-black text-[10px]">TB</span>
                </div>
                <span className="text-base font-extrabold font-headline text-[#00386c] tracking-tight">TalentBridge</span>
              </div>

              <div className="space-y-4">

                {/* Email */}
                <div className="f2 space-y-1.5">
                  <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-widest text-[#424750]">
                    Correo electrónico
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c2c6d1] group-focus-within:text-[#00386c] transition-colors" />
                    <input id="email" type="email"
                      value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="nombre@universidad.edu"
                      className="w-full bg-[#f7f9fb] border border-[#e6e8ea] rounded-xl py-3 pl-10 pr-4 focus:border-[#00386c] focus:bg-white focus:ring-3 focus:ring-[#00386c]/8 transition-all text-sm text-[#191c1e] placeholder:text-[#c2c6d1] outline-none"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="f3 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-widest text-[#424750]">
                      Contraseña
                    </label>
                    <Link href="/auth/forgot-password"
                      className="text-[10px] font-bold text-[#00386c] hover:text-[#006d37] transition-colors">
                      ¿Olvidaste?
                    </Link>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c2c6d1] group-focus-within:text-[#00386c] transition-colors" />
                    <input id="password"
                      value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                      onKeyDown={e => e.key === "Enter" && handleLogin()}
                      type={showPassword ? "text" : "password"} placeholder="••••••••••••"
                      className="w-full bg-[#f7f9fb] border border-[#e6e8ea] rounded-xl py-3 pl-10 pr-11 focus:border-[#00386c] focus:bg-white focus:ring-3 focus:ring-[#00386c]/8 transition-all text-sm text-[#191c1e] placeholder:text-[#c2c6d1] outline-none"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c2c6d1] hover:text-[#424750] transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember */}
                <div className="f4 flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer group select-none">
                    <input type="checkbox"
                      className="w-4 h-4 rounded border-[#c2c6d1] text-[#006d37] focus:ring-[#006d37]/20 cursor-pointer" />
                    <span className="text-xs font-semibold text-[#424750] group-hover:text-[#191c1e] transition-colors">
                      Mantener sesión iniciada
                    </span>
                  </label>
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-[#ffdad6] text-[#93000a] text-xs font-semibold px-4 py-3 rounded-xl flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] mt-1 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button type="button" onClick={handleLogin} disabled={isLoading}
                  className="f5 group relative w-full bg-gradient-to-br from-[#00386c] to-[#1a4f8b] text-white font-bold py-3.5 rounded-xl shadow-xl shadow-[#00386c]/15 hover:shadow-[#00386c]/25 hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 text-sm uppercase tracking-wider overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  {isLoading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span className="relative">Ingresando...</span></>
                  ) : (
                    <><span className="relative">Iniciar sesión</span><ArrowRight className="relative w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>

                {/* Divider */}
                <div className="f5 flex items-center gap-3">
                  <div className="flex-1 h-px bg-[#e6e8ea]" />
                  <span className="text-[10px] font-bold text-[#c2c6d1] uppercase tracking-widest">o</span>
                  <div className="flex-1 h-px bg-[#e6e8ea]" />
                </div>

                {/* Register CTA */}
                <Link href="/auth/register"
                  className="f6 group flex items-center justify-center gap-2 w-full bg-white border-2 border-[#e6e8ea] hover:border-[#00386c]/25 text-[#191c1e] hover:text-[#00386c] font-bold py-3 rounded-xl transition-all text-sm">
                  ¿Nuevo en TalentBridge?
                  <span className="text-[#00386c] font-black group-hover:underline underline-offset-4">Crea una cuenta</span>
                </Link>

                {/* Trust badges */}
                <div className="f6 flex items-center justify-center gap-4 text-[10px] text-[#c2c6d1] font-semibold pt-1">
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}