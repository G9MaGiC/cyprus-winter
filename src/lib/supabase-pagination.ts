const DEFAULT_PAGE_SIZE = 1000;

type SupabaseRangeQuery<T> = {
  range(from: number, to: number): PromiseLike<{ data: T[] | null; error: unknown }>;
};

export async function fetchAllSupabaseRows<T>(
  buildQuery: () => SupabaseRangeQuery<T>,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<{ data: T[] | null; error: unknown }> {
  const rows: T[] = [];
  let from = 0;

  while (true) {
    const to = from + pageSize - 1;
    const { data, error } = await buildQuery().range(from, to);

    if (error) return { data: null, error };

    const page = data ?? [];
    rows.push(...page);

    if (page.length < pageSize) {
      return { data: rows, error: null };
    }

    from += pageSize;
  }
}
