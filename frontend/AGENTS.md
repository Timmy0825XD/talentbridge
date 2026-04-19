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
│   │   │   │   ├── page.tsx                  # Dashboard candidato (STUDENT, GRADUATE)
│   │   │   │   ├── explorar/page.tsx         # Explorar empleos — master/detail
│   │   │   │   └── postulaciones/page.tsx    # (Sprint 2)
│   │   │   └── company/
│   │   │       ├── page.tsx                  # Dashboard empresa (COMPANY)
│   │   │       ├── vacantes/page.tsx         # (Sprint 2)
│   │   │       └── talento/page.tsx          # (Sprint 2)
│   │   └── profile/
│   │       ├── candidate/page.tsx            # Formulario perfil candidato
│   │       └── company/page.tsx              # Formulario perfil empresa
│   ├── context/
│   │   └── auth-context.tsx                  # Contexto global de autenticación
│   └── lib/
│       └── api.ts                            # Cliente Axios centralizado con interceptores
├── .env.local                                # Variables de entorno — NUNCA subir al repo
├── .env.example                              # Plantilla de variables — SÍ subir al repo
├── next.config.ts
├── postcss.config.mjs
└── package.json
```

### Reglas de arquitectura

- **Todas las páginas** van dentro de `src/app/` siguiendo el App Router de Next.js
- **Rutas de candidato** van dentro de `dashboard/candidate/` — nunca en `dashboard/` directamente
- **Rutas de empresa** van dentro de `dashboard/company/` — nunca en `dashboard/` directamente
- **El layout del dashboard** (`dashboard/layout.tsx`) maneja el header y la protección de ruta para todas las páginas del dashboard — no repetir esta lógica en las páginas hijas
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
| `logout()` | `function` | Limpia sesión y redirige al landing `/` |
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

## Layout del dashboard — src/app/dashboard/layout.tsx

Componente que envuelve todas las páginas dentro de `dashboard/`. Maneja:

- **Header fijo** con logo, navegación dinámica por rol y botón de logout
- **Protección de ruta centralizada** — si no hay sesión redirige a `/`
- **Nav dinámico por rol:**

```typescript
STUDENT / GRADUATE:
  Dashboard     → /dashboard/candidate
  Postulaciones → /dashboard/candidate/postulaciones
  Explorar      → /dashboard/candidate/explorar
  Mi Perfil     → /profile/candidate

COMPANY:
  Dashboard     → /dashboard/company
  Mis Vacantes  → /dashboard/company/vacantes
  Buscar Talento→ /dashboard/company/talento
  Mi Perfil     → /profile/company
```

- El link activo se detecta con `usePathname()` y se resalta con el color del rol
- Avatar azul para candidatos, verde para empresas

---

## Sistema de diseño — Colores

Los colores están definidos en `src/app/globals.css` con `@theme` de Tailwind v4.

| Token | Valor hex | Uso principal |
|---|---|---|
| primary | `#00386c` | Azul — títulos, botones candidato, nav |
| primary-container | `#1a4f8b` | Azul medio — hover botones |
| secondary | `#006d37` | Verde — acentos empresa, éxito |
| secondary-container | `#6bfe9c` | Verde claro — badges, fondos éxito |
| secondary-fixed-dim | `#4ae183` | Verde medio — elementos decorativos |
| background | `#f7f9fb` | Fondo general |
| surface-container-low | `#f2f4f6` | Fondo de inputs y cards secundarias |
| surface-container-high | `#e6e8ea` | Bordes, separadores |
| on-surface | `#191c1e` | Texto principal |
| on-surface-variant | `#424750` | Texto secundario |
| outline | `#737781` | Placeholders, iconos secundarios |
| outline-variant | `#c2c6d1` | Bordes sutiles |
| error | `#ba1a1a` | Rojo — errores |
| error-container | `#ffdad6` | Fondo mensajes de error |
| on-error-container | `#93000a` | Texto mensajes de error |

**En el código se usan siempre como colores inline** porque Tailwind v4 aún no expone los tokens `@theme` como clases estándar:
```tsx
// ✅ Correcto
className="bg-[#00386c] text-white"

// ❌ Incorrecto — no funciona en v4
className="bg-primary text-on-primary"
```

---

## Tipografía

| Fuente | Uso | Clase |
|---|---|---|
| Manrope | Títulos y headlines | `font-headline` |
| DM Sans | Cuerpo de texto | fuente por defecto del body |

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

**Caso NOT_VERIFIED en login:**
- Si el backend responde con `code: "NOT_VERIFIED"` y `userId`
- El frontend redirige automáticamente a `/auth/verify-otp?userId=xxx`
- El backend reenvía el OTP al correo automáticamente en este caso

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
- Layouts: siempre `layout.tsx` dentro de su carpeta
- Componentes reutilizables: `PascalCase` → `AuthCard.tsx`
- Hooks personalizados: prefijo `use` → `useAuth`
- Archivos de utilidad: `kebab-case` → `api.ts`, `auth-context.tsx`

### TypeScript en formularios

- Los formularios de perfil **no usan interfaces** por ahora — TypeScript infiere el tipo desde `EMPTY_FORM`
- Se agregarán interfaces en Sprint 2 cuando los datos vengan del backend
- Para errores de Axios usar siempre este patrón:

```typescript
} catch (err: unknown) {
  const e = err as { response?: { data?: { error?: string } } };
  setError(e.response?.data?.error ?? "Error inesperado.");
}
```

### Inputs — estilo estándar del proyecto

```typescript
// Clase base reutilizable para todos los inputs
const input = "w-full bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#006d37] focus:ring-0 rounded-lg px-4 py-3 text-sm text-[#191c1e] placeholder:text-[#737781] outline-none transition-all";

const label = "block text-xs font-semibold uppercase tracking-wider text-[#424750] mb-2";
```

### Mensajes de feedback

```tsx
// Error
{error && (
  <div className="bg-[#ffdad6] text-[#93000a] text-sm font-medium px-4 py-3 rounded-xl">
    {error}
  </div>
)}

// Éxito
{success && (
  <div className="bg-[#6bfe9c]/20 text-[#005228] text-sm font-medium px-4 py-3 rounded-xl">
    {success}
  </div>
)}
```

### Spinner de carga estándar

```tsx
// Candidato (azul)
<span className="w-8 h-8 border-2 border-[#00386c]/20 border-t-[#00386c] rounded-full animate-spin" />

// Empresa (verde)
<span className="w-8 h-8 border-2 border-[#006d37]/20 border-t-[#006d37] rounded-full animate-spin" />
```

### Botón submit estándar

```tsx
// Candidato
<button className="bg-gradient-to-br from-[#00386c] to-[#1a4f8b] text-white px-10 py-3.5 rounded-full font-bold text-sm uppercase tracking-widest ...">

// Empresa
<button className="bg-gradient-to-br from-[#006d37] to-[#00743a] text-white px-10 py-3.5 rounded-full font-bold text-sm uppercase tracking-widest ...">
```

---

## Endpoints del backend consumidos

Base URL: `http://localhost:3001/api` (desarrollo) — definido en `NEXT_PUBLIC_API_URL`

| Método | Ruta | Usado en | Estado |
|---|---|---|---|
| POST | `/auth/register` | `/auth/register` | ✅ |
| POST | `/auth/verify-otp` | `/auth/verify-otp` | ✅ |
| POST | `/auth/resend-otp` | `/auth/verify-otp` | ✅ |
| POST | `/auth/login` | `/auth/login` | ✅ |
| POST | `/auth/forgot-password` | `/auth/forgot-password` | ✅ |
| POST | `/auth/reset-password` | `/auth/reset-password` | ✅ |
| GET | `/profile/candidate` | `/profile/candidate`, `/dashboard/candidate` | ✅ |
| PUT | `/profile/candidate` | `/profile/candidate` | ✅ |
| POST | `/profile/candidate/cv` | `/profile/candidate` | ✅ |
| GET | `/profile/company` | `/profile/company` | ✅ |
| PUT | `/profile/company` | `/profile/company` | ✅ |

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
| `/dashboard/candidate` | `app/dashboard/candidate/page.tsx` | ✅ Completo — datos estáticos |
| `/dashboard/candidate/explorar` | `app/dashboard/candidate/explorar/page.tsx` | ✅ Completo — datos estáticos |
| `/dashboard/company` | `app/dashboard/company/page.tsx` | ✅ Completo — datos estáticos |
| `/profile/candidate` | `app/profile/candidate/page.tsx` | ✅ Completo — conectado a API |
| `/profile/company` | `app/profile/company/page.tsx` | ✅ Completo — conectado a API |

---

## Lo que NO está implementado aún

- Postulaciones de candidato — `/dashboard/candidate/postulaciones` (Sprint 2)
- Vacantes de empresa — `/dashboard/company/vacantes` (Sprint 2)
- Buscar talento empresa — `/dashboard/company/talento` (Sprint 2)
- Dashboards con datos reales del backend (Sprint 2)
- Página de explorar con datos reales (Sprint 2)
- Mantener sesión iniciada con sessionStorage (Sprint 2)
- Reenvío de OTP desde login con solo email — pendiente backend (Sprint 2)
- Notificaciones (Sprint 3)
- Panel de administración (Sprint 4)

---

## Notas para agentes de IA

- **No usar `fetch`** — siempre el cliente `api` de `@/lib/api`
- **No usar `localStorage` directamente** — usar `useAuth()`
- **No crear `tailwind.config.ts`** — los tokens van en `globals.css` con `@theme`
- **No usar Pages Router** — este proyecto usa exclusivamente App Router
- **Siempre `"use client"`** en componentes con hooks o eventos del browser
- **Los mensajes de error van en español**
- **Los imports siempre son** `@/lib/api` y `@/context/auth-context` — nunca `@/src/...`
- **El dashboard tiene un layout compartido** en `app/dashboard/layout.tsx` — no repetir el header en las páginas hijas
- **Rutas de candidato** dentro de `dashboard/candidate/`, rutas de empresa dentro de `dashboard/company/`
- **Los formularios de perfil no tienen interfaces TypeScript** — TypeScript infiere el tipo desde `EMPTY_FORM`. Se agregarán en Sprint 2
- **El botón "Ver CV"** en el dashboard candidato requiere hacer `GET /profile/candidate` para obtener el `cvUrl`
- **El acento de color del rol empresa es verde** (`#006d37`), el de candidato es azul (`#00386c`)
- **El flujo NOT_VERIFIED** está manejado en el login — redirige automáticamente a verify-otp
- Al agregar una página nueva, agregarla a la tabla de páginas implementadas de este archivo
- Al consumir un endpoint nuevo, agregarlo a la tabla de endpoints de este archivo