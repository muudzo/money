// Standalone render worker: polls the job queue and renders one video at a
// time. Run with `npm run worker` (tsx src/worker/index.ts).
//
// IMPORTANT: `.env` must be loaded before anything that reads `@/lib/env`
// evaluates. Static `import` declarations are hoisted by the module loader
// and evaluate before this file's own top-level code runs (verified: even a
// plain statement written above a static `import` executes AFTER the
// imported module has already read `process.env`). So everything that
// touches env is loaded via a dynamic `import()` inside `main()`, which only
// starts once `loadEnvFile` has already run.
try {
  process.loadEnvFile(".env");
} catch {
  // .env is optional — fine in environments where real env vars are already set.
}

const POLL_INTERVAL_MS = 1500;

let shuttingDown = false;
let currentJobId: string | null = null;

function requestShutdown(signal: string) {
  if (shuttingDown) {
    console.log(`[worker] received ${signal} again — already shutting down`);
    return;
  }
  shuttingDown = true;
  if (currentJobId) {
    console.log(`[worker] received ${signal}; finishing job ${currentJobId} then exiting`);
  } else {
    console.log(`[worker] received ${signal}; exiting`);
  }
}

process.on("SIGINT", () => requestShutdown("SIGINT"));
process.on("SIGTERM", () => requestShutdown("SIGTERM"));

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const { env } = await import("@/lib/env");
  const { claimNextQueuedJob, completeJob, failJob, requeueStaleJobs } =
    await import("@/lib/jobs");
  const { renderJob } = await import("@/pipeline/render");

  // Recover anything a previous worker crashed on before we start polling.
  const recovered = await requeueStaleJobs().catch(() => 0);
  if (recovered > 0) {
    console.log(`[worker] re-queued ${recovered} stale job(s) from a previous run`);
  }

  console.log("──────────────────────────────────────────────");
  console.log(" AdReel render worker");
  console.log("──────────────────────────────────────────────");
  console.log(` script:   ${env.SCRIPT_PROVIDER} (falls back to template)`);
  console.log(` tts:      ${env.TTS_PROVIDER} (falls back to say/silent)`);
  console.log(` captions: ${env.CAPTIONS_PROVIDER} (falls back to estimate)`);
  console.log(` avatar:   ${env.AVATAR_PROVIDER} (falls back to kenburns)`);
  console.log(` poll:     every ${POLL_INTERVAL_MS}ms, concurrency 1`);
  console.log("──────────────────────────────────────────────");

  while (!shuttingDown) {
    const job = await claimNextQueuedJob().catch((err) => {
      console.error("[worker] failed to claim next job:", err instanceof Error ? err.message : err);
      return null;
    });

    if (!job) {
      await sleep(POLL_INTERVAL_MS);
      continue;
    }

    currentJobId = job.id;
    const startedAt = Date.now();
    console.log(`[worker] claimed job ${job.id} (project "${job.project?.name ?? "unknown"}")`);

    try {
      const asset = await renderJob(job);
      await completeJob(job.id, asset);
      const secs = ((Date.now() - startedAt) / 1000).toFixed(1);
      console.log(`[worker] job ${job.id} done in ${secs}s -> ${asset.videoPath}`);
    } catch (err) {
      const message = err instanceof Error ? err.stack ?? err.message : String(err);
      console.error(`[worker] job ${job.id} failed:`, message);
      await failJob(job.id, err instanceof Error ? err.message : String(err)).catch((failErr) => {
        console.error(`[worker] failed to mark job ${job.id} as failed:`, failErr);
      });
    } finally {
      currentJobId = null;
    }
  }

  console.log("[worker] stopped cleanly");
  process.exit(0);
}

main().catch((err) => {
  console.error("[worker] fatal error:", err);
  process.exit(1);
});

// Marks this standalone entry script as a module so its top-level `main`
// doesn't collide with other entry scripts under the same TS program. It has
// no runtime effect and is not a static import, so the env-loading order above
// is unaffected.
export {};
