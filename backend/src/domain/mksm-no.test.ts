import { describe, expect, it } from "vitest";
import { bandForRole, isValidMksmNo, proposeMksmNo, roleForMksmNo } from "./mksm-no";

describe("mksm-no", () => {
  it("validates a 6-digit string", () => {
    expect(isValidMksmNo("100428")).toBe(true);
    expect(isValidMksmNo("12345")).toBe(false);
    expect(isValidMksmNo("1234567")).toBe(false);
    expect(isValidMksmNo("abcdef")).toBe(false);
  });

  it("maps a number back to its role band", () => {
    expect(roleForMksmNo("100428")).toBe("student");
    expect(roleForMksmNo("500112")).toBe("teacher");
    expect(roleForMksmNo("900001")).toBe("admin");
    expect(roleForMksmNo("300000")).toBe(null);
  });

  it("proposes an in-band 6-digit candidate for each role", () => {
    for (const role of ["student", "teacher", "admin"] as const) {
      const [lo, hi] = bandForRole(role);
      const candidate = proposeMksmNo(role, () => 0.5);
      expect(candidate).toMatch(/^[0-9]{6}$/);
      const n = Number(candidate);
      expect(n).toBeGreaterThanOrEqual(lo);
      expect(n).toBeLessThanOrEqual(hi);
    }
  });

  it("proposes the low bound when rng returns 0 and stays in band at rng ~1", () => {
    expect(proposeMksmNo("student", () => 0)).toBe("100000");
    expect(Number(proposeMksmNo("student", () => 0.999999))).toBeLessThanOrEqual(199999);
  });
});
