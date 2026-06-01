import { publicLinks } from "@/src/content/site-links";
import { processesContent } from "@/src/content/processes";
import InfoPageLayout from "@/src/components/info/InfoPageLayout";

export default function ApplicationsProcessPage() {
  const { title, description, steps } = processesContent.applications;

  return (
    <InfoPageLayout title={title} description={description} breadcrumb={[{ label: "Información", href: publicLinks.resources }, { label: "Procesos" }, { label: title }]}>
      <div className="space-y-8">
        {steps.map((step) => (
          <section key={step.title} className="space-y-3">
            <h2 className="text-xl font-bold text-on-surface font-headline">{step.title}</h2>
            <p className="text-on-surface-variant leading-relaxed">{step.content}</p>
          </section>
        ))}
      </div>
    </InfoPageLayout>
  );
}
