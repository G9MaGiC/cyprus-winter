import { useTranslations } from "next-intl";

type EmergencyLineProps = {
  /** Footer-style pill wrapper; default inline text for error pages. */
  variant?: "inline" | "pill";
  className?: string;
};

export default function EmergencyLine({ variant = "inline", className = "" }: EmergencyLineProps) {
  const tCommon = useTranslations("common");

  const content = (
    <>
      {tCommon("emergency")}{" "}
      <strong className={variant === "pill" ? "text-charcoal font-semibold" : undefined}>112</strong>
      {" · "}
      {tCommon("touristInfo")}{" "}
      <strong className={variant === "pill" ? "text-charcoal font-semibold" : undefined}>1460</strong>
      {" · "}
      {tCommon("ambulance")}{" "}
      <strong className={variant === "pill" ? "text-charcoal font-semibold" : undefined}>199</strong>
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
