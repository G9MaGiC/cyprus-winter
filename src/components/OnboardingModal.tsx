"use client";

/**
 * First-time user onboarding modal
 * Shows key features and how to use the app
 */

import { useState } from "react";
import { CTA } from "@/lib/design-tokens";

const ONBOARDING_KEY = "cyprus-winter-onboarded";

const steps = [
  {
    title: "Welcome to Cyprus Winter",
    description: "Your guide to trails, villages, wineries, and winter experiences in Cyprus.",
    icon: "🏔️",
  },
  {
    title: "Discover Places",
    description: "Browse beaches, ancient sites, villages, and wineries. Filter by region and interest.",
    icon: "🔍",
  },
  {
    title: "Build Your Plan",
    description: "Add places to your itinerary. No account needed—your plan saves automatically.",
    icon: "📋",
  },
  {
    title: "Book Tastings",
    description: "Reserve winery tastings and experiences directly through the app.",
    icon: "🍷",
  },
  {
    title: "Ask AI for Help",
    description: "Stuck? Tap the chat button for personalized recommendations and tips.",
    icon: "💬",
  },
];

function getInitialOnboardingState(): boolean {
  if (typeof window === "undefined") return false;
  return !localStorage.getItem(ONBOARDING_KEY);
}

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(getInitialOnboardingState);
  const isClient = typeof window !== "undefined";

  const dismiss = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  };

  const reset = () => {
    localStorage.removeItem(ONBOARDING_KEY);
    setShowOnboarding(true);
  };

  return { showOnboarding, dismiss, reset, isClient };
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
    >
      <div className="bg-sand rounded-2xl max-w-md w-full p-6 shadow-2xl">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentStep(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentStep ? "bg-terracotta" : "bg-sand-300"
              }`}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4" aria-hidden>{step.icon}</div>
          <h2 id="onboarding-title" className="font-display text-2xl font-bold text-charcoal mb-3">
            {step.title}
          </h2>
          <p className="text-olive/70 leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={() => setCurrentStep((s) => s - 1)}
              className={`${CTA.secondaryCompact} flex-1`}
            >
              Back
            </button>
          )}
          
          {isLast ? (
            <>
              <button
                type="button"
                onClick={dismiss}
                className={`${CTA.primaryCompact} flex-1`}
              >
                Get started
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentStep((s) => s + 1)}
              className={`${CTA.primaryCompact} flex-1`}
            >
              Next
            </button>
          )}
        </div>

        {/* Skip */}
        {!isLast && (
          <button
            type="button"
            onClick={dismiss}
            className="w-full mt-4 text-sm text-olive/50 hover:text-terracotta transition-colors"
          >
            Skip tour
          </button>
        )}
      </div>
    </div>
  );
}
