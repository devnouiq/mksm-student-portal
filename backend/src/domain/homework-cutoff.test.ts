import { describe, expect, it } from "vitest";
import { isLateSubmission } from "./homework-cutoff";

const now = new Date("2026-09-08T09:00:00.000Z");

describe("isLateSubmission", () => {
  it("is on time when the class is more than cutoffDays away", () => {
    expect(isLateSubmission("2026-09-12T09:00:00.000Z", 2, now)).toBe(false);
  });

  it("is late when the class is closer than cutoffDays", () => {
    expect(isLateSubmission("2026-09-09T09:00:00.000Z", 2, now)).toBe(true);
  });

  it("is late at exactly the boundary minus a moment", () => {
    // class is 2 days minus 1 minute away -> daysUntilClass < 2 -> late
    expect(isLateSubmission("2026-09-10T08:59:00.000Z", 2, now)).toBe(true);
  });

  it("is on time at exactly cutoffDays away", () => {
    expect(isLateSubmission("2026-09-10T09:00:00.000Z", 2, now)).toBe(false);
  });

  it("is late for a class already in the past", () => {
    expect(isLateSubmission("2026-09-01T09:00:00.000Z", 2, now)).toBe(true);
  });

  it("treats an empty or unparseable date as not late", () => {
    expect(isLateSubmission("", 2, now)).toBe(false);
    expect(isLateSubmission("not-a-date", 2, now)).toBe(false);
  });
});
