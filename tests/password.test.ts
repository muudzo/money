import { describe, it, expect } from "vitest";
import {
  validatePassword,
  MIN_PASSWORD_LENGTH,
} from "../src/lib/password";

describe("validatePassword", () => {
  it("accepts a reasonable password", () => {
    expect(validatePassword("correct-horse-battery")).toBeNull();
  });

  it("rejects too-short passwords", () => {
    expect(validatePassword("a".repeat(MIN_PASSWORD_LENGTH - 1))).toMatch(
      /at least/i,
    );
  });

  it("rejects a single repeated character", () => {
    expect(validatePassword("aaaaaaaaaaaa")).toMatch(/predictable/i);
  });

  it("rejects common passwords case-insensitively", () => {
    expect(validatePassword("Password123")).toMatch(/too common/i);
  });

  it("rejects a password equal to the email", () => {
    expect(validatePassword("user@brand.com", "user@brand.com")).toMatch(
      /can't be your email/i,
    );
  });

  it("rejects absurdly long input", () => {
    expect(validatePassword("x".repeat(500))).toMatch(/too long/i);
  });
});
