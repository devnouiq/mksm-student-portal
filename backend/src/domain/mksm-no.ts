/*
  MKSM number rules — pure (PRD 12.14, recorded assumption).
  6 digits, banded by role: student 1xxxxx, teacher 5xxxxx, admin 9xxxxx.
  The database function public.allocate_mksm_no() is the authoritative allocator
  (handles collisions atomically); this module validates and picks a candidate
  for callers that want to propose one.
*/
import type { Role } from "@mksm/contracts";

export const MKSM_NO_REGEX = /^[0-9]{6}$/;

const BANDS: Record<Role, [number, number]> = {
  student: [100000, 199999],
  teacher: [500000, 599999],
  admin: [900000, 999999],
};

export function isValidMksmNo(value: string): boolean {
  return MKSM_NO_REGEX.test(value);
}

export function bandForRole(role: Role): [number, number] {
  return BANDS[role];
}

export function roleForMksmNo(value: string): Role | null {
  if (!isValidMksmNo(value)) return null;
  const n = Number(value);
  for (const role of ["student", "teacher", "admin"] as const) {
    const [lo, hi] = BANDS[role];
    if (n >= lo && n <= hi) return role;
  }
  return null;
}

/** A random in-band candidate. Not collision-checked — the DB function is. */
export function proposeMksmNo(role: Role, rng: () => number = Math.random): string {
  const [lo, hi] = BANDS[role];
  return String(lo + Math.floor(rng() * (hi - lo + 1))).padStart(6, "0");
}
