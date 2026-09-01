import { describe, expect, it } from "vitest";
import { displayProgress } from "./course";

describe("displayProgress", () => {
  it("shows an ongoing weekly class at 100% regardless of its raw fraction", () => {
    expect(displayProgress({ progress: 0.62, ongoing: true })).toBe(1);
    expect(displayProgress({ progress: 0, ongoing: true })).toBe(1);
  });

  it("shows the raw fraction for a course that is not ongoing", () => {
    expect(displayProgress({ progress: 0.34, ongoing: false })).toBe(0.34);
    expect(displayProgress({ progress: 0.12 })).toBe(0.12);
  });

  it("treats a missing ongoing flag as not ongoing", () => {
    expect(displayProgress({ progress: 0.5 })).toBe(0.5);
  });
});
