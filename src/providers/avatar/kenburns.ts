import type { AvatarProvider, AvatarRequest, AvatarResult } from "@/providers/types";

/**
 * No-op avatar "motion" provider: hands the still image straight back so
 * compose.ts can apply the actual Ken-Burns zoompan while it builds the
 * final video (keeps this cheap and GPU-free — no intermediate video file).
 */
export class KenBurnsAvatarProvider implements AvatarProvider {
  readonly name = "kenburns";

  async render(req: AvatarRequest): Promise<AvatarResult> {
    return {
      clipPath: req.imagePath,
      isVideo: false,
      provider: "kenburns",
    };
  }
}
