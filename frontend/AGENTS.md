# AGENTS.md — TalentBridge Frontend

Este archivo define las convenciones, arquitectura, stack y estado actual
del frontend de TalentBridge. Debe ser leído por cualquier agente de IA
antes de sugerir, generar o modificar código en este proyecto.

---

## Identidad del proyecto

**TalentBridge** es una plataforma web de gestión de talento universitario
que conecta estudiantes y egresados del departamento del Cesar (Colombia)
con empresas que requieren perfiles calificados para proyectos, microtrabajos
o contrataciones formales.

Este frontend consume la API REST del backend (Express + Prisma) y se
comunica con ella a través de un cliente Axios centralizado.

---

## Stack tecnológico — versiones exactas

| Tecnología | Versión | Nota |
|---|---|---|
| Next.js | 16.2.3 | App Router — NO usar Pages Router |
| React | 19.2.4 | |
| TypeScript | 5.x | Strict mode activado |
| Tailwind CSS | 4.x | Sin archivo de config — usa @theme en globals.css |
| Axios | 1.15.0 | Cliente centralizado en src/lib/api.ts |
| lucide-react | 1.8.0 | Para iconos |

### Advertencia crítica sobre Tailwind v4

- **No existe `tailwind.config.ts`** — los colores y tokens se definen en `globals.css` con `@theme`
- Se importa con `@import "tailwindcss"` en vez de las directivas `@tailwind base/components/utilities`
- No crear `tailwind.config.js/ts` bajo ninguna circunstancia

---

## Sistema operativo del equipo

Los tres integrantes trabajan en **Windows** con **Git Bash** como terminal.

---

## Arquitectura del frontend

```
frontend/
├── src/
│   ├── types/
│   │   └── api.ts                            # Tipos compartidos — fuente de verdad (Sprint 3)
│   ├── components/
│   │   └── contracts/
│   │       └── DeliverablesPanel.tsx         # Panel entregables empresa/candidato (Sprint 3)
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                          # Landing
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── verify-otp/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   ├── dashboard/
│   │   │   ├── layout.tsx                    # Header + nav dinámico + protección de ruta
│   │   │   ├── candidate/
│   │   │   │   ├── page.tsx                  # Dashboard candidato — API real (Sprint 3)
│   │   │   │   ├── explorar/page.tsx         # Explorar empleos — score real
│   │   │   │   ├── postulaciones/page.tsx    # Postulaciones — tabs activas/historial (Sprint 3)
│   │   │   │   └── contratos/
│   │   │   │       ├── page.tsx              # Lista contratos candidato
│   │   │   │       └── [id]/page.tsx         # Detalle — confirmar, PDF, pagos, entregables
│   │   │   └── company/
│   │   │       ├── page.tsx                  # Dashboard empresa — API real
│   │   │       ├── vacantes/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── _components/JobForm.tsx
│   │   │       │   └── [id]/postulantes/page.tsx
│   │   │       ├── contratos/
│   │   │       │   ├── page.tsx              # Lista contratos empresa
│   │   │       │   ├── [id]/page.tsx         # Detalle — PDF, pagos, entregables, campos enriquecidos, completar, cancelar
│   │   │       │   └── _components/
│   │   │       │       └── CreateContractForm.tsx
│   │   │       └── talento/page.tsx          # Pendiente Sprint 3
│   │   └── profile/
│   │       ├── candidate/page.tsx
│   │       └── company/page.tsx
│   ├── context/
│   │   └── auth-context.tsx
│   └── lib/
│       └── api.ts
```

### Reglas de arquitectura

- **`src/types/api.ts`** — fuente de verdad para tipos del backend, nunca redefinir interfaces localmente
- **`src/components/`** — componentes reutilizables entre rutas distintas (ej. `DeliverablesPanel`)
- **`_components/`** — componentes internos de una sola página, al mismo nivel que `page.tsx`
- **Rutas de candidato** en `dashboard/candidate/` — nunca en `dashboard/` directamente
- **Rutas de empresa** en `dashboard/company/` — nunca en `dashboard/` directamente
- **`"use client"`** en todo componente con hooks o eventos del browser
- **`api`** de `@/src/lib/api` — nunca `fetch` directo
- **`useAuth()`** — nunca `localStorage` directo

---

## Variables de entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL base del backend (ej: `http://localhost:3001/api`) |

---

## Cliente Axios — src/lib/api.ts

- **Request:** agrega `Authorization: Bearer {tb_token}` automáticamente
- **Response:** si `401` y ruta no es `/auth/` → limpia localStorage y redirige a `/`

```typescript
import api from "@/src/lib/api";
const res = await api.get("/contracts");
```

---

## Tipos compartidos — src/types/api.ts

Importar siempre desde aquí, nunca redefinir:

```typescript
import {
  ProfileScoreResponse, Contract, PaymentScheme,
  ApplicationWithJob, Deliverable, DeliverableStatus
} from "@/src/types/api";
```

**Enums:** `UserRole`, `JobStatus`, `JobType`, `WorkMode`, `ApplicationStatus`,
`ContractStatus`, `PaymentStatus`, `PaymentScheme`, `DeliverableStatus`

**Interfaces:** `LoginResponse`, `RegisterResponse`, `ProfileScoreResponse`,
`JobListItem`, `JobsListResponse`, `ApplicationWithJob`, `ApplyResponse`,
`Payment`, `Deliverable`, `Contract`

**Payloads:** `CreateContractPayload`, `CreatePaymentPayload`, `ReviewDeliverablePayload`

---

## DeliverablesPanel — src/components/contracts/DeliverablesPanel.tsx

Componente compartido para gestión de entregables/hitos. Usado en detalle
contrato empresa y candidato.

```tsx
<DeliverablesPanel
  contractId={contractId}
  contractStatus={contract.status}   // acciones solo habilitadas si ACTIVE
  role="COMPANY"                     // "COMPANY" | "CANDIDATE"
/>
```

| Role | Puede hacer |
|---|---|
| `COMPANY` | Crear hitos, aprobar/rechazar con feedback |
| `CANDIDATE` | Enviar archivo + notas, reenviar si rechazado |

Endpoints que consume internamente:
- `GET /contracts/:id/deliverables`
- `POST /contracts/:id/deliverables` (empresa)
- `POST /contracts/deliverables/:id/submit` (candidato)
- `PATCH /contracts/deliverables/:id/review` (empresa)

---

## Dashboard candidato — datos reales (Sprint 3)

`dashboard/candidate/page.tsx` consume en paralelo con `Promise.allSettled`:
- `GET /ranking/me` → score real + sugerencias
- `GET /applications/me` → postulaciones activas
- `GET /contracts` → contratos activos y pendientes

Muestra: score animado, postulaciones recientes con % match y estado,
mini-lista contratos activos, alerta si hay contratos pendientes de confirmar,
CTA a explorar.

---

## Detalle contrato empresa — campos enriquecidos (Sprint 3)

`dashboard/company/contratos/[id]/page.tsx` muestra adicionalmente:
- `paymentScheme` como badge traducido (Pago único / Por hitos / Periódico)
- `paidAmount` y `remainingAmount` del backend (no recalculados)
- `confirmedAt` y `cancelledAt` cuando existen

---

## Contexto de autenticación

```typescript
const { user, login, logout, isLoading } = useAuth();
// user.userId | user.role | user.token
```

Sesión en localStorage: `tb_token`, `tb_role`, `tb_userId`

Redirección por rol: `STUDENT/GRADUATE → /dashboard/candidate`, `COMPANY → /dashboard/company`

---

## Sistema de diseño — Colores

| Hex | Uso |
|---|---|
| `#00386c` | Azul — candidato, títulos, botones primarios |
| `#006d37` | Verde — empresa, acciones positivas |
| `#f7f9fb` | Fondo general |
| `#191c1e` | Texto principal |
| `#424750` | Texto secundario |
| `#737781` | Texto terciario, placeholders |
| `#ba1a1a` | Error |
| `#ffdad6` | Fondo error |
| `#6bfe9c` | Verde claro — éxito, badges |

**Siempre inline** — Tailwind v4 no expone tokens `@theme` como clases:
```tsx
className="bg-[#00386c]"  // ✅
className="bg-primary"    // ❌
```

---

## Patrones de componentes

### Página con datos reales
```typescript
const [data, setData]       = useState<MiTipo | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError]     = useState('');

useEffect(() => { if (user) loadData(); }, [user]);

async function loadData() {
  setLoading(true);
  try {
    const res = await api.get('/endpoint');
    setData(res.data);
  } catch {
    setError('Mensaje en español.');
  } finally {
    setLoading(false);
  }
}
```

### Peticiones paralelas (preferir sobre secuenciales)
```typescript
const [resA, resB] = await Promise.allSettled([
  api.get('/endpoint-a'),
  api.get('/endpoint-b'),
]);
if (resA.status === 'fulfilled') setDataA(resA.value.data);
```

### Manejo de errores Axios
```typescript
} catch (err: unknown) {
  const e = err as { response?: { data?: { error?: string } } };
  setError(e.response?.data?.error ?? 'Error inesperado.');
}
```

### Subida de archivos
```typescript
const fd = new FormData();
fd.append("file", file);   // nombre exacto según tabla multipart
await api.post("/contracts/:id/file", fd, {
  headers: { "Content-Type": "multipart/form-data" }
});
```

### Inputs y labels — estilo estándar
```typescript
const inp = "w-full bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#006d37] focus:ring-0 rounded-lg px-4 py-3 text-sm text-[#191c1e] placeholder:text-[#737781] outline-none transition-all";
const lbl = "block text-xs font-semibold uppercase tracking-wider text-[#424750] mb-2";
```

---

## Campos multipart — nombres exactos

| Acción | Campo | Tipos | Límite |
|---|---|---|---|
| CV candidato | `cv` | PDF | 5MB |
| Foto candidato | `photo` | JPG/PNG/WebP | 2MB |
| Logo empresa | `logo` | JPG/PNG/WebP | 2MB |
| PDF contrato | `file` | PDF | 10MB |
| Comprobante pago | `receipt` | PDF/imagen | 10MB |
| Entregable | `file` | PDF/imagen | 10MB |

**Nota:** UI valida foto/logo a 3MB pero backend limita a 2MB — pendiente corregir.

---

## Endpoints consumidos

| Método | Ruta | Usado en | Estado |
|---|---|---|---|
| POST | `/auth/register` | `/auth/register` | ✅ |
| POST | `/auth/verify-otp` | `/auth/verify-otp` | ✅ |
| POST | `/auth/resend-otp` | `/auth/verify-otp` | ✅ |
| POST | `/auth/login` | `/auth/login` | ✅ |
| POST | `/auth/forgot-password` | `/auth/forgot-password` | ✅ |
| POST | `/auth/reset-password` | `/auth/reset-password` | ✅ |
| GET | `/profile/candidate` | perfil, dashboard, explorar | ✅ |
| PUT | `/profile/candidate` | perfil candidato | ✅ |
| POST | `/profile/candidate/cv` | perfil candidato | ✅ |
| POST | `/profile/candidate/photo` | perfil candidato | ✅ |
| GET | `/profile/company` | perfil empresa | ✅ |
| PUT | `/profile/company` | perfil empresa | ✅ |
| GET | `/keywords` | perfil candidato | ✅ |
| GET | `/jobs` | explorar | ✅ |
| GET | `/jobs/company/mine` | dashboard empresa, vacantes | ✅ |
| POST | `/jobs` | vacantes | ✅ |
| PUT | `/jobs/:id` | vacantes | ✅ |
| PATCH | `/jobs/:id/status` | vacantes | ✅ |
| GET | `/jobs/:id` | postulantes | ✅ |
| GET | `/jobs/:id/applicants` | postulantes, dashboard empresa | ✅ |
| POST | `/jobs/:id/apply` | explorar | ✅ |
| PATCH | `/applications/:id/status` | postulantes | ✅ |
| GET | `/applications/me` | explorar, postulaciones, dashboard candidato | ✅ |
| GET | `/ranking/me` | explorar, dashboard candidato | ✅ |
| GET | `/contracts` | contratos empresa/candidato, dashboard candidato | ✅ |
| GET | `/contracts/:id` | detalle contrato empresa y candidato | ✅ |
| POST | `/contracts` | CreateContractForm | ✅ |
| POST | `/contracts/:id/file` | detalle contrato empresa | ✅ |
| PATCH | `/contracts/:id/confirm` | detalle contrato candidato | ✅ |
| PATCH | `/contracts/:id/cancel` | detalle contrato empresa | ✅ |
| PATCH | `/contracts/:id/complete` | detalle contrato empresa | ✅ |
| POST | `/contracts/:id/payments` | detalle contrato empresa | ✅ |
| POST | `/contracts/payments/:id/receipt` | detalle contrato empresa | ✅ |
| GET | `/contracts/:id/deliverables` | DeliverablesPanel | ✅ |
| POST | `/contracts/:id/deliverables` | DeliverablesPanel (empresa) | ✅ |
| POST | `/contracts/deliverables/:id/submit` | DeliverablesPanel (candidato) | ✅ |
| PATCH | `/contracts/deliverables/:id/review` | DeliverablesPanel (empresa) | ✅ |

---

## Páginas implementadas

| Ruta | Archivo | Estado |
|---|---|---|
| `/` | `app/page.tsx` | ✅ |
| `/auth/login` | `app/auth/login/page.tsx` | ✅ |
| `/auth/register` | `app/auth/register/page.tsx` | ✅ |
| `/auth/verify-otp` | `app/auth/verify-otp/page.tsx` | ✅ |
| `/auth/forgot-password` | `app/auth/forgot-password/page.tsx` | ✅ |
| `/auth/reset-password` | `app/auth/reset-password/page.tsx` | ✅ |
| `/dashboard/candidate` | `app/dashboard/candidate/page.tsx` | ✅ API real — Sprint 3 |
| `/dashboard/candidate/explorar` | `...explorar/page.tsx` | ✅ score real |
| `/dashboard/candidate/postulaciones` | `...postulaciones/page.tsx` | ✅ Sprint 3 |
| `/dashboard/candidate/contratos` | `...contratos/page.tsx` | ✅ |
| `/dashboard/candidate/contratos/[id]` | `...contratos/[id]/page.tsx` | ✅ confirmar, PDF, pagos, entregables |
| `/dashboard/company` | `app/dashboard/company/page.tsx` | ✅ API real |
| `/dashboard/company/vacantes` | `...vacantes/page.tsx` | ✅ CRUD completo |
| `/dashboard/company/vacantes/[id]/postulantes` | `...postulantes/page.tsx` | ✅ |
| `/dashboard/company/contratos` | `...contratos/page.tsx` | ✅ |
| `/dashboard/company/contratos/[id]` | `...contratos/[id]/page.tsx` | ✅ campos enriquecidos, entregables, cancelar |
| `/profile/candidate` | `app/profile/candidate/page.tsx` | ✅ |
| `/profile/company` | `app/profile/company/page.tsx` | ✅ |

---

## Pendiente Sprint 3

- `/dashboard/company/talento` — buscar talento (coordinar endpoint con Josheph)
- Toggle notificaciones en perfil (`PATCH /notifications/preferences`)
- Nav activo con `pathname.startsWith` en layout dashboard
- Corrección límite upload foto/logo a 2MB en UI (backend ya valida 2MB)

---

## Notas para agentes de IA

- **No usar `fetch`** — siempre `api` de `@/src/lib/api`
- **No usar `localStorage`** — usar `useAuth()`
- **No crear `tailwind.config.ts`**
- **No usar Pages Router**
- **Siempre `"use client"`** en componentes con hooks
- **Tipos desde `@/src/types/api`** — no redefinir interfaces del backend
- **Mensajes al usuario en español** — `err.response?.data?.error`
- **`candidateId` en contratos = `CandidateProfile.id`**, no `User.id`
- **Campo multipart PDF contrato = `file`**, comprobante = `receipt`
- **`DeliverablesPanel` acciones solo cuando `contractStatus === "ACTIVE"`**
- **`paidAmount` / `remainingAmount`** vienen del backend — no recalcular en frontend
- **Dashboard candidato** usa `Promise.allSettled` — fallo de un endpoint no rompe la página
- Al agregar página: actualizar tabla de páginas implementadas
- Al consumir endpoint nuevo: agregarlo a la tabla de endpoints