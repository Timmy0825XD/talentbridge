export const processesContent = {
  applications: {
    title: "Proceso de Postulación",
    description: "Cómo funciona el flujo de postulación en TalentBridge, paso a paso.",
    steps: [
      {
        title: "1. Registro y Perfil",
        content:
          "El primer paso es crear tu cuenta en TalentBridge y completar tu perfil profesional. Debes incluir tu información académica, habilidades técnicas, experiencia, proyectos y subir tu CV en formato PDF. El sistema evaluará tu perfil automáticamente y te asignará un puntaje de 0 a 100 puntos que determinará tu visibilidad ante las empresas.",
      },
      {
        title: "2. Explorar Vacantes",
        content:
          "Una vez que tu perfil está completo, puedes explorar todas las vacantes y proyectos activos publicados por las empresas. Los resultados se pueden filtrar por área de trabajo, modalidad (presencial, remoto, híbrido), duración y rango salarial. Cada vacante muestra el porcentaje de afinidad con tu perfil, calculado según la compatibilidad entre tus habilidades y los requisitos de la vacante.",
      },
      {
        title: "3. Postularse",
        content:
          "Al encontrar una vacante que te interese, puedes postularte con un solo clic. El sistema registra tu postulación y la empresa recibe una notificación. Tu perfil queda en la lista de postulantes con tu puntaje de ranking calculado automáticamente según los criterios de la vacante.",
      },
      {
        title: "4. Estados de Postulación",
        content:
          "Cada postulación pasa por los siguientes estados: RECEIVED (Recibida) - la empresa recibió tu postulación y está en su bandeja de entrada; REVIEWING (En revisión) - la empresa está evaluando tu perfil activamente; SELECTED (Seleccionado) - has sido escogido para continuar con el proceso de contratación; REJECTED (Descartado) - no has sido seleccionado en esta ocasión. Puedes hacer seguimiento del estado en tiempo real desde tu panel de postulaciones.",
      },
      {
        title: "5. Siguientes Pasos",
        content:
          "Si eres seleccionado, la empresa procederá a generar un contrato dentro de la plataforma. Si eres descartado, no te preocupes: tu perfil sigue siendo visible para otras empresas y puedes seguir postulándote a nuevas oportunidades sin límite.",
      },
    ],
  },
  contracts: {
    title: "Proceso de Contratos",
    description: "El ciclo completo de contratación en TalentBridge, desde la selección hasta el cierre.",
    steps: [
      {
        title: "1. Selección del Candidato",
        content:
          "El proceso de contratación comienza cuando la empresa selecciona a un candidato de entre los postulantes a una vacante. La empresa puede revisar el perfil completo, el CV y el puntaje de ranking del candidato antes de tomar la decisión.",
      },
      {
        title: "2. Creación del Contrato",
        content:
          "La empresa crea un contrato dentro de la plataforma especificando: las partes involucradas (empresa y candidato), la descripción del trabajo o proyecto, los entregables acordados, las fechas de inicio y fin, el monto total y el esquema de pago (único, por hitos o periódico). El contrato se genera en estado PENDING.",
      },
      {
        title: "3. Confirmación del Candidato",
        content:
          "El candidato recibe una notificación del contrato pendiente y debe revisar los términos. Si está de acuerdo, lo confirma y el contrato pasa a estado ACTIVE. Si no está de acuerdo, puede rechazarlo. Ambas partes deben confirmar para que el contrato se active.",
      },
      {
        title: "4. Ejecución y Entregables",
        content:
          "Una vez activo el contrato, el candidato comienza a trabajar. Puede registrar avances mediante comentarios y adjuntar archivos de entregables en la plataforma. La empresa revisa cada entregable y puede aprobarlo o rechazarlo con observaciones detalladas. Este proceso se repite hasta completar todos los entregables acordados.",
      },
      {
        title: "5. Pagos",
        content:
          "La empresa confirma los pagos asociados al contrato dentro de la plataforma. Para cada pago, puede marcar el estado como Realizado y adjuntar el comprobante correspondiente (formato PDF o imagen, máximo 10 MB). En esta versión, el registro de pagos es informativo y de trazabilidad; no se integra un procesador de pagos externo.",
      },
      {
        title: "6. Cierre del Proyecto",
        content:
          "Cuando todos los entregables han sido completados y los pagos confirmados, el proyecto se cierra formalmente. El contrato pasa a estado COMPLETED y se habilita el módulo de calificación mutua. La empresa califica al candidato (calidad, plazos, comunicación, actitud) y el candidato califica a la empresa (puntualidad de pagos, claridad de instrucciones, ambiente laboral). Las calificaciones son en escala de 1 a 5 estrellas.",
      },
      {
        title: "7. Reporte Final",
        content:
          "Al cerrar el proyecto, la empresa recibe un reporte descargable en PDF con: costo total del proyecto, duración real vs. estimada, calificación del entregable y métricas detalladas. Este reporte ayuda a la empresa a tomar mejores decisiones de contratación en el futuro.",
      },
    ],
  },
} as const;
