"use client";

import { useAuth } from "@/src/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import api from "@/src/lib/api";
import InfoCallout from "@/src/components/info/InfoCallout";
import { ArrowLeft, Save, Building2, Globe, Mail, Phone, MapPin, Users, Camera, Loader2, Briefcase, ChevronRight, ExternalLink} from "lucide-react";
import { toast } from '@/src/lib/toast';

const EMPTY_FORM = {
  companyName:   "",
  nit:           "",
  sector:        "",
  employeeCount: "1-10" as "1-10" | "10-50" | "50-200" | "200+",
  description:   "",
  website:       "",
  contactEmail:  "",
  contactPhone:  "",
  city:          "",
  logoUrl:       "",
};

const NAV_SECTIONS = [
  { id: "identity", label: "Identidad",      icon: Building2 },
  { id: "about",    label: "Sobre nosotros", icon: Users },
  { id: "contact",  label: "Contacto",       icon: Mail },
];

const EMPLOYEE_OPTIONS = [
  { value: "1-10",   label: "1 – 10 empleados" },
  { value: "10-50",  label: "10 – 50 empleados" },
  { value: "50-200", label: "50 – 200 empleados" },
  { value: "200+",   label: "Más de 200" },
];

export default function CompanyProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm]                   = useState(EMPTY_FORM);
  const [saving, setSaving]               = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/auth/login");
    if (!isLoading && user && user.role !== "COMPANY") router.replace("/dashboard/candidate");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    api.get("/profile/company").then((res) => {
      const d = res.data;
      setForm({
        companyName:   d.companyName   ?? "",
        nit:           d.nit           ?? "",
        sector:        d.sector        ?? "",
        employeeCount: d.employeeCount ?? "1-10",
        description:   d.description   ?? "",
        website:       d.website       ?? "",
        contactEmail:  d.contactEmail  ?? "",
        contactPhone:  d.contactPhone  ?? "",
        city:          d.city          ?? "",
        logoUrl:       d.logoUrl       ?? "",
      });
    }).catch(() => {});
  }, [user]);

  function set<K extends keyof typeof EMPTY_FORM>(field: K, value: typeof EMPTY_FORM[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Solo JPG, PNG o WebP."); return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("La imagen no puede superar 3MB."); return;
    }
    setLogoUploading(true);
    const fd = new FormData();
    fd.append("logo", file);
    try {
      const res = await api.post("/profile/company/logo", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set("logoUrl", res.data.logoUrl ?? "");
      toast.success("Logo actualizado.");
      if (logoInputRef.current) logoInputRef.current.value = "";
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error ?? "Error al subir el logo.");
    } finally {
      setLogoUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      companyName:   form.companyName,
      nit:           form.nit           || undefined,
      sector:        form.sector        || undefined,
      employeeCount: form.employeeCount,
      description:   form.description   || undefined,
      website:       form.website       || undefined,
      contactEmail:  form.contactEmail  || undefined,
      contactPhone:  form.contactPhone  || undefined,
      city:          form.city          || undefined,
    };
    try {
      await api.put("/profile/company", payload);
      toast.success("Perfil guardado correctamente.");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error ?? "Error al guardar el perfil.");
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

  const completitudFields = [
    form.companyName, form.sector, form.description,
    form.city, form.contactEmail, form.website,
    form.logoUrl, form.nit,
  ];
  const completitudPct = Math.round(
    (completitudFields.filter(Boolean).length / completitudFields.length) * 100
  );

  const inp = "w-full bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#006d37] focus:ring-0 rounded-xl px-4 py-3 text-sm text-[#191c1e] placeholder:text-[#b0b4bc] outline-none transition-all";
  const lbl = "block text-xs font-bold uppercase tracking-widest text-[#737781] mb-2";

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <div className="relative h-96 overflow-hidden bg-gradient-to-br from-[#191c1e] via-[#00386c] to-[#006d37]">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 800 384" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="g1" cx="20%" cy="50%">
                <stop offset="0%" stopColor="#6bfe9c" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              <radialGradient id="g2" cx="80%" cy="30%">
                <stop offset="0%" stopColor="#a6c8ff" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              <radialGradient id="g3" cx="50%" cy="80%">
                <stop offset="0%" stopColor="#6bfe9c" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
            <ellipse cx="160" cy="192" rx="280" ry="200" fill="url(#g1)" />
            <ellipse cx="640" cy="100" rx="220" ry="160" fill="url(#g2)" />
            <ellipse cx="400" cy="340" rx="180" ry="120" fill="url(#g3)" />
          </svg>
        </div>

        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative z-10 px-10 pt-8">
          <Link href="/dashboard/company"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm font-semibold transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver al dashboard
          </Link>
        </div>

        <div className="absolute top-20 left-10 translate-y-1/2 z-20">
          <div className="relative">
            <div className="w-36 h-36 rounded-2xl bg-white shadow-2xl border-4 border-white flex items-center justify-center overflow-hidden">
              {form.logoUrl ? (
                <img src={form.logoUrl} alt="Logo empresa" className="w-full h-full object-contain p-3" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#006d37] to-[#1a4f8b] flex items-center justify-center">
                  <span className="text-5xl font-black text-white font-headline">
                    {(form.companyName || "?")[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              disabled={logoUploading}
              className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#6bfe9c] text-[#005228] rounded-full flex items-center justify-center shadow-lg hover:bg-[#4ae183] transition-colors disabled:opacity-50"
              title="Cambiar logo"
            >
              {logoUploading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Camera className="w-4 h-4" />}
            </button>
            <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp"
              onChange={handleLogoUpload} disabled={logoUploading} className="hidden" />
          </div>
        </div>

        <div className="absolute bottom-10 left-56 z-10 max-w-lg">
          {form.sector && (
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6bfe9c]" />
              {form.sector}
            </span>
          )}

          <h1 className="text-4xl font-black text-white font-headline tracking-tight leading-tight mb-2">
            {form.companyName || "Tu empresa"}
          </h1>

          {form.city && (
            <p className="text-white/60 text-sm flex items-center gap-1.5 mb-3">
              <MapPin className="w-3.5 h-3.5" /> {form.city}
            </p>
          )}

          {form.description && (
            <p className="text-white/50 text-sm leading-relaxed line-clamp-2 max-w-md">
              {form.description}
            </p>
          )}

          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 rounded-full mt-4">
            <div className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#6bfe9c] rounded-full transition-all duration-700"
                style={{ width: `${completitudPct}%` }}
              />
            </div>
            <span className="text-xs font-bold text-white/80">
              Perfil {completitudPct}% completo
            </span>
          </div>
        </div>

        <div className="absolute bottom-10 right-10 z-10 flex items-end gap-8">

          <div className="text-right">
            <p className="text-3xl font-black text-white font-headline leading-none mb-1">
              {form.employeeCount || "—"}
            </p>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Empleados</p>
          </div>

          <div className="w-px h-12 bg-white/20" />

          <div className="text-right">
            <p className="text-3xl font-black text-white font-headline leading-none mb-1">
              {form.nit ? "✓" : "—"}
            </p>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">NIT</p>
          </div>

          <div className="w-px h-12 bg-white/20" />

          <div className="text-right">
            <div className="flex items-center justify-end gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${form.companyName ? "bg-[#6bfe9c] animate-pulse" : "bg-[#737781]"}`} />
              <p className="text-sm font-black text-white leading-none">
                {form.companyName ? "Activo" : "Incompleto"}
              </p>
            </div>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Estado</p>
          </div>

        </div>
      </div>

      <div className="h-24" />
      <div className="max-w-screen-xl mx-auto px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <aside className="lg:col-span-3 space-y-5 lg:sticky lg:top-6 self-start">

          <nav className="bg-white rounded-2xl border border-[#e6e8ea] overflow-hidden shadow-sm">
            <p className="px-5 pt-5 pb-3 text-[10px] font-black uppercase tracking-widest text-[#b0b4bc]">Secciones</p>
            {NAV_SECTIONS.map(({ id, label, icon: Icon }) => (
              <a key={id} href={`#${id}`}
                className="flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-[#424750] hover:bg-[#f7f9fb] hover:text-[#006d37] transition-colors border-t border-[#f7f9fb] group">
                <span className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-[#b0b4bc] group-hover:text-[#006d37] transition-colors" />
                  {label}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#c2c6d1] group-hover:text-[#006d37] transition-colors" />
              </a>
            ))}
          </nav>

          <div className="bg-white rounded-2xl border border-[#e6e8ea] p-5 shadow-sm space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#b0b4bc]">Datos rápidos</p>
            {[
              { label: "Empleados", value: form.employeeCount || "—" },
              { label: "Ciudad",    value: form.city          || "—" },
              { label: "Sector",    value: form.sector        || "—" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-[#737781] font-medium">{label}</span>
                <span className="text-xs font-bold text-[#191c1e] text-right max-w-[120px] truncate">{value}</span>
              </div>
            ))}
            {form.website && (
              <a href={form.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-[#006d37] font-semibold hover:underline underline-offset-2 pt-1">
                <ExternalLink className="w-3 h-3" /> Visitar sitio web
              </a>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-[#e6e8ea] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#b0b4bc]">Completitud</p>
              <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                completitudPct >= 75 ? "bg-[#6bfe9c]/20 text-[#005228]"
                : completitudPct >= 50 ? "bg-[#a6c8ff]/20 text-[#00386c]"
                : "bg-[#ffdad6] text-[#93000a]"
              }`}>
                {completitudPct}%
              </span>
            </div>
            <div className="h-2 bg-[#f2f4f6] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-[#006d37] to-[#6bfe9c]"
                style={{ width: `${completitudPct}%` }}
              />
            </div>
            <div className="mt-3 space-y-1.5">
              {[
                { label: "Nombre",      done: !!form.companyName },
                { label: "Sector",      done: !!form.sector },
                { label: "Descripción", done: !!form.description },
                { label: "Logo",        done: !!form.logoUrl },
                { label: "Contacto",    done: !!form.contactEmail },
              ].map(({ label, done }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full flex-shrink-0 ${done ? "bg-[#006d37]" : "bg-[#e6e8ea]"}`} />
                  <span className={`text-xs ${done ? "text-[#191c1e] font-semibold" : "text-[#b0b4bc]"}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <InfoCallout
            title="Perfil visible para candidatos"
            description="Completar los datos de tu empresa aumenta la confianza y las postulaciones que recibes."
            href="/info/empresas"
            linkLabel="Saber más"
          />

          <div className="bg-gradient-to-br from-[#006d37] to-[#00743a] rounded-2xl p-6 text-white">
            <Briefcase className="w-6 h-6 text-[#6bfe9c] mb-3" />
            <p className="font-bold text-sm mb-2">Perfil completo = más postulantes</p>
            <p className="text-xs text-[#6bfe9c]/80 leading-relaxed">
              Las empresas con perfil completo reciben un 40% más de aplicaciones calificadas.
            </p>
          </div>
        </aside>

        <div className="lg:col-span-9 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            <section id="identity" className="bg-white rounded-3xl border border-[#e6e8ea] overflow-hidden shadow-sm">
              <div className="bg-[#f7f9fb] px-8 py-5 border-b border-[#e6e8ea] flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#00386c] flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-black text-[#191c1e] text-base font-headline">Identidad de la empresa</h2>
                  <p className="text-xs text-[#737781]">Nombre, NIT, sector y tamaño</p>
                </div>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={lbl}>Razón social <span className="text-[#ba1a1a]">*</span></label>
                  <input type="text" required value={form.companyName}
                    onChange={e => set("companyName", e.target.value)}
                    placeholder="e.j. Empresa S.A.S." className={inp} />
                </div>
                <div>
                  <label className={lbl}>NIT</label>
                  <input type="text" value={form.nit}
                    onChange={e => set("nit", e.target.value)}
                    placeholder="e.j. 900123456-1" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Sector económico</label>
                  <input type="text" value={form.sector}
                    onChange={e => set("sector", e.target.value)}
                    placeholder="e.j. Tecnología, Finanzas, Salud..." className={inp} />
                </div>
                <div>
                  <label className={lbl}>Número de empleados</label>
                  <select value={form.employeeCount}
                    onChange={e => set("employeeCount", e.target.value as typeof form.employeeCount)}
                    className={`${inp} cursor-pointer`}>
                    {EMPLOYEE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Ciudad</label>
                  <input type="text" value={form.city}
                    onChange={e => set("city", e.target.value)}
                    placeholder="e.j. Valledupar" className={inp} />
                </div>
              </div>
            </section>

            <section id="about" className="bg-white rounded-3xl border border-[#e6e8ea] overflow-hidden shadow-sm">
              <div className="bg-[#f7f9fb] px-8 py-5 border-b border-[#e6e8ea] flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#006d37] flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-black text-[#191c1e] text-base font-headline">Sobre la empresa</h2>
                  <p className="text-xs text-[#737781]">Cuéntale a los candidatos quiénes son</p>
                </div>
              </div>
              <div className="p-8">
                <label className={lbl}>Descripción</label>
                <textarea rows={6} value={form.description}
                  onChange={e => set("description", e.target.value)}
                  placeholder="¿Qué hace tu empresa? ¿Cuál es su misión? ¿Qué tipo de talento buscan? Un buen texto aquí aumenta el interés de los candidatos..."
                  className={`${inp} resize-none`} />
                <p className="text-xs text-[#b0b4bc] mt-2">
                  {form.description.length}/800 caracteres recomendados
                </p>
              </div>
            </section>

            <section id="contact" className="bg-white rounded-3xl border border-[#e6e8ea] overflow-hidden shadow-sm">
              <div className="bg-[#f7f9fb] px-8 py-5 border-b border-[#e6e8ea] flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#00386c] flex items-center justify-center">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-black text-[#191c1e] text-base font-headline">Información de contacto</h2>
                  <p className="text-xs text-[#737781]">Cómo pueden encontrarte los candidatos</p>
                </div>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={lbl}>
                    <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> Sitio web</span>
                  </label>
                  <input type="url" value={form.website}
                    onChange={e => set("website", e.target.value)}
                    placeholder="e.j. https://miempresa.com" className={inp} />
                </div>
                <div>
                  <label className={lbl}>
                    <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> Correo de contacto</span>
                  </label>
                  <input type="email" value={form.contactEmail}
                    onChange={e => set("contactEmail", e.target.value)}
                    placeholder="e.j. rrhh@miempresa.com" className={inp} />
                </div>
                <div>
                  <label className={lbl}>
                    <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> Teléfono</span>
                  </label>
                  <input type="tel" value={form.contactPhone}
                    onChange={e => set("contactPhone", e.target.value)}
                    placeholder="e.j. 3001234567" className={inp} />
                </div>
              </div>
            </section>

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving}
                className="bg-gradient-to-br from-[#006d37] to-[#00743a] text-white px-12 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-xl shadow-[#006d37]/20 hover:shadow-[#006d37]/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-3">
                {saving
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Save className="w-4 h-4" />}
                {saving ? "Guardando..." : "Guardar perfil"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}