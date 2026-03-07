import { trails } from "@/data/trails";

export function generateStaticParams() {
  return trails.flatMap((t) =>
    t.slug !== t.id ? [{ id: t.id }, { id: t.slug }] : [{ id: t.id }]
  );
}

export default function TrailIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
