import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getJobForUser } from "@/lib/jobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Polled by the render progress UI. Returns status + asset URLs when done. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const job = await getJobForUser(session.userId, id);
  if (!job) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    id: job.id,
    status: job.status,
    progress: job.progress,
    stage: job.stage,
    error: job.error,
    scriptText: job.scriptText,
    projectName: job.project.name,
    asset: job.asset
      ? {
          videoUrl: `/api/media/${job.asset.videoPath}`,
          thumbUrl: job.asset.thumbPath
            ? `/api/media/${job.asset.thumbPath}`
            : null,
          width: job.asset.width,
          height: job.asset.height,
          durationMs: job.asset.durationMs,
        }
      : null,
  });
}
