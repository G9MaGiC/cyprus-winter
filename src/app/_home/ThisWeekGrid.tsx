import "server-only";

import { getHomeThisWeekGridProps } from "@/app/_home/home-this-week-data";
import HomeThisWeekGridView from "@/app/_home/HomeThisWeekGridView";

type Props = { locale?: string };

export default async function ThisWeekGrid({ locale }: Props) {
  const props = await getHomeThisWeekGridProps(locale);
  return <HomeThisWeekGridView {...props} />;
}
