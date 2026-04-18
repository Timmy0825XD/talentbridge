'use client';

import { useAuth } from '@/src/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/src/lib/api';

type EmployeeCount = '1-10' | '10-50' | '50-200' | '200+';

interface CompanyForm {
  companyName: string;
  nit: string;
  sector: string;
  employeeCount: EmployeeCount;
  description: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  city: string;
}

const EMPTY_FORM: CompanyForm = {
  companyName: '',
  nit: '',
  sector: '',
  employeeCount: '1-10',
  description: '',
  website: '',
  contactEmail: '',
  contactPhone: '',
  city: '',
};

export default function CompanyProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<CompanyForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isLoading && !user) router.replace('/auth/login');
    if (!isLoading && user && user.role !== 'COMPANY') router.replace('/dashboard/candidate');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    api.get('/profile/company').then((res) => {
      const d = res.data;
      setForm({
        companyName: d.companyName ?? '',
        nit: d.nit ?? '',
        sector: d.sector ?? '',
        employeeCount: d.employeeCount ?? '1-10',
        description: d.description ?? '',
        website: d.website ?? '',
        contactEmail: d.contactEmail ?? '',
        contactPhone: d.contactPhone ?? '',
        city: d.city ?? '',
      });
    }).catch(() => {});
  }, [user]);

  function set<K extends keyof CompanyForm>(field: K, value: CompanyForm[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

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
      await api.put('/profile/company', payload);
      setSuccess('Perfil de empresa guardado correctamente.');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error ?? 'Error al guardar el perfil.');
    } finally {
      setSaving(false);
    }
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 text-sm">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Perfil de Empresa</h1>
          <p className="text-slate-500 text-sm mt-1">
            Completa el perfil de tu empresa para empezar a publicar vacantes.
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-emerald-50 text-emerald-700 text-sm px-4 py-3 rounded-lg border border-emerald-200">
            {success}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 pb-2 border-b border-slate-100">
              Datos de la empresa
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Razón social <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.companyName}
                  onChange={(e) => set('companyName', e.target.value)}
                  placeholder="e.j. Empresa S.A.S."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">NIT</label>
                <input
                  type="text"
                  value={form.nit}
                  onChange={(e) => set('nit', e.target.value)}
                  placeholder="e.j. 900123456-1"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Sector económico
                </label>
                <input
                  type="text"
                  value={form.sector}
                  onChange={(e) => set('sector', e.target.value)}
                  placeholder="e.j. Tecnología, Finanzas, Salud..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Número de empleados
                </label>
                <select
                  value={form.employeeCount}
                  onChange={(e) => set('employeeCount', e.target.value as EmployeeCount)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                >
                  <option value="1-10">1 – 10</option>
                  <option value="10-50">10 – 50</option>
                  <option value="50-200">50 – 200</option>
                  <option value="200+">200+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ciudad</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                  placeholder="e.j. Valledupar"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Descripción de la empresa
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="¿Qué hace tu empresa y qué tipo de talento buscas?"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 pb-2 border-b border-slate-100">
              Contacto
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Sitio web
                </label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => set('website', e.target.value)}
                  placeholder="e.j. https://miempresa.com"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Correo de contacto
                </label>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => set('contactEmail', e.target.value)}
                  placeholder="e.j. rrhh@miempresa.com"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Teléfono de contacto
                </label>
                <input
                  type="tel"
                  value={form.contactPhone}
                  onChange={(e) => set('contactPhone', e.target.value)}
                  placeholder="e.j. 3001234567"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-800 text-white px-8 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Guardando...' : 'Guardar perfil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}