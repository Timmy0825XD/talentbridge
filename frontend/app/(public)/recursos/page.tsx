import Link from "next/link";
import { publicLinks } from "@/src/content/site-links";
import InfoPageLayout from "@/src/components/info/InfoPageLayout";
import { HelpCircle, PlayCircle, Users, UserCheck, Building2, GraduationCap, SendHorizonal, FileSignature, FileText, Mail } from "lucide-react";

const resourceCards = [
  {
    title: "Preguntas Frecuentes",
    description: "Respuestas a las dudas más comunes sobre la plataforma.",
    href: publicLinks.faq,
    icon: HelpCircle,
  },
  {
    title: "¿Cómo Funciona?",
    description: "El flujo completo de TalentBridge explicado paso a paso.",
    href: publicLinks.howItWorks,
    icon: PlayCircle,
  },
  {
    title: "Roles en la Plataforma",
    description: "Conoce los tipos de usuario y sus permisos.",
    href: publicLinks.roles,
    icon: Users,
  },
  {
    title: "Para Candidatos",
    description: "Guía para estudiantes y egresados.",
    href: publicLinks.candidates,
    icon: UserCheck,
  },
  {
    title: "Para Empresas",
    description: "Publica vacantes y encuentra talento.",
    href: publicLinks.companies,
    icon: Building2,
  },
  {
    title: "Para Universidades",
    description: "Monitorea la inserción laboral.",
    href: publicLinks.universities,
    icon: GraduationCap,
  },
  {
    title: "Procesos de Postulación",
    description: "Estados del flujo de postulación explicados.",
    href: publicLinks.processes.applications,
    icon: SendHorizonal,
  },
  {
    title: "Procesos de Contratos",
    description: "Ciclo completo de contratación.",
    href: publicLinks.processes.contracts,
    icon: FileSignature,
  },
  {
    title: "Términos de Servicio",
    description: "Condiciones de uso de la plataforma.",
    href: publicLinks.terms,
    icon: FileText,
  },
  {
    title: "Política de Privacidad",
    description: "Protección de tus datos personales.",
    href: publicLinks.privacy,
    icon: FileText,
  },
  {
    title: "Cookies",
    description: "Uso de cookies y almacenamiento local.",
    href: publicLinks.cookies,
    icon: FileText,
  },
  {
    title: "Contacto",
    description: "Comunícate con el equipo de TalentBridge.",
    href: publicLinks.contact,
    icon: Mail,
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
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <card.icon className="w-5 h-5" />
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
