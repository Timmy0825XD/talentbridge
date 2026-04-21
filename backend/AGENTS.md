


# AGENTS.md — TalentBridge Backend

Este archivo define las convenciones, arquitectura, stack y estado actual
del backend de TalentBridge. Debe ser leído por cualquier agente de IA
antes de sugerir, generar o modificar código en este proyecto.

---

## Identidad del proyecto

**TalentBridge** es una plataforma web de gestión de talento universitario
que conecta estudiantes y egresados del departamento del Cesar (Colombia)
con empresas que requieren perfiles calificados para proyectos, microtrabajos
o contrataciones formales.

Este backend expone una API REST que sirve al frontend de Next.js y a los
flujos de automatización de n8n.

---

## Stack tecnológico — versiones exactas

| Tecnología | Versión | Notar |
|---|---|---|
| Node.js | 24.x | Gestionado con fnm |
| npm | 11.x | |
| TypeScript | 6.x | Strict mode activado |
| Express | 5.x | |
| Prisma ORM | 6.5.0 | **NUNCA actualizar a Prisma 7** |
| @prisma/client | 6.5.0 | Debe coincidir exactamente con prisma |
| PostgreSQL | 16.x | Alojado en Supabase |
| @supabase/supabase-js | Latest | Para Supabase Storage |
| bcryptjs | 2.x | Para hashing de contraseñas |
| jsonwebtoken | 9.x | Para JWT |
| nodemailer | Latest | Para envío de correos |
| multer | 2.x | Para recibir archivos en el servidor |
| zod | 3.x | Para validación de esquemas |
| uuid | 9.x | Para generación de IDs |
| pdf-parse | 1.1.1 | Extracción de texto de PDFs — usar `require('pdf-parse/lib/pdf-parse.js')` directamente |

### Advertencia crítica sobre Prisma

Prisma 7 introdujo cambios incompatibles con este proyecto:
- Ya no acepta `url` en el datasource del `schema.prisma`
- Requiere un archivo `prisma.config.ts` separado
- El paquete PSL cambió su comportamiento

**Prisma debe permanecer fijado en 6.5.0.** Si se detecta una versión
diferente, no actualizar — reportar al Scrum Master.

La extensión de Prisma en VS Code debe estar fijada a comportamiento de
Prisma 6 ejecutando desde la paleta de comandos:
`Prisma: Pin the current workspace to Prisma 6`

---

## Sistema operativo del equipo

Los tres integrantes trabajan en **Windows** con **Git Bash** como terminal.
Todos los comandos y rutas deben ser compatibles con Windows.

---

## Servicios externos

| Servicio | Uso | Plan |
|---|---|---|
| Supabase | Base de datos PostgreSQL + Storage de CVs | Gratuito |
| Mailtrap | Envío de correos en desarrollo | Gratuito |

### Supabase

- Base de datos: PostgreSQL alojado en Supabase (región São Paulo)
- Storage: bucket `cvs` para almacenar las hojas de vida en PDF
- El bucket `cvs` tiene políticas RLS configuradas para permitir INSERT y SELECT a `anon`
- La conexión a la BD se hace via `DATABASE_URL` con la connection string de Supabase
- El cliente de Supabase Storage se inicializa en `src/lib/supabase.ts` con `SUPABASE_URL` y `SUPABASE_ANON_KEY`
- Los archivos se suben directamente al bucket sin subcarpetas — el path es solo el nombre del archivo

### Mailtrap

- Solo se usa en desarrollo para capturar correos sin enviarlos a destinatarios reales
- Configurado via SMTP en `src/lib/mailer.ts` usando Nodemailer
- En producción se reemplazará por Resend con dominio verificado

---

## Arquitectura del backend

El backend sigue una arquitectura en capas estricta. Cada capa tiene una
responsabilidad única y no debe mezclar responsabilidades con otras capas.

```
backend/
├── src/
│   ├── routes/          # Solo define URLs y conecta con controllers
│   ├── controllers/     # Recibe req, extrae datos, llama service, devuelve res
│   ├── services/        # Lógica de negocio pura — no importa nada de Express
│   ├── middlewares/     # Funciones intermedias (autenticación, uploads)
│   └── lib/             # Utilidades singleton (Prisma, JWT, Mailer, Supabase)
├── prisma/
│   ├── schema.prisma    # Definición del modelo de datos
│   └── migrations/      # Historial de migraciones — nunca editar manualmente
├── .env                 # Variables de entorno — NUNCA subir al repo
├── .env.example         # Plantilla de variables — SÍ subir al repo
├── nodemon.json         # Configuración de nodemon para desarrollo
├── tsconfig.json        # Configuración de TypeScript
└── package.json         # Dependencias y scripts
```

### Reglas de la arquitectura en capas

- **routes** importa solo controllers y middlewares
- **controllers** importan solo services y tipos de middlewares
- **services** importan solo lib/prisma, lib/mailer, lib/jwt y lib/supabase
- **lib** no importa nada del proyecto — solo librerías externas
- **middlewares** importan solo lib/jwt
- Ninguna capa salta otra — un controller nunca usa prisma o supabase directamente

---

## Convenciones de código

### Nomenclatura

- Archivos: `kebab-case` → `auth.service.ts`, `upload.middleware.ts`
- Funciones exportadas: `camelCase` → `registerUser`, `getCandidateProfile`
- Interfaces y tipos: `PascalCase` → `JwtPayload`, `AuthRequest`
- Variables de entorno: `UPPER_SNAKE_CASE` → `JWT_SECRET`, `DATABASE_URL`
- Tablas de BD (Prisma @@map): `snake_case` → `users`, `otp_codes`
- Modelos de Prisma: `PascalCase` → `User`, `OtpCode`, `CandidateProfile`

### TypeScript

- **Strict mode** activado — no usar `any` salvo casos justificados con comentario
- Siempre tipar los parámetros y retornos de funciones exportadas
- Usar `interface` para tipos de objetos, `type` para uniones y alias simples
- No usar `as any` — preferir `as unknown as T` si es absolutamente necesario

### Manejo de errores en services

Los services lanzan errores con códigos string en mayúsculas. Los controllers
los capturan y los convierten en respuestas HTTP apropiadas:

```typescript
// En el service — lanzar error con código
throw new Error('EMAIL_TAKEN');
throw new Error('OTP_INVALID');
throw new Error('STORAGE_UPLOAD_FAILED');

// En el controller — capturar y responder
if (err.message === 'EMAIL_TAKEN')
  return res.status(409).json({ error: 'El correo ya está registrado.' });
```

Códigos de error HTTP usados:

| Código | Cuándo usarlo |
|---|---|
| 200 | Operación exitosa |
| 201 | Recurso creado exitosamente |
| 400 | Error del cliente — datos inválidos |
| 401 | No autenticado — token ausente o inválido |
| 403 | No autorizado — token válido pero sin permisos |
| 404 | Recurso no encontrado |
| 409 | Conflicto — recurso ya existe |
| 500 | Error interno del servidor |

### Respuestas HTTP

Siempre responder con JSON. Estructura estándar:

```typescript
// Éxito
res.status(200).json({ message: 'Descripción clara de lo que ocurrió.' });
res.status(201).json({ message: '...', data: resultado });

// Error
res.status(4xx).json({ error: 'Mensaje claro para el usuario.' });
```

Los mensajes de error deben estar en **español** — son los que ve el usuario final.
Los códigos de error internos van en **inglés** en UPPER_SNAKE_CASE.

### Commits

Seguir la convención Conventional Commits:

```
tipo(scope): descripción en imperativo

Tipos válidos:
  feat      → nueva funcionalidad
  fix       → corrección de bug
  chore     → configuración, dependencias, tareas de mantenimiento
  refactor  → refactorización sin cambio de comportamiento
  docs      → documentación
  style     → formato, espaciado (no afecta lógica)
  test      → pruebas
```

---

## Control de versiones — Git Flow

Ramas permanentes:
- `main` — producción estable, protegida
- `develop` — rama de integración, protegida

Ramas temporales:
- `feature/nombre-descriptivo` — desarrollo de funcionalidades
- `hotfix/nombre` — correcciones urgentes en producción

Flujo obligatorio:
```
1. git checkout develop && git pull origin develop
2. git checkout -b feature/nombre
3. [desarrollo + commits pequeños y descriptivos]
4. git push -u origin feature/nombre
5. Pull Request en GitHub: feature/nombre → develop
6. Revisión de al menos un integrante
7. Merge a develop
8. Eliminar rama feature local y remota
```

**Nunca hacer push directo a develop o main.**

---

## Variables de entorno

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor (default: 3001) |
| `NODE_ENV` | `development` o `production` |
| `DATABASE_URL` | Connection string de PostgreSQL en Supabase |
| `JWT_SECRET` | Secreto para firmar tokens JWT |
| `JWT_EXPIRES_IN` | Duración del JWT (ej: `7d`) |
| `OTP_EXPIRES_MINUTES` | Minutos de validez del OTP (default: 10) |
| `RESET_TOKEN_EXPIRES_MINUTES` | Minutos de validez del token de reset (default: 15) |
| `FRONTEND_URL` | URL del frontend para configurar CORS |
| `SUPABASE_URL` | URL del proyecto de Supabase |
| `SUPABASE_ANON_KEY` | Clave anon pública del proyecto de Supabase |
| `SMTP_HOST` | Host SMTP de Mailtrap |
| `SMTP_PORT` | Puerto SMTP de Mailtrap (2525 en dev) |
| `SMTP_USER` | Usuario SMTP de Mailtrap |
| `SMTP_PASS` | Contraseña SMTP de Mailtrap |
| `SMTP_FROM` | Correo remitente |

---

## Modelo de datos — Prisma

### Enums

```prisma
enum Role {
  STUDENT      // Estudiante activo universitario
  GRADUATE     // Egresado de institución de educación superior
  COMPANY      // Empresa o MiPyme
  INSTITUTION  // Institución educativa
  ADMIN        // Administrador de la plataforma
}

enum KeywordType {
  TECHNICAL   // Habilidades técnicas → va a skills[]
  SOFT        // Habilidades blandas → va a softSkills[]
  LANGUAGE    // Idiomas → va a languages JSON
}

enum JobType {
  FORMAL      // Contrato formal
  FREELANCE   // Proyecto puntual / microwork
}

enum JobStatus {
  ACTIVE      // Visible para candidatos
  SELECTING   // En proceso de selección
  CLOSED      // Cerrada — ya se seleccionó
  CANCELLED   // Cancelada por la empresa
}

enum ApplicationStatus {
  RECEIVED    // Postulación recibida
  REVIEWING   // En revisión por la empresa
  SELECTED    // Candidato seleccionado
  REJECTED    // Candidato descartado
}

enum WorkMode {
  REMOTE
  ONSITE
  HYBRID
}
```



### Modelos implementados

#### User
Tabla central del sistema. Todo usuario tiene un rol y estado de verificación.
- `isVerified: false` hasta completar verificación OTP
- `isActive: false` si fue suspendido por un administrador
- Relaciones: OtpCode[], ResetToken[], CandidateProfile?, CompanyProfile?

#### OtpCode
Código de 6 dígitos enviado al correo al registrarse.
- Expira en 10 minutos
- Se marca `used: true` al verificarse — no se elimina para mantener auditoría
- Un usuario puede tener múltiples OTPs

#### ResetToken
Token UUID para recuperar contraseña.
- Expira en 15 minutos
- Se marca `used: true` al usarse

#### CandidateProfile
Perfil profesional de estudiantes y egresados.
- Relación 1:1 con User
- `skills` y `softSkills` son arrays de strings en PostgreSQL
- `languages`, `projects` y `certifications` son JSON con estructura flexible
- `cvUrl` almacena la URL pública del archivo en Supabase Storage
- Siempre se crea/actualiza con `upsert`

#### CompanyProfile
Perfil corporativo de empresas.
- Relación 1:1 con User
- Siempre se crea/actualiza con `upsert`

#### Job
Vacante publicada por una empresa.
- Estado inicial: `ACTIVE` — visible para candidatos
- Estados: `ACTIVE`, `SELECTING`, `CLOSED`, `CANCELLED`
- Tipos: `FORMAL` (contrato) o `FREELANCE` (proyecto puntual)
- `skills` es array de strings con las habilidades requeridas
- Relaciones: pertenece a `CompanyProfile`, tiene muchas `Application`, tiene un `JobRankConfig` opcional

#### Application
Postulación de un candidato a una vacante.
- Restricción única: un candidato solo puede postularse una vez por vacante (`@@unique([jobId, candidateId])`)
- `scoreAtApply` guarda el puntaje del candidato en el momento de postularse — no cambia aunque el perfil cambie después
- Estados: `RECEIVED`, `REVIEWING`, `SELECTED`, `REJECTED`

#### JobRankConfig
Pesos personalizados del motor de ranking para una vacante específica.
- Relación 1:1 con `Job`
- Si no existe config para una vacante, el motor usa los pesos globales por defecto
- La suma de todos los pesos debe ser siempre 1.0
- Pesos por defecto: skills(0.30), experience(0.25), education(0.15), certs(0.10), reputation(0.10), languages(0.05), completion(0.05)

#### ProfileScore
Puntaje calculado de un candidato.
- Relación 1:1 con `CandidateProfile`
- Se recalcula cada vez que el candidato actualiza su perfil o sube un CV
- `totalScore` es 0-100
- Guarda el desglose por cada criterio del ranking

#### Nuevos enums Sprint 2
- `JobType`: FORMAL, FREELANCE
- `JobStatus`: ACTIVE, SELECTING, CLOSED, CANCELLED  
- `ApplicationStatus`: RECEIVED, REVIEWING, SELECTED, REJECTED
- `WorkMode`: REMOTE, ONSITE, HYBRID

#### Keyword
Keywords gestionadas en BD para el extractor de CV y el motor de ranking.
- `type`: TECHNICAL → va a `skills[]`, SOFT → va a `softSkills[]`, LANGUAGE → va a `languages JSON`
- `category`: agrupa keywords por área (ej: "Desarrollo Web", "Diseño", "Administración")
- `isActive`: permite desactivar keywords sin eliminarlas — el extractor solo usa las activas
- Poblada inicialmente con `npx prisma db seed`
- Gestionable desde el panel de administrador en Sprint 4




---

## Endpoints implementados

### Base URL en desarrollo
```
http://localhost:3001/api
```

### Health check
```
GET /api/health
```

### Autenticación — `/api/auth`

| Método | Ruta | Descripción | Body requerido | Auth |
|---|---|---|---|---|
| POST | `/auth/register` | Registra usuario y envía OTP | `email, password, role` | No |
| POST | `/auth/verify-otp` | Verifica OTP y activa cuenta | `userId, code` | No |
| POST | `/auth/resend-otp` | Reenvía OTP al correo | `userId` | No |
| POST | `/auth/login` | Autentica y devuelve JWT | `email, password` | No |
| POST | `/auth/logout` | Cierra sesión stateless | ninguno | No |
| POST | `/auth/forgot-password` | Envía enlace de recuperación | `email` | No |
| POST | `/auth/reset-password` | Cambia la contraseña | `token, newPassword` | No |

### Perfiles — `/api/profile`

Todas requieren `Authorization: Bearer TOKEN` en el header.

| Método | Ruta | Descripción | Roles | Auth |
|---|---|---|---|---|
| GET | `/profile/candidate` | Consultar perfil candidato | STUDENT, GRADUATE | Sí |
| PUT | `/profile/candidate` | Crear o actualizar perfil candidato | STUDENT, GRADUATE | Sí |
| POST | `/profile/candidate/cv` | Subir CV en PDF a Supabase Storage (máx 5MB) | STUDENT, GRADUATE | Sí |
| GET | `/profile/company` | Consultar perfil empresa | COMPANY | Sí |
| PUT | `/profile/company` | Crear o actualizar perfil empresa | COMPANY | Sí |


### Extracción de CV — `/api/profile`

| Método | Ruta | Descripción | Roles | Auth |
|---|---|---|---|---|
| POST | `/profile/candidate/extract-cv` | Extrae keywords del CV manualmente y actualiza el perfil | STUDENT, GRADUATE | Sí |

### Ranking — `/api/ranking`

| Método | Ruta | Descripción | Roles | Auth |
|---|---|---|---|---|
| GET | `/ranking/me` | Consultar mi puntaje con desglose y sugerencias | STUDENT, GRADUATE | Sí |
| POST | `/ranking/recalculate` | Forzar recálculo de mi puntaje | STUDENT, GRADUATE | Sí |
| GET | `/ranking/:userId` | Consultar puntaje de un candidato específico | COMPANY, ADMIN | Sí |

### Vacantes — `/api/jobs`

| Método | Ruta | Descripción | Roles | Auth |
|---|---|---|---|---|
| GET | `/jobs` | Listar vacantes activas con filtros | Todos | Sí |
| GET | `/jobs/company/mine` | Mis vacantes publicadas | COMPANY | Sí |
| GET | `/jobs/:id` | Detalle de una vacante | Todos | Sí |
| POST | `/jobs` | Publicar nueva vacante | COMPANY | Sí |
| PUT | `/jobs/:id` | Editar vacante | COMPANY | Sí |
| PATCH | `/jobs/:id/status` | Cambiar estado de vacante | COMPANY | Sí |

**Filtros disponibles en GET /jobs:**
- `search` — búsqueda en título y descripción
- `area` — área de la vacante
- `workMode` — REMOTE, ONSITE, HYBRID
- `type` — FORMAL, FREELANCE
- `budgetMin` / `budgetMax` — rango de presupuesto
- `skills` — skills separadas por coma
- `page` / `limit` — paginación

---

## Supabase Storage — CVs

- Bucket: `cvs` (público)
- Políticas RLS: INSERT y SELECT permitidos para `anon`
- Path del archivo: `{userId}_{timestamp}.pdf` — sin subcarpetas
- URL pública formato: `https://{project}.supabase.co/storage/v1/object/public/cvs/{fileName}`
- La URL pública se guarda en `candidateProfile.cvUrl`
- Al subir un CV nuevo se reemplaza el anterior (`upsert: true`)
- El archivo se recibe en memoria con Multer (`memoryStorage`) y se envía directamente a Supabase

---

## Archivos por módulo — mapa completo

```
src/
├── app.ts
│   └── Entrada de la aplicación. Registra middlewares globales y rutas.
│       Importa: express, cors, dotenv, authRoutes, profileRoutes, rankingRoutes, jobRoutes
│
├── lib/
│   ├── prisma.ts
│   │   └── Singleton del cliente de Prisma.
│   ├── jwt.ts
│   │   └── signToken(payload) y verifyToken(token).
│   ├── mailer.ts
│   │   └── Transporter Nodemailer con Mailtrap SMTP.
│   │       Exporta: sendOtpEmail(to, code), sendResetEmail(to, token)
│   ├── supabase.ts
│   │   └── Cliente singleton de Supabase.
│   │       Exporta: supabase (instancia de createClient)
│   ├── cv-extractor.ts
│   │   └── Descarga PDF desde Supabase Storage, extrae texto con pdf-parse,
│   │       consulta keywords activas de la BD y las clasifica por tipo.
│   │       IMPORTANTE: usar require('pdf-parse/lib/pdf-parse.js') — NO import default
│   │       Exporta: extractCvKeywords(cvUrl) → ExtractedKeywords
│   │       Exporta: interface ExtractedKeywords { technical, soft, languages }
│   └── ranking.ts
│       └── Lógica pura del cálculo del puntaje — no toca la BD
│           Exporta: calculateScore(data, weights) → ScoreBreakdown
│           Exporta: DEFAULT_WEIGHTS
│           Exporta: interfaces RankingWeights, CandidateData, ScoreBreakdown
│
├── middlewares/
│   ├── auth.middleware.ts
│   │   └── authenticate — verifica JWT en header Authorization
│   │       authorize(...roles) — verifica rol del usuario
│   │       Extiende Request con AuthRequest que incluye req.user
│   └── upload.middleware.ts
│       └── uploadCv — Multer con memoryStorage, solo PDF, máx 5MB
│
├── services/
│   ├── auth.service.ts
│   │   └── registerUser, verifyOtp, resendOtp, loginUser,
│   │       forgotPassword, resetPassword
│   ├── profile.service.ts
│   │   └── getCandidateProfile, upsertCandidateProfile,
│   │       getCompanyProfile, upsertCompanyProfile,
│   │       uploadCvToStorage
│   ├── ranking.service.ts
│   │   └── Orquesta el cálculo y persiste en ProfileScore
│   │       Exporta: computeAndSaveScore(userId)
│   │       Exporta: getScoreByUserId(userId)
│   │       Exporta: getScoreByCandidateId(candidateId)
│   └── job.service.ts
│       └── createJob, listJobs, getJobById, updateJob,
│           updateJobStatus, getMyJobs
│
├── controllers/
│   ├── auth.controller.ts
│   │   └── register, verifyOtp, resendOtp, login, logout,
│   │       forgotPassword, resetPassword
│   ├── profile.controller.ts
│   │   └── getCandidateProfile, updateCandidateProfile, uploadCv,
│   │       getCompanyProfile, updateCompanyProfile
│   ├── ranking.controller.ts
│   │   └── getMyScore, getCandidateScore, recalculateMyScore
│   └── job.controller.ts
│       └── createJob, listJobs, getJobById, updateJob,
│           updateJobStatus, getMyJobs
│
└── routes/
    ├── auth.routes.ts
    │   └── POST /register, /verify-otp, /resend-otp, /login,
    │       /logout, /forgot-password, /reset-password
    ├── profile.routes.ts
    │   └── GET|PUT /candidate, POST /candidate/cv,
    │       GET|PUT /company
    ├── ranking.routes.ts
    │   └── GET /me, POST /recalculate, GET /:userId
    └── job.routes.ts
        └── GET /, GET /company/mine, GET /:id,
            POST /, PUT /:id, PATCH /:id/status

```

---

## Seed de datos

El proyecto tiene un seed inicial de keywords en `prisma/seed.ts`.

Para ejecutarlo:
```bash
npx prisma db seed
```

Esto inserta ~120 keywords clasificadas por tipo y categoría en la tabla `keywords`.
El seed usa `upsert` — es seguro ejecutarlo múltiples veces sin duplicar datos.

Requiere `tsconfig.seed.json` en la raíz de `backend/` para que `ts-node` compile
el seed correctamente con `rootDir: "."`.

---

## Patrones a seguir al agregar nuevos módulos

```
1. Agregar modelos al schema.prisma
2. Ejecutar: npx prisma migrate dev --name nombre_descriptivo
3. Ejecutar: npx prisma generate
4. Crear src/services/nombre.service.ts
5. Crear src/controllers/nombre.controller.ts
6. Crear src/routes/nombre.routes.ts
7. Registrar las rutas en src/app.ts
8. Probar con Postman
9. Commit + PR → develop
10. Actualizar este AGENTS.md
```

---

## Lo que NO está implementado aún

- Motor de ranking de perfiles (Sprint 2)
- Publicación y gestión de vacantes (Sprint 2)
- Postulaciones (Sprint 2)
- Notificaciones WhatsApp via n8n (Sprint 3)
- Contratos y seguimiento de entregas (Sprint 3)
- Registro de pagos (Sprint 3)
- Calificaciones mutuas (Sprint 4)
- Dashboards y reportes PDF (Sprint 4)
- Panel de institución educativa (Sprint 4)
- Panel de administración (Sprint 4)

---

## Notas para agentes de IA

- **No sugerir Prisma 7** bajo ninguna circunstancia
- **No usar `any` en TypeScript** sin justificación explícita en comentario
- **No mezclar capas** — un service nunca devuelve un Response de Express
- **No crear rutas directamente en app.ts** — siempre en archivos de routes separados
- **No hardcodear valores sensibles** — siempre usar `process.env.VARIABLE`
- **No eliminar migraciones existentes** — solo agregar nuevas
- **Siempre usar `upsert`** para perfiles — nunca `create` + `update` separados
- **Los mensajes de error al usuario van en español**
- **Los códigos de error internos van en inglés en UPPER_SNAKE_CASE**
- **El path de archivos en Supabase Storage no lleva subcarpetas** — solo el nombre del archivo
- Al agregar un endpoint nuevo, agregarlo también a la tabla de endpoints de este archivo


