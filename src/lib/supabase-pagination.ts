const DEFAULT_PAGE_SIZE = 1000;

type SupabaseRangeResponse<T> = {
  data: T[] | null;
  error: unknown;
};

export type SupabaseRangeQuery<T> = {
  range(from: number, to: number): PromiseLike<SupabaseRangeResponse<T>>;
};

export async function fetchAllSupabaseRows<T>(
  buildQuery: () => SupabaseRangeQuery<T>,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<SupabaseRangeResponse<T>> {
  const data: T[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data: pageRows, error } = await buildQuery().range(from, from + pageSize - 1);
    if (error) return { data: null, error };

    const rows = pageRows ?? [];
    data.push(...rows);
    if (rows.length < pageSize) break;
  }

  return { data, error: null };
}
