/*
  Course progress rule — pure. Mirrors frontend/src/domain/course.ts.
  An ongoing weekly batch (no fixed end) always shows 100%; every other course
  shows its raw 0..1 fraction.
*/
export interface ProgressLike {
  progress: number;
  ongoing?: boolean;
}

export function displayProgress(course: ProgressLike): number {
  return course.ongoing ? 1 : course.progress;
}
