export const faqContent = {
  title: "Preguntas Frecuentes",
  description: "Respuestas a las dudas más comunes sobre TalentBridge.",
  categories: [
    {
      name: "Cuenta y Registro",
      items: [
        {
          question: "¿Quién puede registrarse en TalentBridge?",
          answer:
            "Pueden registrarse estudiantes activos de instituciones de educación superior, egresados de cualquier programa académico, y empresas legalmente constituidas. Los estudiantes deben usar su correo institucional. Las empresas deben contar con NIT y datos de contacto válidos.",
        },
        {
          question: "¿Por qué debo verificar mi correo con un código OTP?",
          answer:
            "La verificación por código OTP (One-Time Password) garantiza que la dirección de correo ingresada es válida y te pertenece. El código tiene una duración de 10 minutos y es de un solo uso. Tu cuenta solo se activa después de esta verificación, lo que protege la seguridad de la plataforma.",
        },
        {
          question: "¿Puedo tener más de una cuenta?",
          answer:
            "No. Cada persona natural o jurídica puede tener una única cuenta activa. No se permite compartir cuentas ni crear perfiles falsos. El registro de roles como ADMIN o INSTITUTION es gestionado exclusivamente por el equipo de TalentBridge.",
        },
        {
          question: "¿Cómo recupero mi contraseña?",
          answer:
            "En la página de inicio de sesión, selecciona la opción '¿Olvidaste tu contraseña?'. Recibirás un enlace temporal en tu correo electrónico con una validez de 15 minutos para restablecerla.",
        },
      ],
    },
    {
      name: "Perfil y CV",
      items: [
        {
          question: "¿Cómo funciona el score de perfil?",
          answer:
            "El sistema calcula automáticamente un puntaje de 0 a 100 puntos basado en: habilidades técnicas (30%), experiencia y proyectos (25%), formación académica (15%), certificaciones (10%), reputación en la plataforma (10%), idiomas (5%) y completitud del perfil (5%). Mientras más completo sea tu perfil, mayor puntaje tendrás.",
        },
        {
          question: "¿Qué formato debe tener mi CV y cuál es el tamaño máximo?",
          answer:
            "El CV debe subirse exclusivamente en formato PDF con un tamaño máximo de 5 MB. Solo se permite un CV activo por usuario; al subir uno nuevo, el anterior se reemplaza automáticamente.",
        },
        {
          question: "¿Puedo editar mi perfil después de registrarme?",
          answer:
            "Sí. Puedes modificar tu perfil en cualquier momento desde la sección de perfil. Los cambios se reflejan inmediatamente y el sistema recalcula tu puntaje de forma dinámica.",
        },
      ],
    },
    {
      name: "Postulaciones",
      items: [
        {
          question: "¿Qué significa cada estado de postulación?",
          answer:
            "Los estados son: Recibida (la empresa recibió tu postulación), En revisión (la empresa está evaluando tu perfil), Seleccionado (pasaste a la siguiente etapa, la empresa se pondrá en contacto contigo), Descartado (no fuiste seleccionado en esta ocasión).",
        },
        {
          question: "¿Cómo se calcula el porcentaje de afinidad con una vacante?",
          answer:
            "El sistema compara las habilidades requeridas en la vacante con las registradas en tu perfil, aplicando los pesos del motor de ranking. El resultado es un porcentaje que indica qué tan compatible eres con esa oportunidad.",
        },
        {
          question: "¿Puedo postularme a varias vacantes al mismo tiempo?",
          answer:
            "Sí. No hay límite de postulaciones activas. Puedes postularte a todas las vacantes que se ajusten a tu perfil y hacer seguimiento individual de cada una.",
        },
      ],
    },
    {
      name: "Contratos",
      items: [
        {
          question: "¿Cómo se crea y confirma un contrato?",
          answer:
            "Cuando la empresa selecciona a un candidato, genera un contrato con entregables, fechas y monto acordado. El candidato debe confirmar el acuerdo para activarlo. El contrato pasa por los estados: PENDING (pendiente de confirmación), ACTIVE (en ejecución), COMPLETED (finalizado).",
        },
        {
          question: "¿Cómo funcionan los pagos dentro de la plataforma?",
          answer:
            "Los pagos se registran de forma informativa para trazabilidad. La empresa confirma el pago adjuntando un comprobante (PDF o imagen, máximo 10 MB). No integramos un procesador de pagos en esta versión.",
        },
        {
          question: "¿Cómo se califica al finalizar un proyecto?",
          answer:
            "Al cerrar un proyecto, ambas partes se califican mutuamente en escala de 1 a 5 estrellas. La empresa califica calidad, plazos, comunicación y actitud. El candidato califica puntualidad de pagos, claridad de instrucciones y ambiente laboral.",
        },
      ],
    },
    {
      name: "Privacidad y Datos",
      items: [
        {
          question: "¿Qué datos personales almacena TalentBridge?",
          answer:
            "Almacenamos datos de registro (correo y contraseña), datos de perfil (nombre, institución, habilidades, CV, foto), y datos de uso (postulaciones, contratos, calificaciones). Toda la información se maneja conforme a la Ley 1581 de 2012 de protección de datos personales en Colombia.",
        },
        {
          question: "¿Puedo eliminar mi cuenta y mis datos?",
          answer:
            "Sí. Puedes solicitar la eliminación de tu cuenta contactando a nuestro equipo. Tus datos personales se eliminarán de forma segura, aunque algunos datos anonimizados para métricas estadísticas podrán conservarse.",
        },
      ],
    },
    {
      name: "Instituciones",
      items: [
        {
          question: "¿Cómo accede una universidad al panel institucional?",
          answer:
            "El acceso al panel de institución es creado exclusivamente por el equipo de TalentBridge o por administradores. Una vez creada la cuenta, la institución puede visualizar métricas de inserción laboral de sus egresados.",
        },
        {
          question: "¿Cómo se vinculan los estudiantes con su institución?",
          answer:
            "Las métricas se calculan automáticamente comparando el nombre de la institución registrado en el perfil del candidato con el de la cuenta institucional. La institución puede verificar manualmente la condición de egresado cuando el sistema no pueda hacerlo automáticamente.",
        },
      ],
    },
  ],
} as const;
