import DiscoverPage from "@/app/(padded)/discover/page";
import { buildDiscoverListMetadata } from "@/lib/discover-list-meta";

export default DiscoverPage;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ filter?: string | string[] }>;
}) {
  const [{ locale }, { filter }] = await Promise.all([params, searchParams]);
  return buildDiscoverListMetadata(locale, filter);
}
