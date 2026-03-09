import type { TrailStatus } from "@/data/trails";

export function buildTrailHref(params: {
  status?: TrailStatus;
  difficulty?: string;
  region?: string;
}): string {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.difficulty) q.set("difficulty", params.difficulty);
  if (params.region) q.set("region", params.region);
  return q.toString() ? `/trails?${q.toString()}` : "/trails";
}
