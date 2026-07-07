// NOTE: no `server-only` here — the render worker imports these path helpers.
import path from "node:path";
import { promises as fs } from "node:fs";

/** Generated renders live here (gitignored). Swap for S3 in production. */
export const STORAGE_ROOT = path.join(process.cwd(), "storage");
/** Bundled seed media: avatars, b-roll, music. */
export const ASSETS_ROOT = path.join(process.cwd(), "assets");

export function storagePath(...segments: string[]): string {
  return path.join(STORAGE_ROOT, ...segments);
}

export function assetPath(...segments: string[]): string {
  return path.join(ASSETS_ROOT, ...segments);
}

export async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

/** Directory for a single render job's working + output files. */
export function jobDir(jobId: string): string {
  return storagePath("renders", jobId);
}
