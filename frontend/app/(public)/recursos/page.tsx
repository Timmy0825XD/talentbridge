import Link from "next/link";
import { publicLinks } from "@/src/content/site-links";
import InfoPageLayout from "@/src/components/info/InfoPageLayout";

const resourceCards = [
  {
    title: "Preguntas Frecuentes",
    description: "Respuestas a las dudas más comunes sobre la plataforma.",
    href: publicLinks.faq,
    icon: "?",
  },
  {
    title: "¿Cómo Funciona?",
    description: "El flujo completo de TalentBridge explicado paso a paso.",
    href: publicLinks.howItWorks,
    icon: ">",
  },
  {
    title: "Roles en la Plataforma",
    description: "Conoce los tipos de usuario y sus permisos.",
    href: publicLinks.roles,
    icon: "@",
  },
  {
    title: "Para Candidatos",
    description: "Guía para estudiantes y egresados.",
    href: publicLinks.candidates,
    icon: "U",
  },
  {
    title: "Para Empresas",
    description: "Publica vacantes y encuentra talento.",
    href: publicLinks.companies,
    icon: "E",
  },
  {
    title: "Para Universidades",
    description: "Monitorea la inserción laboral.",
    href: publicLinks.universities,
    icon: "I",
  },
  {
    title: "Procesos de Postulación",
    description: "Estados del flujo de postulación explicados.",
    href: publicLinks.processes.applications,
    icon: "P",
  },
  {
    title: "Procesos de Contratos",
    description: "Ciclo completo de contratación.",
    href: publicLinks.processes.contracts,
    icon: "C",
  },
  {
    title: "Términos de Servicio",
    description: "Condiciones de uso de la plataforma.",
    href: publicLinks.terms,
    icon: "L",
  },
  {
    title: "Política de Privacidad",
    description: "Protección de tus datos personales.",
    href: publicLinks.privacy,
    icon: "L",
  },
  {
    title: "Cookies",
    description: "Uso de cookies y almacenamiento local.",
    href: publicLinks.cookies,
    icon: "L",
  },
  {
    title: "Contacto",
    description: "Comunícate con el equipo de TalentBridge.",
    href: publicLinks.contact,
    icon: "@",
  },
];

export default function ResourcesPage() {
  return (
    <InfoPageLayout title="Recursos" description="Centro de documentación y guías de TalentBridge." breadcrumb={[{ label: "Recursos" }]}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resourceCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="flex items-start gap-4 p-5 rounded-xl bg-surface-container-low border border-outline-variant/20 hover:border-primary/40 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0 text-sm">
              {card.icon}
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-on-surface text-sm group-hover:text-primary transition-colors">{card.title}</p>
              <p className="text-xs text-on-surface-variant leading-relaxed">{card.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </InfoPageLayout>
  );
}
