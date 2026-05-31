import Link from "next/link";

interface InfoCalloutProps {
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
}

export default function InfoCallout({ title, description, href, linkLabel }: InfoCalloutProps) {
  return (
    <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-5 space-y-2">
      <p className="font-semibold text-on-surface text-sm">{title}</p>
      <p className="text-sm text-on-surface-variant">{description}</p>
      {href && (
        <Link
          href={href}
          className="inline-block text-sm font-semibold text-secondary hover:text-secondary-container transition-colors"
        >
          {linkLabel ?? "Más información"} &rarr;
        </Link>
      )}
    </div>
  );
}
