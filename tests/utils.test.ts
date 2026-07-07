import { describe, it, expect } from "vitest";
import {
  cn,
  formatCurrency,
  formatDuration,
  formatBytes,
  slugify,
  titleCase,
} from "../src/lib/utils";
import { mimeFromPath } from "../src/lib/mime";

describe("utils", () => {
  it("joins class names and drops falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
    expect(cn("a", { b: true, c: false })).toBe("a b");
  });

  it("formats currency without cents for whole amounts", () => {
    expect(formatCurrency(39)).toBe("$39");
    expect(formatCurrency(0)).toBe("$0");
    expect(formatCurrency(9.5)).toBe("$9.50");
  });

  it("formats a millisecond duration as m:ss", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(65_000)).toBe("1:05");
    expect(formatDuration(9_000)).toBe("0:09");
  });

  it("formats byte sizes with units", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(1_572_864)).toBe("1.5 MB");
  });

  it("slugifies to url-safe strings", () => {
    expect(slugify("  Summer Sale 2026! ")).toBe("summer-sale-2026");
    expect(slugify("A/B Test")).toBe("a-b-test");
  });

  it("title-cases words", () => {
    expect(titleCase("energetic tone")).toBe("Energetic Tone");
  });
});

describe("mime", () => {
  it("maps known extensions", () => {
    expect(mimeFromPath("renders/x/output.mp4")).toBe("video/mp4");
    expect(mimeFromPath("thumb.JPG")).toBe("image/jpeg");
    expect(mimeFromPath("avatars/aria.png")).toBe("image/png");
  });
  it("defaults unknown extensions to octet-stream", () => {
    expect(mimeFromPath("file.xyz")).toBe("application/octet-stream");
    expect(mimeFromPath("noext")).toBe("application/octet-stream");
  });
});
