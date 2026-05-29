import { preload } from "react-dom";
import EventsPageClient from "./EventsPageClient";

const EVENTS_HERO_IMAGE = "/images/cyprus/cyprus-monastery-kykkos.jpg";

export default function EventsPage() {
  preload(EVENTS_HERO_IMAGE, { as: "image" });
  return <EventsPageClient />;
}
