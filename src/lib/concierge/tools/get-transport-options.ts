import { airports } from "@/data/airport";
import type { Airport } from "@/data/airport";

export type GetTransportInput = {
  airportCode: string;
};

export function getTransportOptions(input: GetTransportInput): Airport | undefined {
  return airports.find(
    (a) => a.code.toUpperCase() === input.airportCode.toUpperCase()
  );
}
