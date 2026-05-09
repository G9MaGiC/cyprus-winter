const SUPABASE_PAGE_SIZE = 1000;

type SupabaseRowsResult<Row> = {
  data: Row[] | null;
  error: unknown | null;
};

export type RangeableSupabaseQuery<Row> = PromiseLike<SupabaseRowsResult<Row>> & {
  range(from: number, to: number): RangeableSupabaseQuery<Row>;
};

export async function fetchAllSupabaseRows<Row>(
  buildQuery: () => RangeableSupabaseQuery<Row>
): Promise<SupabaseRowsResult<Row>> {
  const allRows: Row[] = [];

  for (let offset = 0; ; offset += SUPABASE_PAGE_SIZE) {
    const { data, error } = await buildQuery().range(offset, offset + SUPABASE_PAGE_SIZE - 1);
    if (error) {
      return { data: null, error };
    }

    const rows = data ?? [];
    allRows.push(...rows);

    if (rows.length < SUPABASE_PAGE_SIZE) {
      return { data: allRows, error: null };
    }
  }
}
