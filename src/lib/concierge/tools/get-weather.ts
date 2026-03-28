import { weatherByMonth } from "@/data/weather";
import type { WeatherByMonth } from "@/data/weather";

export type GetWeatherInput = {
  month?: string;
};

export function getWeather(input: GetWeatherInput): WeatherByMonth | undefined {
  if (!input.month) return undefined;
  return weatherByMonth.find(
    (w) => w.month.toLowerCase() === input.month!.toLowerCase()
  );
}
