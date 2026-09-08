import { describe, expect, it } from "vitest";
import { displayProgress } from "./progress";

describe("displayProgress", () => {
  it("shows the raw fraction for a normal course", () => {
    expect(displayProgress({ progress: 0.62 })).toBe(0.62);
  });

  it("shows 100% for an ongoing weekly batch regardless of raw progress", () => {
    expect(displayProgress({ progress: 0.62, ongoing: true })).toBe(1);
    expect(displayProgress({ progress: 0, ongoing: true })).toBe(1);
  });

  it("treats ongoing:false like a normal course", () => {
    expect(displayProgress({ progress: 0.34, ongoing: false })).toBe(0.34);
  });
});
