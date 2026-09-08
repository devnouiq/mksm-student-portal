import { describe, expect, it } from "vitest";
import {
  dayToDb,
  dayToLabel,
  formatClassTime,
  homeworkStatusToApi,
  homeworkStatusToDb,
  levelToApi,
  levelToDb,
  pitchToApi,
  pitchToDb,
  providerToApi,
  providerToDb,
} from "./mappers";

describe("enum mappers round-trip", () => {
  it("pitch", () => {
    for (const api of ["C#", "G#", "B#"] as const) {
      expect(pitchToApi[pitchToDb[api]]).toBe(api);
    }
  });
  it("level", () => {
    for (const api of ["Beginner", "Intermediate", "Advance"] as const) {
      expect(levelToApi[levelToDb[api]]).toBe(api);
    }
  });
  it("homework status", () => {
    for (const api of ["homework-pending", "submitted", "review-pending", "reviewed"] as const) {
      expect(homeworkStatusToApi[homeworkStatusToDb[api]]).toBe(api);
    }
  });
  it("provider", () => {
    for (const api of ["razorpay", "paypal", "one-time"] as const) {
      expect(providerToApi[providerToDb[api]]).toBe(api);
    }
  });
  it("day label", () => {
    for (const api of ["Monday", "Sunday"] as const) {
      expect(dayToLabel(dayToDb[api])).toBe(api);
    }
  });
});

describe("formatClassTime", () => {
  it("formats a 24h time + IST zone the way the frontend fixtures do", () => {
    expect(formatClassTime("18:00", "Asia/Kolkata")).toBe("6:00 PM IST");
    expect(formatClassTime("10:00", "Asia/Kolkata")).toBe("10:00 AM IST");
    expect(formatClassTime("00:30", "Asia/Kolkata")).toBe("12:30 AM IST");
  });
  it("returns empty string for a missing time", () => {
    expect(formatClassTime(null, "Asia/Kolkata")).toBe("");
  });
});
