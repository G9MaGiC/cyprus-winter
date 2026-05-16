const DEFAULT_PAGE_SIZE = 1000;

type SupabaseRangeResult<T> = {
  data: T[] | null;
  error: unknown;
};

type SupabaseRangeQuery<T> = {
  range(from: number, to: number): PromiseLike<SupabaseRangeResult<T>>;
};

export async function fetchAllSupabaseRows<T>(
  createQuery: () => SupabaseRangeQuery<T>,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<SupabaseRangeResult<T>> {
  const rows: T[] = [];

  for (let from = 0; ; from += pageSize) {
    const to = from + pageSize - 1;
    const { data, error } = await createQuery().range(from, to);
    if (error) return { data: null, error };

    const page = data ?? [];
    rows.push(...page);
    if (page.length < pageSize) break;
  }

  return { data: rows, error: null };
}
