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

Este proyecto usa **Tailwind CSS v4** que tiene cambios importantes respecto a v3:
- **No existe `tailwind.config.ts`** — los colores y tokens se definen en `globals.css` con `@theme`
- Se importa con `@import "tailwindcss"` en vez de las directivas `@tailwind base/components/utilities`
- No usar `tailwind.config.js/ts` — reportar al Scrum Master si alguien lo crea

---

## Sistema operativo del equipo

Los tres integrantes trabajan en **Windows** con **Git Bash** como terminal.
Todos los comandos y rutas deben ser compatibles con Windows.

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
│   │   ├── layout.tsx                        # Layout raíz — fuentes, metadata, AuthProvider
│   │   ├── page.tsx                          # Landing page público
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── verify-otp/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   ├── dashboard/
│   │   │   ├── layout.tsx                    # Header compartido con nav dinámico por rol
│   │   │   ├── candidate/
│   │   │   │   ├── page.tsx                  # Dashboard candidato (datos mock — Sprint 4)
│   │   │   │   ├── explorar/page.tsx         # Explorar empleos — master/detail + filtros + score real
│   │   │   │   ├── postulaciones/page.tsx    # Postulaciones candidato — tabs activas/historial (Sprint 3)
│   │   │   │   └── contratos/
│   │   │   │       ├── page.tsx              # Lista contratos candidato
│   │   │   │       └── [id]/page.tsx         # Detalle — confirmar, guard PDF, pagos, entregables
│   │   │   └── company/
│   │   │       ├── page.tsx                  # Dashboard empresa — API real
│   │   │       ├── vacantes/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── _components/
│   │   │       │   │   └── JobForm.tsx
│   │   │       │   └── [id]/postulantes/page.tsx
│   │   │       ├── contratos/
│   │   │       │   ├── page.tsx              # Lista contratos empresa — filtros, stats
│   │   │       │   ├── [id]/page.tsx         # Detalle — PDF, pagos, entregables, completar, cancelar
│   │   │       │   └── _components/
│   │   │       │       └── CreateContractForm.tsx
│   │   │       └── talento/page.tsx          # Pendiente Sprint 3
│   │   └── profile/
│   │       ├── candidate/page.tsx
│   │       └── company/page.tsx
│   ├── context/
│   │   └── auth-context.tsx
│   └── lib/
│       └── api.ts                            # Cliente Axios centralizado con interceptores
├── .env.local
├── .env.example
├── next.config.ts
├── postcss.config.mjs
└── package.json
```

### Reglas de arquitectura

- **Todas las páginas** van dentro de `src/app/` siguiendo el App Router de Next.js
- **Rutas de candidato** van dentro de `dashboard/candidate/` — nunca en `dashboard/` directamente
- **Rutas de empresa** van dentro de `dashboard/company/` — nunca en `dashboard/` directamente
- **El layout del dashboard** (`dashboard/layout.tsx`) maneja el header y la protección de ruta
- **Componentes de cliente** (`useState`, `useEffect`, hooks) deben tener `"use client"` al inicio
- **El cliente Axios** (`src/lib/api.ts`) es el único punto de comunicación con el backend
- **El contexto de auth** (`src/context/auth-context.tsx`) es la única fuente de verdad de la sesión
- **Nunca acceder a `localStorage` directamente** — usar el contexto de auth
- **Tipos compartidos** en `src/types/api.ts` — nunca redefinir interfaces del backend en cada página
- **Componentes reutilizables** en `src/components/` — no duplicar lógica entre páginas
- **Componentes internos de una página** van en `_components/` al mismo nivel que `page.tsx`

---

## Variables de entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL base de la API del backend (ej: `http://localhost:3001/api`) |

---

## Cliente Axios — src/lib/api.ts

**Interceptor de request:** lee `tb_token` de localStorage y lo agrega como `Authorization: Bearer TOKEN`.

**Interceptor de response:** si el backend responde `401` y la ruta NO es `/auth/` → limpia localStorage y redirige a `/`.

```typescript
import api from "@/src/lib/api";
const res = await api.get("/profile/candidate");
```

---

## Tipos compartidos — src/types/api.ts

Fuente de verdad para todos los tipos del backend. Importar siempre desde aquí:

```typescript
import { ProfileScoreResponse, Contract, PaymentScheme, ApplicationWithJob, Deliverable } from "@/src/types/api";
```

**Enums:** `UserRole`, `JobStatus`, `JobType`, `WorkMode`, `ApplicationStatus`, `ContractStatus`, `PaymentStatus`, `PaymentScheme`, `DeliverableStatus`

**Interfaces:** `LoginResponse`, `RegisterResponse`, `ProfileScoreResponse`, `JobListItem`, `JobsListResponse`, `ApplicationWithJob`, `ApplyResponse`, `Payment`, `Deliverable`, `Contract`

**Payloads:** `CreateContractPayload`, `CreatePaymentPayload`, `ReviewDeliverablePayload`

---

## DeliverablesPanel — src/components/contracts/DeliverablesPanel.tsx

Componente compartido que gestiona los entregables/hitos de un contrato. Se comporta distinto según `role`:

```tsx
<DeliverablesPanel
  contractId={contractId}
  contractStatus={contract.status}   // controla si las acciones están habilitadas
  role="COMPANY"                     // "COMPANY" | "CANDIDATE"
/>
```

**Empresa (`role="COMPANY"`):**
- Lista entregables con estado expandible
- Crear nuevo hito (`POST /contracts/:id/deliverables`)
- Aprobar o rechazar con feedback (`PATCH /contracts/deliverables/:id/review`)

**Candidato (`role="CANDIDATE"`):**
- Lista entregables con estado expandible
- Enviar archivo + notas (`POST /contracts/deliverables/:id/submit`)
- Reenviar si fue rechazado

Las acciones solo están habilitadas si `contractStatus === "ACTIVE"`.

---

## Contexto de autenticación

```typescript
const { user, login, logout, isLoading } = useAuth();
// user.userId, user.role, user.token
```

Sesión en localStorage: `tb_token`, `tb_role`, `tb_userId`

Redirección por rol en `login()`: `STUDENT/GRADUATE → /dashboard/candidate`, `COMPANY → /dashboard/company`

---

## Sistema de diseño — Colores

| Token | Valor hex | Uso |
|---|---|---|
| `#00386c` | Azul | Candidato — títulos, botones, nav |
| `#006d37` | Verde | Empresa — acentos, botones |
| `#f7f9fb` | Gris claro | Fondo general |
| `#191c1e` | Negro suave | Texto principal |
| `#ba1a1a` | Rojo | Errores |

**Usar siempre como colores inline** — Tailwind v4 no expone tokens `@theme` como clases utilitarias:
```tsx
className="bg-[#00386c] text-white"  // ✅
className="bg-primary"               // ❌
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
    const res = await api.get('/mi-endpoint');
    setData(res.data);
  } catch {
    setError('Mensaje en español.');
  } finally {
    setLoading(false);
  }
}
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
fd.append("file", file);   // nombre exacto según tabla de campos multipart
await api.post("/contracts/:id/file", fd, {
  headers: { "Content-Type": "multipart/form-data" }
});
```

### Inputs — estilo estándar del proyecto
```typescript
const inp = "w-full bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#006d37] focus:ring-0 rounded-lg px-4 py-3 text-sm text-[#191c1e] placeholder:text-[#737781] outline-none transition-all";
const lbl = "block text-xs font-semibold uppercase tracking-wider text-[#424750] mb-2";
```

---

## Campos multipart — nombres exactos

| Acción | Campo FormData | Tipos | Límite |
|---|---|---|---|
| CV candidato | `cv` | PDF | 5MB |
| Foto candidato | `photo` | JPG/PNG/WebP | 2MB |
| Logo empresa | `logo` | JPG/PNG/WebP | 2MB |
| PDF contrato | `file` | PDF | 10MB |
| Comprobante pago | `receipt` | PDF/imagen | 10MB |
| Entregable | `file` | PDF/imagen | 10MB |

**Nota:** La UI valida foto/logo a 3MB pero el backend limita a 2MB — pendiente corregir en Sprint 3.

---

## Endpoints del backend consumidos

Base URL: `NEXT_PUBLIC_API_URL` (ej. `http://localhost:3001/api`)

| Método | Ruta | Usado en | Estado |
|---|---|---|---|
| POST | `/auth/register` | `/auth/register` | ✅ |
| POST | `/auth/verify-otp` | `/auth/verify-otp` | ✅ |
| POST | `/auth/resend-otp` | `/auth/verify-otp` | ✅ |
| POST | `/auth/login` | `/auth/login` | ✅ |
| POST | `/auth/forgot-password` | `/auth/forgot-password` | ✅ |
| POST | `/auth/reset-password` | `/auth/reset-password` | ✅ |
| GET | `/profile/candidate` | perfil, dashboard, explorar | ✅ |
| PUT | `/profile/candidate` | `/profile/candidate` | ✅ |
| POST | `/profile/candidate/cv` | `/profile/candidate` | ✅ |
| POST | `/profile/candidate/photo` | `/profile/candidate` | ✅ |
| GET | `/profile/company` | `/profile/company` | ✅ |
| PUT | `/profile/company` | `/profile/company` | ✅ |
| GET | `/keywords` | `/profile/candidate` | ✅ |
| GET | `/jobs` | explorar | ✅ |
| GET | `/jobs/company/mine` | dashboard empresa, vacantes | ✅ |
| POST | `/jobs` | vacantes | ✅ |
| PUT | `/jobs/:id` | vacantes | ✅ |
| PATCH | `/jobs/:id/status` | vacantes | ✅ |
| GET | `/jobs/:id` | postulantes | ✅ |
| GET | `/jobs/:id/applicants` | postulantes, dashboard empresa | ✅ |
| POST | `/jobs/:id/apply` | explorar | ✅ |
| PATCH | `/applications/:id/status` | postulantes | ✅ |
| GET | `/applications/me` | explorar, postulaciones candidato | ✅ |
| GET | `/ranking/me` | explorar | ✅ |
| GET | `/contracts` | contratos empresa y candidato | ✅ |
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
| `/` | `app/page.tsx` | ✅ Completo |
| `/auth/login` | `app/auth/login/page.tsx` | ✅ |
| `/auth/register` | `app/auth/register/page.tsx` | ✅ |
| `/auth/verify-otp` | `app/auth/verify-otp/page.tsx` | ✅ |
| `/auth/forgot-password` | `app/auth/forgot-password/page.tsx` | ✅ |
| `/auth/reset-password` | `app/auth/reset-password/page.tsx` | ✅ |
| `/dashboard/candidate` | `app/dashboard/candidate/page.tsx` | ⚠️ Datos mock — Sprint 4 |
| `/dashboard/candidate/explorar` | `...explorar/page.tsx` | ✅ API real, score real |
| `/dashboard/candidate/postulaciones` | `...postulaciones/page.tsx` | ✅ Sprint 3 |
| `/dashboard/candidate/contratos` | `...contratos/page.tsx` | ✅ |
| `/dashboard/candidate/contratos/[id]` | `...contratos/[id]/page.tsx` | ✅ confirmar, PDF, pagos, entregables |
| `/dashboard/company` | `app/dashboard/company/page.tsx` | ✅ API real |
| `/dashboard/company/vacantes` | `...vacantes/page.tsx` | ✅ CRUD completo |
| `/dashboard/company/vacantes/[id]/postulantes` | `...postulantes/page.tsx` | ✅ |
| `/dashboard/company/contratos` | `...contratos/page.tsx` | ✅ |
| `/dashboard/company/contratos/[id]` | `...contratos/[id]/page.tsx` | ✅ PDF, pagos, entregables, completar, cancelar |
| `/profile/candidate` | `app/profile/candidate/page.tsx` | ✅ |
| `/profile/company` | `app/profile/company/page.tsx` | ✅ |

---

## Pendiente Sprint 3

- `/dashboard/company/talento` — buscar talento (coordinar endpoint con backend)
- Dashboard candidato con datos reales (Sprint 4)
- Toggle notificaciones en perfil (`PATCH /notifications/preferences`)
- Nav activo con `pathname.startsWith` en layout dashboard
- Corrección límite upload foto/logo a 2MB (actualmente 3MB en UI)

---

## Notas para agentes de IA

- **No usar `fetch`** — siempre `api` de `@/src/lib/api`
- **No usar `localStorage` directamente** — usar `useAuth()`
- **No crear `tailwind.config.ts`** — tokens en `globals.css` con `@theme`
- **No usar Pages Router** — exclusivamente App Router
- **Siempre `"use client"`** en componentes con hooks o eventos
- **Tipos desde `@/src/types/api`** — no redefinir interfaces del backend
- **Mensajes de error al usuario en español** — mostrar `err.response?.data?.error`
- **`candidateId` en contratos = `CandidateProfile.id`**, no `User.id`
- **Campo multipart PDF contrato = `file`**, comprobante = `receipt`, entregable = `file`
- **Acciones en `DeliverablesPanel` solo cuando `contractStatus === "ACTIVE"`**
- Al agregar página: actualizar tabla de páginas implementadas
- Al consumir endpoint nuevo: agregarlo a la tabla de endpoints