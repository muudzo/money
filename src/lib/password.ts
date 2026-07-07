// Password policy, NIST 800-63B style: favor length and a breached/common
// blocklist over forced composition rules. Pure and dependency-free so it is
// unit-testable and usable from any server action.

export const MIN_PASSWORD_LENGTH = 10;
// bcrypt only hashes the first 72 bytes, but cap input so a megabyte "password"
// can't be used to burn CPU on the hash.
export const MAX_PASSWORD_LENGTH = 200;

// Small local blocklist of the passwords bots actually spray. Not exhaustive —
// swap for a k-anonymity HIBP check in production — but it stops the obvious ones.
const COMMON_PASSWORDS = new Set([
  "password",
  "password1",
  "password123",
  "1234567890",
  "12345678",
  "123456789",
  "qwertyuiop",
  "letmein123",
  "iloveyou1",
  "adminadmin",
  "welcome123",
  "changeme123",
  "adreel12345",
]);

/**
 * Returns a user-facing error message if the password is unacceptable, or null
 * if it passes. `email` is optional; when given, the password may not equal it.
 */
export function validatePassword(password: string, email?: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return "Password is too long.";
  }
  if (/^(.)\1+$/.test(password)) {
    return "Choose a less predictable password.";
  }
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return "That password is too common — choose something harder to guess.";
  }
  if (email && password.toLowerCase() === email.trim().toLowerCase()) {
    return "Your password can't be your email address.";
  }
  return null;
}
