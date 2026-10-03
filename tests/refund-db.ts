import type { SupabaseClient } from "@supabase/supabase-js";
type Row = Record<string, unknown>;

/** In-memory query double: filters and compare-and-set updates execute at await time. */
export function refundDb(initial: Record<string, Row[]> = {}) {
  const tables = structuredClone(initial);
  const errors = new Set<string>();
  const client = {
    rpc: async () => ({ data: null, error: null }),
    from(table: string) {
      let op = "read", values: Row = {}, conflict = "id", ignore = false, single = false, max = Infinity;
      const filters: Array<(r: Row) => boolean> = [];
      let sort: { col: string; ascending: boolean } | null = null;
      const q = {
        select() { return q; },
        update(v: Row) { op = "update"; values = v; return q; },
        upsert(v: Row, opts?: { onConflict?: string; ignoreDuplicates?: boolean }) { op = "upsert"; values = v; conflict = opts?.onConflict ?? "id"; ignore = !!opts?.ignoreDuplicates; return q; },
        insert(v: Row) { op = "insert"; values = v; return q; },
        delete() { op = "delete"; return q; },
        eq(k: string, v: unknown) { filters.push(r => r[k] === v); return q; },
        neq(k: string, v: unknown) { filters.push(r => r[k] !== v); return q; },
        is(k: string, v: unknown) { filters.push(r => (r[k] ?? null) === v); return q; },
        in(k: string, v: unknown[]) { filters.push(r => v.includes(r[k])); return q; },
        order(col: string, options?: { ascending?: boolean }) { sort = { col, ascending: options?.ascending ?? true }; return q; },
        limit(n: number) { max = n; return q; },
        maybeSingle() { single = true; return q; },
        then(resolve: (value: unknown) => unknown, reject?: (err: unknown) => unknown) {
          const run = () => {
            if (errors.has(`${table}:${op}`)) return { data: null, error: { message: "injected database failure" } };
            const all = tables[table] ??= [];
            if (op === "upsert" || op === "insert") {
              const old = all.find(r => r[conflict] === values[conflict]);
              if (old && op === "insert") return { data: null, error: { code: "23505" } };
              if (old && !ignore) Object.assign(old, values);
              if (!old) all.push({ id: `${table}-${all.length}`, status: "queued", attempts: 0, provider_refund_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...values });
            }
            let rows = all.filter(r => filters.every(f => f(r)));
            if (sort) rows.sort((a, b) => String(a[sort!.col]).localeCompare(String(b[sort!.col])) * (sort!.ascending ? 1 : -1));
            rows = rows.slice(0, max);
            if (op === "update") rows.forEach(r => Object.assign(r, values));
            if (op === "delete") tables[table] = all.filter(r => !rows.includes(r));
            return { data: structuredClone(single ? rows[0] ?? null : rows), error: null };
          };
          return Promise.resolve().then(run).then(resolve, reject);
        },
      };
      return q;
    },
  } as unknown as SupabaseClient;
  return { client, tables, errors };
}

export const refundRow = (extra: Row = {}) => ({ id: "refund-1", user_id: "user-1", transaction_reference: "ref_old", status: "queued", attempts: 0, last_error: null, provider_refund_id: null, updated_at: new Date().toISOString(), ...extra });
export const paidRow = (extra: Row = {}) => ({ user_id: "user-1", tier: "premium", status: "active", provider_customer_id: "CUS_1", last_charge_reference: "ref_old", paid_at: new Date().toISOString(), money_back_used: false, current_period_end: new Date(Date.now()+86400000*20).toISOString(), ...extra });
