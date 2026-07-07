import path from "node:path";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { STORAGE_ROOT } from "@/lib/storage";
import { mimeFromPath } from "@/lib/mime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Streams a rendered asset from `storage/`, enforcing that the requester owns
 * the underlying render job. Supports HTTP Range so <video> can seek/scrub.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const rel = segments.join("/");
  const abs = path.normalize(path.join(STORAGE_ROOT, rel));

  // Path-traversal guard.
  if (!abs.startsWith(STORAGE_ROOT + path.sep)) {
    return new Response("Forbidden", { status: 403 });
  }

  // Ownership: renders/<jobId>/<file> must belong to the signed-in user.
  if (segments[0] === "renders") {
    const jobId = segments[1];
    const session = await getSession();
    if (!session) return new Response("Unauthorized", { status: 401 });
    const owned = await db.renderJob.findFirst({
      where: { id: jobId, userId: session.userId },
      select: { id: true },
    });
    if (!owned) return new Response("Not found", { status: 404 });
  }

  const stats = await stat(abs).catch(() => null);
  if (!stats || !stats.isFile()) {
    return new Response("Not found", { status: 404 });
  }

  const total = stats.size;
  const type = mimeFromPath(abs);
  const rangeHeader = req.headers.get("range");

  if (rangeHeader) {
    const match = /bytes=(\d*)-(\d*)/.exec(rangeHeader);
    let start = match?.[1] ? parseInt(match[1], 10) : 0;
    let end = match?.[2] ? parseInt(match[2], 10) : total - 1;
    if (Number.isNaN(start) || start < 0) start = 0;
    if (Number.isNaN(end) || end >= total) end = total - 1;
    if (start > end) start = 0;
    const chunkSize = end - start + 1;
    const nodeStream = createReadStream(abs, { start, end });
    return new Response(Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>, {
      status: 206,
      headers: {
        "Content-Type": type,
        "Content-Length": String(chunkSize),
        "Content-Range": `bytes ${start}-${end}/${total}`,
        "Accept-Ranges": "bytes",
        "Cache-Control": "private, max-age=3600",
      },
    });
  }

  const nodeStream = createReadStream(abs);
  return new Response(Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>, {
    headers: {
      "Content-Type": type,
      "Content-Length": String(total),
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
