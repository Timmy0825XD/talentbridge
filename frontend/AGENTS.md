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
│   │   │   │   ├── explorar/page.tsx         # Explorar empleos — master/detail + filtros avanzados
│   │   │   │   └── postulaciones/page.tsx    # (Sprint 3)
│   │   │   └── company/
│   │   │       ├── page.tsx                  # Dashboard empresa — conectado a API real
│   │   │       ├── vacantes/
│   │   │       │   ├── page.tsx              # Gestión de vacantes con CRUD completo y filtros
│   │   │       │   ├── _components/
│   │   │       │   │   └── JobForm.tsx       # Formulario crear/editar vacante — reutilizable
│   │   │       │   └── [id]/
│   │   │       │       └── postulantes/
│   │   │       │           └── page.tsx      # Vista master/detail de postulantes con ranking e IA
│   │   │       └── talento/page.tsx          # (Sprint 3)
│   │   └── profile/
│   │       ├── candidate/page.tsx            # Perfil candidato — foto, CV, skills, certs, proyectos
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
- **Componentes internos de una página** van en una carpeta `_components/` al mismo nivel que `page.tsx`

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
- Si el backend responde con `401` (token expirado o inválido) **y la ruta NO es `/auth/`**
- Limpia `localStorage` y redirige automáticamente a `/`
- Las rutas de autenticación están excluidas del redirect para mostrar sus propios errores

**Fix crítico aplicado en Sprint 2:**
```typescript
const isAuthRoute = error.config?.url?.includes('/auth/');
if (error.response?.status === 401 && !isAuthRoute) {
  // limpiar localStorage y redirigir
}
```

**Uso:**
```typescript
import api from "@/lib/api";

const res = await api.get("/profile/candidate");
const res = await api.post("/auth/login", { email, password });
const res = await api.put("/profile/candidate", data);
const res = await api.patch(`/applications/${id}/status`, { status });
const res = await api.post("/profile/candidate/photo", formData, {
  headers: { "Content-Type": "multipart/form-data" }
});
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
className="bg-[#00386c] text-white"   // ✅ correcto
className="bg-primary text-on-primary" // ❌ no funciona en v4
```

---

## Tipografía

| Fuente | Uso | Clase |
|---|---|---|
| Manrope | Títulos y headlines | `font-headline` |
| DM Sans | Cuerpo de texto | fuente por defecto del body |

Configuradas en `layout.tsx` con `next/font/google`.

---

## Perfil de candidato — src/app/profile/candidate/page.tsx

Página completa rediseñada en Sprint 2. Características:

**Secciones:**
- Hero banner con foto de perfil, nombre, carrera y completitud del perfil (anillo circular)
- Sidebar con navegación ancla a cada sección y resumen de conteos
- Información básica (nombre, teléfono, resumen)
- Información académica (institución, carrera, semestre/año de graduación según rol)
- Preferencias laborales (modalidad, pretensión salarial)
- Habilidades técnicas y blandas con autocompletado
- Idiomas (nombre + nivel)
- Certificaciones (nombre, institución, año)
- Proyectos destacados (nombre, descripción, URL)
- Hoja de vida (subida de PDF)

**Foto de perfil:**
- Subida via `POST /profile/candidate/photo` con `multipart/form-data`
- Campo `photo` en el FormData
- Acepta JPG, PNG, WebP — máx 3MB
- La URL resultante se guarda en `form.photoUrl`

**Skills con autocompletado (`SkillInput`):**
- Componente interno que consume `GET /keywords` para mostrar sugerencias
- Filtra en tiempo real mientras el usuario escribe
- Permite agregar skills que no existen en la BD (texto libre)
- Muestra badge "Técnica" o "Blanda" según el tipo de keyword
- Cierra el dropdown al hacer clic fuera (usa `useRef` + `mousedown`)

**Completitud del perfil:**
- Calculada localmente sobre 8 campos clave
- Mostrada como anillo SVG animado en el hero

**Endpoints consumidos en esta página:**
- `GET /profile/candidate` — carga datos iniciales
- `PUT /profile/candidate` — guarda el perfil
- `POST /profile/candidate/cv` — sube el CV (campo `cv`, solo PDF, máx 5MB)
- `POST /profile/candidate/photo` — sube foto (campo `photo`, JPG/PNG/WebP, máx 3MB)
- `GET /keywords` — carga keywords para autocompletado de skills

---

## Patrones de componentes — Sprint 2

### Página con datos reales del backend

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

### Peticiones en paralelo

```typescript
// Todas deben tener éxito
const [resA, resB] = await Promise.all([
  api.get('/endpoint-a'),
  api.get('/endpoint-b'),
]);

// Algunas pueden fallar sin romper la página
const results = await Promise.allSettled([
  api.get('/endpoint-a'),
  api.get('/endpoint-b'),
]);
```

### Actualización optimista de estado

```typescript
setItems(prev =>
  prev.map(item => item.id === targetId ? { ...item, status: newStatus } : item)
);
```

### Layout master/detail

```tsx
<div className="flex gap-8 h-[calc(100vh-280px)]">
  <aside className="w-[400px] flex flex-col overflow-y-auto">
    {items.map(item => (
      <div key={item.id} onClick={() => setSelected(item)}>{/* card */}</div>
    ))}
  </aside>
  <main className="flex-1 overflow-y-auto">
    {!selected ? <EmptyState /> : <Detail item={selected} />}
  </main>
</div>
```

### Pantalla de error con reintento

```tsx
{error && (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4">
    <AlertCircle className="w-10 h-10 text-[#ba1a1a]" />
    <p className="text-[#93000a] font-semibold">{error}</p>
    <button onClick={loadData}
      className="px-6 py-2 bg-[#006d37] text-white rounded-full text-sm font-bold">
      Reintentar
    </button>
  </div>
)}
```

### Función timeAgo

```typescript
function timeAgo(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (days > 0)  return `hace ${days} día${days > 1 ? 's' : ''}`;
  if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
  return `hace ${mins} min`;
}
```

### Formulario con modo crear/editar reutilizable

```typescript
interface FormProps {
  editingItem: Item | null;
  onSuccess: () => void;
  onCancel: () => void;
}

if (editingItem) {
  await api.put(`/items/${editingItem.id}`, payload);
} else {
  await api.post('/items', payload);
}
onSuccess();
```

### Subida de archivos con FormData

```typescript
const fd = new FormData();
fd.append("photo", file);
const res = await api.post("/profile/candidate/photo", fd, {
  headers: { "Content-Type": "multipart/form-data" }
});
```

---

## Convenciones de código

### Nomenclatura

- Archivos de página: siempre `page.tsx` dentro de su carpeta de ruta
- Layouts: siempre `layout.tsx` dentro de su carpeta
- Componentes reutilizables: `PascalCase` → `JobForm.tsx`
- Hooks personalizados: prefijo `use` → `useAuth`
- Archivos de utilidad: `kebab-case` → `api.ts`, `auth-context.tsx`
- Componentes internos de una página: en `_components/` al mismo nivel

### TypeScript

```typescript
// Errores de Axios
} catch (err: unknown) {
  const e = err as { response?: { data?: { error?: string } } };
  setError(e.response?.data?.error ?? 'Error inesperado.');
}
```

- Definir interfaces para todos los tipos que vienen del backend
- No usar `any` — justificar con comentario si es absolutamente necesario
- Tipar explícitamente variables locales que TypeScript no puede inferir

### Inputs — estilo estándar del proyecto

```typescript
const inputCls = "w-full bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#006d37] focus:ring-0 rounded-lg px-4 py-3 text-sm text-[#191c1e] placeholder:text-[#737781] outline-none transition-all";
const labelCls = "block text-xs font-semibold uppercase tracking-wider text-[#424750] mb-2";
```

### Mensajes de feedback

```tsx
{error && (
  <div className="bg-[#ffdad6] text-[#93000a] text-sm font-medium px-4 py-3 rounded-xl">
    {error}
  </div>
)}
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
| GET | `/profile/candidate` | `/profile/candidate`, `/dashboard/candidate`, `/dashboard/candidate/explorar` | ✅ |
| PUT | `/profile/candidate` | `/profile/candidate` | ✅ |
| POST | `/profile/candidate/cv` | `/profile/candidate` | ✅ |
| POST | `/profile/candidate/photo` | `/profile/candidate` | ✅ |
| GET | `/profile/company` | `/profile/company` | ✅ |
| PUT | `/profile/company` | `/profile/company` | ✅ |
| GET | `/keywords` | `/profile/candidate` | ✅ |
| GET | `/jobs` | `/dashboard/candidate/explorar` | ✅ |
| GET | `/jobs/company/mine` | `/dashboard/company`, `/dashboard/company/vacantes` | ✅ |
| POST | `/jobs` | `/dashboard/company/vacantes` (JobForm) | ✅ |
| PUT | `/jobs/:id` | `/dashboard/company/vacantes` (JobForm) | ✅ |
| PATCH | `/jobs/:id/status` | `/dashboard/company/vacantes` | ✅ |
| GET | `/jobs/:id` | `/dashboard/company/vacantes/[id]/postulantes` | ✅ |
| GET | `/jobs/:id/applicants` | `/dashboard/company/vacantes/[id]/postulantes`, `/dashboard/company` | ✅ |
| POST | `/jobs/:id/apply` | `/dashboard/candidate/explorar` | ✅ |
| PATCH | `/applications/:id/status` | `/dashboard/company/vacantes/[id]/postulantes` | ✅ |
| GET | `/applications/me` | `/dashboard/candidate/explorar` | ✅ |
| GET | `/ranking/me` | `/dashboard/candidate/explorar` | ✅ |

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
| `/dashboard/candidate/explorar` | `app/dashboard/candidate/explorar/page.tsx` | ✅ Completo — API real, filtros avanzados, postulación |
| `/dashboard/company` | `app/dashboard/company/page.tsx` | ✅ Completo — API real |
| `/dashboard/company/vacantes` | `app/dashboard/company/vacantes/page.tsx` | ✅ Completo — CRUD completo |
| `/dashboard/company/vacantes/[id]/postulantes` | `app/dashboard/company/vacantes/[id]/postulantes/page.tsx` | ✅ Completo — master/detail, ranking, IA |
| `/profile/candidate` | `app/profile/candidate/page.tsx` | ✅ Completo — foto, CV, skills con autocompletado, certs, proyectos |
| `/profile/company` | `app/profile/company/page.tsx` | ✅ Completo — API real |

---

## Lo que NO está implementado aún

- Postulaciones de candidato — `/dashboard/candidate/postulaciones` (Sprint 3)
- Buscar talento empresa — `/dashboard/company/talento` (Sprint 3)
- Dashboard candidato con datos reales del backend (Sprint 3)
- Notificaciones (Sprint 3)
- Contratos y seguimiento de entregas (Sprint 3)
- Registro de pagos (Sprint 3)
- Calificaciones mutuas (Sprint 4)
- Dashboards y reportes PDF (Sprint 4)
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
- **El dashboard tiene un layout compartido** — no repetir el header en páginas hijas
- **Componentes internos** van en `_components/` al mismo nivel que su `page.tsx`
- **El acento de color empresa es verde** (`#006d37`), el de candidato es azul (`#00386c`)
- **Toda página con datos del backend** debe tener estado de carga, error con reintentar, y vacío explícito
- **Para peticiones paralelas** usar `Promise.all` o `Promise.allSettled` según si todas deben tener éxito
- **Para actualizaciones de estado** preferir actualización local optimista
- **El interceptor 401 excluye rutas `/auth/`** — intencional para que login muestre sus propios errores
- **`JobForm.tsx`** es el patrón de referencia para formularios crear/editar reutilizables
- **`SkillInput`** en `profile/candidate/page.tsx` es el patrón de referencia para autocompletado con keywords
- **Subida de archivos** usa `FormData` con `Content-Type: multipart/form-data`
- Al agregar una página nueva, agregarla a la tabla de páginas implementadas
- Al consumir un endpoint nuevo, agregarlo a la tabla de endpoints