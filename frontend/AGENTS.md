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

---

## Stack tecnológico — versiones exactas

| Tecnología | Versión | Nota |
|---|---|---|
| Next.js | 16.2.3 | App Router — NO usar Pages Router |
| React | 19.2.4 | |
| TypeScript | 5.x | Strict mode activado |
| Tailwind CSS | 4.x | Sin archivo de config — usa @theme en globals.css |
| Axios | 1.15.0 | Cliente centralizado en src/lib/api.ts — timeout 30s |
| @tanstack/react-query | 5.x | Caché de GET compartidos — hooks en src/hooks/queries/ |
| lucide-react | 1.8.0 | Para iconos |

### Advertencia crítica sobre Tailwind v4

- **No existe `tailwind.config.ts`** — colores y tokens en `globals.css` con `@theme`
- Se importa con `@import "tailwindcss"` — no `@tailwind base/components/utilities`
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
│   │   └── api.ts                            # Tipos compartidos — fuente de verdad
│   ├── providers/
│   │   └── query-provider.tsx                # QueryClientProvider (React Query)
│   ├── hooks/
│   │   └── queries/                          # useQuery hooks + query-keys.ts
│   │       ├── query-keys.ts
│   │       ├── index.ts                      # Exporta todos los hooks
│   │       ├── use-applications.ts
│   │       ├── use-candidates.ts             # GET /candidates/search (Sprint 4)
│   │       ├── use-contracts.ts
│   │       ├── use-jobs.ts
│   │       ├── use-keywords.ts
│   │       ├── use-profile.ts
│   │       └── use-ranking.ts
│   ├── lib/
│   │   ├── api.ts                            # Axios + timeout 30s
│   │   └── query-client.ts                   # staleTime 60s, gcTime 5min, retry 1
│   ├── components/
│   │   └── contracts/
│   │       ├── DeliverablesPanel.tsx         # Entregables empresa/candidato
│   │       ├── ContractsListSkeleton.tsx     # Skeleton lista contratos
│   │       └── RatingsPanel.tsx             # Calificaciones mutuas (Sprint 4)
│   ├── app/
│   │   ├── layout.tsx                        # Envuelve con AuthProvider + QueryProvider
│   │   ├── page.tsx
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── verify-otp/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   ├── dashboard/
│   │   │   ├── layout.tsx                    # Header + nav activo con isNavActive()
│   │   │   ├── candidate/
│   │   │   │   ├── page.tsx                  # Dashboard — hooks React Query
│   │   │   │   ├── explorar/page.tsx         # Explorar — hooks React Query
│   │   │   │   ├── postulaciones/page.tsx
│   │   │   │   └── contratos/
│   │   │   │       ├── page.tsx
│   │   │   │       └── [id]/page.tsx         # + RatingsPanel si COMPLETED
│   │   │   └── company/
│   │   │       ├── page.tsx                  # Dashboard — hooks React Query
│   │   │       ├── vacantes/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── _components/JobForm.tsx
│   │   │       │   └── [id]/postulantes/page.tsx
│   │   │       ├── contratos/
│   │   │       │   ├── page.tsx              # Lista — hooks React Query + skeleton
│   │   │       │   ├── [id]/page.tsx         # + RatingsPanel si COMPLETED
│   │   │       │   └── _components/CreateContractForm.tsx
│   │   │       └── talento/page.tsx          # ✅ Buscar talento (Sprint 4)
│   │   └── profile/
│   │       ├── candidate/page.tsx
│   │       └── company/page.tsx
│   ├── context/
│   │   └── auth-context.tsx
│   └── lib/
│       └── api.ts
```

### Reglas de arquitectura

- **`src/types/api.ts`** — fuente de verdad para tipos, nunca redefinir localmente
- **`src/hooks/queries/`** — GET reutilizables entre páginas; `index.ts` exporta todo
- **`src/components/`** — componentes compartidos entre rutas distintas
- **`_components/`** — componentes internos de una sola página
- **`"use client"`** en todo componente con hooks o eventos del browser
- **`api`** de `@/src/lib/api` — nunca `fetch` directo
- **`useAuth()`** — nunca `localStorage` directo

---

## Política de performance (obligatoria)

### React Query — reglas

- GET compartido entre 2+ páginas → hook en `src/hooks/queries/`
- Mutaciones → `useMutation` o `api.*` manual + `queryClient.invalidateQueries`
- **Prohibido** `useEffect + api.get` en páginas ya migradas a hooks
- Datos solo usados en modales → carga lazy (no al montar la página)
- Spinner full-page solo si no hay nada que mostrar; si hay header/título → skeleton local

### Hooks disponibles

| Hook | Endpoint |
|---|---|
| `useMyApplications` | GET `/applications/me` |
| `useCandidateProfile` | GET `/profile/candidate` |
| `useCompanyProfile` | GET `/profile/company` |
| `useCompanyJobs` | GET `/jobs/company/mine` |
| `useJobsList(params?)` | GET `/jobs` |
| `useJobDetail(id)` | GET `/jobs/:id` |
| `useJobApplicants(id)` | GET `/jobs/:id/applicants` |
| `useJobApplicantsBatch(ids)` | GET `/jobs/:id/applicants` (batch) |
| `useContracts` | GET `/contracts` |
| `useContractDetail(id)` | GET `/contracts/:id` |
| `useMyRanking` | GET `/ranking/me` |
| `useKeywords` | GET `/keywords` (staleTime 5 min) |
| `useCandidateSearch(params)` | GET `/candidates/search` (Sprint 4) |

### Query keys

```typescript
queryKeys.applications.me
queryKeys.contracts.list
queryKeys.contracts.detail(id)
queryKeys.jobs.list(params?)
queryKeys.jobs.companyMine
queryKeys.jobs.applicants(id)
queryKeys.ranking.me
queryKeys.keywords.all
// candidates no tiene key centralizada — usa ['candidates','search', params]
```

### Invalidación tras mutaciones

```typescript
queryClient.invalidateQueries({ queryKey: queryKeys.contracts.list });
queryClient.invalidateQueries({ queryKey: queryKeys.applications.me });
```

---

## Variables de entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL base del backend (ej: `http://localhost:3001/api`) |

---

## Cliente Axios — src/lib/api.ts

- **Request:** agrega `Authorization: Bearer {tb_token}`
- **Response:** `401` fuera de `/auth/` → limpia localStorage y redirige a `/`
- **Timeout:** 30 segundos

---

## Tipos compartidos — src/types/api.ts

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

## Nav activo — dashboard/layout.tsx

```typescript
function isNavActive(pathname: string, href: string): boolean {
  if (href === "/dashboard/candidate" || href === "/dashboard/company") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(href + "/");
}
```

---

## DeliverablesPanel

```tsx
<DeliverablesPanel
  contractId={contractId}
  contractStatus={contract.status}   // acciones solo si ACTIVE
  role="COMPANY"                     // "COMPANY" | "CANDIDATE"
  initialDeliverables={contract.deliverableItems}  // evita refetch
/>
```

---

## RatingsPanel — Sprint 4

Componente nuevo en `src/components/contracts/RatingsPanel.tsx`.
Visible solo cuando `contract.status === "COMPLETED"`.

```tsx
<RatingsPanel contractId={contractId} role="COMPANY" />
<RatingsPanel contractId={contractId} role="CANDIDATE" />
```

**Empresa califica candidato:** calidad, plazos, comunicación, actitud (1–5).
**Candidato califica empresa:** puntualidad pagos, claridad instrucciones, ambiente (1–5).
Muestra calificación recibida de la otra parte si ya existe.

Endpoints que consume:
- `GET /contracts/:id/ratings` — estado + flags `canRateCandidate`, `canRateCompany`
- `POST /contracts/:id/ratings/company`
- `POST /contracts/:id/ratings/candidate`

---

## Buscar Talento — Sprint 4

**Ruta:** `/dashboard/company/talento/page.tsx` ✅ implementado

Usa `useCandidateSearch(params)` → `GET /candidates/search`.
Patrón master/detail igual que Explorar. Filtros: texto, skills con autocompletado,
carrera, modalidad, score mínimo. Paginación. Anillo de score animado.
Muestra reputación si el candidato tiene calificaciones.

**No incluye** acción de contratar directo — flujo sigue siendo
vacante → postulación → SELECTED → contrato.

---

## Notificaciones — perfil candidato

Toggle en `profile/candidate/page.tsx`:
```typescript
await api.patch("/notifications/preferences", { enabled: newValue });
```

---

## Campos multipart — nombres exactos

| Acción | Campo | Tipos | Límite |
|---|---|---|---|
| CV candidato | `cv` | PDF | 5MB |
| Foto candidato | `photo` | JPG/PNG/WebP | **2MB** |
| Logo empresa | `logo` | JPG/PNG/WebP | 2MB |
| PDF contrato | `file` | PDF | 10MB |
| Comprobante pago | `receipt` | PDF/imagen | 10MB |
| Entregable | `file` | PDF/imagen | 10MB |

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
| POST | `/profile/candidate/photo` | perfil candidato (2MB) | ✅ |
| GET | `/profile/company` | perfil empresa | ✅ |
| PUT | `/profile/company` | perfil empresa | ✅ |
| GET | `/keywords` | perfil candidato, talento | ✅ |
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
| GET | `/contracts/:id/ratings` | RatingsPanel | ✅ |
| POST | `/contracts/:id/ratings/company` | RatingsPanel (empresa) | ✅ |
| POST | `/contracts/:id/ratings/candidate` | RatingsPanel (candidato) | ✅ |
| PATCH | `/notifications/preferences` | perfil candidato | ✅ |
| GET | `/candidates/search` | `/dashboard/company/talento` | ✅ |

---

## Páginas implementadas

| Ruta | Estado |
|---|---|
| `/` | ✅ |
| `/auth/*` | ✅ |
| `/dashboard/candidate` | ✅ hooks React Query |
| `/dashboard/candidate/explorar` | ✅ hooks React Query |
| `/dashboard/candidate/postulaciones` | ✅ |
| `/dashboard/candidate/contratos` | ✅ |
| `/dashboard/candidate/contratos/[id]` | ✅ + RatingsPanel Sprint 4 |
| `/dashboard/company` | ✅ hooks React Query |
| `/dashboard/company/vacantes` | ✅ |
| `/dashboard/company/vacantes/[id]/postulantes` | ✅ |
| `/dashboard/company/contratos` | ✅ hooks React Query + skeleton |
| `/dashboard/company/contratos/[id]` | ✅ + RatingsPanel Sprint 4 |
| `/dashboard/company/talento` | ✅ Sprint 4 |
| `/profile/candidate` | ✅ notificaciones, foto 2MB |
| `/profile/company` | ✅ |

---

## Pendiente Sprint 4

- Dashboards agregados con `GET /dashboard/company` y `GET /dashboard/candidate`
- Reporte PDF contrato (`GET /contracts/:id/report`)
- Simulador tributario (`GET /tax/benefits`, `POST /tax/simulate`)
- Panel Admin (`/dashboard/admin/*`)
- Panel Institución (`/dashboard/institution`)

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
- **Foto/logo = máx 2MB** — backend Multer rechaza mayor
- **`DeliverablesPanel`** acciones solo cuando `contractStatus === "ACTIVE"`
- **`RatingsPanel`** solo cuando `contract.status === "COMPLETED"`
- **`paidAmount` / `remainingAmount`** vienen del backend — no recalcular
- **Nav activo** usa `isNavActive()` — no cambiar a `pathname ===` simple
- **No copiar datos de React Query a useState** — causa bucles infinitos
- Al agregar página: actualizar tabla de páginas implementadas
- Al consumir endpoint nuevo: agregarlo a la tabla de endpoints