import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { env } from "@/lib/env";
import { run, probeDurationMs } from "@/pipeline/ffmpeg";
import { NotConfiguredError } from "@/providers/errors";
import type { TtsProvider, TtsRequest, TtsResult } from "@/providers/types";

/**
 * Piper (https://github.com/rhasspy/piper) local neural TTS adapter.
 * Pluggable GPU/CPU upgrade over `say` — enable by setting PIPER_BIN (and
 * optionally PIPER_VOICE) in the environment. Piper writes raw 16-bit PCM
 * WAV to stdout when given `--output_file -`; we pipe that through ffmpeg
 * to produce the standard mp3 the rest of the pipeline expects.
 */
export class PiperTtsProvider implements TtsProvider {
  readonly name = "piper";

  async synthesize(req: TtsRequest): Promise<TtsResult> {
    if (!env.PIPER_BIN) {
      throw new NotConfiguredError("piper", "set PIPER_BIN to the piper executable path to enable this provider");
    }

    const tmpWav = req.outPath.replace(/\.mp3$/i, ".piper.wav");
    const args = ["--output_file", tmpWav];
    if (env.PIPER_VOICE) args.push("--model", env.PIPER_VOICE);

    await fs.mkdir(path.dirname(req.outPath), { recursive: true });

    // Piper reads the input text from stdin.
    await new Promise<void>((resolve, reject) => {
      const child = spawn(env.PIPER_BIN as string, args, { stdio: ["pipe", "ignore", "pipe"] });
      let stderr = "";
      child.stderr?.on("data", (c: Buffer) => (stderr += c.toString()));
      child.on("error", (err) => reject(new Error(`Failed to spawn piper: ${err.message}`)));
      child.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`piper exited with code ${code}: ${stderr.slice(-2000)}`));
      });
      child.stdin?.write(req.text);
      child.stdin?.end();
    });

    await run("ffmpeg", ["-y", "-i", tmpWav, "-ar", "44100", "-ac", "2", "-b:a", "192k", req.outPath]);
    await fs.unlink(tmpWav).catch(() => {});

    const durationMs = await probeDurationMs(req.outPath);
    return { audioPath: req.outPath, durationMs, provider: "piper" };
  }
}
