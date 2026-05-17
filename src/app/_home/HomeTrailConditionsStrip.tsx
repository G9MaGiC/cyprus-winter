import "server-only";

import { getHomeTrailConditionsStripProps } from "@/app/_home/home-trail-conditions-data";
import HomeTrailConditionsStripView from "@/app/_home/HomeTrailConditionsStripView";

type Props = { locale?: string };

export default async function HomeTrailConditionsStrip({ locale }: Props) {
  const props = await getHomeTrailConditionsStripProps(locale);
  return <HomeTrailConditionsStripView {...props} />;
}
