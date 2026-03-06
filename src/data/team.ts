export type TeamMember = {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  bio: string;
  linkedIn?: string;
};

export const team: TeamMember[] = [
  {
    id: "ceo",
    name: "Alex Costa",
    role: "CEO & Co-founder",
    expertise: ["Travel tech", "Scale-ups", "Go-to-market"],
    bio: "Ex-Head of Product at a leading European OTA. 15+ years building travel products that convert browsers into bookers.",
    linkedIn: "#",
  },
  {
    id: "cto",
    name: "Yuki Tanaka",
    role: "CTO & Co-founder",
    expertise: ["Product eng", "Platforms", "AI/ML"],
    bio: "Former Staff Engineer at Booking.com. Built mobile and AI systems serving 100M+ users. Y Combinator alum.",
    linkedIn: "#",
  },
  {
    id: "cpo",
    name: "Maria Vasquez",
    role: "Chief Product Officer",
    expertise: ["UX", "Consumer apps", "Growth"],
    bio: "Led product at Airbnb Experiences. Expert in discovery and personalization for destination travel.",
    linkedIn: "#",
  },
  {
    id: "tourism",
    name: "Nicos Andreas",
    role: "Chief Tourism Officer",
    expertise: ["Cyprus tourism", "Destination mgmt", "Hospitality"],
    bio: "20 years in Cyprus tourism. Former Director at Cyprus Tourism Organisation. Deep local networks and policy experience.",
    linkedIn: "#",
  },
  {
    id: "growth",
    name: "Sofia Bergström",
    role: "Head of Growth",
    expertise: ["Performance", "Partnerships", "Airport ops"],
    bio: "Ex-growth lead at a Nordic travel startup. Expert in airport acquisition, affiliate deals, and tourism boards.",
    linkedIn: "#",
  },
  {
    id: "design",
    name: "James Okonkwo",
    role: "Head of Design",
    expertise: ["Brand", "Mobile-first", "Accessibility"],
    bio: "Design lead at multiple travel and lifestyle apps. Focus on inclusive, high-converting experiences.",
    linkedIn: "#",
  },
  {
    id: "ux-designer",
    name: "Lena Müller",
    role: "Senior UX Designer",
    expertise: ["User research", "Journey mapping", "Wireframes"],
    bio: "Former UX lead at GetYourGuide. Specializes in travel discovery flows and conversion optimization.",
    linkedIn: "#",
  },
  {
    id: "ui-designer",
    name: "Kostas Papadopoulos",
    role: "UI Designer",
    expertise: ["Visual design", "Design systems", "Iconography"],
    bio: "Cyprus-based designer. Brings Mediterranean aesthetic and local cultural nuance to every screen.",
    linkedIn: "#",
  },
  {
    id: "frontend-dev",
    name: "Emma Chen",
    role: "Senior Frontend Developer",
    expertise: ["React", "Next.js", "Performance"],
    bio: "Ex-Spotify. Builds fast, accessible web apps. Loves making travel experiences smooth on mobile.",
    linkedIn: "#",
  },
  {
    id: "backend-dev",
    name: "Marcus Lindqvist",
    role: "Backend Developer",
    expertise: ["APIs", "Databases", "Integrations"],
    bio: "Backend specialist from Stockholm. Shipping reliable booking and notification systems.",
    linkedIn: "#",
  },
  {
    id: "fullstack-dev",
    name: "Dimitra Ioannou",
    role: "Full-stack Developer",
    expertise: ["TypeScript", "Supabase", "AI integration"],
    bio: "Cyprus native. Connects our AI assistant and booking flows. YC-backed startup alum.",
    linkedIn: "#",
  },
];
