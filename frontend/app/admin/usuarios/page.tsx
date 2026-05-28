"use client";

import { useAuth } from "@/src/context/auth-context";
import { useEffect, useState } from "react";
import api from "@/src/lib/api";
import { Search, AlertCircle, Loader2, CheckCircle2, XCircle, Trash2 } from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  candidateProfile?: { fullName: string | null } | null;
  companyProfile?: { companyName: string | null } | null;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ROLE_LABEL: Record<string, string> = {
  STUDENT: "Estudiante", GRADUATE: "Egresado",
  COMPANY: "Empresa", INSTITUTION: "Institución", ADMIN: "Admin",
};

const ROLE_COLOR: Record<string, string> = {
  STUDENT: "bg-[#a6c8ff]/20 text-[#00386c]",
  GRADUATE: "bg-[#a6c8ff]/10 text-[#1a4f8b]",
  COMPANY: "bg-[#6bfe9c]/20 text-[#005228]",
  INSTITUTION: "bg-[#fff3cd] text-[#7c5c00]",
  ADMIN: "bg-[#ffdad6] text-[#93000a]",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminUsuariosPage() {
  const { user } = useAuth();
  const [users, setUsers]         = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage]           = useState(1);
  const [actionMsg, setActionMsg] = useState("");

  useEffect(() => {
    if (user) loadUsers();
  }, [user, page, roleFilter]);

  async function loadUsers(searchOverride?: string) {
    setLoading(true); setError("");
    try {
      const params: Record<string, string> = { page: String(page), limit: "15" };
      const q = searchOverride !== undefined ? searchOverride : search;
      if (q)          params.search = q;
      if (roleFilter) params.role   = roleFilter;
      const res = await api.get("/admin/users", { params });
      setUsers(res.data.users ?? res.data);
      setPagination(res.data.pagination ?? null);
    } catch {
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(userId: string, currentStatus: boolean) {
    try {
      await api.patch(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u));
      setActionMsg(!currentStatus ? "Usuario activado." : "Usuario suspendido.");
      setTimeout(() => setActionMsg(""), 3000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setActionMsg(e.response?.data?.error ?? "Error al cambiar estado.");
      setTimeout(() => setActionMsg(""), 3000);
    }
  }

  async function handleDelete(userId: string) {
    if (!confirm("¿Eliminar este usuario? Esta acción no se puede deshacer.")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
      setActionMsg("Usuario eliminado.");
      setTimeout(() => setActionMsg(""), 3000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setActionMsg(e.response?.data?.error ?? "Error al eliminar.");
      setTimeout(() => setActionMsg(""), 3000);
    }
  }

  const inp = "bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#191c1e] focus:ring-0 rounded-lg px-4 py-2.5 text-sm text-[#191c1e] placeholder:text-[#737781] outline-none transition-all";

  return (
    <div className="px-8 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-[#191c1e] font-headline">Usuarios</h1>
        <p className="text-[#424750] mt-1">Gestiona cuentas, roles y estados</p>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex-1 min-w-[200px] flex items-center bg-[#f2f4f6] rounded-lg px-4 gap-2">
          <Search className="w-4 h-4 text-[#737781] flex-shrink-0" />
          <input type="text" value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { setPage(1); loadUsers(search); } }}
            placeholder="Buscar por email o nombre..."
            className="flex-1 bg-transparent border-none focus:ring-0 py-2.5 text-sm text-[#191c1e] placeholder:text-[#737781] outline-none" />
        </div>
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          className={`${inp} cursor-pointer`}>
          <option value="">Todos los roles</option>
          {["STUDENT","GRADUATE","COMPANY","INSTITUTION","ADMIN"].map(r => (
            <option key={r} value={r}>{ROLE_LABEL[r]}</option>
          ))}
        </select>
        <button onClick={() => { setPage(1); loadUsers(search); }}
          className="px-5 py-2.5 bg-[#191c1e] text-white rounded-lg text-sm font-bold hover:opacity-80 transition">
          Buscar
        </button>
      </div>

      {/* Mensaje acción */}
      {actionMsg && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm font-semibold bg-[#6bfe9c]/20 text-[#005228]">
          {actionMsg}
        </div>
      )}

      {/* Tabla */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="w-6 h-6 border-2 border-[#424750]/20 border-t-[#424750] rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertCircle className="w-8 h-8 text-[#ba1a1a]" />
          <p className="text-[#93000a] font-semibold">{error}</p>
          <button onClick={() => loadUsers()} className="text-sm font-bold text-[#191c1e] hover:underline">Reintentar</button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-[#e6e8ea] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f2f4f6]">
                  {["Usuario", "Rol", "Estado", "Registro", "Acciones"].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#737781]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2f4f6]">
                {users.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-10 text-[#737781] text-sm">No se encontraron usuarios.</td></tr>
                ) : users.map(u => {
                  const name = u.candidateProfile?.fullName ?? u.companyProfile?.companyName ?? u.email;
                  return (
                    <tr key={u.id} className="hover:bg-[#f7f9fb] transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#191c1e] truncate max-w-[180px]">{name}</p>
                        <p className="text-xs text-[#737781] truncate max-w-[180px]">{u.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${ROLE_COLOR[u.role] ?? "bg-[#f2f4f6] text-[#424750]"}`}>
                          {ROLE_LABEL[u.role] ?? u.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`flex items-center gap-1.5 text-xs font-bold w-fit ${
                          u.isActive ? "text-[#005228]" : "text-[#93000a]"
                        }`}>
                          {u.isActive
                            ? <CheckCircle2 className="w-3.5 h-3.5" />
                            : <XCircle className="w-3.5 h-3.5" />}
                          {u.isActive ? "Activo" : "Suspendido"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-[#737781]">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleToggleStatus(u.id, u.isActive)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
                              u.isActive
                                ? "bg-[#fff3cd] text-[#7c5c00] hover:bg-[#ffc107]/30"
                                : "bg-[#6bfe9c]/20 text-[#005228] hover:bg-[#6bfe9c]/40"
                            }`}>
                            {u.isActive ? "Suspender" : "Activar"}
                          </button>
                          {u.role !== "ADMIN" && (
                            <button onClick={() => handleDelete(u.id)}
                              className="p-1.5 text-[#737781] hover:text-[#ba1a1a] transition-colors rounded-lg hover:bg-[#ffdad6]">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-[#737781]">
                {pagination.total} usuarios · página {page} de {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-[#f2f4f6] text-[#424750] hover:bg-[#e6e8ea] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  Anterior
                </button>
                <button disabled={page === pagination.totalPages} onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-[#191c1e] text-white hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}