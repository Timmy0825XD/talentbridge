export const institutionalContent = {
  about: {
    title: "Acerca de TalentBridge",
    description: "Conectando el talento universitario del Cesar con las oportunidades del mañana.",
    sections: [
      {
        title: "¿Qué es TalentBridge?",
        content:
          "TalentBridge es una plataforma web que funciona como puente entre estudiantes y egresados del departamento del Cesar con empresas que buscan talento calificado para proyectos, microtrabajos o contrataciones formales. Nacimos para resolver la desconexión entre la formación universitaria y el mercado laboral local, ofreciendo herramientas de evaluación, seguimiento y gestión de talento.",
      },
      {
        title: "Nuestra Misión",
        content:
          "Facilitar la inserción laboral de los jóvenes del Cesar mediante una plataforma tecnológica que permita a estudiantes y egresados demostrar sus habilidades, a las empresas encontrar talento verificado, y a las instituciones educativas medir el impacto de sus programas en el mercado laboral.",
      },
      {
        title: "El Problema",
        content:
          "Actualmente en Valledupar y el Cesar, la informalidad laboral alcanza casi el 66% según el DANE. Las oportunidades se consiguen por contactos personales o recomendaciones, sin procesos organizados, contratos claros ni garantías. Las empresas pequeñas y medianas no encuentran talento calificado de forma rápida, y los estudiantes no tienen canales confiables para acceder a su primer empleo formal.",
      },
      {
        title: "Ecosistema de Actores",
        content:
          "TalentBridge conecta a cuatro actores clave: (a) Candidatos - estudiantes activos y egresados que buscan oportunidades laborales acordes a su perfil; (b) Empresas - organizaciones que publican vacantes y proyectos para encontrar talento universitario verificado; (c) Instituciones Educativas - universidades que monitorean la inserción laboral de sus egresados; (d) Administradores - encargados de moderar y gestionar la plataforma.",
      },
      {
        title: "Stack Tecnológico",
        content:
          "Construida con tecnologías modernas: Next.js 16 + React 19 + TypeScript en el frontend, Node.js + Express + Prisma ORM + PostgreSQL en el backend, Tailwind CSS v4 para diseño responsivo, y n8n para automatización de notificaciones vía WhatsApp. Desplegada en Vercel (frontend) y Railway (backend).",
      },
    ],
  },
  howItWorks: {
    title: "¿Cómo Funciona TalentBridge?",
    description: "El flujo completo de la plataforma explicado paso a paso.",
    sections: [
      {
        title: "Para Candidatos",
        content:
          "1. Regístrate con tu correo institucional y verifica tu identidad con el código OTP. 2. Completa tu perfil profesional: información académica, habilidades, experiencia y sube tu CV en PDF. 3. El sistema calcula automáticamente tu puntaje de perfil (0-100) evaluando habilidades, experiencia, formación y certificaciones. 4. Explora vacantes y proyectos filtrados por área, modalidad, duración y presupuesto. 5. Postúlate con un clic y haz seguimiento al estado de tus postulaciones en tiempo real.",
      },
      {
        title: "Para Empresas",
        content:
          "1. Registra tu empresa con NIT y datos de contacto. 2. Publica vacantes formales o proyectos freelance con todos los detalles: descripción, habilidades requeridas, presupuesto y entregables. 3. Recibe postulaciones de candidatos rankeados automáticamente según el perfil. 4. Ajusta los pesos del ranking por vacante para priorizar los criterios que más te importan. 5. Gestiona el proceso de selección cambiando estados: Recibida → En revisión → Seleccionado. 6. Genera contratos, da seguimiento a entregables y confirma pagos dentro de la plataforma.",
      },
      {
        title: "Para Universidades",
        content:
          "1. Accede a un panel de control con métricas de inserción laboral de tus egresados. 2. Visualiza el número de estudiantes y egresados activos en la plataforma. 3. Consulta las habilidades más demandadas por las empresas de la región. 4. Revisa la distribución de contrataciones por área de conocimiento para mejorar tus programas académicos.",
      },
      {
        title: "Flujo General del Sistema",
        content:
          "Candidato se registra y crea perfil → Explora vacantes y se postula → Empresa revisa candidatos rankeados → Selecciona y genera contrato → Ambas partes confirman el acuerdo → Candidato entrega resultados → Empresa aprueba entregables y paga → Proyecto se cierra y ambos se califican mutuamente.",
      },
    ],
  },
  roles: {
    title: "Roles en TalentBridge",
    description: "Tipos de usuario y sus权限 en la plataforma.",
    sections: [
      {
        title: "Roles Públicos (Autoregistro)",
        content:
          "Estos roles pueden crearse directamente desde el formulario de registro: (a) Estudiante (STUDENT) - para estudiantes activos de instituciones de educación superior, requiere correo institucional; (b) Egresado (GRADUATE) - para profesionales ya graduados, puede usar correo personal; (c) Empresa (COMPANY) - para organizaciones que buscan talento, requiere NIT y datos de contacto.",
      },
      {
        title: "Roles Administrados",
        content:
          "Estos roles son creados exclusivamente por el equipo de TalentBridge o por administradores: (a) Institución (INSTITUTION) - acceso a paneles de métricas de inserción laboral de egresados, vinculado por nombre de institución; (b) Administrador (ADMIN) - gestión completa de usuarios, vacantes, instituciones y configuración global del sistema.",
      },
      {
        title: "Permisos por Rol",
        content:
          "Cada rol tiene acceso a funcionalidades específicas: ESTUDIANTE/EGRESADO puede crear perfil, explorar vacantes, postularse y gestionar contratos. EMPRESA puede publicar vacantes, revisar postulaciones, gestionar contratos y acceder al simulador tributario. INSTITUCIÓN puede ver métricas de egresados y habilidades demandadas. ADMIN puede gestionar usuarios, moderar vacantes y configurar pesos del ranking.",
      },
    ],
  },
  candidates: {
    title: "Para Candidatos",
    description: "Todo lo que puedes hacer como estudiante o egresado en TalentBridge.",
    sections: [
      {
        title: "Tu Perfil Profesional",
        content:
          "Crea un perfil completo con tu información académica, habilidades técnicas y blandas, idiomas, proyectos y certificaciones. El sistema evalúa tu perfil automáticamente y te asigna un puntaje de 0 a 100 puntos basado en: habilidades técnicas (30%), experiencia y proyectos (25%), formación académica (15%), certificaciones (10%), reputación (10%), idiomas (5%) y completitud del perfil (5%).",
      },
      {
        title: "Constructor de CV y Score",
        content:
          "Sube tu hoja de vida en formato PDF (máximo 5 MB) y el sistema extraerá automáticamente el texto para alimentar el motor de ranking. Tu CV Score se actualiza dinámicamente y las empresas ven tu perfil ordenado por puntaje. Mientras más completo sea tu perfil, mayor visibilidad tendrás ante los empleadores.",
      },
      {
        title: "Explorar y Postular",
        content:
          "Navega por todas las vacantes y proyectos activos con filtros por área de trabajo, modalidad (presencial, remoto, híbrido), duración y rango salarial. Los resultados se ordenan por fecha y por porcentaje de afinidad con tu perfil. Postúlate con un solo clic y recibe notificaciones cuando las empresas revisen tu aplicación.",
      },
      {
        title: "Seguimiento de Postulaciones",
        content:
          "El estado de cada postulación se actualiza en tiempo real: Recibida (la empresa recibió tu postulación), En revisión (la empresa está evaluando tu perfil), Seleccionado (felicidades, pasaste a la siguiente etapa), Descartado (no fuiste seleccionado en esta ocasión).",
      },
      {
        title: "Contratos y Proyectos",
        content:
          "Cuando una empresa te selecciona, se genera un contrato dentro de la plataforma con entregables, fechas y monto acordado. Puedes registrar avances, subir entregables y recibir retroalimentación. Al finalizar, calificas a la empresa y contribuyes a su reputación en la plataforma.",
      },
    ],
  },
  companies: {
    title: "Para Empresas",
    description: "Encuentra talento universitario verificado en el Cesar.",
    sections: [
      {
        title: "Publicar Vacantes y Proyectos",
        content:
          "Crea oportunidades laborales de dos tipos: vacante formal (contratación directa) o proyecto freelance (por entregas). Define título, descripción, habilidades requeridas, modalidad, rango salarial, duración y fecha límite. Las vacantes activas son visibles inmediatamente para todos los candidatos.",
      },
      {
        title: "Ranking Inteligente de Candidatos",
        content:
          "Cada postulación incluye el puntaje de ranking del candidato calculado automáticamente según tu perfil de búsqueda. Puedes ajustar los pesos del ranking por vacante: dale más importancia a habilidades técnicas, experiencia o certificaciones según tus prioridades. El sistema recalcula los puntajes en tiempo real.",
      },
      {
        title: "Proceso de Selección",
        content:
          "Gestiona las postulaciones cambiando estados manualmente: Recibida → En revisión → Seleccionado o Descartado. Visualiza el CV y perfil completo de cada candidato directamente desde la plataforma. Todo el historial queda registrado para futuras referencias.",
      },
      {
        title: "Gestión de Contratos",
        content:
          "Al seleccionar un candidato, genera un contrato con entregables, fechas y monto. Da seguimiento a los avances, aprueba o rechaza entregables con observaciones, y confirma los pagos adjuntando comprobantes. Al cerrar el proyecto, califica al candidato y recibe un reporte PDF con métricas detalladas.",
      },
      {
        title: "Beneficios Tributarios",
        content:
          "Colombia ofrece beneficios tributarios a empresas que contratan jóvenes menores de 28 años (Art. 108-5 ET, Ley 2466/2025). TalentBridge incluye un simulador que te permite estimar tu ahorro aproximado según el salario ingresado, para que tomes decisiones informadas.",
      },
    ],
  },
  universities: {
    title: "Para Universidades",
    description: "Monitorea la inserción laboral de tus egresados.",
    sections: [
      {
        title: "Panel de Control",
        content:
          "Accede a un panel diseñado para instituciones educativas con indicadores clave: número de estudiantes y egresados con perfil activo en la plataforma, tasa de inserción laboral (egresados con al menos un proyecto o contrato cerrado), y distribución de contrataciones por área de conocimiento.",
      },
      {
        title: "Métricas de Empleabilidad",
        content:
          "Visualiza estadísticas agregadas sobre el desempeño de tus egresados en el mercado laboral: top skills más demandadas por las empresas de la región, comparativas por programa académico, y evolución de la inserción laboral a lo largo del tiempo.",
      },
      {
        title: "Vinculación de Estudiantes",
        content:
          "Las métricas se calculan automáticamente comparando el nombre de la institución registrado en el perfil del candidato con el de tu cuenta institucional. Puedes verificar manualmente la condición de egresado cuando el sistema no pueda hacerlo automáticamente por correo institucional.",
      },
      {
        title: "Mejora Curricular",
        content:
          "Usa los datos de habilidades más demandadas por las empresas como insumo para la mejora curricular de tus programas. Identifica brechas entre la formación académica y las necesidades del mercado laboral en el Cesar.",
      },
    ],
  },
  resources: {
    title: "Recursos",
    description: "Centro de documentación y guías de TalentBridge.",
    sections: [
      {
        title: "Documentación de la Plataforma",
        content:
          "Explora nuestras guías y documentación para aprovechar al máximo TalentBridge.",
      },
      {
        title: "Enlaces de Interés",
        content: "Accede a las secciones clave de la plataforma: Preguntas Frecuentes (FAQ), Guía de Procesos: Postulaciones y Contratos, Información Institucional y Legal.",
      },
    ],
  },
} as const;
