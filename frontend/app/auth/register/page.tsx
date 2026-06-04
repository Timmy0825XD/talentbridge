"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Eye, EyeOff, ArrowRight, ArrowLeft, Mail, Lock,
  Sparkles, CheckCircle2, GraduationCap, Briefcase, Building2,
  BookOpen, Zap, Star, Users,
} from "lucide-react";
import api from "@/src/lib/api";
import { publicLinks } from "@/src/content/site-links";

type Role = "STUDENT" | "GRADUATE" | "COMPANY";

const roleData: Record<Role, {
  label: string; icon: React.ReactNode;
  headline: string; sub: string;
  color: string; accent: string;
  image: string; features: { icon: React.ReactNode; text: string }[];
}> = {
  STUDENT: {
    label: "Estudiante", icon: <GraduationCap className="w-4 h-4" />,
    headline: "Construye tu carrera desde hoy.",
    sub: "Conectamos tu talento universitario con las mejores empresas del Cesar.",
    color: "#00386c", accent: "#6bfe9c",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCm0KssseYAu7hq7n7XjhoLVJ7aqTxO87CKz3M7NwcawdXxR9Jsbpwx1IQWFocD6yXz8dHDFMWWzozefSOivq0Om8pO602d0M7Jl1ad2SApfZzrCBDqsCFQdskgftczLdAkAdWUZBjc2n0_F68oUBjioRlGhJPUeONqAnwgxHiVApPavLnU28cZV_izYIngHUDTzOKgF_1S-7XKZhQzCh4J4IfjprfGc5ufejvOgYBxIkmGZPfnHhs-gGZY0Hf3GgaRVvbkdVJIVRg",
    features: [
      { icon: <Zap className="w-3.5 h-3.5" />, text: "CV inteligente con IA" },
      { icon: <Star className="w-3.5 h-3.5" />, text: "Score de empleabilidad" },
      { icon: <CheckCircle2 className="w-3.5 h-3.5" />, text: "Postulaciones ilimitadas" },
    ],
  },
  GRADUATE: {
    label: "Egresado", icon: <BookOpen className="w-4 h-4" />,
    headline: "Tu experiencia, tu ventaja.",
    sub: "Pon en valor tu formación y conecta con proyectos que impulsen tu carrera.",
    color: "#006d37", accent: "#6bfe9c",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB19Om-BmL5-xFQN4R9QpvUZ2FobW9vKRLOiVZnP7Xa8rq-nvDDNF_PTajbvarzZ0C06FuU-djWC3OhnuxyKQ9OA1PsGh04pGan0etbx0-0l38SNOhkzQNc_omp7eCByOMEa6I_zA0natby4UwNx3dW0Hj7Vo8_PUpvpqe838fxTa8enDAEPofDlr7DCPDTvhxecxfWX17DjXWO_H4aIHPVHHsCr_ByKa0vlo7HIjo_PlGqLwDJL3wjKNOTqYupYsllx2h2Y6ulYTE",
    features: [
      { icon: <Briefcase className="w-3.5 h-3.5" />, text: "Matching con empresas" },
      { icon: <Star className="w-3.5 h-3.5" />, text: "Reputación verificada" },
      { icon: <CheckCircle2 className="w-3.5 h-3.5" />, text: "Contratos digitales" },
    ],
  },
  COMPANY: {
    label: "Empresa", icon: <Building2 className="w-4 h-4" />,
    headline: "El talento del Cesar, a tu alcance.",
    sub: "Accede a perfiles verificados y contrata con confianza y agilidad.",
    color: "#0c4783", accent: "#6bfe9c",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuARYqry3UXMOqQL4FPCnb5F7GoikFBuwHAsCYnBBDD8cX7ptfCWhv6PfEwAmHX774ugTeyazihApWnjl4ujWxRhejY550f7gZS709HvRAZdfL9-IAhBTdNMmQ1JADR5ISwKLfAi6mfGFABLx9erzXjWV6v8M1rBPuBHOZ_IdInbNZK_qDV0TKpcJ21rOM4holjgAkbT_huP-9D4F2RsDNZvgf1mfGso266CvkYvIfWjGwOYD87IozevEnS_5mNJFXEroWAfw5NSESk",
    features: [
      { icon: <Users className="w-3.5 h-3.5" />, text: "Talento local verificado" },
      { icon: <Zap className="w-3.5 h-3.5" />, text: "Matching inteligente" },
      { icon: <Star className="w-3.5 h-3.5" />, text: "Simulador tributario" },
    ],
  },
};

// Pre-render all three panels; we crossfade between them instead of swapping
const ALL_ROLES: Role[] = ["STUDENT", "GRADUATE", "COMPANY"];

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw)           return { score: 0, label: "",          color: "#e0e3e5" };
  if (pw.length < 8) return { score: 1, label: "Muy débil", color: "#ba1a1a" };
  let s = 1;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s >= 5) return { score: 4, label: "Excelente", color: "#006d37" };
  if (s >= 4) return { score: 3, label: "Buena",     color: "#00386c" };
  if (s >= 3) return { score: 2, label: "Aceptable", color: "#C9A84C" };
  return { score: 1, label: "Débil", color: "#ba1a1a" };
}

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole]           = useState<Role>("STUDENT");
  const [showPassword, setShowPw] = useState(false);
  const [showConfirm, setShowConf]= useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [form, setForm]           = useState({ email: "", password: "", confirm: "", terms: false });
  const [mouse, setMouse]         = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 18,
        y: (e.clientY / window.innerHeight - 0.5) * 18,
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  async function handleRegister() {
    setError(null);
    if (!form.email || !form.password || !form.confirm) { setError("Completa todos los campos."); return; }
    if (form.password !== form.confirm) { setError("Las contraseñas no coinciden."); return; }
    if (form.password.length < 8) { setError("Mínimo 8 caracteres."); return; }
    if (!form.terms) { setError("Acepta los términos y condiciones."); return; }
    setIsLoading(true);
    try {
      const res = await api.post("/auth/register", { email: form.email, password: form.password, role });
      router.push(`/auth/verify-otp?userId=${res.data.userId}`);
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number; data?: { error?: string } } };
      const msg = ax.response?.data?.error ?? "Error al registrarse.";
      setError(ax.response?.status === 409 || msg.toLowerCase().includes("registrado")
        ? "Este correo ya tiene una cuenta. Inicia sesión."
        : msg);
    } finally { setIsLoading(false); }
  }

  const current  = roleData[role];
  const strength = passwordStrength(form.password);

  // Subtle parallax tilt (desktop only, on the active panel)
  const tiltStyle = {
    transform: `perspective(1200px) rotateY(${mouse.x * 0.04}deg) rotateX(${-mouse.y * 0.03}deg)`,
    transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
  };

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
        /* Panel content fade in after crossfade settles */
        @keyframes panel-content-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .card-in  { animation: slide-card-in 0.8s cubic-bezier(0.16,1,0.3,1) both; }
        .form-in  { animation: form-in 0.7s 0.1s cubic-bezier(0.16,1,0.3,1) both; }
        .f1 { animation: field-in 0.5s 0.10s cubic-bezier(0.16,1,0.3,1) both; }
        .f2 { animation: field-in 0.5s 0.18s cubic-bezier(0.16,1,0.3,1) both; }
        .f3 { animation: field-in 0.5s 0.26s cubic-bezier(0.16,1,0.3,1) both; }
        .f4 { animation: field-in 0.5s 0.34s cubic-bezier(0.16,1,0.3,1) both; }
        .f5 { animation: field-in 0.5s 0.42s cubic-bezier(0.16,1,0.3,1) both; }
        .f6 { animation: field-in 0.5s 0.50s cubic-bezier(0.16,1,0.3,1) both; }
        .f7 { animation: field-in 0.5s 0.58s cubic-bezier(0.16,1,0.3,1) both; }
        .bg-orb-1 { animation: bg-orb-1 18s ease-in-out infinite; }
        .bg-orb-2 { animation: bg-orb-2 24s ease-in-out infinite; }
        .bg-orb-3 { animation: bg-orb-3 14s ease-in-out infinite; }
        .bg-dots {
          background-image: radial-gradient(circle, rgba(0,56,108,0.13) 1px, transparent 1px);
          background-size: 28px 28px;
          animation: bg-dots-drift 8s linear infinite;
        }

        /* ─── Crossfade panel layers ─── */
        /*
          Each role has its own absolutely-positioned layer inside the panel.
          Inactive layers have opacity:0 and pointer-events:none so only the
          active one is visible/interactive. The transition is pure CSS so it
          starts immediately with zero JS delay.
        */
        .panel-layer {
          position: absolute;
          inset: 0;
          transition: opacity 0.55s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: opacity;
        }
        .panel-layer.active  { opacity: 1;  pointer-events: auto; }
        .panel-layer.inactive{ opacity: 0;  pointer-events: none; }

        /* Content inside each layer fades up when it becomes active */
        .panel-layer.active .panel-content {
          animation: panel-content-in 0.5s 0.15s cubic-bezier(0.16,1,0.3,1) both;
        }
        .panel-layer.inactive .panel-content {
          animation: none;
        }

        /* ─── Mobile layout ─── */
        /*
          On mobile: form is on top, image panel is below (decorative strip).
          We achieve this with flex-col-reverse on the card wrapper.
        */
        @media (max-width: 1023px) {
          .card-wrapper {
            flex-direction: column-reverse !important;
          }
          .image-panel {
            min-height: 220px !important;
            max-height: 260px !important;
            /* On mobile the panel needs an explicit height since it's not flex-filling */
            height: 240px;
          }
          /* On mobile hide the verbose copy, show only brand + badge + stat */
          .image-panel .panel-middle { display: none; }
          .image-panel .panel-bottom { margin-top: auto; }
        }
      `}</style>

      <div
        className="min-h-screen flex items-center justify-center p-4 md:p-6 lg:p-10 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #e8edf3 0%, #dde4ed 40%, #e4eae8 100%)" }}
      >
        {/* Animated dot grid */}
        <div className="bg-dots absolute inset-0 pointer-events-none" />

        {/* Background orbs */}
        <div className="bg-orb-1 absolute pointer-events-none" style={{
          top: "-10%", left: "-8%", width: "520px", height: "520px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,56,108,0.14) 0%, transparent 70%)",
          filter: "blur(40px)",
        }} />
        <div className="bg-orb-2 absolute pointer-events-none" style={{
          bottom: "-12%", right: "-6%", width: "480px", height: "480px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(74,225,131,0.13) 0%, transparent 70%)",
          filter: "blur(48px)",
        }} />
        <div className="bg-orb-3 absolute pointer-events-none" style={{
          top: "30%", right: "12%", width: "280px", height: "280px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,56,108,0.08) 0%, transparent 70%)",
          filter: "blur(32px)",
        }} />
        <div className="absolute pointer-events-none" style={{
          top: "55%", left: "8%", width: "200px", height: "200px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(107,254,156,0.09) 0%, transparent 70%)",
          filter: "blur(28px)",
          animation: "bg-orb-1 20s 3s ease-in-out infinite",
        }} />

        {/* Watermark */}
        <div
          className="absolute bottom-[-4%] right-[-2%] pointer-events-none select-none"
          style={{
            fontSize: "clamp(80px, 12vw, 180px)",
            fontWeight: 900, fontFamily: "var(--font-headline, sans-serif)",
            color: "transparent",
            WebkitTextStroke: "1.5px rgba(0,56,108,0.07)",
            lineHeight: 1, letterSpacing: "-0.02em",
            userSelect: "none",
          }}
        >
          TalentBridge
        </div>

        {/* ── Main card ── */}
        <div
          className="card-in card-wrapper w-full max-w-5xl bg-white rounded-3xl shadow-2xl shadow-black/10 overflow-hidden flex relative z-10"
          style={{ flexDirection: "row" }}
        >

          {/* ════ LEFT: Crossfading image panel ════ */}
          <div
            className="image-panel relative lg:w-[44%] flex-shrink-0 overflow-hidden"
            style={{ minHeight: 500 }}
          >
            {/* Subtle parallax wrapper — only moves on desktop via mouse */}
            <div className="absolute inset-0 hidden lg:block" style={tiltStyle}>
              {/* All three layers live here; only the active one is visible */}
              {ALL_ROLES.map((r) => {
                const d = roleData[r];
                const isActive = r === role;
                return (
                  <div
                    key={r}
                    className={`panel-layer ${isActive ? "active" : "inactive"}`}
                    style={{ background: d.color }}
                  >
                    {/* Photo */}
                    <div className="absolute inset-0">
                      <Image
                        src={d.image} alt={d.label} fill
                        className="object-cover"
                        style={{ opacity: 0.35 }}
                        unoptimized
                      />
                    </div>
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute inset-0" style={{
                      background: `linear-gradient(135deg, ${d.color}dd 0%, ${d.color}88 50%, transparent 100%)`
                    }} />

                    {/* Panel content */}
                    <div className="panel-content absolute inset-0 flex flex-col justify-between p-10">
                      {/* Brand */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/15 backdrop-blur-md border border-white/25 rounded-xl flex items-center justify-center">
                          <span className="text-white font-black text-xs">TB</span>
                        </div>
                        <span className="text-white font-extrabold text-lg tracking-tight">TalentBridge</span>
                      </div>

                      {/* Middle copy */}
                      <div className="panel-middle space-y-4">
                        <div
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border"
                          style={{ background: `${d.accent}20`, borderColor: `${d.accent}40`, color: d.accent }}
                        >
                          <Sparkles className="w-3 h-3" /> {d.label}
                        </div>
                        <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-[1.1] tracking-tight">
                          {d.headline}
                        </h2>
                        <p className="text-white/70 text-sm leading-relaxed max-w-xs">{d.sub}</p>
                        <div className="space-y-2.5 pt-1">
                          {d.features.map(({ icon, text }) => (
                            <div key={text} className="flex items-center gap-3">
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ background: `${d.accent}20`, color: d.accent }}
                              >
                                {icon}
                              </div>
                              <span className="text-white/85 text-xs font-semibold">{text}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bottom stat card */}
                      <div className="panel-bottom bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-xl">
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-2 flex-shrink-0">
                            {["#6bfe9c","#a6c8ff","#C9A84C","#4ae183"].map((c, i) => (
                              <div
                                key={i}
                                className="w-7 h-7 rounded-full border-2 border-white/20 flex items-center justify-center text-[8px] font-black"
                                style={{ background: c, color: "#00210c", zIndex: 4 - i }}
                              >
                                {["EG","AN","MA","LP"][i]}
                              </div>
                            ))}
                          </div>
                          <div>
                            <p className="text-white text-xs font-bold">500+ candidatos activos</p>
                            <div className="flex gap-0.5 mt-0.5">
                              {[1,2,3,4,5].map(i => (
                                <Star key={i} className="w-2.5 h-2.5 fill-[#C9A84C] text-[#C9A84C]" />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile version: simple crossfading background (no parallax) */}
            <div className="absolute inset-0 lg:hidden">
              {ALL_ROLES.map((r) => {
                const d = roleData[r];
                const isActive = r === role;
                return (
                  <div
                    key={r}
                    className={`panel-layer ${isActive ? "active" : "inactive"}`}
                    style={{ background: d.color }}
                  >
                    <div className="absolute inset-0">
                      <Image
                        src={d.image} alt={d.label} fill
                        className="object-cover"
                        style={{ opacity: 0.3 }}
                        unoptimized
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute inset-0" style={{
                      background: `linear-gradient(135deg, ${d.color}cc 0%, ${d.color}66 60%, transparent 100%)`
                    }} />
                    {/* Mobile: brand top-left + stat bottom */}
                    <div className="absolute inset-0 flex flex-col justify-between p-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/15 backdrop-blur-md border border-white/25 rounded-xl flex items-center justify-center">
                          <span className="text-white font-black text-[10px]">TB</span>
                        </div>
                        <span className="text-white font-extrabold text-base tracking-tight">TalentBridge</span>
                      </div>
                      {/* Mobile: role tag + headline */}
                      <div className="space-y-2">
                        <div
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border"
                          style={{ background: `${d.accent}20`, borderColor: `${d.accent}40`, color: d.accent }}
                        >
                          <Sparkles className="w-2.5 h-2.5" /> {d.label}
                        </div>
                        <p className="text-white font-extrabold text-xl leading-tight">{d.headline}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Page edge shadow (book spine) */}
            <div
              className="absolute right-0 top-0 bottom-0 w-6 pointer-events-none hidden lg:block"
              style={{ background: "linear-gradient(to left, rgba(0,0,0,0.18) 0%, transparent 100%)" }}
            />
          </div>

          {/* ════ RIGHT: Form ════ */}
          <div className="form-in flex-1 flex items-center justify-center px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12 bg-white">
            <div className="w-full max-w-sm">

              {/* Back + heading */}
              <div className="f1 flex items-center justify-between mb-7">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6bfe9c]/15 border border-[#6bfe9c]/25 text-[#006d37] text-[10px] font-bold uppercase tracking-widest mb-3">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-[#6bfe9c] opacity-75 animate-ping" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#006d37]" />
                    </span>
                    Registro gratuito
                  </div>
                  <h3 className="font-headline text-2xl font-extrabold text-[#191c1e] leading-tight tracking-tight">
                    Crea tu cuenta
                  </h3>
                  <p className="text-[#737781] text-xs mt-1">Elige tu rol y completa los datos.</p>
                </div>
                <Link
                  href="/"
                  className="flex items-center gap-1 text-[#737781] hover:text-[#00386c] text-xs font-semibold transition-colors group ml-4 flex-shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> Inicio
                </Link>
              </div>

              {/* Role pills */}
              <div className="f2 bg-[#f2f4f6] p-1 rounded-full flex mb-5">
                {(["STUDENT","GRADUATE","COMPANY"] as Role[]).map(r => {
                  const active = role === r;
                  const d = roleData[r];
                  return (
                    <button
                      key={r} type="button" onClick={() => setRole(r)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-full text-xs font-bold transition-all duration-300 ${
                        active
                          ? "bg-white shadow-md text-[#191c1e] scale-[1.02]"
                          : "text-[#737781] hover:text-[#424750]"
                      }`}
                    >
                      <span className={active ? "text-[#00386c]" : "opacity-60"}>{d.icon}</span>
                      {d.label}
                    </button>
                  );
                })}
              </div>

              {/* Fields */}
              <div className="space-y-4">

                <div className="f3 space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#424750]">
                    {role === "COMPANY" ? "Correo corporativo" : "Correo electrónico"}
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c2c6d1] group-focus-within:text-[#00386c] transition-colors" />
                    <input
                      type="email"
                      placeholder={role === "COMPANY" ? "contacto@empresa.com" : "nombre@universidad.edu"}
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-[#f7f9fb] border border-[#e6e8ea] rounded-xl py-3 pl-10 pr-4 focus:border-[#00386c] focus:bg-white focus:ring-3 focus:ring-[#00386c]/8 transition-all text-sm text-[#191c1e] placeholder:text-[#c2c6d1] outline-none"
                    />
                  </div>
                </div>

                <div className="f4 space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#424750]">Contraseña</label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c2c6d1] group-focus-within:text-[#00386c] transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 8 caracteres"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      className="w-full bg-[#f7f9fb] border border-[#e6e8ea] rounded-xl py-3 pl-10 pr-11 focus:border-[#00386c] focus:bg-white focus:ring-3 focus:ring-[#00386c]/8 transition-all text-sm text-[#191c1e] placeholder:text-[#c2c6d1] outline-none"
                    />
                    <button
                      type="button" onClick={() => setShowPw(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c2c6d1] hover:text-[#424750] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {form.password && (
                    <div className="pt-0.5">
                      <div className="flex gap-1 mb-1">
                        {[1,2,3,4].map(i => (
                          <div
                            key={i} className="flex-1 h-1 rounded-full transition-all duration-500"
                            style={{ background: i <= strength.score ? strength.color : "#e6e8ea" }}
                          />
                        ))}
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: strength.color }}>
                        {strength.label}
                      </p>
                    </div>
                  )}
                </div>

                <div className="f5 space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#424750]">Confirmar contraseña</label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c2c6d1] group-focus-within:text-[#00386c] transition-colors" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Repite tu contraseña"
                      value={form.confirm}
                      onChange={e => setForm({ ...form, confirm: e.target.value })}
                      onKeyDown={e => e.key === "Enter" && handleRegister()}
                      className="w-full bg-[#f7f9fb] border border-[#e6e8ea] rounded-xl py-3 pl-10 pr-11 focus:border-[#00386c] focus:bg-white focus:ring-3 focus:ring-[#00386c]/8 transition-all text-sm text-[#191c1e] placeholder:text-[#c2c6d1] outline-none"
                    />
                    <button
                      type="button" onClick={() => setShowConf(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c2c6d1] hover:text-[#424750] transition-colors"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {form.confirm && form.password === form.confirm && (
                    <p className="text-[10px] font-bold text-[#006d37] flex items-center gap-1 pt-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Contraseñas coinciden
                    </p>
                  )}
                </div>

                <div className="f6 flex items-start gap-2.5">
                  <input
                    id="terms" type="checkbox" checked={form.terms}
                    onChange={e => setForm({ ...form, terms: e.target.checked })}
                    className="w-4 h-4 mt-0.5 rounded border-[#c2c6d1] text-[#006d37] focus:ring-[#006d37]/20 flex-shrink-0 cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-[11px] text-[#424750] leading-relaxed cursor-pointer select-none">
                    Acepto los{" "}
                    <Link href={publicLinks.terms} className="text-[#00386c] font-bold hover:underline underline-offset-4">Términos</Link>
                    {" "}y la{" "}
                    <Link href={publicLinks.privacy} className="text-[#00386c] font-bold hover:underline underline-offset-4">Privacidad</Link>
                  </label>
                </div>

                {error && (
                  <div className="bg-[#ffdad6] text-[#93000a] text-xs font-semibold px-4 py-3 rounded-xl flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] mt-1 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="button" onClick={handleRegister} disabled={isLoading}
                  className="f7 group relative w-full font-bold py-3.5 rounded-xl text-white text-sm uppercase tracking-wider overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.98]"
                  style={{
                    background: `linear-gradient(135deg, ${current.color} 0%, ${current.color}cc 100%)`,
                    boxShadow: `0 8px 30px ${current.color}30`,
                  }}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="relative">Creando...</span>
                    </>
                  ) : (
                    <>
                      <span className="relative">Crear cuenta gratis</span>
                      <ArrowRight className="relative w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-[#737781] pt-1">
                  ¿Ya tienes cuenta?{" "}
                  <Link href="/auth/login" className="text-[#00386c] font-bold hover:underline underline-offset-4">
                    Inicia sesión
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}