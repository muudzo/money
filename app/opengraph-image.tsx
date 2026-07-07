import { ImageResponse } from "next/og";

// Social share card (Open Graph + Twitter fall back to this). Rendered by
// satori at request time — flexbox-only styles, system font stack.
export const runtime = "edge";
export const alt = "AdReel — AI UGC Ad Generator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #131019 0%, #1d1530 55%, #0f1b2d 100%)",
          color: "#ffffff",
          padding: 72,
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: "sans-serif",
        }}
      >
        {/* Copy block */}
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: "linear-gradient(135deg, #8b5cf6, #22d3ee)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 30,
                fontWeight: 700,
              }}
            >
              ▶
            </div>
            <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>
              AdReel
            </div>
          </div>
          <div
            style={{
              marginTop: 40,
              fontSize: 58,
              fontWeight: 700,
              lineHeight: 1.12,
              letterSpacing: -2,
            }}
          >
            One idea in. A ready-to-post ad out.
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 27,
              lineHeight: 1.4,
              color: "rgba(255,255,255,0.72)",
            }}
          >
            AI script · voiceover · avatar · captions — vertical video for
            TikTok, Reels &amp; Shorts.
          </div>
        </div>

        {/* Phone-frame motif */}
        <div
          style={{
            width: 240,
            height: 430,
            borderRadius: 36,
            border: "3px solid rgba(255,255,255,0.25)",
            background: "linear-gradient(160deg, rgba(139,92,246,0.35), rgba(34,211,238,0.25))",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: 22,
          }}
        >
          <div
            style={{
              display: "flex",
              alignSelf: "center",
              width: 74,
              height: 74,
              borderRadius: 999,
              background: "rgba(255,255,255,0.92)",
              color: "#131019",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              marginBottom: 110,
            }}
          >
            ▶
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", height: 13, width: "88%", borderRadius: 7, background: "rgba(255,255,255,0.85)" }} />
            <div style={{ display: "flex", height: 13, width: "64%", borderRadius: 7, background: "rgba(255,255,255,0.55)" }} />
          </div>
        </div>
      </div>
    ),
    size,
  );
}
