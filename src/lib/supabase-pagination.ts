const DEFAULT_PAGE_SIZE = 1000;

export type SupabaseRangeQuery<T> = {
  range: (
    from: number,
    to: number
  ) => PromiseLike<{ data: T[] | null; error: unknown }>;
};

export async function fetchAllSupabaseRows<T>(
  createQuery: () => SupabaseRangeQuery<T>,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<{ data: T[]; error: unknown | null }> {
  const rows: T[] = [];

  for (let from = 0; ; from += pageSize) {
    const to = from + pageSize - 1;
    const { data, error } = await createQuery().range(from, to);
    if (error) return { data: rows, error };

    const page = data ?? [];
    rows.push(...page);
    if (page.length < pageSize) break;
  }

  return { data: rows, error: null };
}
