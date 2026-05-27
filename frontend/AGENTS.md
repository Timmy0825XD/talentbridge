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
│   │   └── api.ts                            # ← SPRINT 3: Tipos compartidos (fuente de verdad)
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
│   │   │   │   ├── explorar/page.tsx         # Explorar empleos — master/detail + filtros avanzados
│   │   │   │   ├── postulaciones/page.tsx    # (Sprint 3 — pendiente)
│   │   │   │   └── contratos/
│   │   │   │       └── [id]/page.tsx         # Detalle contrato candidato — confirmar, ver PDF, pagos
│   │   │   └── company/
│   │   │       ├── page.tsx                  # Dashboard empresa — conectado a API real
│   │   │       ├── vacantes/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── _components/
│   │   │       │   │   └── JobForm.tsx
│   │   │       │   └── [id]/postulantes/page.tsx
│   │   │       ├── contratos/
│   │   │       │   ├── page.tsx              # Lista contratos empresa — CRUD, filtros, stats
│   │   │       │   ├── [id]/page.tsx         # Detalle contrato empresa — PDF, pagos, completar, cancelar
│   │   │       │   └── _components/
│   │   │       │       └── CreateContractForm.tsx  # Crear contrato — select paymentScheme, fechas required, hitos
│   │   │       └── talento/page.tsx          # (Sprint 3 — pendiente)
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
- **Componentes internos de una página** van en `_components/` al mismo nivel que `page.tsx`

---

## Variables de entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL base de la API del backend (ej: `http://localhost:3001/api`) |

---

## Cliente Axios — src/lib/api.ts

El cliente Axios está configurado con dos interceptores:

**Interceptor de request:**
- Lee el token JWT de `localStorage` (`tb_token`)
- Lo agrega automáticamente al header `Authorization: Bearer TOKEN`

**Interceptor de response:**
- Si el backend responde con `401` y la ruta NO es `/auth/` → limpia localStorage y redirige a `/`

**Uso:**
```typescript
import api from "@/lib/api";
const res = await api.get("/profile/candidate");
```

---

## Tipos compartidos — src/types/api.ts

**Sprint 3:** Se creó `src/types/api.ts` como fuente de verdad para todos los tipos del backend.

Importar siempre desde `@/src/types/api`, nunca redefinir interfaces localmente:

```typescript
import { ProfileScoreResponse, Contract, PaymentScheme, ApplicationWithJob } from "@/src/types/api";
```

Tipos disponibles:
- Enums: `UserRole`, `JobStatus`, `JobType`, `WorkMode`, `ApplicationStatus`, `ContractStatus`, `PaymentStatus`, `PaymentScheme`, `DeliverableStatus`
- Interfaces: `LoginResponse`, `RegisterResponse`, `ProfileScoreResponse`, `JobListItem`, `JobsListResponse`, `ApplicationWithJob`, `ApplyResponse`, `Payment`, `Deliverable`, `Contract`
- Payloads: `CreateContractPayload`, `CreatePaymentPayload`, `ReviewDeliverablePayload`

---

## Contexto de autenticación — src/context/auth-context.tsx

```typescript
const { user, login, logout, isLoading } = useAuth();
```

| Valor | Tipo | Descripción |
|---|---|---|
| `user.userId` | `string` | UUID del usuario |
| `user.role` | `UserRole` | STUDENT, GRADUATE, COMPANY, INSTITUTION, ADMIN |
| `user.token` | `string` | JWT actual |

Sesión persistida en localStorage: `tb_token`, `tb_role`, `tb_userId`

---

## Sistema de diseño — Colores

| Token | Valor hex | Uso principal |
|---|---|---|
| primary | `#00386c` | Azul — candidato |
| secondary | `#006d37` | Verde — empresa |
| background | `#f7f9fb` | Fondo general |
| on-surface | `#191c1e` | Texto principal |
| error | `#ba1a1a` | Rojo — errores |

**Usar siempre como colores inline** (Tailwind v4 no expone tokens `@theme` como clases):
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
    setError('Mensaje de error en español.');
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
fd.append("photo", file);
await api.post("/profile/candidate/photo", fd, {
  headers: { "Content-Type": "multipart/form-data" }
});
```

### Inputs — estilo estándar
```typescript
const inputCls = "w-full bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#006d37] focus:ring-0 rounded-lg px-4 py-3 text-sm text-[#191c1e] placeholder:text-[#737781] outline-none transition-all";
const labelCls = "block text-xs font-semibold uppercase tracking-wider text-[#424750] mb-2";
```

---

## Convenciones de código

- Archivos: `kebab-case` o `PascalCase` para componentes
- Hooks: prefijo `use`
- No usar `any` — siempre tipar explícitamente
- Mensajes al usuario: **español**
- `"use client"` en todo componente con hooks o eventos del browser

---

## Endpoints del backend consumidos

Base URL: `http://localhost:3001/api` — definido en `NEXT_PUBLIC_API_URL`

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
| GET | `/jobs` | `/dashboard/candidate/explorar` | ✅ |
| GET | `/jobs/company/mine` | dashboard empresa, vacantes | ✅ |
| POST | `/jobs` | vacantes (JobForm) | ✅ |
| PUT | `/jobs/:id` | vacantes (JobForm) | ✅ |
| PATCH | `/jobs/:id/status` | vacantes | ✅ |
| GET | `/jobs/:id` | postulantes | ✅ |
| GET | `/jobs/:id/applicants` | postulantes, dashboard empresa | ✅ |
| POST | `/jobs/:id/apply` | explorar | ✅ |
| PATCH | `/applications/:id/status` | postulantes | ✅ |
| GET | `/applications/me` | explorar, postulaciones | ✅ |
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

---

## Páginas implementadas

| Ruta | Archivo | Estado |
|---|---|---|
| `/` | `app/page.tsx` | ✅ Completo |
| `/auth/login` | `app/auth/login/page.tsx` | ✅ Completo |
| `/auth/register` | `app/auth/register/page.tsx` | ✅ Completo |
| `/auth/verify-otp` | `app/auth/verify-otp/page.tsx` | ✅ Completo |
| `/auth/forgot-password` | `app/auth/forgot-password/page.tsx` | ✅ Completo |
| `/auth/reset-password` | `app/auth/reset-password/page.tsx` | ✅ Completo |
| `/dashboard/candidate` | `app/dashboard/candidate/page.tsx` | ⚠️ Datos mock — Sprint 4 |
| `/dashboard/candidate/explorar` | `app/dashboard/candidate/explorar/page.tsx` | ✅ API real, score real |
| `/dashboard/candidate/contratos/[id]` | `app/dashboard/candidate/contratos/[id]/page.tsx` | ✅ Confirmar, guard PDF, pagos |
| `/dashboard/company` | `app/dashboard/company/page.tsx` | ✅ API real |
| `/dashboard/company/vacantes` | `app/dashboard/company/vacantes/page.tsx` | ✅ CRUD completo |
| `/dashboard/company/vacantes/[id]/postulantes` | `...postulantes/page.tsx` | ✅ master/detail, ranking, IA |
| `/dashboard/company/contratos` | `app/dashboard/company/contratos/page.tsx` | ✅ Lista, filtros, stats |
| `/dashboard/company/contratos/[id]` | `app/dashboard/company/contratos/[id]/page.tsx` | ✅ PDF, pagos, completar, cancelar |
| `/profile/candidate` | `app/profile/candidate/page.tsx` | ✅ Completo |
| `/profile/company` | `app/profile/company/page.tsx` | ✅ Completo |

---

## Lo que NO está implementado aún (Sprint 3 pendiente)

- `/dashboard/candidate/postulaciones` — página postulaciones candidato
- `/dashboard/company/talento` — buscar talento (depende de acuerdo con backend)
- Dashboard candidato con datos reales (Sprint 4)
- `DeliverablesPanel` — UI entregables empresa y candidato
- Toggle notificaciones en perfil
- Nav activo con `pathname.startsWith`
- Validación upload foto/logo a 2MB (actualmente 3MB en UI)

---

## Notas para agentes de IA

- **No usar `fetch`** — siempre el cliente `api` de `@/src/lib/api`
- **No usar `localStorage` directamente** — usar `useAuth()`
- **No crear `tailwind.config.ts`** — los tokens van en `globals.css` con `@theme`
- **No usar Pages Router** — exclusivamente App Router
- **Siempre `"use client"`** en componentes con hooks o eventos
- **Tipos siempre desde `@/src/types/api`** — no redefinir interfaces del backend
- **Mensajes de error al usuario en español** — mostrar `err.response?.data?.error`
- **`candidateId` en contratos = `CandidateProfile.id`**, no `User.id`
- **Límite upload foto/logo = 2MB** (backend Multer), aunque la UI aún valida 3MB
- **Campo multipart para PDF de contrato = `file`**, no `pdf` ni `contract`
- **El interceptor 401 excluye rutas `/auth/`** — intencional
- Al agregar una página nueva: actualizar tabla de páginas implementadas
- Al consumir un endpoint nuevo: agregarlo a la tabla de endpoints