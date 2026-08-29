"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import BackLink from "@/components/BackLink";
import { CARD, LAYOUT, SECTION, TYPE } from "@/lib/design-tokens";
import { AUTH_HERO_IMAGE } from "@/lib/cyprus-images";
import { useTranslations } from "next-intl";

export type AuthVariant = "login" | "register" | "forgot" | "success";

export type AuthLayoutProps = {
  variant: AuthVariant;
  title: string;
  subtitle: ReactNode;
  kicker?: string;
  backHref: string;
  backLabel: string;
  children: ReactNode;
  imageSrc?: string;
  footer?: ReactNode;
};

export default function AuthLayout({
  variant,
  title,
  subtitle,
  kicker,
  backHref,
  backLabel,
  children,
  imageSrc = AUTH_HERO_IMAGE,
  footer,
}: AuthLayoutProps) {
  const tAuth = useTranslations("auth");

  return (
    <div className="min-h-[70vh] lg:min-h-[80vh] grid lg:grid-cols-2">
      {/* Hero image — left on desktop, top on mobile */}
      <div className="relative order-first h-[40vh] lg:h-auto lg:min-h-[80vh] w-full overflow-hidden">
        <Image
          src={imageSrc}
          alt={tAuth("layout.heroAlt")}
          fill
          className="object-cover object-center"
          priority
          sizes="(max-width: 1023px) 100vw, 50vw"
        />
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-t from-charcoal/60 via-charcoal/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-charcoal/30 lg:to-charcoal/60"
          aria-hidden
        />
      </div>

      {/* Form panel — right on desktop, below image on mobile */}
      <div
        className={`order-last flex flex-col ${LAYOUT.safeAreaX} py-8 sm:py-12 lg:py-16 lg:ps-12 lg:pe-16 xl:ps-16 xl:pe-24 bg-background`}
      >
        <BackLink href={backHref} label={backLabel} />

        <div
          className={`${CARD.base} ${CARD.contentLg} mt-8 sm:mt-10 lg:mt-12 border-s-4 ${variant === "success" ? "border-s-aegean/50" : "border-s-terracotta/50"}`}
          {...(variant === "success" && {
            role: "status",
            "aria-live": "polite",
          })}
        >
          {kicker && (
            <p
              className={`text-xs font-semibold uppercase tracking-[0.15em] mb-2 ${variant === "success" ? "text-aegean" : "text-terracotta"}`}
            >
              {kicker}
            </p>
          )}
          <h1 className={`${TYPE.sectionTitle} text-charcoal ${SECTION.titleGap}`}>
            {title}
          </h1>
          <p className="text-muted-ink text-base leading-relaxed mb-8">{subtitle}</p>

          {children}
        </div>

        {footer && (
          <p className="mt-8 text-center text-sm text-muted-ink">{footer}</p>
        )}
      </div>
    </div>
  );
}
