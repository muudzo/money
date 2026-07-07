import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getBalance } from "@/lib/credits";
import { listAvatars } from "@/lib/jobs";
import { Wizard } from "@/components/app/wizard/Wizard";
import type { AvatarOption } from "@/components/app/wizard/types";

export const metadata: Metadata = { title: "New Ad" };

export default async function NewAdPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [avatars, credits] = await Promise.all([
    listAvatars(),
    getBalance(user.id),
  ]);

  const avatarOptions: AvatarOption[] = avatars.map((a) => ({
    id: a.id,
    name: a.name,
    imagePath: a.imagePath,
    voice: a.voice,
    tone: a.tone,
    gender: a.gender,
    accent: a.accent,
  }));

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-9">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          Generator
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-fg">
          Create a new ad
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          Five quick steps. The preview on the right updates as you go — what
          you see is the shape of the ad you&apos;ll get.
        </p>
      </header>

      <Wizard avatars={avatarOptions} credits={credits} />
    </div>
  );
}
