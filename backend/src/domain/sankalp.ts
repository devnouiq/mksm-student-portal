/*
  Sankalp roll-up math — pure. Hours are self-reported in minutes.
*/
export const CLUB_600_THRESHOLD_HOURS = 600;

export function minutesToHours(minutes: number): number {
  return Math.round((minutes / 60) * 100) / 100;
}

export function sumHours(minutes: readonly number[]): number {
  return minutesToHours(minutes.reduce((a, b) => a + b, 0));
}

export function avgHoursPerStudent(totalHours: number, studentCount: number): number {
  if (studentCount <= 0) return 0;
  return Math.round((totalHours / studentCount) * 100) / 100;
}

export function isInClub600(cumulativeHours: number): boolean {
  return cumulativeHours >= CLUB_600_THRESHOLD_HOURS;
}

/** Next 100-hour milestone above the given personal total (min 100). */
export function nextMilestoneHours(personalHours: number): number {
  return Math.max(100, Math.ceil((personalHours + 1) / 100) * 100);
}
