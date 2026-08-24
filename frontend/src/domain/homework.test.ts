import { describe, expect, it } from "vitest";
import { isLateSubmission } from "./homework";

/*
  PRD §8.7: weekly homework is tied to a class date. A submission is on time only
  when it lands at least `cutoffDays` before the class; anything closer than that
  is accepted but tagged "Late Submission".

  `now` is injected so these tests are deterministic — no wall-clock.
*/
describe("isLateSubmission", () => {
  const now = new Date("2026-08-24T12:00:00.000Z");
  const cutoffDays = 2;

  it("is on time when the class is comfortably beyond the cutoff", () => {
    // class is 4 days away, cutoff is 2 → on time
    expect(isLateSubmission("2026-08-28T12:00:00.000Z", cutoffDays, now)).toBe(false);
  });

  it("is late when the class is inside the cutoff window", () => {
    // class is 1 day away, cutoff is 2 → late
    expect(isLateSubmission("2026-08-25T12:00:00.000Z", cutoffDays, now)).toBe(true);
  });

  it("is on time at exactly the cutoff boundary (>= cutoff counts as on time)", () => {
    // class is exactly 2 days away → the '≥2 days before' rule is satisfied
    expect(isLateSubmission("2026-08-26T12:00:00.000Z", cutoffDays, now)).toBe(false);
  });

  it("is late just inside the boundary", () => {
    // 1 hour short of 2 full days → late
    expect(isLateSubmission("2026-08-26T11:00:00.000Z", cutoffDays, now)).toBe(true);
  });

  it("is late when the class date has already passed", () => {
    expect(isLateSubmission("2026-08-20T12:00:00.000Z", cutoffDays, now)).toBe(true);
  });

  it("is not late when no class date is selected", () => {
    expect(isLateSubmission("", cutoffDays, now)).toBe(false);
  });

  it("is not late for an unparseable date", () => {
    expect(isLateSubmission("not-a-date", cutoffDays, now)).toBe(false);
  });
});
