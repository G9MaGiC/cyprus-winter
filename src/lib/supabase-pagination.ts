const SUPABASE_PAGE_SIZE = 1000;

export type SupabasePage<T> = {
  data: T[] | null;
  error: unknown;
};

export async function fetchAllSupabaseRows<T>(
  fetchPage: (from: number, to: number) => PromiseLike<SupabasePage<T>>,
  pageSize = SUPABASE_PAGE_SIZE
): Promise<{ data: T[]; error: unknown | null }> {
  const allRows: T[] = [];

  for (let from = 0; ; from += pageSize) {
    const to = from + pageSize - 1;
    const { data, error } = await fetchPage(from, to);

    if (error) {
      return { data: [], error };
    }

    const page = data ?? [];
    allRows.push(...page);

    if (page.length < pageSize) {
      return { data: allRows, error: null };
    }
  }
}
