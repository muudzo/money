import { promises as fs } from "node:fs";
import { env } from "@/lib/env";
import { NotConfiguredError } from "@/providers/errors";
import type { AvatarProvider, AvatarRequest, AvatarResult } from "@/providers/types";

/**
 * GPU lipsync upgrade slot (e.g. a Wav2Lip / SadTalker server). Posts the
 * avatar still + narration audio to LIPSYNC_ENDPOINT and expects back a raw
 * video file (mp4) it writes to req.outPath. Falls back (via NotConfiguredError,
 * caught by the registry) to KenBurnsAvatarProvider when unset — this is
 * documented as the primary place to plug in a real lipsync model.
 */
export class LipsyncAvatarProvider implements AvatarProvider {
  readonly name = "lipsync";

  async render(req: AvatarRequest): Promise<AvatarResult> {
    if (!env.LIPSYNC_ENDPOINT) {
      throw new NotConfiguredError(
        "lipsync",
        "set LIPSYNC_ENDPOINT to a running lipsync server (e.g. Wav2Lip/SadTalker) to enable this provider",
      );
    }

    const [imageBytes, audioBytes] = await Promise.all([
      fs.readFile(req.imagePath),
      fs.readFile(req.audioPath),
    ]);

    const form = new FormData();
    form.append("image", new Blob([new Uint8Array(imageBytes)]), "avatar.png");
    form.append("audio", new Blob([new Uint8Array(audioBytes)]), "voice.mp3");
    form.append("width", String(req.width));
    form.append("height", String(req.height));

    const res = await fetch(env.LIPSYNC_ENDPOINT, { method: "POST", body: form });
    if (!res.ok) {
      throw new Error(`Lipsync endpoint failed: ${res.status} ${res.statusText}`);
    }

    const videoBytes = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(req.outPath, videoBytes);

    return { clipPath: req.outPath, isVideo: true, provider: "lipsync" };
  }
}
