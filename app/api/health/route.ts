import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Liveness/readiness probe for deploys and uptime monitors. Verifies the
 * database answers and reports queue depth so a stuck worker is visible from
 * the outside. No auth by design — it exposes only aggregate, non-sensitive
 * numbers.
 */
export async function GET() {
  try {
    const [queued, rendering] = await Promise.all([
      db.renderJob.count({ where: { status: "queued" } }),
      db.renderJob.count({ where: { status: "rendering" } }),
    ]);
    return NextResponse.json({
      ok: true,
      db: "up",
      queue: { queued, rendering },
      time: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { ok: false, db: "down", time: new Date().toISOString() },
      { status: 503 },
    );
  }
}
