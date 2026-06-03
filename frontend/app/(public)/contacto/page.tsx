import { Mail, Clock, MessageCircle, ArrowRight } from "lucide-react";
import { publicLinks } from "@/src/content/site-links";
import InfoPageLayout from "@/src/components/info/InfoPageLayout";
import Link from "next/link";

export default function ContactPage() {
  return (
    <InfoPageLayout title="Contacto" description="Estamos aquí para ayudarte." breadcrumb={[{ label: "Contacto" }]}>
      <div className="space-y-8">

        {/* Canales */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[#191c1e] font-headline flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-[#00386c]/10 to-[#006d37]/10 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-3.5 h-3.5 text-[#00386c]" />
            </div>
            Canales de Comunicación
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="group relative p-6 rounded-2xl border border-[#e6e8ea] bg-white hover:border-[#00386c]/20 hover:shadow-lg hover:shadow-[#00386c]/5 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00386c] to-[#1a4f8b] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              <div className="w-11 h-11 bg-gradient-to-br from-[#00386c] to-[#1a4f8b] rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <p className="font-bold text-[#191c1e] text-sm mb-1">Correo Electrónico</p>
              <p className="text-xs text-[#737781] leading-relaxed">
                Envíanos un mensaje y te responderemos a la brevedad posible.
              </p>
            </div>
            <div className="group relative p-6 rounded-2xl border border-[#e6e8ea] bg-white hover:border-[#006d37]/20 hover:shadow-lg hover:shadow-[#006d37]/5 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#006d37] to-[#4ae183] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              <div className="w-11 h-11 bg-gradient-to-br from-[#006d37] to-[#00743a] rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <p className="font-bold text-[#191c1e] text-sm mb-1">Horario de Atención</p>
              <p className="text-xs text-[#737781] leading-relaxed">
                Lunes a sábado de 6:00 AM a 11:00 PM (hora Colombia). Respondemos en máximo 24 horas hábiles.
              </p>
            </div>
          </div>
        </section>

        {/* Antes de contactar */}
        <section className="relative bg-gradient-to-br from-[#00386c]/[0.03] to-[#006d37]/[0.03] border border-[#00386c]/10 rounded-2xl p-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#00386c]/[0.04] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <h2 className="text-lg font-bold text-[#191c1e] font-headline mb-3">Antes de Contactarnos</h2>
          <p className="text-sm text-[#424750] leading-relaxed mb-4">
            Revisa nuestras secciones de ayuda donde encontrarás respuesta a las dudas más comunes sobre la plataforma.
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Preguntas Frecuentes", href: publicLinks.faq },
              { label: "Términos de Uso",       href: publicLinks.terms },
              { label: "Política de Privacidad", href: publicLinks.privacy },
            ].map(({ label, href }) => (
              <Link key={label} href={href}
                className="group inline-flex items-center gap-1.5 bg-white border border-[#e6e8ea] hover:border-[#00386c]/30 text-[#00386c] text-xs font-bold px-4 py-2 rounded-full transition-all hover:shadow-sm">
                {label}
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ))}
          </div>
        </section>

        {/* Tiempos */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#191c1e] font-headline">Tiempos de Respuesta</h2>
          <p className="text-sm text-[#424750] leading-relaxed">
            Nos esforzamos por responder todas las consultas en un plazo máximo de 24 horas hábiles. Para solicitudes
            relacionadas con derechos de protección de datos personales, el plazo de respuesta se ajusta a lo establecido
            por la Ley 1581 de 2012 y el Decreto 1377 de 2013.
          </p>
        </section>
      </div>
    </InfoPageLayout>
  );
}