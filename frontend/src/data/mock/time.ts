/*
  Shared time helpers for mock fixtures. Dates are computed relative to "now"
  so class-day / cutoff / previous-day states stay realistic whenever the
  prototype is run — no stale hard-coded dates.
*/

/** ISO for `days` from today at `hour`:00. Negative = past. */
export function inDays(days: number, hour = 18): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

/** ISO date-only (midnight) for `days` from today. */
export function dateOnly(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
