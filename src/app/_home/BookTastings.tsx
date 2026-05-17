import "server-only";

import { getHomeFeaturedWineries } from "@/app/_home/home-featured-wineries-data";
import BookTastingsView from "@/app/_home/BookTastingsView";

type Props = { locale?: string };

export default async function BookTastings({ locale }: Props) {
  const featured = await getHomeFeaturedWineries(locale);
  return <BookTastingsView featured={featured} />;
}
