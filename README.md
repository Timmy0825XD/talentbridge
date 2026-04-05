# TalentBridge

Plataforma web de gestión de talento universitario que conecta estudiantes
y egresados del departamento del Cesar con empresas que requieren perfiles
calificados para proyectos, microtrabajos o contrataciones formales.

## Integrantes

| Nombre | Rol |
|---|---|
| Josheph Javier Martínez Tapias | Backend Developer / Scrum Master |
| Oscar Daniel Duque | Frontend Developer / Product Owner |
| Sebastián Carrillo | Frontend Developer / n8n Integration |

## Stack tecnológico

- **Frontend:** Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **Backend:** Node.js 24 + Express 5 + TypeScript
- **Base de datos:** PostgreSQL (Neon) + Prisma ORM
- **Automatización:** n8n + WhatsApp Business API
- **Despliegue:** Vercel (frontend) + Railway (backend)

## Estructura del proyecto

talentbridge/
├── backend/     # API REST con Node.js + Express
└── frontend/    # Aplicación web con Next.js

## Instalación y ejecución local

### Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Variables de entorno

Copia los archivos de ejemplo y completa los valores:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```
