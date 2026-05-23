import "server-only";

import { getHomeWeatherStripProps } from "@/app/_home/home-weather-data";
import HomeWeatherStripView from "@/app/_home/HomeWeatherStripView";

type Props = { locale?: string };

export default async function HomeWeatherStrip({ locale }: Props) {
  const props = await getHomeWeatherStripProps(locale);
  return <HomeWeatherStripView {...props} />;
}
