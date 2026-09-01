/*
  Course domain rules — pure, framework-free.

  Kept out of the React layer so the same rule drives every screen and cannot
  drift between them (the Overview and My Classes progress bars must agree).
*/

/** The minimum a course needs for its displayed progress to be decided. */
export interface ProgressLike {
  progress: number; // 0..1
  ongoing?: boolean; // weekly class with no fixed end (PRD §5.1)
}

/**
 * Progress to show for a course. An ongoing weekly batch class has no fixed
 * end, so it is always shown full (100%); every other course shows its raw
 * fraction. Single source of truth for both the Overview and My Classes bars.
 */
export function displayProgress(course: ProgressLike): number {
  return course.ongoing ? 1 : course.progress;
}
