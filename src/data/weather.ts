/**
 * Cyprus winter weather by month. Coast = Larnaca/Limassol/Paphos; Troodos = mountain villages and peaks.
 * Typical planning ranges (long-term averages), not live forecasts—check current conditions before hiking or driving high roads.
 */
export type WeatherByMonth = {
  month: string;
  coastMinC: number;
  coastMaxC: number;
  coastDesc: string;
  troodosMinC: number;
  troodosMaxC: number;
  troodosDesc: string;
};

export const weatherByMonth: WeatherByMonth[] = [
  {
    month: "November",
    coastMinC: 12,
    coastMaxC: 22,
    coastDesc: "Still mild. Light jacket for evenings. Beaches empty, ruins at their best.",
    troodosMinC: 5,
    troodosMaxC: 14,
    troodosDesc: "Cool mornings. Trails clear. Ski season not yet; best for hiking.",
  },
  {
    month: "December",
    coastMinC: 9,
    coastMaxC: 18,
    coastDesc: "Mild days, cool nights. Layers. Christmas markets and mulled wine.",
    troodosMinC: 2,
    troodosMaxC: 10,
    troodosDesc: "Snow possible from mid‑month up high. Ski resort usually opens when snow allows—check before you go.",
  },
  {
    month: "January",
    coastMinC: 8,
    coastMaxC: 17,
    coastDesc: "Coolest month. Still sunny. Ruins and villages; pack a warm layer.",
    troodosMinC: 0,
    troodosMaxC: 8,
    troodosDesc: "Peak ski season on Olympus when snow holds. Lower trails may be icy after frost—book tastings; wineries warm inside.",
  },
  {
    month: "February",
    coastMinC: 8,
    coastMaxC: 17,
    coastDesc: "Similar to January. Almond blossoms from late Feb. Longer days.",
    troodosMinC: 1,
    troodosMaxC: 9,
    troodosDesc: "Ski often holds into early spring; lower elevations thaw first. Crocus and cyclamen.",
  },
  {
    month: "March",
    coastMinC: 10,
    coastMaxC: 19,
    coastDesc: "Spring light. Wildflowers inland. Sea still cold; beach walks fine.",
    troodosMinC: 3,
    troodosMaxC: 12,
    troodosDesc: "Best hiking month. Snow melts, trails open. Persephone trail blooms.",
  },
  {
    month: "April",
    coastMinC: 13,
    coastMaxC: 22,
    coastDesc: "Warm. Some swim. Easter dates vary; villages come alive.",
    troodosMinC: 6,
    troodosMaxC: 15,
    troodosDesc: "Mountain green. All trails open. Spring clarity.",
  },
];
