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
    bio: "15+ years building consumer travel products, from early-stage teams to European scale-ups.",
    linkedIn: "#",
  },
  {
    id: "cto",
    name: "Yuki Tanaka",
    role: "CTO & Co-founder",
    expertise: ["Product eng", "Platforms", "AI/ML"],
    bio: "Engineer of large-scale travel platforms and mobile systems. Leads the product engineering and AI work behind the app.",
    linkedIn: "#",
  },
  {
    id: "cpo",
    name: "Maria Vasquez",
    role: "Chief Product Officer",
    expertise: ["UX", "Consumer apps", "Growth"],
    bio: "Product leader in destination travel. Focused on discovery and personalisation that respect the traveller's pace.",
    linkedIn: "#",
  },
  {
    id: "tourism",
    name: "Nicos Andreas",
    role: "Chief Tourism Officer",
    expertise: ["Cyprus tourism", "Destination mgmt", "Hospitality"],
    bio: "20 years in Cyprus tourism and destination management. Deep local networks across hotels, wineries, and trail communities.",
    linkedIn: "#",
  },
  {
    id: "growth",
    name: "Sofia Bergström",
    role: "Head of Growth",
    expertise: ["Performance", "Partnerships", "Airport ops"],
    bio: "Growth background in Nordic travel startups. Builds airport, partner, and tourism-board relationships.",
    linkedIn: "#",
  },
  {
    id: "design",
    name: "James Okonkwo",
    role: "Head of Design",
    expertise: ["Brand", "Mobile-first", "Accessibility"],
    bio: "Design lead across travel and lifestyle apps. Focus on inclusive, calm interfaces that let places speak.",
    linkedIn: "#",
  },
  {
    id: "ux-designer",
    name: "Lena Müller",
    role: "Senior UX Designer",
    expertise: ["User research", "Journey mapping", "Wireframes"],
    bio: "UX researcher and designer for travel discovery. Maps real journeys — airport to trailhead — before drawing a screen.",
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
    bio: "Builds fast, accessible web apps. Cares about how travel feels on a phone with one bar of signal.",
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
    bio: "Cyprus native. Connects the AI assistant and booking flows to the island's real data.",
    linkedIn: "#",
  },
];
