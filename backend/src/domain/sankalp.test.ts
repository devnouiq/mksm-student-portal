import { describe, expect, it } from "vitest";
import {
  avgHoursPerStudent,
  isInClub600,
  minutesToHours,
  nextMilestoneHours,
  sumHours,
} from "./sankalp";

describe("sankalp math", () => {
  it("converts minutes to hours rounded to 2dp", () => {
    expect(minutesToHours(90)).toBe(1.5);
    expect(minutesToHours(100)).toBe(1.67);
  });

  it("sums a list of minute values into hours", () => {
    expect(sumHours([60, 45, 90])).toBe(3.25);
    expect(sumHours([])).toBe(0);
  });

  it("averages hours per student and guards divide-by-zero", () => {
    expect(avgHoursPerStudent(300, 3)).toBe(100);
    expect(avgHoursPerStudent(300, 0)).toBe(0);
  });

  it("flags the 600 Hours Club at the threshold", () => {
    expect(isInClub600(599.99)).toBe(false);
    expect(isInClub600(600)).toBe(true);
  });

  it("computes the next 100-hour milestone", () => {
    expect(nextMilestoneHours(0)).toBe(100);
    expect(nextMilestoneHours(214.5)).toBe(300);
    expect(nextMilestoneHours(300)).toBe(400);
  });
});
