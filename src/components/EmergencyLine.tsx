import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

type EmergencyLineProps = {
  /** Footer-style pill wrapper; default inline text for error pages. */
  variant?: "inline" | "pill";
  className?: string;
};

function Tel({
  href,
  children,
  strongClass,
}: {
  href: string;
  children: ReactNode;
  strongClass?: string;
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center min-h-[44px] py-2 -my-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegean/50 rounded"
    >
      <strong className={strongClass}>{children}</strong>
    </a>
  );
}

export default function EmergencyLine({ variant = "inline", className = "" }: EmergencyLineProps) {
  const tCommon = useTranslations("common");
  const strongClass = variant === "pill" ? "text-charcoal font-semibold" : undefined;

  const content = (
    <>
      {tCommon("emergency")}{" "}
      <Tel href="tel:112" strongClass={strongClass}>
        112
      </Tel>
      {" · "}
      {tCommon("touristInfo")}{" "}
      <Tel href="tel:1460" strongClass={strongClass}>
        1460
      </Tel>
      {" · "}
      {tCommon("ambulance")}{" "}
      <Tel href="tel:199" strongClass={strongClass}>
        199
      </Tel>
    </>
  );

  if (variant === "pill") {
    return (
      <div
        className={`inline-flex flex-wrap justify-center gap-x-4 gap-y-1 px-4 py-3 rounded-xl bg-sand-200/60 border border-sand-200/80 text-xs text-olive/80 mx-auto w-fit ${className}`}
      >
        <span>{content}</span>
      </div>
    );
  }

  return (
    <p className={`text-sm text-olive/60 break-words ${className}`}>{content}</p>
  );
}
