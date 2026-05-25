# AGENTS.md — TalentBridge Backend

Este archivo define las convenciones, arquitectura, stack y **estado actual**
del backend de TalentBridge. Debe ser leído por cualquier agente de IA
antes de sugerir, generar o modificar código en este proyecto.

**Regla de mantenimiento:** al cerrar un sprint o agregar un módulo, actualizar
las secciones *Estado del proyecto*, *Endpoints* y *Mapa de archivos*.

---

## Índice

1. [Identidad del proyecto](#identidad-del-proyecto)
2. [Stack tecnológico](#stack-tecnológico--versiones-exactas)
3. [Sistema operativo del equipo](#sistema-operativo-del-equipo)
4. [Servicios externos](#servicios-externos)
5. [Inicio rápido local](#inicio-rápido-local)
6. [Arquitectura](#arquitectura-del-backend)
7. [Convenciones de código](#convenciones-de-código)
8. [Git Flow](#control-de-versiones--git-flow)
9. [Variables de entorno](#variables-de-entorno)
10. [Estado del proyecto por sprint](#estado-del-proyecto-por-sprint)
11. [Modelo de datos — Prisma](#modelo-de-datos--prisma)
12. [Endpoints implementados](#endpoints-implementados)
13. [Supabase Storage](#supabase-storage)
14. [Motor de ranking e IA](#motor-de-ranking--arquitectura-híbrida)
15. [Notificaciones — n8n y Telegram](#notificaciones--n8n-y-telegram)
16. [Mapa de archivos](#archivos-por-módulo--mapa-completo)
17. [Seed de datos](#seed-de-datos)
18. [Patrón para nuevos módulos](#patrón-para-agregar-nuevos-módulos)
19. [Deuda técnica conocida](#deuda-técnica-conocida)
20. [Notas para agentes de IA](#notas-para-agentes-de-ia)

---

## Identidad del proyecto

**TalentBridge** es una plataforma web de gestión de talento universitario
que conecta estudiantes y egresados del departamento del Cesar (Colombia)
con empresas que requieren perfiles calificados para proyectos, microtrabajos
o contrataciones formales.

Este backend expone una API REST que sirve al frontend de Next.js y a los
flujos de automatización de **n8n** (webhooks, Telegram, WhatsApp planificado).

---

## Stack tecnológico — versiones exactas

| Tecnología | Versión | Nota |
|---|---|---|
| Node.js | 24.x | Gestionado con fnm — ver `engines` en `package.json` |
| npm | 11.x | |
| TypeScript | 6.x | Strict mode activado |
| Express | 5.x | |
| Prisma ORM | 6.5.0 | **NUNCA actualizar a Prisma 7** |
| @prisma/client | 6.5.0 | Debe coincidir exactamente con `prisma` |
| PostgreSQL | 16.x | Alojado en Supabase |
| @supabase/supabase-js | 2.x | Storage de archivos |
| bcryptjs | 3.x | Hashing de contraseñas (factor 10) |
| jsonwebtoken | 9.x | JWT stateless |
| nodemailer | 8.x | SMTP (Mailtrap en dev) |
| multer | 2.x | Uploads en memoria |
| zod | 4.x | Instalado — **validación en controllers pendiente de adopción sistemática** |
| uuid | 13.x | Tokens de reset |
| pdf-parse | 1.1.x | Usar `require('pdf-parse/lib/pdf-parse.js')` — NO import default |
| @google/generative-ai | 0.24.x | Gemini — modelo `gemini-2.5-flash` |
| axios | 1.x | Webhook hacia n8n |

### Advertencia crítica sobre Prisma

Prisma 7 introdujo cambios incompatibles con este proyecto:

- Ya no acepta `url` en el datasource del `schema.prisma`
- Requiere un archivo `prisma.config.ts` separado
- El paquete PSL cambió su comportamiento

**Prisma debe permanecer fijado en 6.5.0.** Si se detecta una versión
diferente, no actualizar — reportar al Scrum Master.

En VS Code, fijar comportamiento de Prisma 6 desde la paleta:
`Prisma: Pin the current workspace to Prisma 6`

---

## Sistema operativo del equipo

Los tres integrantes trabajan en **Windows** con **Git Bash** como terminal.
Todos los comandos y rutas deben ser compatibles con Windows.

---

## Servicios externos

| Servicio | Uso | Plan |
|---|---|---|
| Supabase | PostgreSQL + Storage | Gratuito |
| Mailtrap | Correos en desarrollo | Gratuito |
| Google Gemini | Ranking IA + extracción de CV | API key |
| n8n | Automatización de notificaciones | Self-hosted / cloud del equipo |

### Supabase

- Base de datos: PostgreSQL en Supabase (región São Paulo)
- Conexión vía `DATABASE_URL`
- Cliente Storage en `src/lib/supabase.ts` con `SUPABASE_URL` y `SUPABASE_ANON_KEY`
- **Sin subcarpetas en buckets** — el path es solo el nombre del archivo

| Bucket | Uso | Políticas |
|---|---|---|
| `cvs` | CVs PDF de candidatos | INSERT + SELECT anon |
| `avatars` | Fotos de perfil | INSERT + SELECT anon |
| `logos` | Logos de empresa | INSERT + SELECT anon |

Path de archivos:

- CVs: `{userId}_{timestamp}.pdf`
- Avatars: `{userId}.jpg` / `.png` / `.webp`
- Logos: `{userId}.jpg` / `.png` / `.webp`

En todos los casos `upsert: true` — el archivo nuevo reemplaza el anterior.

### Mailtrap

- Solo desarrollo — captura correos sin enviarlos a destinatarios reales
- Configurado en `src/lib/mailer.ts` (Nodemailer + SMTP)
- Producción: migración planificada a **Resend** (`RESEND_API_KEY` en `.env.example`)

---

## Inicio rápido local

```bash
cd backend
npm install
cp .env.example .env   # completar valores
npx prisma generate
npx prisma migrate dev
npx prisma db seed      # keywords iniciales (~120)
npm run dev             # http://localhost:3001
```

Health check: `GET http://localhost:3001/api/health`

---

## Arquitectura del backend

Arquitectura en **capas estrictas**. Cada capa tiene una responsabilidad única.

```
backend/
├── src/
│   ├── app.ts              # Entrada: middlewares globales + registro de rutas
│   ├── routes/             # URLs → controllers (+ middlewares)
│   ├── controllers/        # req/res → services → JSON
│   ├── services/           # Lógica de negocio (sin Express)
│   ├── middlewares/        # auth, uploads
│   └── lib/                # Singletons y lógica pura (Prisma, JWT, IA, ranking)
├── prisma/
│   ├── schema.prisma
│   └── migrations/         # Nunca editar manualmente — solo nuevas migraciones
├── .env                    # NUNCA subir al repo
├── .env.example            # SÍ subir al repo
├── nodemon.json
├── tsconfig.json
├── tsconfig.seed.json      # Solo para `prisma db seed`
└── package.json
```

### Reglas de la arquitectura en capas

| Capa | Puede importar |
|---|---|
| **routes** | controllers, middlewares |
| **controllers** | services, tipos de middlewares (`AuthRequest`) |
| **services** | `lib/*`, otros **services** solo si es orquestación clara (ej. `job.service` → `notification.service`) |
| **middlewares** | `lib/jwt` |
| **lib** | Solo librerías externas — **nunca** services ni controllers |

**Prohibido:**

- Un controller usando `prisma` o `supabase` directamente
- Un service devolviendo un `Response` de Express
- Registrar rutas sueltas en `app.ts` (siempre archivo en `routes/`)

**Excepción documentada:** `keyword.routes.ts` consulta Prisma inline.
No replicar ese patrón — al tocar keywords, migrar a `keyword.service.ts` + controller.

---

## Convenciones de código

### Nomenclatura

- Archivos: `kebab-case` → `auth.service.ts`, `upload.middleware.ts`
- Funciones exportadas: `camelCase` → `registerUser`, `getCandidateProfile`
- Interfaces y tipos: `PascalCase` → `JwtPayload`, `AuthRequest`
- Variables de entorno: `UPPER_SNAKE_CASE` → `JWT_SECRET`, `DATABASE_URL`
- Tablas BD (`@@map`): `snake_case` → `users`, `otp_codes`
- Modelos Prisma: `PascalCase` → `User`, `CandidateProfile`

### TypeScript

- **Strict mode** — no usar `any` salvo casos justificados con comentario
- Tipar parámetros y retornos de funciones exportadas
- `interface` para objetos; `type` para uniones y alias
- No usar `as any` — preferir `as unknown as T` si es imprescindible
- En `catch`, preferir `unknown` y estrechar el tipo

### Manejo de errores en services

Los services lanzan `throw new Error('CODIGO_INTERNO')`.
Los controllers mapean el código a HTTP y mensaje en español:

```typescript
// Service
throw new Error('EMAIL_TAKEN');

// Controller
if (err instanceof Error && err.message === 'EMAIL_TAKEN')
  return res.status(409).json({ error: 'El correo ya está registrado.' });
```

| HTTP | Uso |
|---|---|
| 200 | Éxito |
| 201 | Recurso creado |
| 400 | Datos inválidos |
| 401 | Sin token o token inválido |
| 403 | Rol sin permiso |
| 404 | No encontrado |
| 409 | Conflicto (duplicado, ya postuló, etc.) |
| 500 | Error interno |

### Respuestas HTTP

Siempre JSON:

```typescript
res.status(200).json({ message: 'Descripción clara.' });
res.status(201).json({ message: '...', data: resultado });
res.status(4xx).json({ error: 'Mensaje para el usuario.' });
```

- Mensajes al usuario: **español**
- Códigos internos en services: **inglés** `UPPER_SNAKE_CASE`

### Commits

Conventional Commits:

```
tipo(scope): descripción en imperativo

feat | fix | chore | refactor | docs | style | test
```

---

## Control de versiones — Git Flow

Ramas permanentes:

- `main` — producción estable, protegida
- `develop` — integración, protegida

Ramas temporales:

- `feature/nombre-descriptivo`
- `hotfix/nombre`

Flujo obligatorio:

```
1. git checkout develop && git pull origin develop
2. git checkout -b feature/nombre
3. [desarrollo + commits pequeños]
4. git push -u origin feature/nombre
5. Pull Request: feature/nombre → develop
6. Revisión de al menos un integrante
7. Merge a develop
8. Eliminar rama feature (local y remota)
```

**Nunca hacer push directo a `develop` o `main`.**

---

## Variables de entorno

Ver plantilla completa en `backend/.env.example`.

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor (default: `3001`) |
| `NODE_ENV` | `development` \| `production` |
| `DATABASE_URL` | Connection string PostgreSQL (Supabase) |
| `JWT_SECRET` | Secreto para firmar JWT |
| `JWT_EXPIRES_IN` | Duración del JWT (ej. `7d`) |
| `OTP_EXPIRES_MINUTES` | Validez OTP (default: 10) |
| `RESET_TOKEN_EXPIRES_MINUTES` | Validez reset password (default: 15) |
| `FRONTEND_URL` | Origen permitido en CORS |
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_ANON_KEY` | Clave anon de Supabase Storage |
| `GEMINI_API_KEY` | API de Google Gemini |
| `N8N_WEBHOOK_URL` | Webhook que n8n expone al publicar vacante |
| `TELEGRAM_BOT_TOKEN` | Bot de Telegram (flujo n8n) |
| `SMTP_*` | Mailtrap en desarrollo |
| `SMTP_FROM` | Remitente |
| `RESEND_API_KEY` | Producción (planificado) |

---

## Estado del proyecto por sprint

### Implementado (API + lógica)

| Área | Sprint | Detalle |
|---|---|---|
| Auth (registro, OTP, login, reset) | 1 | JWT, bcrypt, Mailtrap |
| Perfiles candidato y empresa | 1–2 | upsert, foto, logo, CV |
| CV Intelligence | 2 | Gemini + pdf-parse + keywords dinámicas |
| Ranking de perfil | 2 | `ProfileScore`, `GET/POST /ranking` |
| Vacantes CRUD + filtros | 2 | Empresa publica/edita/estados |
| Postulaciones + score híbrido | 2 | 40% perfil + 60% Gemini → `Application` |
| Keywords API | 2 | `GET /keywords` |
| Notificaciones (parcial) | 3 | Webhook n8n, Telegram chatId, preferencias |
| Contratos, pagos y entregables | 3 | API REST completa, validación Zod, reglas RF-19/21/22 |

### Pendiente

| Área | Sprint | Detalle |
|---|---|---|
| UI entregables en frontend | 3 | Oscar — consumir endpoints de deliverables |
| Endurecer seguridad webhooks | 3 | Secret compartido en `/notifications/*` |
| Validación Zod en otros módulos | 3+ | Adoptado en contratos; pendiente auth, jobs, etc. |
| Tests automatizados | 3+ | Unit + integración mínima |
| WhatsApp vía n8n | 3 | Canal alternativo a Telegram |
| Calificaciones mutuas | 4 | |
| Panel ADMIN / INSTITUTION | 4 | Roles ya en schema |
| Reportes PDF | 4 | |

---

## Modelo de datos — Prisma

Fuente de verdad: `prisma/schema.prisma`.

### Enums principales

```prisma
enum Role { STUDENT GRADUATE COMPANY INSTITUTION ADMIN }
enum KeywordType { TECHNICAL SOFT LANGUAGE }
enum JobType { FORMAL FREELANCE }
enum JobStatus { ACTIVE SELECTING CLOSED CANCELLED }
enum ApplicationStatus { RECEIVED REVIEWING SELECTED REJECTED }
enum WorkMode { REMOTE ONSITE HYBRID }
enum ContractStatus { PENDING_CANDIDATE ACTIVE COMPLETED CANCELLED }
enum PaymentStatus { PENDING CONFIRMED }
enum PaymentScheme { SINGLE MILESTONES PERIODIC }
enum DeliverableStatus { PENDING SUBMITTED APPROVED REJECTED }
```

### Modelos — resumen

| Modelo | Rol |
|---|---|
| **User** | Cuenta central; `isVerified`, `isActive`, `role` |
| **OtpCode** / **ResetToken** | Verificación y recuperación |
| **CandidateProfile** | Perfil 1:1; skills[], JSON projects/certs/languages; `cvUrl`, `photoUrl`; notificaciones (`telegramChatId`, `notificationsEnabled`) |
| **CompanyProfile** | Perfil empresa 1:1; relación con `Job[]` |
| **Job** | Vacante; `skills[]`, presupuesto, `JobRankConfig?` |
| **Application** | Postulación única por par job+candidato; `scoreAtApply`, `aiReasons[]`, `aiGaps[]`; relación opcional con `Contract` |
| **JobRankConfig** | Pesos por vacante (deben sumar ~1.0) |
| **ProfileScore** | Puntaje global del candidato (recalculable) |
| **Keyword** | Catálogo + crecimiento automático desde CV |
| **Contract** | Acuerdo formal; `applicationId?`, `paymentScheme` enum, `contractFileUrl`, ciclo de estados |
| **Payment** | Pago asociado a contrato; `sequence`, `dueDate?`, comprobante |
| **Deliverable** | Entregable/hito rastreable; submit + review por candidato/empresa |

### Migraciones relevantes

| Migración | Contenido |
|---|---|
| `init_auth_profiles` | Users, perfiles, OTP |
| `sprint2_jobs_applications_ranking` | Jobs, applications, ranking |
| `add_keywords_table` | Keywords + seed |
| `add_ai_insights_to_application` | `aiReasons`, `aiGaps` |
| `sprint3_notifications_contracts_payments` | Contratos, pagos, campos Telegram |
| `refactor_contracts_deliverables` | PaymentScheme enum, Deliverable, applicationId, reglas |

### Reglas de datos

- Perfiles: siempre **`upsert`**, nunca `create` + `update` separados
- `scoreAtApply` se congela al postular — no se recalcula si el perfil cambia después
- Keywords nuevas desde CV: `isActive: true` por defecto
- Contrato: requiere postulación `SELECTED`; candidato confirma solo si hay `contractFileUrl`
- Cierre de contrato: todos los entregables `APPROVED` (si existen) + pagos confirmados ≥ `totalAmount`

---

## Endpoints implementados

### Base URL (desarrollo)

```
http://localhost:3001/api
```

Todas las rutas protegidas requieren:

```
Authorization: Bearer <JWT>
```

### Health

| Método | Ruta | Auth |
|---|---|---|
| GET | `/health` | No |

### Autenticación — `/api/auth`

| Método | Ruta | Body | Auth |
|---|---|---|---|
| POST | `/auth/register` | `email, password, role` | No |
| POST | `/auth/verify-otp` | `userId, code` | No |
| POST | `/auth/resend-otp` | `userId` | No |
| POST | `/auth/login` | `email, password` | No |
| POST | `/auth/logout` | — | No |
| POST | `/auth/forgot-password` | `email` | No |
| POST | `/auth/reset-password` | `token, newPassword` | No |

### Perfiles — `/api/profile`

| Método | Ruta | Roles | Notas |
|---|---|---|---|
| GET | `/profile/candidate` | STUDENT, GRADUATE | |
| PUT | `/profile/candidate` | STUDENT, GRADUATE | upsert |
| POST | `/profile/candidate/cv` | STUDENT, GRADUATE | campo `cv`, PDF máx 5MB, extracción IA |
| POST | `/profile/candidate/photo` | STUDENT, GRADUATE | campo `photo`, imagen máx **2MB** |
| POST | `/profile/candidate/extract-cv` | STUDENT, GRADUATE | Re-procesar CV ya subido |
| GET | `/profile/company` | COMPANY | |
| PUT | `/profile/company` | COMPANY | upsert |
| POST | `/profile/company/logo` | COMPANY | campo `logo`, imagen máx 2MB |

### Ranking — `/api/ranking`

| Método | Ruta | Roles |
|---|---|---|
| GET | `/ranking/me` | STUDENT, GRADUATE |
| POST | `/ranking/recalculate` | STUDENT, GRADUATE |
| GET | `/ranking/:userId` | COMPANY, ADMIN |

### Vacantes — `/api/jobs`

| Método | Ruta | Roles | Notas |
|---|---|---|---|
| GET | `/jobs` | Autenticado | Filtros abajo |
| GET | `/jobs/company/mine` | COMPANY | |
| GET | `/jobs/:id` | Autenticado | |
| POST | `/jobs` | COMPANY | Dispara webhook n8n en background |
| PUT | `/jobs/:id` | COMPANY | Verifica ownership |
| PATCH | `/jobs/:id/status` | COMPANY | |
| POST | `/jobs/:id/apply` | STUDENT, GRADUATE | Score híbrido |
| GET | `/jobs/:id/applicants` | COMPANY | Ordenados por score |

**Query params en `GET /jobs`:** `search`, `area`, `workMode`, `type`, `budgetMin`, `budgetMax`, `skills` (coma), `page`, `limit`

### Postulaciones — `/api/applications`

| Método | Ruta | Roles |
|---|---|---|
| GET | `/applications/me` | STUDENT, GRADUATE |
| PATCH | `/applications/:id/status` | COMPANY |

*(También: `POST /jobs/:id/apply` y `GET /jobs/:id/applicants` en router de jobs.)*

### Keywords — `/api/keywords`

| Método | Ruta | Query | Auth |
|---|---|---|---|
| GET | `/keywords` | `?type=TECHNICAL\|SOFT\|LANGUAGE` | Sí |

### Notificaciones — `/api/notifications`

| Método | Ruta | Auth | Consumidor |
|---|---|---|---|
| GET | `/notifications/jobs/:id/candidates` | **Sin JWT** (pendiente: secret) | n8n |
| POST | `/notifications/telegram/register` | **Sin JWT** (pendiente: hardening) | Bot Telegram |
| PATCH | `/notifications/preferences` | JWT candidato | Frontend perfil |

Body `POST /telegram/register`: `{ userId, chatId }`

### Contratos, pagos y entregables — `/api/contracts`

| Método | Ruta | Roles | Notas |
|---|---|---|---|
| GET | `/contracts` | Autenticado | Lista con `paidAmount`, `remainingAmount`, `_count` |
| GET | `/contracts/:id` | Autenticado | Detalle enriquecido + entregables |
| POST | `/contracts` | COMPANY | Body validado con Zod; requiere candidato SELECTED |
| POST | `/contracts/:id/file` | COMPANY | campo **`file`** (PDF), bucket `contracts` |
| PATCH | `/contracts/:id/confirm` | STUDENT, GRADUATE | Requiere PDF subido por empresa |
| PATCH | `/contracts/:id/cancel` | COMPANY | Solo PENDING_CANDIDATE o ACTIVE |
| PATCH | `/contracts/:id/complete` | COMPANY | Valida entregables y pagos |
| POST | `/contracts/:id/payments` | COMPANY | Valida monto vs total pendiente |
| POST | `/contracts/payments/:id/receipt` | COMPANY | campo `receipt`, confirma pago |
| GET | `/contracts/:id/deliverables` | COMPANY, STUDENT, GRADUATE | Lista entregables |
| POST | `/contracts/:id/deliverables` | COMPANY | Crear hito/entregable |
| POST | `/contracts/deliverables/:id/submit` | STUDENT, GRADUATE | campo `file` + `candidateNotes` |
| PATCH | `/contracts/deliverables/:id/review` | COMPANY | `{ status: APPROVED\|REJECTED, companyFeedback? }` |

**Body `POST /contracts`:** `candidateId`, `title`, `startDate`, `endDate`, `totalAmount`, opcionales: `jobId`, `description`, `deliverables`, `paymentScheme`, `items[]`

**Ciclo de estados:** `PENDING_CANDIDATE` → `ACTIVE` (confirmación candidato) → `COMPLETED` | `CANCELLED`

---

## Supabase Storage

- Buckets públicos con políticas `anon` INSERT + SELECT
- Multer `memoryStorage` — el buffer se sube directo a Supabase
- URL pública: `https://{project}.supabase.co/storage/v1/object/public/{bucket}/{fileName}`

| Bucket | Uso | Paths |
|---|---|---|
| `cvs` | CVs PDF de candidatos | `{userId}_{timestamp}.pdf` |
| `avatars` | Fotos de perfil | `{userId}.{ext}` |
| `logos` | Logos de empresa | `{userId}.{ext}` |
| `contracts` | PDFs de contrato, comprobantes, entregables | `contract_{id}.pdf`, `receipt_{id}.pdf`, `deliverable_{id}.pdf` |

- CV → `candidateProfile.cvUrl`
- Contrato → `contract.contractFileUrl`
- Comprobante → `payment.receiptUrl`
- Entregable → `deliverable.fileUrl`

---

## Motor de ranking — Arquitectura híbrida

### Dos contextos de puntaje (no confundir)

| Contexto | Dónde | Pesos |
|---|---|---|
| **Perfil global** | `ProfileScore` vía `ranking.service` | `DEFAULT_WEIGHTS` en `lib/ranking.ts` |
| **Al postular** | `Application.scoreAtApply` | `JobRankConfig` de la vacante o defaults del job service |

`DEFAULT_WEIGHTS` (perfil global en código):

```
skills 0.20 | experience 0.20 | education 0.20 | certs 0.10 | reputation 0.10 | completion 0.20
```

`JobRankConfig` (por vacante, si la empresa personaliza):

```
skills 0.30 | experience 0.25 | education 0.15 | certs 0.10 | reputation 0.10 | languages 0.05 | completion 0.05
```

> Al postular, `application.service` mapea `JobRankConfig` a `RankingWeights`.
> El campo `languagesWeight` del schema no tiene columna separada en el cálculo
> actual — queda absorbido en la capa de certs/IA.

### Score final al postular

1. **Capa 1 (40%)** — `calculateScore()` en `lib/ranking.ts`
2. **Capa 2 (60%)** — `scoreCompatibility()` en `lib/gemini.ts`
3. **Combinación** — `combineScores(base, ai)` → guardado en `scoreAtApply`, `aiReasons`, `aiGaps`

Si Gemini falla: score neutro **50**, no bloquea la postulación.
Rate limit 429: hasta 3 reintentos con backoff.

### CV Intelligence (upload de CV)

1. `pdf-parse` extrae texto
2. Gemini estructura skills, softSkills, languages, certs, projects, summary
3. Normalización contra tabla `keywords` (nombre canónico o alta nueva)
4. Perfil actualizado + recálculo de `ProfileScore`

---

## Notificaciones — n8n y Telegram

### Flujo al publicar vacante

```
POST /api/jobs  →  job.service.createJob()
                 →  triggerNotificationWebhook(jobId)  [background, no bloquea]
                 →  POST N8N_WEBHOOK_URL { jobId }
                 →  n8n llama GET /api/notifications/jobs/:id/candidates
                 →  n8n envía Telegram a candidatos elegibles
```

### Criterios actuales en `getCandidatesToNotify`

- `notificationsEnabled: true`
- `telegramChatId` no nulo
- `ProfileScore.totalScore >= 50` (umbral en código; alinear con producto si cambia)

### Campos en `CandidateProfile`

- `notificationsEnabled` (default `true`)
- `notificationChannel` (default `"telegram"`)
- `telegramChatId`

---

## Archivos por módulo — mapa completo

```
src/
├── app.ts
│   └── CORS, JSON, rutas: auth, profile, ranking, jobs,
│       applications, keywords, notifications, contracts
│
├── lib/
│   ├── prisma.ts          → singleton PrismaClient
│   ├── jwt.ts             → signToken, verifyToken, JwtPayload
│   ├── mailer.ts          → sendOtpEmail, sendResetEmail
│   ├── supabase.ts        → cliente Storage
│   ├── ranking.ts         → calculateScore, combineScores, DEFAULT_WEIGHTS
│   ├── gemini.ts          → scoreCompatibility, extractCvIntelligent
│   ├── cv-extractor.ts    → extractCvKeywords (pdf-parse + keywords BD)
│   ├── contract-helpers.ts → pickUploadedFile, computePaymentTotals
│   └── validators/
│       └── contract.validators.ts → schemas Zod contratos/pagos/entregables
│
├── middlewares/
│   ├── auth.middleware.ts → authenticate, authorize, AuthRequest
│   ├── upload.middleware.ts → uploadCv, uploadPhoto, uploadDocument, uploadContractFile
│   └── upload-error.middleware.ts → handleMulterError (mensajes en español)
│
├── services/
│   ├── auth.service.ts
│   ├── profile.service.ts
│   ├── ranking.service.ts
│   ├── job.service.ts           → importa notification.service (webhook)
│   ├── application.service.ts   → ranking + gemini al postular
│   ├── notification.service.ts  → candidatos elegibles, n8n, Telegram
│   ├── contract.service.ts      → contratos, pagos, ciclo de vida
│   └── deliverable.service.ts   → entregables, submit, review
│
├── controllers/
│   ├── auth.controller.ts
│   ├── profile.controller.ts
│   ├── ranking.controller.ts
│   ├── job.controller.ts
│   ├── application.controller.ts
│   ├── notification.controller.ts
│   ├── contract.controller.ts
│   └── deliverable.controller.ts
│
└── routes/
    ├── auth.routes.ts
    ├── profile.routes.ts
    ├── ranking.routes.ts
    ├── job.routes.ts              → incluye apply + applicants
    ├── application.routes.ts
    ├── keyword.routes.ts          → ⚠ excepción: Prisma inline
    ├── notification.routes.ts
    └── contract.routes.ts         → contratos + pagos + entregables
```

---

## Seed de datos

Archivo: `prisma/seed.ts`

```bash
npx prisma db seed
```

- ~120 keywords por tipo y categoría
- `upsert` — seguro ejecutar varias veces
- Requiere `tsconfig.seed.json` (`rootDir: "."`)

---

## Patrón para agregar nuevos módulos

```
1. Modelos en schema.prisma
2. npx prisma migrate dev --name descripcion_clara
3. npx prisma generate
4. src/services/nombre.service.ts
5. src/controllers/nombre.controller.ts
6. src/routes/nombre.routes.ts
7. Registrar en src/app.ts
8. Probar (Postman / Thunder Client)
9. Commit + PR → develop
10. Actualizar este AGENTS.md (estado, endpoints, mapa)
```

Para endpoints con body: definir schema **Zod** en el controller (objetivo del equipo).

---

## Deuda técnica conocida

Registrar aquí evita que agentes “arreglen” cosas sin contexto del sprint.

| Item | Prioridad | Notas |
|---|---|---|
| `/notifications/*` sin API key / secret | Alta | Endpoints públicos sensibles |
| `POST /telegram/register` sin validar identidad | Alta | Cualquiera puede vincular chatId a un userId |
| Zod solo en módulo contratos | Media | Extender a auth, jobs, profile |
| `keyword.routes.ts` rompe capas | Media | Mover a service + controller |
| Tests inexistentes | Media | Priorizar auth, apply, contracts |
| `err: any` en controllers legacy | Baja | Migrar a `unknown` |
| Roles ADMIN / INSTITUTION sin API | Sprint 4 | Solo en schema |
| UI entregables en frontend | Sprint 3 | Oscar — endpoints listos |

---

## Notas para agentes de IA

- **No sugerir Prisma 7** bajo ninguna circunstancia
- **No usar `any`** sin comentario justificando
- **No mezclar capas** — controller sin Prisma directo (salvo refactor de keywords)
- **No crear rutas en `app.ts`** — usar `routes/`
- **No hardcodear secretos** — `process.env`
- **No editar migraciones viejas** — solo agregar nuevas
- **Perfiles siempre con `upsert`**
- **Errores al usuario en español**; códigos internos en `UPPER_SNAKE_CASE`
- **Storage sin subcarpetas** en paths de Supabase
- **pdf-parse:** `require('pdf-parse/lib/pdf-parse.js')`
- Al agregar endpoint: actualizar tablas de *Endpoints* y *Mapa de archivos* en este documento
- Al cerrar sprint: actualizar *Estado del proyecto* y *Deuda técnica*
- **Gemini:** no bloquear flujos críticos si la API falla — degradar con valores neutros
- **Webhooks n8n:** fallo silencioso en `triggerNotificationWebhook` — no revertir creación de vacante
