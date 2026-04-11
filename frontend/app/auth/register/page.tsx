"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Eye, EyeOff, ArrowRight, TrendingUp } from "lucide-react";

type Role = "STUDENT" | "GRADUATE" | "COMPANY";

const roles: { value: Role; label: string }[] = [
  { value: "STUDENT", label: "Estudiante" },
  { value: "GRADUATE", label: "Egresado" },
  { value: "COMPANY", label: "Empresa" },
];

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<Role>("STUDENT");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-0 md:p-6 lg:p-12 bg-[#f7f9fb] flex-col gap-5">
      <main className="w-full max-w-7xl min-h-[870px] bg-white rounded-xl md:rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-sm">

        <section className="hidden md:flex w-1/2 bg-gradient-to-br from-[#00386c] to-[#1a4f8b] p-12 lg:p-20 flex-col justify-between relative overflow-hidden">

          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB19Om-BmL5-xFQN4R9QpvUZ2FobW9vKRLOiVZnP7Xa8rq-nvDDNF_PTajbvarzZ0C06FuU-djWC3OhnuxyKQ9OA1PsGh04pGan0etbx0-0l38SNOhkzQNc_omp7eCByOMEa6I_zA0natby4UwNx3dW0Hj7Vo8_PUpvpqe838fxTa8enDAEPofDlr7DCPDTvhxecxfWX17DjXWO_H4aIHPVHHsCr_ByKa0vlo7HIjo_PlGqLwDJL3wjKNOTqYupYsllx2h2Y6ulYTE"
            alt="Universidad moderna"
            fill
            className="object-cover opacity-20 mix-blend-overlay"
            unoptimized
          />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-12">
              <span className="text-[#4ae183] text-3xl font-black tracking-tighter">TB</span>
              <span className="text-white text-xl font-bold tracking-tight">TalentBridge</span>
            </div>

            <h1 className="text-white text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6 font-headline">
              Tu perfil,<br />
              <span className="text-[#4ae183]">tu oportunidad.</span>
            </h1>
            <p className="text-[#9bc2ff] text-lg max-w-md leading-relaxed">
              Crea tu cuenta en segundos y empieza a conectar con empresas y
              proyectos que buscan exactamente tu perfil.
            </p>
          </div>

          <div className="relative z-10">
            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#006d37] flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold">Crecimiento Asegurado</p>
                  <p className="text-[#9bc2ff] text-sm"> Todo lo que necesitas para empezar a laborar aqui. </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full md:w-1/2 bg-white p-8 md:p-12 lg:p-20 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">

            <div className="flex md:hidden items-center gap-2 mb-8">
              <span className="text-[#00386c] text-2xl font-black tracking-tighter">TB</span>
              <span className="text-[#00386c] text-lg font-bold tracking-tight">TalentBridge</span>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#191c1e] mb-2 font-headline">
                Crea tu cuenta
              </h2>
              <p className="text-[#424750]">
                Completa los datos para unirte a la plataforma.
              </p>
            </div>

            <div className="flex p-1 bg-[#f2f4f6] rounded-full mb-8">
              {roles.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectedRole(value)}
                  className={`flex-1 py-2 px-3 rounded-full text-sm font-semibold transition-all ${
                    selectedRole === value
                      ? "bg-white shadow-sm text-[#00386c]"
                      : "text-[#424750] hover:text-[#00386c]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="space-y-5">

              {(selectedRole === "STUDENT" || selectedRole === "GRADUATE") && (
                <div className="space-y-1">
                  <label
                    htmlFor="fullName"
                    className="text-xs font-semibold uppercase tracking-wider text-[#424750] ml-1"
                  >
                    Nombre completo
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Juan Pérez"
                    className="w-full bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#006d37] focus:ring-0 rounded-lg p-4 transition-all text-[#191c1e] placeholder:text-[#737781] outline-none"
                  />
                </div>
              )}

              {selectedRole === "COMPANY" && (
                <div className="space-y-1">
                  <label htmlFor="companyName" className="text-xs font-semibold uppercase tracking-wider text-[#424750] ml-1">
                    Nombre de la empresa
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    placeholder="Empresa S.A.S."
                    className="w-full bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#006d37] focus:ring-0 rounded-lg p-4 transition-all text-[#191c1e] placeholder:text-[#737781] outline-none"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-[#424750] ml-1">
                  {selectedRole === "STUDENT" || selectedRole === "GRADUATE" ? "Correo institucional" : "Correo corporativo"}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={ selectedRole === "COMPANY" ? "contacto@empresa.com" : "nombre@universidad.edu" }
                  className="w-full bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#006d37] focus:ring-0 rounded-lg p-4 transition-all text-[#191c1e] placeholder:text-[#737781] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-[#424750] ml-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#006d37] focus:ring-0 rounded-lg p-4 pr-12 transition-all text-[#191c1e] placeholder:text-[#737781] outline-none"
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

              <div className="space-y-1">
                <label htmlFor="confirm" className="text-xs font-semibold uppercase tracking-wider text-[#424750] ml-1" >
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    id="confirm"
                    name="confirm"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repite tu contraseña"
                    className="w-full bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#006d37] focus:ring-0 rounded-lg p-4 pr-12 transition-all text-[#191c1e] placeholder:text-[#737781] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737781] hover:text-[#00386c] transition-colors"
                  >
                    {showConfirm ? ( <EyeOff className="w-5 h-5" /> ) : ( <Eye className="w-5 h-5" /> )}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-3 px-1 pt-1">
                <input
                  id="terms"
                  type="checkbox"
                  className="w-5 h-5 mt-0.5 rounded border-[#c2c6d1] text-[#006d37] focus:ring-[#006d37]/20 transition-all flex-shrink-0"
                />
                <label htmlFor="terms" className="text-sm text-[#424750] leading-relaxed">
                  Acepto los{" "}
                  <Link href="#" className="text-[#00386c] font-semibold hover:underline underline-offset-4">
                    Términos de Servicio
                  </Link>{" "}
                  y la{" "}
                  <Link href="#" className="text-[#00386c] font-semibold hover:underline underline-offset-4">
                    Política de Privacidad
                  </Link>
                </label>
              </div>

              <button
                type="button"
                className="w-full py-4 bg-[#00386c] hover:bg-[#1a4f8b] text-white font-bold rounded-full transition-all shadow-lg shadow-[#00386c]/10 flex items-center justify-center gap-2 group mt-2"
              >
                <span>CREAR CUENTA</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            <div className="mt-10 text-center">
              <p className="text-[#424750] text-sm">
                ¿Ya tienes una cuenta?{" "}
                <Link
                  href="/auth/login"
                  className="text-[#006d37] font-bold hover:underline underline-offset-4 ml-1"
                >
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="hidden lg:flex items-center gap-8 opacity-40 hover:opacity-100 transition-opacity">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[#191c1e]">
          © 2026 TalentBridge
        </span>
        <div className="flex gap-4">
          {["Privacidad", "Términos", "Soporte"].map((item) => (
            <Link key={item} href="#" className="text-[10px] font-semibold uppercase tracking-widest text-[#191c1e] hover:text-[#00386c]" >
              {item}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
}