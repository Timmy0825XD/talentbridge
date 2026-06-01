"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { faqContent } from "@/src/content/faq";
import InfoPageLayout from "@/src/components/info/InfoPageLayout";

function AccordionItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-outline-variant/20 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
      >
        {question}
        <ChevronDown className={`w-4 h-4 flex-shrink-0 text-on-surface-variant transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-on-surface-variant leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const { title, description, categories } = faqContent;

  return (
    <InfoPageLayout title={title} description={description} breadcrumb={[{ label: title }]}>
      {categories.map((category) => (
        <section key={category.name} className="space-y-3">
          <h2 className="text-xl font-bold text-on-surface font-headline">{category.name}</h2>
          <div className="space-y-2">
            {category.items.map((item) => (
              <AccordionItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </section>
      ))}
    </InfoPageLayout>
  );
}
