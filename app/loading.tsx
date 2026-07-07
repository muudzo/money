import { Logo } from "@/components/ui/Logo";

export default function Loading() {
  return (
    <div
      className="flex min-h-dvh items-center justify-center"
      role="status"
      aria-label="Loading"
    >
      <div className="animate-pulse">
        <Logo size={36} />
      </div>
    </div>
  );
}
