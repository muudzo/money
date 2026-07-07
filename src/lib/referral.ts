import { randomBytes } from "node:crypto";

// Unambiguous alphabet — no 0/O/1/I/L — so codes are easy to read aloud and
// share. 8 chars over 31 symbols ≈ 852 billion combinations: collisions are
// astronomically unlikely, and createUser retries on the off chance anyway.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const DEFAULT_LENGTH = 8;

/** Generate a short, human-shareable referral code (e.g. "7QP4KX9M"). */
export function generateReferralCode(length = DEFAULT_LENGTH): string {
  const bytes = randomBytes(length);
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return code;
}

/** Normalize a user-supplied code (from a share link) for lookup. */
export function normalizeReferralCode(raw: string): string {
  return raw.trim().toUpperCase();
}
