"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import {
  Sparkles, GraduationCap, CheckCheck, ChartBarBig,
  ChartSpline, Handshake, Workflow, Landmark, ArrowRight,
  Star, Zap, Shield, TrendingUp, Users, Building2,
  MapPin, Clock, Briefcase, Play, ChevronDown,
} from "lucide-react";
import { publicLinks } from "@/src/content/site-links";

// ─── Animated counter ────────────────────────────────────────────────────────
function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const duration = 1800;
        const step = (t: number) => {
          if (!start) start = t;
          const p = Math.min((t - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setCount(Math.floor(eased * end));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── Reveal on scroll ────────────────────────────────────────────────────────
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setVisible(true);
    }, { threshold: 0.15 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.8s ${delay}s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s ${delay}s cubic-bezier(0.16, 1, 0.3, 1)`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Glass card ─────────────────────────────────────────────────────────────
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl shadow-xl shadow-[#00386c]/5 ${className}`}>
      {children}
    </div>
  );
}

export default function Home() {
  // Mouse parallax effect for hero
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMouseOffset({ x, y });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <>
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50%       { transform: translateY(-12px) rotate(1deg); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
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
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(40px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(40px) rotate(-360deg); }
        }
        @keyframes grid-pan {
          0%   { background-position: 0% 0%; }
          100% { background-position: 40px 40px; }
        }
        @keyframes blob {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50%      { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
        }
        .animate-slide-up    { animation: slide-up 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .animate-slide-up-d1 { animation: slide-up 0.9s 0.1s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .animate-slide-up-d2 { animation: slide-up 0.9s 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .animate-slide-up-d3 { animation: slide-up 0.9s 0.34s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .animate-slide-up-d4 { animation: slide-up 0.9s 0.46s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .animate-fade-in     { animation: fade-in 1.2s ease forwards; opacity: 0; }
        .shimmer-text {
          background: linear-gradient(90deg, #006d37 0%, #00743a 30%, #6bfe9c 50%, #00743a 70%, #006d37 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .grid-pattern {
          background-image: linear-gradient(rgba(0,56,108,0.06) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,56,108,0.06) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: grid-pan 60s linear infinite;
        }
        .gradient-text-primary {
          background: linear-gradient(135deg, #00386c 0%, #1a4f8b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .marquee {
          display: flex;
          width: 200%;
          animation: marquee 30s linear infinite;
        }
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .blob {
          animation: blob 12s ease-in-out infinite;
        }
      `}</style>

      <div className="bg-[#f7f9fb] text-[#191c1e] overflow-x-hidden">

        {/* ═══════ HERO ═══════ */}
        <section className="relative min-h-[calc(100vh-72px)] flex items-center overflow-hidden">

          {/* Background layers */}
          <div className="absolute inset-0 grid-pattern opacity-60" />

          {/* Animated blobs */}
          <div
            className="absolute top-[10%] right-[5%] w-[400px] h-[400px] bg-gradient-to-br from-[#00386c]/15 to-[#1a4f8b]/5 blob blur-3xl pointer-events-none"
            style={{ transform: `translate(${mouseOffset.x}px, ${mouseOffset.y}px)`, transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}
          />
          <div
            className="absolute bottom-[5%] left-[8%] w-[350px] h-[350px] bg-gradient-to-tr from-[#6bfe9c]/20 to-transparent blob blur-3xl pointer-events-none"
            style={{ transform: `translate(${-mouseOffset.x}px, ${-mouseOffset.y}px)`, transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}
          />

          <div className="relative z-10 max-w-screen-2xl mx-auto px-6 lg:px-10 py-16 lg:py-24 w-full">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">

              {/* ── Left: copy ── */}
              <div className="lg:col-span-7 space-y-7">

                <div className="animate-slide-up">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-white/60 shadow-sm text-xs font-bold text-[#006d37]">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-[#6bfe9c] opacity-75 animate-ping" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#006d37]" />
                    </span>
                    Plataforma activa en el Cesar
                    <span className="text-[#737781] font-medium">·</span>
                    <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
                  </div>
                </div>

                <div className="animate-slide-up-d1">
                  <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight font-headline leading-[1.02]">
                    <span className="block text-[#191c1e]">El talento del</span>
                    <span className="block gradient-text-primary">Cesar conectado</span>
                    <span className="block">
                      <span className="shimmer-text">con su futuro.</span>
                    </span>
                  </h1>
                </div>

                <div className="animate-slide-up-d2">
                  <p className="text-lg lg:text-xl text-[#424750] leading-relaxed max-w-xl">
                    La plataforma inteligente que une <strong className="text-[#00386c]">estudiantes, egresados y empresas</strong> con
                    proyectos reales, microtrabajos y contrataciones formales.
                  </p>
                </div>

                <div className="animate-slide-up-d3 flex flex-wrap gap-3 pt-2">
                  <Link
                    href={publicLinks.register}
                    className="group relative flex items-center gap-2 bg-gradient-to-br from-[#00386c] to-[#1a4f8b] text-white rounded-full px-7 py-3.5 font-bold text-sm uppercase tracking-wider overflow-hidden shadow-xl shadow-[#00386c]/25 hover:shadow-[#00386c]/40 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <span className="relative">Empezar gratis</span>
                    <ArrowRight className="relative w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="#como-funciona"
                    className="group flex items-center gap-2 bg-white/70 backdrop-blur-md text-[#00386c] border border-white/60 rounded-full px-6 py-3.5 font-bold text-sm hover:bg-white hover:border-[#00386c]/30 hover:shadow-md transition-all"
                  >
                    <span className="w-7 h-7 rounded-full bg-[#00386c] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                    </span>
                    Ver cómo funciona
                  </Link>
                </div>

                {/* Social proof bar */}
                <div className="animate-slide-up-d4 flex items-center gap-5 pt-6">
                  <div className="flex -space-x-2">
                    {[
                      { c: "#00386c", t: "EG" }, { c: "#006d37", t: "AN" },
                      { c: "#1a4f8b", t: "MA" }, { c: "#00743a", t: "LP" },
                    ].map((a, i) => (
                      <div key={i}
                        className="w-9 h-9 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-black"
                        style={{ background: a.c, zIndex: 4 - i }}>
                        {a.t}
                      </div>
                    ))}
                    <div className="w-9 h-9 rounded-full border-2 border-white bg-white shadow-md flex items-center justify-center text-[#00386c] text-[10px] font-black">
                      +496
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-0.5">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-[#C9A84C] text-[#C9A84C]" />)}
                      <span className="text-xs font-bold text-[#191c1e] ml-1">4.9</span>
                    </div>
                    <p className="text-xs text-[#737781]">
                      <span className="font-bold text-[#191c1e]">500+</span> candidatos confían en nosotros
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Right: visual showcase ── */}
              <div className="lg:col-span-5 animate-fade-in lg:pl-4">
                <div className="relative">

                  {/* Main image card */}
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-[#00386c]/20 ring-1 ring-[#00386c]/10">
                    <div className="aspect-[4/5] relative">
                      <Image
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCm0KssseYAu7hq7n7XjhoLVJ7aqTxO87CKz3M7NwcawdXxR9Jsbpwx1IQWFocD6yXz8dHDFMWWzozefSOivq0Om8pO602d0M7Jl1ad2SApfZzrCBDqsCFQdskgftczLdAkAdWUZBjc2n0_F68oUBjioRlGhJPUeONqAnwgxHiVApPavLnU28cZV_izYIngHUDTzOKgF_1S-7XKZhQzCh4J4IfjprfGc5ufejvOgYBxIkmGZPfnHhs-gGZY0Hf3GgaRVvbkdVJIVRg"
                        alt="Talento universitario"
                        fill className="object-cover" unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#00386c]/40 via-transparent to-transparent" />
                    </div>

                    {/* Floating job match card (glass) */}
                    <div className="absolute top-5 left-5 right-5">
                      <GlassCard className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-gradient-to-br from-[#00386c] to-[#1a4f8b] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                            <span className="text-white font-black text-sm">M</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-[#191c1e] text-xs">Desarrollador Frontend</p>
                            <p className="text-[#737781] text-[10px] flex items-center gap-1 mt-0.5">
                              <Building2 className="w-2.5 h-2.5" /> Mediatek Tech
                              <span>·</span>
                              <MapPin className="w-2.5 h-2.5" /> Valledupar
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="bg-[#6bfe9c] text-[#005228] text-[10px] font-black px-2 py-0.5 rounded-full">92%</span>
                            <span className="text-[9px] font-bold text-[#737781] uppercase tracking-wider">match</span>
                          </div>
                        </div>
                      </GlassCard>
                    </div>

                    {/* Bottom IA active glass card */}
                    <div className="absolute bottom-5 left-5 right-5">
                      <GlassCard className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#6bfe9c] to-[#4ae183] flex items-center justify-center shadow-md">
                              <Zap className="w-5 h-5 text-[#005228]" />
                            </div>
                            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#006d37] rounded-full border-2 border-white animate-pulse" />
                          </div>
                          <div className="flex-1">
                            <p className="font-black text-[#191c1e] text-xs">IA Match activo</p>
                            <p className="text-[#737781] text-[10px]">3 nuevas oportunidades para ti</p>
                          </div>
                          <div className="flex gap-1">
                            {[0,1,2].map(i => (
                              <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#006d37]"
                                style={{ animation: "dot-pulse 1.4s ease-in-out infinite", animationDelay: `${i * 0.2}s` }} />
                            ))}
                          </div>
                        </div>
                      </GlassCard>
                    </div>
                  </div>

                  {/* Floating side card */}
                  <div className="absolute -right-4 lg:-right-8 top-1/3 hidden md:block" style={{ animation: "float-slow 6s ease-in-out infinite" }}>
                    <GlassCard className="p-4 w-44">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-[#006d37]" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#737781]">Tu progreso</span>
                      </div>
                      <p className="font-headline font-extrabold text-2xl text-[#191c1e] leading-none">+38%</p>
                      <p className="text-[10px] text-[#737781] mt-1">vs. último mes</p>
                      <div className="mt-2 flex items-end gap-0.5 h-6">
                        {[40,55,45,65,60,80,75].map((h, i) => (
                          <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: i === 6 ? "#006d37" : "#a6c8ff" }} />
                        ))}
                      </div>
                    </GlassCard>
                  </div>

                  {/* Stats badge */}
                  <div className="absolute -left-4 lg:-left-8 bottom-20 hidden md:block" style={{ animation: "float-fast 4s ease-in-out infinite" }}>
                    <GlassCard className="px-4 py-3 flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#C9A84C]/20 rounded-xl flex items-center justify-center">
                        <Star className="w-4 h-4 fill-[#C9A84C] text-[#C9A84C]" />
                      </div>
                      <div>
                        <p className="font-headline font-black text-base text-[#191c1e] leading-none">Top 5%</p>
                        <p className="text-[10px] text-[#737781] mt-0.5">Egresados Sistemas</p>
                      </div>
                    </GlassCard>
                  </div>
                </div>
              </div>
            </div>

            {/* Scroll indicator */}
            <div className="hidden lg:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-2 animate-bounce">
              <span className="text-[10px] font-bold text-[#737781] uppercase tracking-widest">Descubre más</span>
              <ChevronDown className="w-5 h-5 text-[#00386c]" />
            </div>
          </div>
        </section>

        {/* ═══════ STATS BAND ═══════ */}
        <section className="relative bg-[#191c1e] py-10 overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-[0.08]" />
          <div className="relative max-w-screen-2xl mx-auto px-6 lg:px-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-white/10">
              {[
                { end: 500, suffix: "+",  label: "Candidatos activos",     icon: <Users className="w-4 h-4" /> },
                { end: 92,  suffix: "%",  label: "Tasa de empleabilidad", icon: <TrendingUp className="w-4 h-4" /> },
                { end: 150, suffix: "+",  label: "Empresas aliadas",       icon: <Building2 className="w-4 h-4" /> },
                { end: 10,  suffix: "k+", label: "Contrataciones",         icon: <CheckCheck className="w-4 h-4" /> },
              ].map(({ end, suffix, label, icon }) => (
                <div key={label} className="flex items-center justify-center gap-4 lg:px-8">
                  <div className="w-11 h-11 rounded-2xl bg-[#6bfe9c]/10 border border-[#6bfe9c]/20 flex items-center justify-center text-[#6bfe9c] flex-shrink-0">
                    {icon}
                  </div>
                  <div>
                    <p className="text-2xl lg:text-3xl font-headline font-extrabold text-white leading-none">
                      <Counter end={end} suffix={suffix} />
                    </p>
                    <p className="text-white/60 text-[11px] font-medium mt-1">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ ECOSYSTEM ═══════ */}
        <section id="como-funciona" className="py-24 lg:py-32 px-6 lg:px-10 relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-20 right-0 w-96 h-96 bg-[#00386c]/[0.04] rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-screen-2xl mx-auto">

            <Reveal>
              <div className="text-center mb-16 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00386c]/5 border border-[#00386c]/10 text-[#00386c] text-xs font-bold uppercase tracking-wider">
                  <Shield className="w-3.5 h-3.5" /> Para todos en el ecosistema
                </div>
                <h2 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold font-headline tracking-tight leading-[1.05]">
                  <span className="text-[#191c1e]">Diseñado para </span>
                  <span className="gradient-text-primary">conectar</span>
                </h2>
                <p className="text-[#737781] text-lg max-w-xl mx-auto leading-relaxed">
                  Estudiantes, universidades y empresas en un solo ecosistema inteligente.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* CARD 1 — Estudiantes */}
              <Reveal delay={0}>
                <div className="group relative h-full bg-white rounded-3xl border border-[#e6e8ea] p-8 hover:border-[#00386c]/20 hover:shadow-2xl hover:shadow-[#00386c]/8 hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#00386c]/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />

                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#00386c] to-[#1a4f8b] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-[#00386c]/20 group-hover:rotate-6 transition-transform duration-300">
                      <GraduationCap className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#737781] mb-2">01 — Talento</p>
                    <h3 className="text-2xl font-headline font-extrabold text-[#191c1e] mb-3">Para Estudiantes</h3>
                    <p className="text-[#737781] text-sm mb-6 leading-relaxed">
                      Construye tu carrera con IA y conexiones reales desde la universidad.
                    </p>
                    <ul className="space-y-3 mb-8">
                      {[
                        { icon: <Zap />, text: "Constructor de CV con IA" },
                        { icon: <CheckCheck />, text: "Seguimiento de postulaciones" },
                        { icon: <ChartBarBig />, text: "Matching por habilidades" },
                      ].map(({ icon, text }) => (
                        <li key={text} className="flex items-center gap-3 text-sm text-[#424750]">
                          <span className="w-7 h-7 bg-[#6bfe9c]/20 rounded-lg flex items-center justify-center flex-shrink-0 text-[#006d37] [&>svg]:w-3.5 [&>svg]:h-3.5">{icon}</span>
                          {text}
                        </li>
                      ))}
                    </ul>
                    <Link href={publicLinks.register}
                      className="inline-flex items-center gap-2 text-[#00386c] font-bold text-sm group/btn">
                      Comenzar gratis
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </Reveal>

              {/* CARD 2 — Universidades (featured) */}
              <Reveal delay={0.1}>
                <div className="group relative h-full bg-gradient-to-br from-[#00386c] via-[#0c4783] to-[#1a4f8b] rounded-3xl p-8 hover:-translate-y-2 transition-all duration-500 overflow-hidden shadow-xl shadow-[#00386c]/25">
                  {/* Grid pattern overlay */}
                  <div className="absolute inset-0 opacity-[0.08] grid-pattern" />
                  {/* Orbs */}
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[#6bfe9c]/15 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-125 transition-transform duration-700" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />

                  <div className="relative">
                    <div className="inline-flex items-center gap-1.5 bg-[#6bfe9c]/20 backdrop-blur-sm border border-[#6bfe9c]/30 text-[#6bfe9c] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
                      <Star className="w-3 h-3 fill-[#6bfe9c]" /> Más popular
                    </div>
                    <div className="w-14 h-14 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform duration-300">
                      <Landmark className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#a6c8ff] mb-2">02 — Educación</p>
                    <h3 className="text-2xl font-headline font-extrabold text-white mb-3">Para Universidades</h3>
                    <p className="text-[#a6c8ff] text-sm mb-6 leading-relaxed">
                      Analíticas de empleabilidad y alianzas con la industria regional.
                    </p>
                    <ul className="space-y-3 mb-8">
                      {[
                        { icon: <ChartSpline />, text: "Analíticas de empleabilidad" },
                        { icon: <Handshake />, text: "Alianzas con la industria" },
                        { icon: <Workflow />, text: "Integración Career Hub" },
                      ].map(({ icon, text }) => (
                        <li key={text} className="flex items-center gap-3 text-sm text-white/85">
                          <span className="w-7 h-7 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5">{icon}</span>
                          {text}
                        </li>
                      ))}
                    </ul>
                    <Link href={publicLinks.universities}
                      className="inline-flex items-center gap-2 text-white font-bold text-sm group/btn">
                      Portal universitario
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </Reveal>

              {/* CARD 3 — Empresas */}
              <Reveal delay={0.2}>
                <div className="group relative h-full bg-white rounded-3xl border border-[#e6e8ea] p-8 hover:border-[#006d37]/20 hover:shadow-2xl hover:shadow-[#006d37]/8 hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#006d37]/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />

                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#006d37] to-[#00743a] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-[#006d37]/20 group-hover:rotate-6 transition-transform duration-300">
                      <Building2 className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#737781] mb-2">03 — Empresa</p>
                    <h3 className="text-2xl font-headline font-extrabold text-[#191c1e] mb-3">Para Empresas</h3>
                    <p className="text-[#737781] text-sm mb-6 leading-relaxed">
                      Talento universitario verificado del Cesar, listo para contratar.
                    </p>
                    <ul className="space-y-3 mb-8">
                      {[
                        { icon: <Users />,    text: "Perfiles verificados con IA" },
                        { icon: <MapPin />,   text: "Talento local del Cesar" },
                        { icon: <Clock />,    text: "Contratación ágil y segura" },
                      ].map(({ icon, text }) => (
                        <li key={text} className="flex items-center gap-3 text-sm text-[#424750]">
                          <span className="w-7 h-7 bg-[#006d37]/10 rounded-lg flex items-center justify-center flex-shrink-0 text-[#006d37] [&>svg]:w-3.5 [&>svg]:h-3.5">{icon}</span>
                          {text}
                        </li>
                      ))}
                    </ul>
                    <Link href={publicLinks.companies}
                      className="inline-flex items-center gap-2 text-[#006d37] font-bold text-sm group/btn">
                      Aliarse con nosotros
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

{/* ═══════ FEATURES + MOCKUP ═══════ */}
        <section className="py-20 lg:py-28 px-6 lg:px-10 bg-gradient-to-b from-[#f2f4f6] via-[#f7f9fb] to-[#f2f4f6] relative overflow-hidden">

          <div className="relative max-w-screen-2xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">

              {/* Left mockup */}
              <div className="lg:col-span-5">
                <Reveal>
                  <div className="relative">
                    <div className="relative bg-white rounded-3xl border border-[#e6e8ea] p-7 shadow-2xl shadow-[#00386c]/8">

                      {/* Top status bar */}
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <p className="text-[10px] font-bold text-[#737781] uppercase tracking-wider">Tu perfil</p>
                          <h4 className="font-headline font-extrabold text-[#191c1e] text-lg">Score de empleabilidad</h4>
                        </div>
                        <div className="flex items-center gap-1 bg-[#6bfe9c]/20 text-[#005228] px-2.5 py-1 rounded-full text-[11px] font-black">
                          <TrendingUp className="w-3 h-3" /> +12%
                        </div>
                      </div>

                      {/* Score ring + label */}
                      <div className="flex items-center gap-5 mb-5">
                        <div className="relative w-24 h-24 flex-shrink-0">
                          <svg width="96" height="96" className="-rotate-90" viewBox="0 0 96 96">
                            <circle cx="48" cy="48" r="42" fill="none" stroke="#e6e8ea" strokeWidth="6" />
                            <circle cx="48" cy="48" r="42" fill="none"
                              stroke="url(#scoreGrad)" strokeWidth="6" strokeLinecap="round"
                              strokeDasharray={`${2 * Math.PI * 42}`}
                              strokeDashoffset={`${2 * Math.PI * 42 * (1 - 0.84)}`} />
                            <defs>
                              <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0" stopColor="#006d37" />
                                <stop offset="1" stopColor="#6bfe9c" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black text-[#00386c]">84%</span>
                            <span className="text-[9px] font-bold text-[#006d37] uppercase tracking-tight">EXCELENTE</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-[#424750]">Skills técnicas</span>
                            <span className="text-xs font-black text-[#006d37]">92%</span>
                          </div>
                          <div className="w-full bg-[#f2f4f6] rounded-full h-1.5 mb-3 overflow-hidden">
                            <div className="bg-gradient-to-r from-[#006d37] to-[#6bfe9c] h-full rounded-full transition-all duration-1000" style={{ width: "92%" }} />
                          </div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-[#424750]">Experiencia</span>
                            <span className="text-xs font-black text-[#00386c]">76%</span>
                          </div>
                          <div className="w-full bg-[#f2f4f6] rounded-full h-1.5 mb-3 overflow-hidden">
                            <div className="bg-gradient-to-r from-[#00386c] to-[#1a4f8b] h-full rounded-full transition-all duration-1000" style={{ width: "76%" }} />
                          </div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-[#424750]">Educación</span>
                            <span className="text-xs font-black text-[#C9A84C]">88%</span>
                          </div>
                          <div className="w-full bg-[#f2f4f6] rounded-full h-1.5 overflow-hidden">
                            <div className="bg-gradient-to-r from-[#C9A84C] to-[#e0c97a] h-full rounded-full transition-all duration-1000" style={{ width: "88%" }} />
                          </div>
                        </div>
                      </div>

                      {/* Active applications */}
                      <div className="bg-[#f7f9fb] rounded-xl p-4 border border-[#e6e8ea]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-[#737781] uppercase tracking-wider">Postulaciones activas</span>
                          <span className="text-[10px] font-bold text-[#00386c]">12 totales</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 flex gap-1">
                            {[true, true, true, true, true, true, true, true, true, false, false, false].map((active, i) => (
                              <div key={i} className={`h-2 flex-1 rounded-sm ${active ? "bg-[#006d37]" : "bg-[#e0e3e5]"}`} />
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-[#006d37]">9 en revisión</span>
                        </div>
                      </div>
                    </div>

                    {/* Decorative orbs around mockup */}
                    <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#6bfe9c]/20 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-8 -right-4 w-32 h-32 bg-[#00386c]/10 rounded-full blur-3xl pointer-events-none" />
                  </div>
                </Reveal>
              </div>

              {/* Right copy */}
              <div className="lg:col-span-7">
                <Reveal delay={0.15}>
                  <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6bfe9c]/15 border border-[#6bfe9c]/30 text-[#006d37] text-xs font-bold uppercase tracking-wider">
                      <Zap className="w-3.5 h-3.5" /> Tecnología de matching
                    </div>

                    <h2 className="text-3xl lg:text-5xl font-extrabold font-headline tracking-tight leading-[1.05]">
                      <span className="text-[#191c1e]">Tu perfil. </span>
                      <span className="gradient-text-primary">Tu oportunidad. </span>
                      <span className="block mt-2">
                        <span className="shimmer-text">A escala.</span>
                      </span>
                    </h2>

                    <p className="text-[#424750] text-lg leading-relaxed max-w-xl">
                      Nuestros algoritmos de IA analizan tu perfil completo — skills, formación y proyectos — para conectarte con las oportunidades exactas que necesitas.
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      {[
                        { icon: <Zap />,        title: "IA Matching",        desc: "50+ señales analizadas en tiempo real" },
                        { icon: <Shield />,     title: "Verificados",         desc: "Validación académica e institucional" },
                        { icon: <ChartSpline />,title: "Analytics live",      desc: "Insights de empleabilidad en vivo" },
                        { icon: <Briefcase />,  title: "Contratos digitales", desc: "Pagos y entregables centralizados" },
                      ].map(({ icon, title, desc }) => (
                        <div key={title} className="bg-white rounded-2xl border border-[#e6e8ea] p-4 hover:border-[#00386c]/20 hover:shadow-md transition-all group">
                          <div className="w-9 h-9 bg-gradient-to-br from-[#00386c]/10 to-[#006d37]/10 rounded-xl flex items-center justify-center mb-2 text-[#00386c] [&>svg]:w-4 [&>svg]:h-4 group-hover:scale-110 transition-transform">
                            {icon}
                          </div>
                          <h4 className="font-headline font-bold text-[#191c1e] text-sm mb-1">{title}</h4>
                          <p className="text-[#737781] text-xs leading-snug">{desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ MARQUEE OF VALUES ═══════ */}
        <section className="py-12 border-y border-[#e6e8ea] bg-white overflow-hidden">
          <div className="marquee">
            {[...Array(2)].map((_, dup) => (
              <div key={dup} className="flex items-center gap-12 px-6 flex-shrink-0">
                {[
                  "Conectando talento",
                  "Empleabilidad real",
                  "IA + Educación",
                  "Cesar profesional",
                  "Match inteligente",
                  "Contratación ágil",
                  "Universidades aliadas",
                  "Talento verificado",
                ].map((w, i) => (
                  <span key={`${dup}-${i}`} className="flex items-center gap-12 text-2xl lg:text-4xl font-headline font-extrabold text-[#191c1e] tracking-tight whitespace-nowrap">
                    {w}
                    <span className="w-2 h-2 rounded-full bg-[#6bfe9c]" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ═══════ CTA FINAL ═══════ */}
        <section className="py-20 lg:py-28 px-6 lg:px-10">
          <div className="max-w-screen-2xl mx-auto">
            <Reveal>
              <div className="relative bg-gradient-to-br from-[#00386c] via-[#0c4783] to-[#191c1e] rounded-[2.5rem] lg:rounded-[3rem] overflow-hidden">
                {/* Patterns */}
                <div className="absolute inset-0 grid-pattern opacity-[0.08]" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#6bfe9c]/15 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#1a4f8b]/40 rounded-full translate-y-1/3 -translate-x-1/3 blur-3xl" />

                {/* Big watermark */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[200px] lg:text-[300px] font-black text-white opacity-[0.03] select-none leading-none pointer-events-none hidden lg:block">
                  TB
                </div>

                <div className="relative z-10 text-center text-white px-8 py-16 lg:py-24 max-w-3xl mx-auto space-y-8">
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-xs font-bold text-white/90 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[#6bfe9c]" /> Es 100% gratis para candidatos
                  </div>

                  <h2 className="text-4xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight font-headline leading-[1.05]">
                    Tu próxima
                    <span className="block">
                      <span className="shimmer-text">oportunidad</span>
                    </span>
                    <span className="block">te está esperando.</span>
                  </h2>

                  <p className="text-lg text-[#a6c8ff] leading-relaxed max-w-xl mx-auto">
                    Únete a TalentBridge y accede a oportunidades exclusivas de las mejores organizaciones del Cesar y Colombia.
                  </p>

                  <div className="flex flex-wrap justify-center gap-4 pt-2">
                    <Link href={publicLinks.register}
                      className="group flex items-center gap-2 bg-[#6bfe9c] text-[#00210c] rounded-full px-8 py-4 font-bold text-sm uppercase tracking-wider shadow-2xl shadow-[#006d37]/30 hover:bg-[#4ae183] hover:scale-[1.02] active:scale-95 transition-all">
                      Crear perfil gratis
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link href={publicLinks.contact}
                      className="flex items-center gap-2 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full px-8 py-4 font-bold text-sm uppercase tracking-wider hover:bg-white/20 transition-all">
                      Consultas empresariales
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

      </div>
    </>
  );
}   