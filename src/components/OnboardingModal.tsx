"use client";

/**
 * First-time user onboarding modal
 * Short, warm tour. Discovery-first. No emojis, no hustle.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { CTA, CARD, SECTION } from "@/lib/design-tokens";

const ONBOARDING_KEY = "cyprus-winter-onboarded";

const steps = [
  {
    title: "Welcome to Cyprus Winter",
    description: "Trails, villages, wineries—plan as you go. No account needed.",
    accent: "terracotta",
  },
  {
    title: "Discover & Plan",
    description: "Explore places. Add to your plan. Book tastings and guided hikes.",
    accent: "terracotta",
  },
  {
    title: "Ask AI, Save Anywhere",
    description: "Tap Ask AI for tips. Create an account to sync across devices—or explore now.",
    accent: "sage",
  },
];

export function useOnboarding() {
  const [mounted, setMounted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setMounted(true);
      setShowOnboarding(!localStorage.getItem(ONBOARDING_KEY));
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const dismiss = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  };

  const reset = () => {
    localStorage.removeItem(ONBOARDING_KEY);
    setShowOnboarding(true);
  };

  return { showOnboarding, dismiss, reset, isClient: mounted };
}

export default function OnboardingModal() {
  const { showOnboarding, dismiss, isClient } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(0);

  if (!isClient || !showOnboarding) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      aria-describedby="onboarding-description"
    >
      <div className={`${CARD.base} max-w-md w-full p-6 sm:p-8 shadow-xl`}>
        {/* Progress dots — 44px touch targets */}
        <div className="flex justify-center gap-1 mb-6" role="tablist" aria-label="Onboarding steps">
          {steps.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === currentStep}
              aria-label={`Step ${i + 1} of ${steps.length}`}
              onClick={() => setCurrentStep(i)}
              className="flex items-center justify-center min-w-[44px] min-h-[44px] -m-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span
                className={`block w-2 h-2 rounded-full transition-colors ${
                  i === currentStep ? "bg-terracotta" : "bg-sand-300"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Content — typography-led, no emojis */}
        <div className="text-center mb-8">
          <div
            className={`h-0.5 w-8 mx-auto rounded-full ${SECTION.headingGap} ${
              step.accent === "terracotta" ? "bg-terracotta/40" : "bg-sage/40"
            }`}
            aria-hidden
          />
          <h2 id="onboarding-title" className="font-display text-2xl font-bold text-charcoal mb-3">
            {step.title}
          </h2>
          <p id="onboarding-description" className="text-olive/80 leading-relaxed text-base">
            {step.description}
          </p>
        </div>

        {/* Actions — last step: Explore now primary; Create account secondary; Sign in tertiary. Stack vertically. */}
        <div className={isLast ? "flex flex-col gap-3" : "flex flex-col sm:flex-row gap-3"}>
          {currentStep > 0 && !isLast && (
            <button
              type="button"
              onClick={() => setCurrentStep((s) => s - 1)}
              className={`${CTA.secondaryCompact} flex-1`}
              aria-label="Previous step"
            >
              Back
            </button>
          )}

          {isLast ? (
            <>
              <button
                type="button"
                onClick={dismiss}
                className={`${CTA.primaryCompact} w-full`}
                aria-label="Explore now without account"
              >
                Explore now
              </button>
              <div className="flex flex-col sm:flex-row gap-3 w-full" role="group" aria-label="Account options">
                <Link
                  href="/register"
                  onClick={dismiss}
                  className={`${CTA.secondaryCompact} flex-1 text-center`}
                  aria-label="Create account to save your plan"
                >
                  Create account
                </Link>
                <Link
                  href="/login"
                  onClick={dismiss}
                  className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-lg text-sm font-medium text-olive/70 hover:text-terracotta border border-sand-200/80 hover:border-terracotta/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label="Sign in to existing account"
                >
                  Sign in
                </Link>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setCurrentStep((s) => s + 1)}
                className={`${CTA.primaryCompact} flex-1`}
                aria-label="Next step"
              >
                Next
              </button>
            </>
          )}
        </div>

        {/* Skip — 44px touch target */}
        {!isLast && (
          <button
            type="button"
            onClick={dismiss}
            className="w-full mt-4 min-h-[44px] text-sm text-olive/50 hover:text-terracotta transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background flex items-center justify-center"
            aria-label="Skip onboarding tour"
          >
            Skip tour
          </button>
        )}
      </div>
    </div>
  );
}
