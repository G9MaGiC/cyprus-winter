import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-url";

const ogKourion = `${SITE_URL}/images/cyprus/cyprus-ancient-kourion.jpg`;
const ogMonastery = `${SITE_URL}/images/cyprus/cyprus-monastery-kykkos.jpg`;
const ogAirport = `${SITE_URL}/images/cyprus/cyprus-airport-coast.jpg`;
const ogVillage = `${SITE_URL}/images/cyprus/cyprus-village-omodos.jpg`;
const ogBeachNissi = `${SITE_URL}/images/cyprus/cyprus-beach-nissi.jpg`;
const ogWineryTroodos = `${SITE_URL}/images/cyprus/cyprus-winery-troodos.jpg`;

/** Bases without `alternates` — use `applyLocaleToMetadata(path, locale)` at call site. */
export const discoverListPageMeta: Metadata = {
  title: "Discover Cyprus Winter | Beaches, Villages, Wineries",
  description:
    "Cyprus in winter: curated places that feel real. Beaches, ancient sites, villages, wineries—plus bouldering, cycling, and coast adventures. Sixteen degrees when home is six.",
  openGraph: {
    title: "Discover Cyprus Winter | Beaches, Villages, Wineries",
    description:
      "Cyprus in winter: curated places that feel real. Beaches, ancient sites, villages, wineries—plus bouldering, cycling, and coast adventures.",
    type: "website",
    images: [
      {
        url: ogVillage,
        width: 1200,
        height: 630,
        alt: "Omodos village, Cyprus winter — discover curated places",
      },
    ],
  },
};

export const trailsListPageMeta: Metadata = {
  title: "Cyprus Winter Trails | Troodos, Paphos & Akamas Hiking",
  description:
    "Cyprus trails in winter: Troodos, Paphos, Akamas. Conditions, difficulty, length. Winter hiking tips. Sixteen degrees when home is six. Plan your hike.",
  openGraph: {
    title: "Cyprus Winter Trails | Troodos, Paphos & Akamas Hiking",
    description: "Cyprus trails in winter: Troodos, Paphos, Akamas. Conditions, difficulty, length.",
    type: "website",
  },
};

export const searchPageMeta: Metadata = {
  title: "Search Cyprus Winter | Trails, Wineries, Places",
  description:
    "Search Cyprus winter: trails, wineries, villages, beaches, ancient sites. Find Troodos hikes, Paphos mosaics, Lefkara. Plan or explore when you land. Free search.",
  openGraph: {
    title: "Search Cyprus Winter | Trails, Wineries, Places",
    description: "Search Cyprus winter: trails, wineries, villages, beaches. Find Troodos hikes, Paphos mosaics, Lefkara.",
    type: "website",
    images: [{ url: ogKourion, width: 1200, height: 630, alt: "Cyprus winter — find trails and places" }],
  },
};

export const teamPageMeta: Metadata = {
  title: "Team | Cyprus Winter — Trails, Villages, Wineries",
  description:
    "The people behind Cyprus Winter. Trails, villages, wineries—Cyprus in winter deserves more. Meet the team who built this guide. Sixteen degrees when home is six.",
};

export const airportPageMeta: Metadata = {
  title: "Just Landed? | Cyprus Winter Airport Guide",
  description:
    "Larnaca & Paphos arrivals: taxis, buses, car hire. Coast mild, Troodos cooler. Essential numbers and tips. Just landed? Start here.",
  openGraph: {
    title: "Just Landed? | Cyprus Winter Airport Guide",
    description: "Larnaca & Paphos arrivals: taxis, buses, car hire. Coast mild, Troodos cooler. Essential numbers.",
    type: "website",
    images: [{ url: ogAirport, width: 1200, height: 630, alt: "Cyprus winter — Larnaca and Paphos airport guide" }],
  },
};

export const beachesPageMeta: Metadata = {
  title: "Cyprus Winter Beaches | Nissi, Coral Bay, Konnos",
  description:
    "Best beaches in Cyprus winter: Nissi Beach, Coral Bay, Konnos Bay. Empty sand, golden light. Winter walks, no crowds. Sixteen degrees when home is six. Plan your visit. Free.",
  openGraph: {
    title: "Cyprus Winter Beaches | Nissi, Coral Bay, Konnos",
    description: "Best beaches in Cyprus winter: Nissi, Coral Bay, Konnos. Empty sand, golden light. Winter walks, no crowds.",
    type: "website",
    images: [{ url: ogBeachNissi, width: 1200, height: 630, alt: "Cyprus winter beach, golden light" }],
  },
};

export const villagesPageMeta: Metadata = {
  title: "Cyprus Villages in Winter | Lefkara, Omodos, Platres",
  description:
    "Cyprus villages in winter: Lefkara, Omodos, Platres. Cobbles, kafenions, fireside wine. Mountain and wine heartland. Plan or explore. Sixteen degrees when home is six. Free.",
  openGraph: {
    title: "Cyprus Villages in Winter | Lefkara, Omodos, Platres",
    description: "Cyprus villages in winter: Lefkara, Omodos, Platres. Cobbles, kafenions, fireside wine. Mountain and wine heartland.",
    type: "website",
    images: [{ url: ogVillage, width: 1200, height: 630, alt: "Omodos village, Cyprus winter" }],
  },
};

export const wineriesPageMeta: Metadata = {
  title: "Cyprus Wineries in Winter | Wine Routes & Tastings",
  description:
    "Cyprus winter wineries: Krasochoria, Laona, Commandaria. Fireside tastings, cosy cellars. Book ahead for winter visits. Sixteen degrees when home is six.",
  openGraph: {
    title: "Cyprus Wineries in Winter | Wine Routes & Tastings",
    description: "Cyprus winter wineries: Krasochoria, Laona, Commandaria. Fireside tastings, cosy cellars. Book ahead.",
    type: "website",
    images: [{ url: ogWineryTroodos, width: 1200, height: 630, alt: "Cyprus winery village, winter" }],
  },
};

export const secretsPageMeta: Metadata = {
  title: "Cyprus Winter Secrets | Local Tips & Hidden Spots",
  description:
    "Cyprus winter local secrets: quiet spots, hidden angles, kafenions, viewpoints. From people who live here. Pair with trails and villages. Insider tips.",
  openGraph: {
    title: "Cyprus Winter Secrets | Local Tips & Hidden Spots",
    description: "Cyprus winter local secrets: quiet spots, kafenions, viewpoints. From people who live here.",
    type: "website",
    images: [{ url: ogVillage, width: 1200, height: 630, alt: "Cyprus winter local secrets" }],
  },
};

export const troodosGuidePageMeta: Metadata = {
  title: "Best Troodos Trails in December | Cyprus Winter",
  description:
    "Troodos trails in December: Artemis, Atalante, Caledonia Falls. Clear paths, quiet slopes. What to pack, conditions, snow notes. Cyprus winter hiking guide.",
};

export const privacyPageMeta: Metadata = {
  title: "Privacy Policy — Cyprus Winter",
  description: "How Cyprus Winter collects, uses, and protects your data. GDPR-compliant. Data export and deletion available.",
  robots: { index: true, follow: true },
};

export const termsPageMeta: Metadata = {
  title: "Terms of Service — Cyprus Winter",
  description: "Terms of use for Cyprus Winter: trip planning, bookings, trail conditions, and user-generated content.",
  robots: { index: true, follow: true },
};

export const installPageMeta: Metadata = {
  title: "Install on SiteGround | Cyprus Winter",
  description: "Step-by-step instructions to deploy Cyprus Winter on SiteGround shared hosting. Static export, upload, and .htaccess setup.",
  robots: { index: false, follow: false },
};

export const bookGuideIndexPageMeta: Metadata = {
  title: "Book a Guided Hike | Cyprus Winter",
  description:
    "Guided winter hikes in Troodos, Paphos, and Akamas. Local guides for Artemis, Caledonia Falls, Adonis, and more. Small groups, winter expertise. Book ahead and they'll confirm by email.",
};

export const bookWineryIndexPageMeta: Metadata = {
  title: "Book a Wine Tasting | Cyprus Winter",
  description:
    "Book winter winery tastings across Cyprus wine routes. Verified tasting partners, cosy cellars, mountain villages, and email confirmation. Book ahead for winter visits.",
};

export const trailReportPageMeta: Metadata = {
  title: "Report trail conditions | Cyprus Winter",
  description: "Submit a quick update on trail conditions to help other hikers.",
  robots: { index: false, follow: true },
};

export const planSegmentMeta: Metadata = {
  title: "Plan Cyprus Winter | Curated Itineraries & Trip Builder",
  description:
    "Curated Cyprus winter itineraries: 48h to 10 days. Expert pacing, winery booking tips, seasonal advice. Troodos trails, villages, coast—plan ahead or when you land. Free.",
  openGraph: {
    title: "Plan Cyprus Winter | Curated Itineraries & Trip Builder",
    description: "Curated Cyprus winter itineraries with expert pacing and winery tips. Trails, villages, coast. Plan ahead or when you land.",
    type: "website",
  },
};

export const eventsSegmentMeta: Metadata = {
  title: "Cyprus Winter Events | Epiphany, Carnival, Markets",
  description:
    "Epiphany, carnival, Commandaria tastings, Christmas markets. What's on when you're here. Cyprus doesn't shut down when the sun dips. Plan your winter visit.",
  openGraph: {
    title: "Cyprus Winter Events | Epiphany, Carnival, Markets",
    description: "Epiphany, carnival, Commandaria tastings, Christmas markets. What's on when you're here.",
    type: "website",
    images: [{ url: ogMonastery, width: 1200, height: 630, alt: "Cyprus winter events" }],
  },
};

export const bookingsLayoutMeta: Metadata = {
  title: "My Bookings | Cyprus Winter",
  description:
    "View and manage your Cyprus Winter winery tastings and experiences. All bookings in one place. Sync from any device. Confirmations by email.",
  robots: { index: false, follow: true },
};

export const accountLayoutMeta: Metadata = {
  title: "My account | Cyprus Winter",
  description:
    "Sign in to sync your plan and bookings across devices. Your itinerary and tasting requests will follow you wherever you go.",
  robots: { index: false, follow: true },
};

export const loginLayoutMeta: Metadata = {
  title: "Sign in | Cyprus Winter",
  description: "Sign in to sync your plan and bookings across devices.",
  robots: { index: false, follow: true },
};

export const registerLayoutMeta: Metadata = {
  title: "Create account | Cyprus Winter",
  description: "Create a free account to sync your plan and bookings across devices.",
  robots: { index: false, follow: true },
};

export const forgotPasswordLayoutMeta: Metadata = {
  title: "Reset password | Cyprus Winter",
  description: "Request a password reset link to regain access to your account.",
  robots: { index: false, follow: true },
};

export const resetPasswordLayoutMeta: Metadata = {
  title: "Set new password | Cyprus Winter",
  description: "Set a new password for your account.",
  robots: { index: false, follow: true },
};

export const adminStatsPageMeta: Metadata = {
  title: "Admin — funnel stats | Cyprus Winter",
  description: "Internal conversion and funnel analytics for Cyprus Winter operators. Requires admin access.",
  robots: { index: false, follow: false },
};

export const accountSettingsLayoutMeta: Metadata = {
  title: "Settings | My account | Cyprus Winter",
  description: "Personalize your Cyprus Winter experience. Set interests, favorite regions, and notification preferences.",
  robots: { index: false, follow: true },
};

export const weatherHubPageMeta: Metadata = {
  title: "Cyprus Winter Weather by Month | Coast & Troodos",
  description:
    "Cyprus winter weather by month: coast 18–20°C, Troodos 8–12°C. Pack layers, plan trails and wineries. November to April. Sixteen degrees when home is six.",
  openGraph: {
    title: "Cyprus Winter Weather by Month | Coast & Troodos",
    description: "Cyprus winter weather by month: coast 18–20°C, Troodos 8–12°C. Pack layers, plan trails and wineries.",
    type: "website",
    images: [{ url: ogKourion, width: 1200, height: 630, alt: "Cyprus winter weather guide" }],
  },
};
