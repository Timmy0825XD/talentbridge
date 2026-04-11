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
│   ├── app/                  # Páginas y layouts (App Router de Next.js)
│   │   ├── layout.tsx        # Layout raíz — fuentes, metadata, AuthProvider
│   │   ├── page.tsx          # Landing page público
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── verify-otp/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   └── dashboard/
│   │       ├── candidate/page.tsx   # Dashboard para STUDENT y GRADUATE
│   │       └── company/page.tsx     # Dashboard para COMPANY
│   ├── context/
│   │   └── auth-context.tsx  # Contexto global de autenticación
│   └── lib/
│       └── api.ts            # Cliente Axios centralizado con interceptores
├── .env.local                # Variables de entorno locales — NUNCA subir al repo
├── .env.example              # Plantilla de variables — SÍ subir al repo
├── next.config.ts            # Configuración de Next.js
├── postcss.config.mjs        # Configuración de PostCSS para Tailwind v4
└── package.json
```

### Reglas de arquitectura

- **Todas las páginas** van dentro de `src/app/` siguiendo el App Router de Next.js
- **Componentes de cliente** (`useState`, `useEffect`, hooks) deben tener `"use client"` al inicio
- **Componentes de servidor** no llevan `"use client"` — son el default en App Router
- **El cliente Axios** (`src/lib/api.ts`) es el único punto de comunicación con el backend — nunca usar `fetch` directamente
- **El contexto de auth** (`src/context/auth-context.tsx`) es la única fuente de verdad de la sesión
- **Nunca acceder a `localStorage` directamente** en los componentes — usar el contexto de auth

---

## Variables de entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL base de la API del backend (ej: `http://localhost:3001/api`) |

Las variables con prefijo `NEXT_PUBLIC_` son accesibles en el cliente (browser).
Las variables sin ese prefijo solo están disponibles en el servidor.

---

## Cliente Axios — src/lib/api.ts

El cliente Axios está configurado con dos interceptores:

**Interceptor de request:**
- Lee el token JWT de `localStorage` (`tb_token`)
- Lo agrega automáticamente al header `Authorization: Bearer TOKEN`
- Esto aplica a TODAS las peticiones — no hay que agregarlo manualmente

**Interceptor de response:**
- Si el backend responde con `401` (token expirado o inválido)
- Limpia `localStorage` y redirige automáticamente a `/`
- Maneja esto globalmente — no hay que manejarlo en cada componente

**Uso:**
```typescript
import api from "@/lib/api";

// GET
const res = await api.get("/profile/candidate");

// POST
const res = await api.post("/auth/login", { email, password });

// PUT
const res = await api.put("/profile/candidate", data);
```

---

## Contexto de autenticación — src/context/auth-context.tsx

Provee la sesión del usuario a toda la app. Está envuelto en el `layout.tsx` raíz.

**Valores disponibles:**
```typescript
const { user, login, logout, isLoading } = useAuth();
```

| Valor | Tipo | Descripción |
|---|---|---|
| `user` | `AuthUser \| null` | Usuario actual o null si no hay sesión |
| `user.userId` | `string` | UUID del usuario |
| `user.role` | `UserRole` | Rol: STUDENT, GRADUATE, COMPANY, INSTITUTION, ADMIN |
| `user.token` | `string` | JWT actual |
| `login(data)` | `function` | Guarda sesión y redirige según rol |
| `logout()` | `function` | Limpia sesión y redirige al landing |
| `isLoading` | `boolean` | True mientras recupera sesión del localStorage |

**Redirección automática según rol en `login()`:**
```
STUDENT  → /dashboard/candidate
GRADUATE → /dashboard/candidate
COMPANY  → /dashboard/company
```

**Sesión persistida en localStorage con estas claves:**
```
tb_token   → JWT
tb_role    → Rol del usuario
tb_userId  → UUID del usuario
```

---

## Sistema de diseño — Colores

Los colores están definidos en `src/app/globals.css` con `@theme` de Tailwind v4.

| Token | Valor | Uso |
|---|---|---|
| `primary` | `#00386c` | Azul principal — títulos, botones primarios |
| `primary-container` | `#1a4f8b` | Azul secundario — hover de botones |
| `secondary` | `#006d37` | Verde — acentos, éxito, links |
| `secondary-container` | `#6bfe9c` | Verde claro — badges, fondos de éxito |
| `background` | `#f7f9fb` | Fondo general de la app |
| `surface` | `#f7f9fb` | Fondo de cards |
| `on-surface` | `#191c1e` | Texto principal |
| `on-surface-variant` | `#424750` | Texto secundario |
| `error` | `#ba1a1a` | Rojo — errores |
| `error-container` | `#ffdad6` | Fondo de mensajes de error |

**En el código se usan como colores inline** porque Tailwind v4 aún no expone los tokens `@theme` como clases estándar:
```tsx
// Correcto ✅
className="bg-[#00386c] text-white"

// Incorrecto ❌ (no funciona en v4 sin configuración extra)
className="bg-primary text-on-primary"
```

---

## Tipografía

| Fuente | Variable CSS | Uso |
|---|---|---|
| Manrope | `--font-manrope` | Títulos y headlines — clase `font-headline` |
| DM Sans | `--font-dm-sans` | Cuerpo de texto — fuente por defecto |

Configuradas en `layout.tsx` con `next/font/google`.

---

## Flujo de autenticación implementado

```
POST /auth/register → { userId }
  ↓
/auth/verify-otp?userId=xxx → POST /auth/verify-otp → { message }
  ↓
/auth/login → POST /auth/login → { token, role, userId }
  ↓
AuthContext.login() → guarda en localStorage → redirige según rol
  ↓
/dashboard/candidate  (STUDENT, GRADUATE)
/dashboard/company    (COMPANY)
```

**Recuperación de contraseña:**
```
/auth/forgot-password → POST /auth/forgot-password → envía email
  ↓
Link en email: /auth/reset-password?token=xxx
  ↓
POST /auth/reset-password → { token, newPassword }
  ↓
/auth/login
```

---

## Convenciones de código

### Nomenclatura

- Archivos de página: siempre `page.tsx` dentro de su carpeta de ruta
- Componentes reutilizables: `PascalCase` → `AuthCard.tsx`, `RoleSelector.tsx`
- Hooks personalizados: `camelCase` con prefijo `use` → `useAuth`, `useProfile`
- Archivos de utilidad: `kebab-case` → `api.ts`, `auth-context.tsx`

### TypeScript

- **Strict mode** activado — no usar `any`
- Para errores de Axios usar el patrón:
```typescript
} catch (err: unknown) {
  const axiosErr = err as { response?: { data?: { error?: string } } };
  setError(axiosErr.response?.data?.error ?? "Error inesperado.");
}
```

### Componentes de cliente

- Siempre agregar `"use client"` al inicio si usa hooks o eventos
- Usar `useState` para estado local del formulario — nunca `useRef` para leer inputs
- Validar en el frontend antes de llamar a la API

### Manejo de errores en formularios

```typescript
// Estructura estándar de estado en formularios
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// Mostrar error
{error && (
  <div className="bg-[#ffdad6] text-[#93000a] text-sm font-medium px-4 py-3 rounded-xl">
    {error}
  </div>
)}
```

### Protección de rutas en dashboards

```typescript
useEffect(() => {
  if (!isLoading && !user) router.replace("/auth/login");
}, [user, isLoading, router]);
```

---

## Endpoints del backend consumidos

Base URL: `http://localhost:3001/api` (desarrollo)

| Método | Ruta | Usado en |
|---|---|---|
| POST | `/auth/register` | `/auth/register` |
| POST | `/auth/verify-otp` | `/auth/verify-otp` |
| POST | `/auth/resend-otp` | `/auth/verify-otp` |
| POST | `/auth/login` | `/auth/login` |
| POST | `/auth/forgot-password` | `/auth/forgot-password` |
| POST | `/auth/reset-password` | `/auth/reset-password` |
| GET | `/profile/candidate` | `/dashboard/candidate` (pendiente) |
| PUT | `/profile/candidate` | `/dashboard/candidate` (pendiente) |
| POST | `/profile/candidate/cv` | `/dashboard/candidate` (pendiente) |
| GET | `/profile/company` | `/dashboard/company` (pendiente) |
| PUT | `/profile/company` | `/dashboard/company` (pendiente) |

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
| `/dashboard/candidate` | `app/dashboard/candidate/page.tsx` | ⚠️ Bienvenida básica — Sprint 2 |
| `/dashboard/company` | `app/dashboard/company/page.tsx` | ⚠️ Bienvenida básica — Sprint 2 |

---

## Lo que NO está implementado aún

- Perfil completo de candidato (Sprint 2)
- Subida de CV a Supabase Storage (Sprint 2)
- Perfil completo de empresa (Sprint 2)
- Publicación y gestión de vacantes (Sprint 2)
- Postulaciones (Sprint 2)
- Mantener sesión iniciada / sessionStorage (Sprint 2)
- Reenvío de OTP por correo sin userId (pendiente backend)
- Notificaciones (Sprint 3)
- Dashboards completos con datos reales (Sprint 3)
- Panel de administración (Sprint 4)

---

## Notas para agentes de IA

- **No usar `fetch` directamente** — siempre usar el cliente `api` de `src/lib/api.ts`
- **No usar `localStorage` directamente** en componentes — usar `useAuth()`
- **No crear `tailwind.config.ts`** — los tokens van en `globals.css` con `@theme`
- **No usar Pages Router** — este proyecto usa exclusivamente App Router
- **Siempre agregar `"use client"`** a componentes que usen hooks o eventos del browser
- **Los mensajes de error al usuario van en español**
- **Validar siempre en el frontend** antes de llamar a la API
- Al agregar una página nueva, agregarla también a la tabla de páginas de este archivo
- Al consumir un endpoint nuevo, agregarlo también a la tabla de endpoints de este archivo