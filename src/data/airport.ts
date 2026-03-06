export type Airport = {
  code: string;
  name: string;
  city: string;
  transport: TransportOption[];
  tips: string[];
};

export type TransportOption = {
  type: string;
  description: string;
  approxCost: string;
  duration?: string;
  tip?: string;
};

export const airports: Airport[] = [
  {
    code: "LCA",
    name: "Larnaca International",
    city: "Larnaca",
    transport: [
      {
        type: "Taxi",
        description: "Meet & greet, fixed rates. Best for late arrivals or groups.",
        approxCost: "€25 to 45 to Larnaca, €50 to 70 to Limassol, €80 to 100 to Paphos",
        duration: "15 to 60 min",
        tip: "Pre-book online for best rates; drivers meet you at arrivals.",
      },
      {
        type: "Bus",
        description: "Kapnos shuttle to main resorts. Comfortable, affordable.",
        approxCost: "€8 to 15 one-way",
        duration: "30 to 90 min",
        tip: "Check schedules for your resort; book online or at desk.",
      },
      {
        type: "Car rental",
        description: "Drive on the left. International license accepted.",
        approxCost: "€25 to 60/day",
        tip: "Book in advance; major companies at arrivals.",
      },
    ],
    tips: [
      "Free WiFi at arrivals. Grab a coffee and browse if you haven't already.",
      "EU SIMs work. Local SIMs available at arrivals for data.",
      "Euro (€) only. ATMs and exchange at arrivals. Small village shops prefer cash.",
      "Emergency 112 · Tourist info 1460 · Save both.",
    ],
  },
  {
    code: "PFO",
    name: "Paphos International",
    city: "Paphos",
    transport: [
      {
        type: "Taxi",
        description: "Meet & greet at arrivals. Fixed fares to Paphos, Coral Bay, Limassol.",
        approxCost: "€25 to 35 to Paphos, €60 to 80 to Limassol, €120 to 150 to Larnaca",
        duration: "15 to 90 min",
        tip: "Pre-booking avoids queues; 24/7 availability.",
      },
      {
        type: "Bus",
        description: "612 to Paphos harbour and resort areas. Cheap and straightforward.",
        approxCost: "€2 to 4",
        duration: "30 to 45 min",
        tip: "Runs regularly; check timetables for evening arrivals.",
      },
      {
        type: "Car rental",
        description: "Best if you plan to hit the mosaics, beaches, and wine villages. The west rewards a car.",
        approxCost: "€25 to 60/day",
        tip: "Mosaics, villages, Lara Beach: all within an hour. Book ahead and you're set.",
      },
    ],
    tips: [
      "Smaller than Larnaca. Usually quicker through customs.",
      "Ancient sites, beaches, wine villages within reach. Coral Bay, mosaics, Lara Beach.",
      "Drive on the left. Emergency 112 · Tourist info 1460.",
    ],
  },
];
