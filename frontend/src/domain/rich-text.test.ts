import { describe, expect, it } from "vitest";
import { parseRichText, toPlainText } from "./rich-text";

describe("parseRichText", () => {
  it("returns a single text token when there are no markers", () => {
    expect(parseRichText("plain text")).toEqual([
      { type: "text", value: "plain text" },
    ]);
  });

  it("parses **bold** and keeps the surrounding text", () => {
    expect(parseRichText("Classes pause **8–12 Nov**.")).toEqual([
      { type: "text", value: "Classes pause " },
      { type: "bold", value: "8–12 Nov" },
      { type: "text", value: "." },
    ]);
  });

  it("parses both *asterisk* and _underscore_ italics", () => {
    expect(parseRichText("*a* and _b_")).toEqual([
      { type: "italic", value: "a" },
      { type: "text", value: " and " },
      { type: "italic", value: "b" },
    ]);
  });

  it("does not mistake a bold run for two italic runs", () => {
    expect(parseRichText("**x**")).toEqual([{ type: "bold", value: "x" }]);
  });

  it("leaves an unmatched marker as literal text", () => {
    expect(parseRichText("a * b")).toEqual([{ type: "text", value: "a * b" }]);
  });

  it("does not treat angle brackets as markup (no HTML surface)", () => {
    const evil = "<script>alert(1)</script> **bold**";
    expect(parseRichText(evil)).toEqual([
      { type: "text", value: "<script>alert(1)</script> " },
      { type: "bold", value: "bold" },
    ]);
  });
});

describe("toPlainText", () => {
  it("strips every marker", () => {
    expect(toPlainText("Classes pause **8–12 Nov**, _all_ students.")).toBe(
      "Classes pause 8–12 Nov, all students.",
    );
  });
});
