import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  videoUrl: string;
  thumbUrl?: string | null;
  className?: string;
}

/** Portrait 9:16 player, capped to viewport height. */
export function VideoPlayer({ videoUrl, thumbUrl, className }: VideoPlayerProps) {
  return (
    <video
      controls
      playsInline
      preload="metadata"
      poster={thumbUrl ?? undefined}
      src={videoUrl}
      className={cn(
        "mx-auto aspect-[9/16] max-h-[68vh] w-auto rounded-xl border border-border bg-black object-contain shadow-[var(--shadow-lg)]",
        className,
      )}
    >
      Your browser can&apos;t play this video —{" "}
      <a href={videoUrl} download>
        download it instead
      </a>
      .
    </video>
  );
}
