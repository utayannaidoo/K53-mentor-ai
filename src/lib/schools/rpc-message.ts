/**
 * What a school action shows when one of its RPCs fails.
 *
 * The RPCs in 0035 raise sentences meant to be read ("No seats left on your
 * plan"), so those are passed through. Everything else is not: a missing
 * function, a constraint name or a permission error would hand internals to
 * the user. The line between them is the SQLSTATE — a bare `raise exception`
 * is always P0001, and nothing Postgres or PostgREST raises on its own is.
 */
export function rpcMessage(
  error: { message?: string; code?: string } | null,
  fallback: string,
): string {
  const raw = error?.message?.trim();
  if (error?.code === "P0001" && raw) return raw;
  return fallback;
}
