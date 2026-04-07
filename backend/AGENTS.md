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
| PostgreSQL | 16.x | Alojado en Neon |
| bcryptjs | 2.x | Para hashing de contraseñas |
| jsonwebtoken | 9.x | Para JWT |
| nodemailer | Latest | Para envío de correos |
| multer | 2.x | Para carga de archivos |
| zod | 3.x | Para validación de esquemas |
| uuid | 9.x | Para generación de IDs |

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

## Arquitectura del backend

El backend sigue una arquitectura en capas estricta. Cada capa tiene una
responsabilidad única y no debe mezclar responsabilidades con otras capas.
backend/
├── src/
│   ├── routes/          # Solo define URLs y conecta con controllers
│   ├── controllers/     # Recibe req, extrae datos, llama service, devuelve res
│   ├── services/        # Lógica de negocio pura — no importa nada de Express
│   ├── middlewares/     # Funciones intermedias (autenticación, uploads)
│   └── lib/             # Utilidades singleton (Prisma, JWT, Mailer)
├── prisma/
│   ├── schema.prisma    # Definición del modelo de datos
│   └── migrations/      # Historial de migraciones — nunca editar manualmente
├── uploads/             # CVs en PDF — solo en desarrollo, no en producción
├── .env                 # Variables de entorno — NUNCA subir al repo
├── .env.example         # Plantilla de variables — SÍ subir al repo
├── nodemon.json         # Configuración de nodemon para desarrollo
├── tsconfig.json        # Configuración de TypeScript
└── package.json         # Dependencias y scripts

### Reglas de la arquitectura en capas

- **routes** importa solo controllers y middlewares
- **controllers** importan solo services y tipos de middlewares
- **services** importan solo lib/prisma y lib/mailer y lib/jwt
- **lib** no importa nada del proyecto — solo librerías externas
- **middlewares** importan solo lib/jwt
- Ninguna capa salta otra — un controller nunca usa prisma directamente

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
throw new Error('INVALID_CREDENTIALS');

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
Los códigos de error internos (los que lanza el service) van en **inglés** en mayúsculas.

### Commits

Seguir la convención Conventional Commits:
tipo(scope): descripción en imperativo en español o inglés
Tipos válidos:
feat      → nueva funcionalidad
fix       → corrección de bug
chore     → configuración, dependencias, tareas de mantenimiento
refactor  → refactorización sin cambio de comportamiento
docs      → documentación
style     → formato, espaciado (no afecta lógica)
test      → pruebas

Ejemplos reales del proyecto:
feat(auth): agregar endpoint POST /auth/register con validación OTP
fix(auth): corregir expiración incorrecta del token de reset
chore(deps): fijar Prisma a versión 6.5.0
docs: actualizar README con endpoints de perfiles

---

## Control de versiones — Git Flow

Ramas permanentes:
- `main` — producción estable, protegida, solo recibe merges desde develop
- `develop` — rama de integración, protegida

Ramas temporales:
- `feature/nombre-descriptivo` — desarrollo de funcionalidades
- `hotfix/nombre` — correcciones urgentes en producción

Flujo obligatorio:

git checkout develop && git pull origin develop
git checkout -b feature/nombre
[desarrollo + commits pequeños y descriptivos]
git push -u origin feature/nombre
Pull Request en GitHub: feature/nombre → develop
Revisión de al menos un integrante
Merge a develop
Eliminar rama feature local y remota


**Nunca hacer push directo a develop o main.**

---

## Variables de entorno

Todas las variables sensibles van en `.env` (no se sube al repo).
El archivo `.env.example` (sí se sube) documenta las claves requeridas.

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor (default: 3001) |
| `NODE_ENV` | `development` o `production` |
| `DATABASE_URL` | Connection string de PostgreSQL en Neon |
| `JWT_SECRET` | Secreto para firmar tokens JWT |
| `JWT_EXPIRES_IN` | Duración del JWT (ej: `7d`) |
| `OTP_EXPIRES_MINUTES` | Minutos de validez del OTP (default: 10) |
| `RESET_TOKEN_EXPIRES_MINUTES` | Minutos de validez del token de reset (default: 15) |
| `FRONTEND_URL` | URL del frontend para configurar CORS |
| `SMTP_HOST` | Host SMTP de Mailtrap |
| `SMTP_PORT` | Puerto SMTP de Mailtrap (2525 en dev) |
| `SMTP_USER` | Usuario SMTP de Mailtrap |
| `SMTP_PASS` | Contraseña SMTP de Mailtrap |
| `SMTP_FROM` | Correo remitente (ej: noreply@talentbridge.co) |

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
```

### Modelos implementados

#### User
Tabla central del sistema. Todo usuario tiene un rol y un estado de verificación.
- `isVerified: false` hasta que complete la verificación OTP
- `isActive: false` si fue suspendido por un administrador
- Relaciones: tiene un OtpCode, un ResetToken, y opcionalmente un CandidateProfile o CompanyProfile

#### OtpCode
Código de 6 dígitos enviado al correo al registrarse.
- Expira en 10 minutos (`OTP_EXPIRES_MINUTES`)
- Se marca como `used: true` al verificarse — no se elimina para mantener auditoría
- Un usuario puede tener múltiples OTPs (al reenviar se crea uno nuevo)

#### ResetToken
Token UUID enviado al correo para recuperar contraseña.
- Expira en 15 minutos (`RESET_TOKEN_EXPIRES_MINUTES`)
- Se marca como `used: true` al usarse

#### CandidateProfile
Perfil profesional de estudiantes y egresados.
- Relación 1:1 con User
- `skills` y `softSkills` son arrays de strings en PostgreSQL
- `languages`, `projects` y `certifications` son JSON con estructura flexible
- `cvUrl` almacena la ruta al CV en PDF
- Se crea/actualiza con `upsert` — nunca con `create` + `update` separados

#### CompanyProfile
Perfil corporativo de empresas.
- Relación 1:1 con User
- Se crea/actualiza con `upsert`

---

## Endpoints implementados

### Base URL en desarrollo
http://localhost:3001/api

### Autenticación — `/api/auth`

| Método | Ruta | Descripción | Body requerido |
|---|---|---|---|
| POST | `/auth/register` | Registra usuario y envía OTP | `email, password, role` |
| POST | `/auth/verify-otp` | Verifica OTP y activa cuenta | `userId, code` |
| POST | `/auth/resend-otp` | Reenvía OTP al correo | `userId` |
| POST | `/auth/login` | Autentica y devuelve JWT | `email, password` |
| POST | `/auth/logout` | Cierra sesión (stateless) | ninguno |
| POST | `/auth/forgot-password` | Envía enlace de recuperación | `email` |
| POST | `/auth/reset-password` | Cambia la contraseña | `token, newPassword` |

### Perfiles — `/api/profile`

Todas requieren `Authorization: Bearer TOKEN` en el header.

| Método | Ruta | Descripción | Roles |
|---|---|---|---|
| GET | `/profile/candidate` | Consultar perfil candidato | STUDENT, GRADUATE |
| PUT | `/profile/candidate` | Crear o actualizar perfil candidato | STUDENT, GRADUATE |
| POST | `/profile/candidate/cv` | Subir CV en PDF (máx 5MB) | STUDENT, GRADUATE |
| GET | `/profile/company` | Consultar perfil empresa | COMPANY |
| PUT | `/profile/company` | Crear o actualizar perfil empresa | COMPANY |

---

## Archivos por módulo — mapa completo
src/
├── app.ts
│   └── Entrada de la aplicación. Registra middlewares globales y rutas.
│       Importa: express, cors, dotenv, authRoutes, profileRoutes
│
├── lib/
│   ├── prisma.ts
│   │   └── Singleton del cliente de Prisma. Evita múltiples conexiones en dev.
│   ├── jwt.ts
│   │   └── signToken(payload) y verifyToken(token). Usa JWT_SECRET del .env.
│   └── mailer.ts
│       └── Transporter de Nodemailer con Mailtrap SMTP.
│           Exporta: sendOtpEmail(to, code), sendResetEmail(to, token)
│
├── middlewares/
│   ├── auth.middleware.ts
│   │   └── authenticate — verifica JWT en header Authorization
│   │       authorize(...roles) — verifica que el rol del usuario esté permitido
│   │       Extiende Request con AuthRequest que incluye req.user
│   └── upload.middleware.ts
│       └── Configuración de Multer con memoryStorage.
│           uploadCv — acepta solo PDF, máximo 5MB
│
├── services/
│   ├── auth.service.ts
│   │   └── registerUser, verifyOtp, resendOtp, loginUser,
│   │       forgotPassword, resetPassword
│   └── profile.service.ts
│       └── getCandidateProfile, upsertCandidateProfile,
│           getCompanyProfile, upsertCompanyProfile, saveCvLocally
│
├── controllers/
│   ├── auth.controller.ts
│   │   └── register, verifyOtp, resendOtp, login, logout,
│   │       forgotPassword, resetPassword
│   └── profile.controller.ts
│       └── getCandidateProfile, updateCandidateProfile, uploadCv,
│           getCompanyProfile, updateCompanyProfile
│
└── routes/
├── auth.routes.ts
│   └── POST /register, /verify-otp, /resend-otp, /login,
│       /logout, /forgot-password, /reset-password
└── profile.routes.ts
└── GET|PUT /candidate, POST /candidate/cv,
GET|PUT /company

---

## Servicio de correo

### Desarrollo — Mailtrap
En desarrollo todos los correos son capturados por Mailtrap sin llegar
a destinatarios reales. Todos los correos enviados a cualquier dirección
aparecen en el dashboard de Mailtrap → My First Inbox.

Configuración SMTP:
- Host: `sandbox.smtp.mailtrap.io`
- Port: `2525`
- Credenciales: desde mailtrap.io → My First Inbox → SMTP Settings → Nodemailer

### Producción — Resend (pendiente)
En producción se usará Resend con dominio verificado. Requiere cambiar
las variables `SMTP_*` del `.env` de producción.

---

## Patrones a seguir al agregar nuevos módulos

Cuando se agregue un nuevo módulo (ej: vacantes, contratos, postulaciones),
seguir exactamente este orden:

Agregar modelos al schema.prisma
Ejecutar: npx prisma migrate dev --name nombre_descriptivo
Ejecutar: npx prisma generate
Crear src/services/nombre.service.ts
Crear src/controllers/nombre.controller.ts
Crear src/routes/nombre.routes.ts
Registrar las rutas en src/app.ts
Probar con Thunder Client o Postman
Commit + PR → develop
Actualizar este AGENTS.md


---

## Lo que NO está implementado aún

Los siguientes módulos están planificados en sprints futuros y no deben
asumirse como existentes:

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
- Al agregar un endpoint nuevo, agregarlo también a la tabla de endpoints de este archivo en la sección correspondiente