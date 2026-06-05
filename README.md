# TalentBridge

Plataforma web de gestión de talento universitario que conecta estudiantes y egresados del departamento del Cesar (Colombia) con empresas que requieren perfiles calificados para proyectos, microtrabajos o contrataciones formales.

## Integrantes

| Nombre | Rol |
|---|---|
| Josheph Javier Martínez Tapias | Backend Developer / Scrum Master |
| Oscar Daniel Duque | Frontend Developer / Product Owner |
| Sebastián Carrillo | Frontend Developer / n8n Integration |

## Stack tecnológico

| Capa | Tecnologías |
|---|---|
| **Frontend** | Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · React Query · Axios |
| **Backend** | Node.js 24 · Express 5 · TypeScript · Prisma 6.5 · bcrypt · JWT |
| **Base de datos** | PostgreSQL (Supabase) |
| **Archivos** | Supabase Storage (CVs, avatares, logos, contratos) |
| **Correo** | Brevo API HTTPS (OTP y recuperación de contraseña) |
| **IA** | Google Gemini (ranking al postular, extracción de CV) |
| **Automatización** | n8n + Telegram (notificaciones de vacantes) |
| **Despliegue** | Vercel (frontend) · Railway (backend) |

## Estructura del proyecto

```
talentbridge/
├── backend/          # API REST (Express + Prisma)
│   ├── prisma/       # schema, migraciones y seed
│   ├── src/          # routes → controllers → services
│   └── AGENTS.md     # Convenciones y estado del backend
├── frontend/         # App web (Next.js App Router)
│   ├── app/          # Rutas por rol (dashboard, admin, institution, auth)
│   ├── src/          # hooks, context, componentes, lib/api
│   └── AGENTS.md     # Convenciones y estado del frontend
└── README.md
```

## Roles y paneles

| Rol | Panel | Descripción |
|---|---|---|
| `STUDENT` / `GRADUATE` | `/dashboard/candidate` | Perfil, explorar vacantes, postulaciones, contratos |
| `COMPANY` | `/dashboard/company` | Vacantes, postulantes, talento, contratos, beneficios tributarios |
| `INSTITUTION` | `/institution` | Dashboard, egresados vinculados, empleabilidad, reportes PDF |
| `ADMIN` | `/admin` | Usuarios, vacantes, universidades, carreras, pesos de ranking |

## Instalación local

### Requisitos

- Node.js **24+** y npm **11+**
- Proyecto en Supabase (PostgreSQL + Storage) con buckets `cvs`, `avatars`, `logos`, `contracts`
- API key de Google Gemini
- Cuenta Brevo con remitente verificado (API key v3)

### 1. Variables de entorno

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Completa ambos archivos antes de arrancar. Ver tablas en `backend/AGENTS.md` y `frontend/AGENTS.md`.

### 2. Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed    # keywords + universidades + carreras
npm run dev           # http://localhost:3001
```

Health check: `GET http://localhost:3001/api/health`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev           # http://localhost:3000
```

El frontend consume la API vía `NEXT_PUBLIC_API_URL` (por defecto `http://localhost:3001/api`).

## Scripts útiles

| Comando | Dónde | Uso |
|---|---|---|
| `npm run dev` | backend / frontend | Desarrollo local |
| `npm run build` | backend / frontend | Build de producción |
| `npm start` | backend | Servidor compilado (`dist/server.js`) |
| `npm start` | frontend | Next.js en producción |
| `npx prisma db seed` | backend | Catálogo inicial (keywords, universidades, carreras) |
| `npx prisma migrate deploy` | backend | Aplicar migraciones en producción |
| `npm test` | backend | Tests de slugs/credenciales institución |

## Despliegue (Vercel + Railway)

### Checklist previo al merge a `main`

- [ ] Migraciones Prisma probadas (`migrate deploy` en staging)
- [ ] Seed ejecutado al menos una vez (catálogo universidades/carreras)
- [ ] Variables de entorno de producción configuradas en Railway y Vercel
- [ ] `FRONTEND_URL` en backend = URL pública del frontend (CORS)
- [ ] `NEXT_PUBLIC_API_URL` en frontend = URL pública del backend + `/api`
- [ ] Buckets y políticas de Supabase Storage activos
- [ ] Remitente Brevo verificado y `BREVO_API_KEY` operativa
- [ ] `GEMINI_API_KEY` con cuota suficiente
- [ ] `N8N_WEBHOOK_URL` y `N8N_WEBHOOK_SECRET` si se usan notificaciones

### Backend (Railway)

1. Conectar repositorio y seleccionar directorio `backend/`
2. Variables obligatorias: `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `FRONTEND_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `GEMINI_API_KEY`, `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`
3. Comandos recomendados:
   - **Build:** `npm install && npx prisma generate && npm run build`
   - **Release / start:** `npx prisma migrate deploy && npm start`
4. Exponer el servicio y usar esa URL como base del API (`https://tu-api.railway.app/api`)

### Frontend (Vercel)

1. Conectar repositorio y seleccionar directorio `frontend/`
2. Variable: `NEXT_PUBLIC_API_URL=https://tu-api.railway.app/api`
3. Framework preset: **Next.js** (build y output automáticos)
4. Tras el deploy, actualizar `FRONTEND_URL` en Railway con la URL de Vercel

### Flujo Git

```
feature/* → develop (PR + revisión) → main (release / producción)
```

No hacer push directo a `develop` ni `main`.

## Documentación para desarrolladores

- [backend/AGENTS.md](backend/AGENTS.md) — arquitectura, endpoints, Prisma, variables, deuda técnica
- [frontend/AGENTS.md](frontend/AGENTS.md) — rutas, hooks React Query, convenciones UI

## Licencia

Proyecto académico — Universidad Popular del Cesar.
