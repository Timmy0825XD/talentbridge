import { legalContent } from "@/src/content/legal";
import InfoPageLayout from "@/src/components/info/InfoPageLayout";

export default function TermsPage() {
  const { title, description, sections } = legalContent.terms;

  return (
    <InfoPageLayout title={title} description={description} breadcrumb={[{ label: "Legal" }, { label: title }]}>
      {sections.map((section) => (
        <section key={section.title} className="space-y-3">
          <h2 className="text-xl font-bold text-on-surface font-headline">{section.title}</h2>
          <p className="text-on-surface-variant leading-relaxed">{section.content}</p>
        </section>
      ))}
    </InfoPageLayout>
  );
}
