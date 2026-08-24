/*
  Homework domain rules — pure, framework-free, dependency-injected.

  Kept out of the React layer so the rule can be unit-tested deterministically
  and reused by any future API/server implementation (PRD §8.7).
*/

const MS_PER_DAY = 86_400_000;

/**
 * Whether a homework submission for `classDateIso` is late, given the school's
 * cutoff (`cutoffDays` before the class) and the current instant `now`.
 *
 * On time when the class is at least `cutoffDays` away; late when it is closer
 * than that (or already passed). An empty or unparseable date is treated as
 * "not late" — there is no class selected to be late for.
 */
export function isLateSubmission(
  classDateIso: string,
  cutoffDays: number,
  now: Date = new Date(),
): boolean {
  if (!classDateIso) return false;
  const classTime = new Date(classDateIso).getTime();
  if (Number.isNaN(classTime)) return false;

  const daysUntilClass = (classTime - now.getTime()) / MS_PER_DAY;
  return daysUntilClass < cutoffDays;
}
