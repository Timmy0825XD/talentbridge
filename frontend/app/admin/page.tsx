"use client";

import { useAuth } from "@/src/context/auth-context";
import { useEffect, useState } from "react";
import api from "@/src/lib/api";
import { Users, Briefcase, FileText, Star, AlertCircle, Send } from "lucide-react";

interface AdminMetrics {
  activeUsers: number;
  publishedJobs: number;
  applications: number;
  closedContracts: number;
  averageRating: number | null;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (!user) return;
    api.get<AdminMetrics>("/admin/metrics")
      .then(res => setMetrics(res.data))
      .catch(() => setError("No se pudieron cargar las métricas."))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-[#424750]/20 border-t-[#424750] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-8">
        <AlertCircle className="w-10 h-10 text-[#ba1a1a]" />
        <p className="text-[#93000a] font-semibold">{error}</p>
        <button onClick={() => window.location.reload()}
          className="px-6 py-2 bg-[#191c1e] text-white rounded-full text-sm font-bold hover:opacity-80">
          Reintentar
        </button>
      </div>
    );
  }

  const cards = [
    {
      label: "Usuarios activos",
      value: metrics?.activeUsers ?? 0,
      icon: <Users className="w-5 h-5" />,
      color: "text-[#191c1e]",
      bg: "bg-white border border-[#e6e8ea]",
    },
    {
      label: "Vacantes publicadas",
      value: metrics?.publishedJobs ?? 0,
      icon: <Briefcase className="w-5 h-5" />,
      color: "text-[#006d37]",
      bg: "bg-[#6bfe9c]/20",
    },
    {
      label: "Postulaciones",
      value: metrics?.applications ?? 0,
      icon: <Send className="w-5 h-5" />,
      color: "text-[#7c5c00]",
      bg: "bg-[#fff3cd]",
    },
    {
      label: "Contratos cerrados",
      value: metrics?.closedContracts ?? 0,
      icon: <FileText className="w-5 h-5" />,
      color: "text-[#00386c]",
      bg: "bg-[#a6c8ff]/20",
    },
    {
      label: "Calificación promedio",
      value: metrics?.averageRating !== null && metrics?.averageRating !== undefined
        ? `${metrics.averageRating.toFixed(2)} ★`
        : "—",
      icon: <Star className="w-5 h-5" />,
      color: "text-[#005228]",
      bg: "bg-[#6bfe9c]/10",
      isText: true,
    },
  ];

  return (
    <div className="px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#191c1e] font-headline">
          Panel de administración
        </h1>
        <p className="text-[#424750] mt-1">Métricas generales de la plataforma</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map(({ label, value, icon, color, bg, isText }) => (
          <div key={label} className={`${bg} rounded-2xl p-6`}>
            <div className={`${color} mb-3`}>{icon}</div>
            <p className={`${isText ? "text-2xl" : "text-4xl"} font-headline font-extrabold ${color}`}>
              {value}
            </p>
            <p className="text-xs text-[#737781] font-semibold mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}