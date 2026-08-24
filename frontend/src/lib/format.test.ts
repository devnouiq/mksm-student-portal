import { describe, expect, it } from "vitest";
import { initials, toPercent } from "./format";

describe("toPercent", () => {
  it("converts a 0..1 fraction to a whole-number percentage", () => {
    expect(toPercent(0)).toBe(0);
    expect(toPercent(0.5)).toBe(50);
    expect(toPercent(1)).toBe(100);
  });

  it("rounds to the nearest whole percent", () => {
    expect(toPercent(0.336)).toBe(34);
    expect(toPercent(0.334)).toBe(33);
  });

  it("clamps out-of-range input into 0..100", () => {
    expect(toPercent(1.5)).toBe(100);
    expect(toPercent(-0.2)).toBe(0);
  });
});

describe("initials", () => {
  it("takes the first letter of the first two names, uppercased", () => {
    expect(initials("Melody Kulkarni")).toBe("MK");
    expect(initials("guru deshpande")).toBe("GD");
  });

  it("handles a single name", () => {
    expect(initials("Admin")).toBe("A");
  });

  it("caps at two initials for longer names", () => {
    expect(initials("Mahesh Kale School Music")).toBe("MK");
  });

  it("ignores extra whitespace", () => {
    expect(initials("  guru   deshpande  ")).toBe("GD");
  });

  it("returns an empty string for an empty name", () => {
    expect(initials("")).toBe("");
  });
});
