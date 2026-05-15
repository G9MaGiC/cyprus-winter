type SupabaseRowsResult<T> = {
  data: T[] | null;
  error: unknown;
};

export type SupabasePagedQuery<T> = {
  range: (from: number, to: number) => PromiseLike<SupabaseRowsResult<T>>;
};

const DEFAULT_PAGE_SIZE = 1000;

export async function fetchAllSupabaseRows<T>(
  query: SupabasePagedQuery<T>,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<SupabaseRowsResult<T>> {
  const rows: T[] = [];

  for (let from = 0; ; from += pageSize) {
    const to = from + pageSize - 1;
    const { data, error } = await query.range(from, to);
    if (error) return { data: rows, error };

    const page = data ?? [];
    rows.push(...page);
    if (page.length < pageSize) return { data: rows, error: null };
  }
}
