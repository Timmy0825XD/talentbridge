import { institutionalContent } from "@/src/content/institutional";
import InfoPageLayout from "@/src/components/info/InfoPageLayout";

export default function AboutPage() {
  const { title, description, sections } = institutionalContent.about;

  return (
    <InfoPageLayout title={title} description={description} breadcrumb={[{ label: title }]}>
      {sections.map((section) => (
        <section key={section.title} className="space-y-3">
          <h2 className="text-xl font-bold text-on-surface font-headline">{section.title}</h2>
          <p className="text-on-surface-variant leading-relaxed">{section.content}</p>
        </section>
      ))}
    </InfoPageLayout>
  );
}
