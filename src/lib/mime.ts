/** Minimal extension → MIME map for the media/asset routes. Pure (no Node). */
const MIME: Record<string, string> = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".mp3": "audio/mpeg",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

export function mimeFromPath(p: string): string {
  const dot = p.lastIndexOf(".");
  const ext = dot >= 0 ? p.slice(dot).toLowerCase() : "";
  return MIME[ext] ?? "application/octet-stream";
}
