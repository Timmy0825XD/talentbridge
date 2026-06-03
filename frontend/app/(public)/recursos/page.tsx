import Link from "next/link";
import { publicLinks } from "@/src/content/site-links";
import InfoPageLayout from "@/src/components/info/InfoPageLayout";
import { HelpCircle, PlayCircle, Users, UserCheck, Building2, GraduationCap, SendHorizonal, FileSignature, FileText, Mail, ArrowRight } from "lucide-react";

const resourceCards = [
  { title: "Preguntas Frecuentes",   description: "Respuestas a las dudas más comunes.",        href: publicLinks.faq,                     icon: HelpCircle,    color: "from-[#00386c] to-[#1a4f8b]" },
  { title: "¿Cómo Funciona?",        description: "Flujo completo paso a paso.",                href: publicLinks.howItWorks,               icon: PlayCircle,    color: "from-[#006d37] to-[#00743a]" },
  { title: "Roles en la Plataforma", description: "Tipos de usuario y permisos.",               href: publicLinks.roles,                    icon: Users,         color: "from-[#00386c] to-[#1a4f8b]" },
  { title: "Para Candidatos",        description: "Guía para estudiantes y egresados.",          href: publicLinks.candidates,               icon: UserCheck,     color: "from-[#006d37] to-[#00743a]" },
  { title: "Para Empresas",          description: "Publica vacantes y encuentra talento.",       href: publicLinks.companies,                icon: Building2,     color: "from-[#00386c] to-[#1a4f8b]" },
  { title: "Para Universidades",     description: "Monitorea la inserción laboral.",             href: publicLinks.universities,             icon: GraduationCap, color: "from-[#006d37] to-[#00743a]" },
  { title: "Proceso de Postulación", description: "Estados del flujo de postulación.",           href: publicLinks.processes.applications,   icon: SendHorizonal, color: "from-[#00386c] to-[#1a4f8b]" },
  { title: "Proceso de Contratos",   description: "Ciclo completo de contratación.",             href: publicLinks.processes.contracts,       icon: FileSignature, color: "from-[#006d37] to-[#00743a]" },
  { title: "Términos de Servicio",   description: "Condiciones de uso.",                         href: publicLinks.terms,                    icon: FileText,      color: "from-[#424750] to-[#737781]" },
  { title: "Política de Privacidad", description: "Protección de datos personales.",             href: publicLinks.privacy,                  icon: FileText,      color: "from-[#424750] to-[#737781]" },
  { title: "Cookies",                description: "Uso de cookies y almacenamiento.",            href: publicLinks.cookies,                  icon: FileText,      color: "from-[#424750] to-[#737781]" },
  { title: "Contacto",               description: "Comunícate con el equipo.",                   href: publicLinks.contact,                  icon: Mail,          color: "from-[#00386c] to-[#1a4f8b]" },
];

export default function ResourcesPage() {
  return (
    <InfoPageLayout title="Recursos" description="Centro de documentación y guías de TalentBridge." breadcrumb={[{ label: "Recursos" }]}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resourceCards.map((card) => (
          <Link key={card.title} href={card.href}
            className="group flex items-start gap-4 p-5 rounded-xl bg-white border border-[#e6e8ea] hover:border-[#00386c]/20 hover:shadow-lg hover:shadow-[#00386c]/5 hover:-translate-y-0.5 transition-all duration-300">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold text-[#191c1e] text-sm group-hover:text-[#00386c] transition-colors">{card.title}</p>
                <ArrowRight className="w-3.5 h-3.5 text-[#c2c6d1] group-hover:text-[#00386c] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </div>
              <p className="text-xs text-[#737781] leading-relaxed">{card.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </InfoPageLayout>
  );
}