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
│   │   └── query-provider.tsx                # QueryClientProvider
│   ├── hooks/
│   │   └── queries/
│   │       ├── query-keys.ts
│   │       ├── index.ts
│   │       ├── use-applications.ts
│   │       ├── use-candidates.ts             # GET /candidates/search
│   │       ├── use-contracts.ts
│   │       ├── use-dashboard.ts              # GET /dashboard/company|candidate
│   │       ├── use-jobs.ts
│   │       ├── use-keywords.ts
│   │       ├── use-profile.ts
│   │       └── use-ranking.ts
│   ├── lib/
│   │   ├── api.ts                            # Axios + timeout 30s
│   │   └── query-client.ts                   # staleTime 60s, gcTime 5min
│   ├── components/
│   │   └── contracts/
│   │       ├── DeliverablesPanel.tsx
│   │       ├── ContractsListSkeleton.tsx
│   │       └── RatingsPanel.tsx
│   ├── context/
│   │   └── auth-context.tsx                  # Redirects por rol incluyendo ADMIN e INSTITUTION
│   ├── app/
│   │   ├── layout.tsx                        # AuthProvider + QueryProvider
│   │   ├── page.tsx
│   │   ├── auth/
│   │   │   └── ...
│   │   ├── admin/                            # ← FUERA de dashboard/ — layout propio
│   │   │   ├── layout.tsx                    # Guard ADMIN + sidebar oscuro
│   │   │   ├── page.tsx                      # Métricas
│   │   │   ├── usuarios/page.tsx
│   │   │   ├── vacantes/page.tsx
│   │   │   ├── pesos-ranking/page.tsx
│   │   │   ├── instituciones/page.tsx
│   │   │   └── admins/page.tsx
│   │   ├── institution/                      # ← FUERA de dashboard/ — layout propio
│   │   │   ├── layout.tsx                    # Guard INSTITUTION + header propio
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   ├── layout.tsx                    # Header + nav activo — solo candidato/empresa
│   │   │   ├── candidate/
│   │   │   │   ├── page.tsx                  # GET /dashboard/candidate
│   │   │   │   ├── explorar/page.tsx
│   │   │   │   ├── postulaciones/page.tsx
│   │   │   │   └── contratos/
│   │   │   │       ├── page.tsx
│   │   │   │       └── [id]/page.tsx         # + RatingsPanel si COMPLETED
│   │   │   └── company/
│   │   │       ├── page.tsx                  # GET /dashboard/company
│   │   │       ├── vacantes/...
│   │   │       ├── contratos/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── [id]/page.tsx         # + RatingsPanel + reporte PDF
│   │   │       │   └── _components/CreateContractForm.tsx
│   │   │       ├── talento/page.tsx          # GET /candidates/search
│   │   │       └── beneficios-tributarios/page.tsx  # GET /tax/benefits + POST /tax/simulate
│   │   └── profile/
│   │       ├── candidate/page.tsx
│   │       └── company/page.tsx
│   └── lib/
│       └── api.ts
```

### Regla crítica — layouts por rol

| Rol | Ruta raíz | Layout |
|---|---|---|
| STUDENT / GRADUATE | `/dashboard/candidate` | `dashboard/layout.tsx` |
| COMPANY | `/dashboard/company` | `dashboard/layout.tsx` |
| ADMIN | `/admin` | `admin/layout.tsx` — sidebar oscuro independiente |
| INSTITUTION | `/institution` | `institution/layout.tsx` — header propio independiente |

**NUNCA** poner rutas de ADMIN o INSTITUTION dentro de `dashboard/` — heredarían el header de candidato/empresa.

---

## Política de performance (React Query)

- GET compartido entre 2+ páginas → hook en `src/hooks/queries/`
- Mutaciones → `api.*` manual + `queryClient.invalidateQueries`
- **Prohibido** `useEffect + api.get` en páginas ya migradas a hooks
- Spinner full-page solo si no hay nada que mostrar → skeleton local si hay header

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
| `useJobApplicantsBatch(ids)` | batch applicants |
| `useContracts` | GET `/contracts` |
| `useContractDetail(id)` | GET `/contracts/:id` |
| `useMyRanking` | GET `/ranking/me` |
| `useKeywords` | GET `/keywords` (staleTime 5 min) |
| `useCandidateSearch(params)` | GET `/candidates/search` |
| `useCompanyDashboard` | GET `/dashboard/company` |
| `useCandidateDashboard` | GET `/dashboard/candidate` |

---

## Variables de entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL base del backend (ej: `http://localhost:3001/api`) |

---

## Auth context — redirects por rol

```typescript
STUDENT / GRADUATE → /dashboard/candidate
COMPANY            → /dashboard/company
ADMIN              → /admin
INSTITUTION        → /institution
// sin rol conocido → /
```

---

## Componentes compartidos

### DeliverablesPanel
```tsx
<DeliverablesPanel
  contractId={contractId}
  contractStatus={contract.status}   // acciones solo si ACTIVE
  role="COMPANY"                     // "COMPANY" | "CANDIDATE"
  initialDeliverables={contract.deliverableItems}
/>
```

### RatingsPanel
```tsx
<RatingsPanel contractId={contractId} role="COMPANY" />
<RatingsPanel contractId={contractId} role="CANDIDATE" />
```
Visible solo cuando `contract.status === "COMPLETED"`.

Empresa: calidad, plazos, comunicación, actitud (1–5).
Candidato: puntualidad pagos, claridad instrucciones, ambiente (1–5).

---

## Simulador tributario — empresa

Ruta: `/dashboard/company/beneficios-tributarios`
Link en nav empresa como "Beneficios".

- `GET /tax/benefits` → marco legal colapsable. Respuesta puede ser array directo o `{ benefits: [] }` — manejar ambos.
- `POST /tax/simulate` → `{ monthlySalary, hireAge? }` → resultado con ahorro + breakdown + disclaimer.

---

## Panel Admin — /admin/*

Layout independiente con sidebar oscuro. Guard: redirige a `/` si no es ADMIN.

| Ruta | Endpoint | Funcionalidad |
|---|---|---|
| `/admin` | `GET /admin/metrics` | KPIs: activeUsers, publishedJobs, applications, closedContracts, averageRating |
| `/admin/usuarios` | `GET /admin/users`, `PATCH .../status`, `DELETE ...` | Tabla paginada, filtros, activar/suspender |
| `/admin/vacantes` | `GET /admin/jobs`, `PATCH .../moderate` | Moderación |
| `/admin/pesos-ranking` | `GET/PUT /admin/ranking-weights` | 7 pesos: skills, experience, education, certs, reputation, languages, completion — deben sumar 1.0 |
| `/admin/instituciones` | `GET/POST/PATCH /admin/institutions` | CRUD |
| `/admin/admins` | `POST /admin/admins` | Crear cuenta admin |

**Shape real de `/admin/metrics`:**
```json
{ "activeUsers": 14, "publishedJobs": 3, "applications": 10, "closedContracts": 1, "averageRating": 3.96 }
```

**Shape real de `/admin/ranking-weights`:**
```json
{ "id": "global", "skillsWeight": 0.2, "experienceWeight": 0.2, "educationWeight": 0.2,
  "certsWeight": 0.1, "reputationWeight": 0.1, "languagesWeight": 0.05, "completionWeight": 0.2,
  "updatedAt": "..." }
```
Ignorar `id` y `updatedAt` al iterar — usar lista fija de claves de peso.

---

## Panel Institución — /institution

Layout independiente con header simple. Guard: redirige a `/` si no es INSTITUTION.

- `GET /institution/dashboard` → metrics (estudiantes, egresados, tasa inserción, contratos), topSkills, contractsByArea.

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
| POST | `/auth/*` | auth pages | ✅ |
| GET/PUT | `/profile/candidate` | perfil candidato | ✅ |
| POST | `/profile/candidate/cv` | perfil candidato | ✅ |
| POST | `/profile/candidate/photo` | perfil candidato (2MB) | ✅ |
| GET/PUT | `/profile/company` | perfil empresa | ✅ |
| GET | `/keywords` | perfil, talento | ✅ |
| GET | `/jobs` | explorar | ✅ |
| GET | `/jobs/company/mine` | dashboard empresa, vacantes | ✅ |
| POST/PUT/PATCH | `/jobs*` | vacantes | ✅ |
| POST | `/jobs/:id/apply` | explorar | ✅ |
| GET | `/jobs/:id/applicants` | postulantes | ✅ |
| PATCH | `/applications/:id/status` | postulantes | ✅ |
| GET | `/applications/me` | postulaciones, explorar | ✅ |
| GET | `/ranking/me` | explorar, dashboard candidato | ✅ |
| GET | `/contracts` | contratos empresa/candidato | ✅ |
| GET | `/contracts/:id` | detalle contrato | ✅ |
| POST | `/contracts` | CreateContractForm | ✅ |
| POST | `/contracts/:id/file` | detalle empresa | ✅ |
| PATCH | `/contracts/:id/confirm` | detalle candidato | ✅ |
| PATCH | `/contracts/:id/cancel` | detalle empresa | ✅ |
| PATCH | `/contracts/:id/complete` | detalle empresa | ✅ |
| GET | `/contracts/:id/report` | detalle empresa (COMPLETED) | ✅ |
| GET | `/contracts/:id/ratings` | RatingsPanel | ✅ |
| POST | `/contracts/:id/ratings/company` | RatingsPanel empresa | ✅ |
| POST | `/contracts/:id/ratings/candidate` | RatingsPanel candidato | ✅ |
| POST | `/contracts/:id/payments` | detalle empresa | ✅ |
| POST | `/contracts/payments/:id/receipt` | detalle empresa | ✅ |
| GET/POST | `/contracts/:id/deliverables` | DeliverablesPanel | ✅ |
| POST | `/contracts/deliverables/:id/submit` | DeliverablesPanel candidato | ✅ |
| PATCH | `/contracts/deliverables/:id/review` | DeliverablesPanel empresa | ✅ |
| PATCH | `/notifications/preferences` | perfil candidato | ✅ |
| GET | `/candidates/search` | talento | ✅ |
| GET | `/dashboard/company` | dashboard empresa | ✅ |
| GET | `/dashboard/candidate` | dashboard candidato | ✅ |
| GET | `/tax/benefits` | beneficios tributarios | ✅ |
| POST | `/tax/simulate` | beneficios tributarios | ✅ |
| GET | `/admin/metrics` | /admin | ✅ |
| GET/PATCH/DELETE | `/admin/users*` | /admin/usuarios | ✅ |
| GET/PATCH | `/admin/jobs*` | /admin/vacantes | ✅ |
| GET/PUT | `/admin/ranking-weights` | /admin/pesos-ranking | ✅ |
| GET/POST/PATCH | `/admin/institutions*` | /admin/instituciones | ✅ |
| POST | `/admin/admins` | /admin/admins | ✅ |
| GET | `/institution/dashboard` | /institution | ✅ |

---

## Páginas implementadas

| Ruta | Estado |
|---|---|
| `/` | ✅ |
| `/auth/*` | ✅ |
| `/dashboard/candidate` | ✅ GET /dashboard/candidate |
| `/dashboard/candidate/explorar` | ✅ |
| `/dashboard/candidate/postulaciones` | ✅ |
| `/dashboard/candidate/contratos` | ✅ |
| `/dashboard/candidate/contratos/[id]` | ✅ + RatingsPanel |
| `/dashboard/company` | ✅ GET /dashboard/company |
| `/dashboard/company/vacantes` | ✅ |
| `/dashboard/company/vacantes/[id]/postulantes` | ✅ |
| `/dashboard/company/contratos` | ✅ |
| `/dashboard/company/contratos/[id]` | ✅ + RatingsPanel + reporte PDF |
| `/dashboard/company/talento` | ✅ |
| `/dashboard/company/beneficios-tributarios` | ✅ Sprint 4 |
| `/profile/candidate` | ✅ |
| `/profile/company` | ✅ |
| `/admin` | ✅ Sprint 4 |
| `/admin/usuarios` | ✅ Sprint 4 |
| `/admin/vacantes` | ✅ Sprint 4 |
| `/admin/pesos-ranking` | ✅ Sprint 4 |
| `/admin/instituciones` | ✅ Sprint 4 |
| `/admin/admins` | ✅ Sprint 4 |
| `/institution` | ✅ Sprint 4 |

---

## Notas para agentes de IA

- **No usar `fetch`** — siempre `api` de `@/src/lib/api`
- **No usar `localStorage`** — usar `useAuth()`
- **No crear `tailwind.config.ts`**
- **No usar Pages Router**
- **Siempre `"use client"`** en componentes con hooks
- **Tipos desde `@/src/types/api`** — no redefinir interfaces del backend
- **Mensajes al usuario en español** — `err.response?.data?.error`
- **Admin e Institution FUERA de `dashboard/`** — si se ponen dentro heredan el header de candidato/empresa
- **`/admin/ranking-weights`** devuelve `id` y `updatedAt` — ignorarlos, usar lista fija de claves
- **`/tax/benefits`** puede devolver array directo o `{ benefits: [] }` — manejar ambos
- **`candidateId` en contratos = `CandidateProfile.id`**, no `User.id`
- **Foto/logo = máx 2MB** — backend Multer rechaza mayor
- **`RatingsPanel`** solo cuando `contract.status === "COMPLETED"`
- **`DeliverablesPanel`** acciones solo cuando `contractStatus === "ACTIVE"`
- **`paidAmount` / `remainingAmount`** vienen del backend — no recalcular
- **Nav activo** usa `isNavActive()` — no cambiar a `pathname ===` simple
- Al agregar página: actualizar tabla de páginas implementadas
- Al consumir endpoint nuevo: agregarlo a la tabla de endpoints