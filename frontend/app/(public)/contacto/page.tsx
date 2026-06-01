import { Mail, Clock } from "lucide-react";
import { publicLinks } from "@/src/content/site-links";
import InfoPageLayout from "@/src/components/info/InfoPageLayout";
import Link from "next/link";

export default function ContactPage() {
  return (
    <InfoPageLayout title="Contacto" description="Estamos aquí para ayudarte." breadcrumb={[{ label: "Contacto" }]}>
      <div className="space-y-6">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-on-surface font-headline">Canales de Comunicación</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-4 p-5 rounded-xl bg-surface-container-low border border-outline-variant/20">
              <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-on-surface text-sm">Correo Electrónico</p>
                <p className="text-sm text-on-surface-variant">
                  Envíanos un mensaje a nuestro correo de contacto y te responderemos a la brevedad.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 rounded-xl bg-surface-container-low border border-outline-variant/20">
              <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-on-surface text-sm">Horario de Atención</p>
                <p className="text-sm text-on-surface-variant">
                  Lunes a sábado de 6:00 AM a 11:00 PM (hora Colombia). Respondemos en un máximo de 24 horas hábiles.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-on-surface font-headline">Antes de Contactarnos</h2>
          <p className="text-on-surface-variant leading-relaxed">
            Revisa nuestra sección de{" "}
            <Link href={publicLinks.faq} className="text-primary font-semibold hover:underline underline-offset-4">
              Preguntas Frecuentes
            </Link>{" "}
            donde encontrarás respuesta a las dudas más comunes sobre la plataforma. También puedes consultar nuestras{" "}
            <Link href={publicLinks.terms} className="text-primary font-semibold hover:underline underline-offset-4">
              Condiciones de Uso
            </Link>{" "}
            y{" "}
            <Link href={publicLinks.privacy} className="text-primary font-semibold hover:underline underline-offset-4">
              Política de Privacidad
            </Link>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-on-surface font-headline">Tiempos de Respuesta</h2>
          <p className="text-on-surface-variant leading-relaxed">
            Nos esforzamos por responder todas las consultas en un plazo máximo de 24 horas hábiles. Para solicitudes
            relacionadas con derechos de protección de datos personales, el plazo de respuesta se ajusta a lo establecido
            por la Ley 1581 de 2012 y el Decreto 1377 de 2013.
          </p>
        </section>
      </div>
    </InfoPageLayout>
  );
}
