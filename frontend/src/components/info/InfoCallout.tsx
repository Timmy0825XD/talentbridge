import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";

interface InfoCalloutProps {
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
}

export default function InfoCallout({ title, description, href, linkLabel }: InfoCalloutProps) {
  return (
    <div className="relative bg-gradient-to-br from-[#00386c]/[0.04] to-[#006d37]/[0.04] border border-[#00386c]/10 rounded-2xl p-5 overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-[#00386c]/[0.04] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="relative flex items-start gap-3">
        <div className="w-8 h-8 bg-[#00386c]/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
          <Info className="w-4 h-4 text-[#00386c]" />
        </div>
        <div className="space-y-1.5">
          <p className="font-bold text-[#191c1e] text-sm">{title}</p>
          <p className="text-sm text-[#424750] leading-relaxed">{description}</p>
          {href && (
            <Link
              href={href}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#00386c] hover:text-[#006d37] transition-colors group mt-1"
            >
              {linkLabel ?? "Más información"}
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}