"use client";

import { useState } from "react";
import { ChevronDown, MessageCircleQuestion } from "lucide-react";
import { faqContent } from "@/src/content/faq";
import InfoPageLayout from "@/src/components/info/InfoPageLayout";

function AccordionItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`border rounded-xl overflow-hidden transition-all duration-300 ${
      open ? "border-[#00386c]/20 bg-[#00386c]/[0.02] shadow-sm" : "border-[#e6e8ea] hover:border-[#00386c]/15"
    }`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition-colors"
      >
        <span className={`text-sm font-semibold transition-colors ${open ? "text-[#00386c]" : "text-[#191c1e]"}`}>
          {question}
        </span>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
          open ? "bg-[#00386c] rotate-180" : "bg-[#f2f4f6]"
        }`}>
          <ChevronDown className={`w-4 h-4 transition-colors ${open ? "text-white" : "text-[#424750]"}`} />
        </div>
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? "500px" : "0", opacity: open ? 1 : 0 }}
      >
        <div className="px-5 pb-5 text-sm text-[#424750] leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const { title, description, categories } = faqContent;

  return (
    <InfoPageLayout title={title} description={description} breadcrumb={[{ label: title }]}>
      {categories.map((category) => (
        <section key={category.name} className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-[#00386c]/10 to-[#006d37]/10 rounded-lg flex items-center justify-center">
              <MessageCircleQuestion className="w-4 h-4 text-[#00386c]" />
            </div>
            <h2 className="text-lg font-bold text-[#191c1e] font-headline">{category.name}</h2>
          </div>
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