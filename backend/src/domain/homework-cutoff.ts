/*
  Homework late-cutoff rule (PRD 8.7) — pure, framework-free.
  Mirrors frontend/src/domain/homework.ts so the frontend and backend agree.
*/
const MS_PER_DAY = 86_400_000;

/**
 * Whether a submission made at `now` for a class at `classDateIso` is late,
 * given the school's cutoff of `cutoffDays` before the class. On time when the
 * class is at least `cutoffDays` away; late when closer than that (or passed).
 * An empty / unparseable date is treated as not late.
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
