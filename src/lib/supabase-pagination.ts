type SupabasePagedQuery<T> = {
  range: (from: number, to: number) => Promise<{
    data: T[] | null;
    error: { message?: string } | null;
  }>;
};

export async function fetchAllSupabaseRows<T>(
  createQuery: () => SupabasePagedQuery<T>,
  pageSize = 1000
): Promise<{ data: T[]; error: { message?: string } | null }> {
  const rows: T[] = [];
  let page = 0;

  while (true) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    const { data, error } = await createQuery().range(from, to);
    if (error) return { data: rows, error };

    const batch = data ?? [];
    rows.push(...batch);
    if (batch.length < pageSize) return { data: rows, error: null };
    page++;
  }
}
