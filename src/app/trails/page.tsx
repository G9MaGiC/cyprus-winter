import type { Metadata } from "next";
import TrailsClient from "./TrailsClient";

export const metadata: Metadata = {
  title: "Cyprus Winter Trails | Troodos, Paphos & Akamas Hiking",
  description:
    "Cyprus trails in winter: Troodos, Paphos, Akamas. Trail conditions, difficulty, length. Winter hiking tips. Check before you go. Sixteen degrees when home is six.",
};

export default function TrailsPage() {
  return <TrailsClient />;
}
