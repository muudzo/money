import path from "node:path";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { ASSETS_ROOT } from "@/lib/storage";
import { mimeFromPath } from "@/lib/mime";

export const runtime = "nodejs";

/**
 * Serves bundled seed media (avatar portraits, b-roll) from `assets/`.
 * Public + cacheable; restricted to the avatars/ and broll/ subdirectories.
 */
const ALLOWED_PREFIXES = ["avatars/", "broll/"];

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const rel = segments.join("/");

  if (!ALLOWED_PREFIXES.some((p) => rel.startsWith(p))) {
    return new Response("Forbidden", { status: 403 });
  }

  const abs = path.normalize(path.join(ASSETS_ROOT, rel));
  if (!abs.startsWith(ASSETS_ROOT + path.sep)) {
    return new Response("Forbidden", { status: 403 });
  }

  const stats = await stat(abs).catch(() => null);
  if (!stats || !stats.isFile()) {
    return new Response("Not found", { status: 404 });
  }

  const nodeStream = createReadStream(abs);
  return new Response(Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>, {
    headers: {
      "Content-Type": mimeFromPath(abs),
      "Content-Length": String(stats.size),
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
