"use client";

import { useAuth } from "@/src/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/src/lib/api";
import { ArrowLeft, Save, Building2, Globe, Mail, Phone, MapPin, Users } from "lucide-react";

const EMPTY_FORM = {
  companyName: "",
  nit: "",
  sector: "",
  employeeCount: "1-10" as "1-10" | "10-50" | "50-200" | "200+",
  description: "",
  website: "",
  contactEmail: "",
  contactPhone: "",
  city: "",
};

const sections = [
  { id: "company", label: "Datos de la empresa", icon: Building2 },
  { id: "contact", label: "Contacto", icon: Mail },
];

export default function CompanyProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isLoading && !user) router.replace("/auth/login");
    if (!isLoading && user && user.role !== "COMPANY") router.replace("/dashboard/candidate");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    api.get("/profile/company").then((res) => {
      const d = res.data;
      setForm({
        companyName: d.companyName ?? "",
        nit: d.nit ?? "",
        sector: d.sector ?? "",
        employeeCount: d.employeeCount ?? "1-10",
        description: d.description ?? "",
        website: d.website ?? "",
        contactEmail: d.contactEmail ?? "",
        contactPhone: d.contactPhone ?? "",
        city: d.city ?? "",
      });
    }).catch(() => {});
  }, [user]);

  function set<K extends keyof typeof EMPTY_FORM>(field: K, value: typeof EMPTY_FORM[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      companyName: form.companyName,
      nit: form.nit || undefined,
      sector: form.sector || undefined,
      employeeCount: form.employeeCount,
      description: form.description || undefined,
      website: form.website || undefined,
      contactEmail: form.contactEmail || undefined,
      contactPhone: form.contactPhone || undefined,
      city: form.city || undefined,
    };

    try {
      await api.put("/profile/company", payload);
      setSuccess("Perfil de empresa guardado correctamente.");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error ?? "Error al guardar el perfil.");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
        <span className="w-8 h-8 border-2 border-[#006d37]/20 border-t-[#006d37] rounded-full animate-spin" />
      </div>
    );
  }

  const input = "w-full bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#006d37] focus:ring-0 rounded-lg px-4 py-3 text-sm text-[#191c1e] placeholder:text-[#737781] outline-none transition-all";
  const labelCls = "block text-xs font-semibold uppercase tracking-wider text-[#424750] mb-2";

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <div className="max-w-screen-xl mx-auto px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">

        <aside className="lg:col-span-3 space-y-6">
          <Link href="/dashboard/company" className="flex items-center gap-2 text-sm font-semibold text-[#424750] hover:text-[#006d37] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver al dashboard
          </Link>

          <div className="bg-white rounded-2xl p-6 border border-[#e6e8ea] text-center space-y-3">
            <div className="w-20 h-20 rounded-2xl bg-[#006d37] flex items-center justify-center mx-auto"> <Building2 className="w-10 h-10 text-white" /> </div>
            <div>
              <p className="font-bold text-[#191c1e]"> {form.companyName || "Tu empresa"} </p>
              <p className="text-xs text-[#424750] mt-1"> {form.sector || "Sector no definido"} </p>
            </div>
            {form.city && (
              <div className="flex items-center justify-center gap-1 text-xs text-[#737781]"> <MapPin className="w-3 h-3" /> {form.city} </div>
            )}
          </div>

          <nav className="bg-white rounded-2xl border border-[#e6e8ea] overflow-hidden">
            {sections.map(({ id, label, icon: Icon }) => (
              <a
                key={id}
                href={`#${id}`}
                className="flex items-center gap-3 px-5 py-4 text-sm font-semibold text-[#424750] hover:bg-[#f2f4f6] hover:text-[#006d37] transition-colors border-b border-[#f2f4f6] last:border-0"
              >
                <Icon className="w-4 h-4" />
                {label}
              </a>
            ))}
          </nav>

          {/* Info card */}
          <div className="bg-gradient-to-br from-[#006d37] to-[#00743a] rounded-2xl p-6 text-white space-y-2">
            <Users className="w-6 h-6 text-[#6bfe9c]" />
            <p className="font-bold text-sm">Perfil completo = más postulantes</p>
            <p className="text-xs text-[#6bfe9c]/80 leading-relaxed">
              Las empresas con perfil completo reciben un 40% más de aplicaciones calificadas.
            </p>
          </div>
        </aside>

        <div className="lg:col-span-9 space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[#006d37] font-headline"> Perfil de Empresa </h1>
            <p className="text-[#424750] text-sm mt-1">
              Completa el perfil de tu empresa para empezar a publicar vacantes y atraer talento.
            </p>
          </div>

          {error && (
            <div className="bg-[#ffdad6] text-[#93000a] text-sm font-medium px-4 py-3 rounded-xl"> {error} </div>
          )}
          {success && (
            <div className="bg-[#6bfe9c]/20 text-[#005228] text-sm font-medium px-4 py-3 rounded-xl"> {success} </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            <section id="company" className="bg-white rounded-2xl border border-[#e6e8ea] p-8">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#f2f4f6]">
                <div className="w-8 h-8 rounded-lg bg-[#006d37]/10 flex items-center justify-center"> <Building2 className="w-4 h-4 text-[#006d37]" /> </div>
                <h2 className="font-bold text-[#191c1e]">Datos de la empresa</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={labelCls}> Razón social <span className="text-[#ba1a1a]">*</span> </label>
                  <input
                    type="text"
                    required
                    value={form.companyName}
                    onChange={(e) => set("companyName", e.target.value)}
                    placeholder="e.j. Empresa S.A.S."
                    className={input}
                  />
                </div>

                <div>
                  <label className={labelCls}>NIT</label>
                  <input
                    type="text"
                    value={form.nit}
                    onChange={(e) => set("nit", e.target.value)}
                    placeholder="e.j. 900123456-1"
                    className={input}
                  />
                </div>

                <div>
                  <label className={labelCls}>Sector económico</label>
                  <input
                    type="text"
                    value={form.sector}
                    onChange={(e) => set("sector", e.target.value)}
                    placeholder="e.j. Tecnología, Finanzas, Salud..."
                    className={input}
                  />
                </div>

                <div>
                  <label className={labelCls}>Número de empleados</label>
                  <select
                    value={form.employeeCount}
                    onChange={(e) => set("employeeCount", e.target.value as typeof form.employeeCount)}
                    className={`${input} cursor-pointer`}
                  >
                    <option value="1-10">1 – 10</option>
                    <option value="10-50">10 – 50</option>
                    <option value="50-200">50 – 200</option>
                    <option value="200+">200+</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>
                    <span className="flex items-center gap-1"> <MapPin className="w-3 h-3" /> Ciudad </span>
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    placeholder="e.j. Valledupar"
                    className={input}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelCls}>Descripción de la empresa</label>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="¿Qué hace tu empresa y qué tipo de talento buscas?"
                    className={`${input} resize-none`}
                  />
                </div>
              </div>
            </section>

            <section id="contact" className="bg-white rounded-2xl border border-[#e6e8ea] p-8">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#f2f4f6]">
                <div className="w-8 h-8 rounded-lg bg-[#006d37]/10 flex items-center justify-center"> <Mail className="w-4 h-4 text-[#006d37]" /> </div>
                <h2 className="font-bold text-[#191c1e]">Contacto</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={labelCls}>
                    <span className="flex items-center gap-1"> <Globe className="w-3 h-3" /> Sitio web </span>
                  </label>
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) => set("website", e.target.value)}
                    placeholder="e.j. https://miempresa.com"
                    className={input}
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    <span className="flex items-center gap-1"> <Mail className="w-3 h-3" /> Correo de contacto </span>
                  </label>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => set("contactEmail", e.target.value)}
                    placeholder="e.j. rrhh@miempresa.com"
                    className={input}
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    <span className="flex items-center gap-1"> <Phone className="w-3 h-3" /> Teléfono de contacto </span>
                  </label>
                  <input
                    type="tel"
                    value={form.contactPhone}
                    onChange={(e) => set("contactPhone", e.target.value)}
                    placeholder="e.j. 3001234567"
                    className={input}
                  />
                </div>
              </div>
            </section>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-br from-[#006d37] to-[#00743a] text-white px-10 py-3.5 rounded-full font-bold text-sm uppercase tracking-widest shadow-lg shadow-[#006d37]/10 hover:shadow-[#006d37]/20 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? "Guardando..." : "Guardar perfil"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}