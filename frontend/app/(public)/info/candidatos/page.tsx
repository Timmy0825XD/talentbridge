import { publicLinks } from "@/src/content/site-links";
import { institutionalContent } from "@/src/content/institutional";
import InfoPageLayout from "@/src/components/info/InfoPageLayout";

export default function CandidatesPage() {
  const { title, description, sections } = institutionalContent.candidates;

  return (
    <InfoPageLayout title={title} description={description} breadcrumb={[{ label: "Información", href: publicLinks.resources }, { label: title }]}>
      {sections.map((section) => (
        <section key={section.title} className="space-y-3">
          <h2 className="text-xl font-bold text-on-surface font-headline">{section.title}</h2>
          <p className="text-on-surface-variant leading-relaxed">{section.content}</p>
        </section>
      ))}
    </InfoPageLayout>
  );
}
