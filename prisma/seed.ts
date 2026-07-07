// Idempotent avatar seed. Run via `npm run db:seed` (tsx prisma/seed.ts).
//
// Must load `.env` before anything that reads `@/lib/env` evaluates — static
// imports are hoisted and evaluate before this file's own top-level code, so
// everything env-dependent is loaded via dynamic `import()` inside `main()`.
try {
  process.loadEnvFile(".env");
} catch {
  // .env is optional — fine when real env vars are already set.
}

interface SeedAvatar {
  /** Stable, hand-picked id so re-running the seed is idempotent (upsert by id). */
  id: string;
  name: string;
  /** Filename under assets/avatars — imagePath is stored relative to assets/. */
  file: string;
  voice: string;
  gender: string;
  tone: string;
  accent: string;
}

const SEED_AVATARS: SeedAvatar[] = [
  { id: "seed-aria", name: "Aria", file: "aria.png", voice: "Samantha", gender: "female", tone: "friendly", accent: "American" },
  { id: "seed-marcus", name: "Marcus", file: "marcus.png", voice: "Alex", gender: "male", tone: "authoritative", accent: "American" },
  { id: "seed-noa", name: "Noa", file: "noa.png", voice: "Daniel", gender: "male", tone: "calm", accent: "British" },
  { id: "seed-ivy", name: "Ivy", file: "ivy.png", voice: "Karen", gender: "female", tone: "energetic", accent: "Australian" },
  { id: "seed-leo", name: "Leo", file: "leo.png", voice: "Rishi", gender: "male", tone: "friendly", accent: "Indian" },
  { id: "seed-sana", name: "Sana", file: "sana.png", voice: "Moira", gender: "female", tone: "calm", accent: "Irish" },
];

async function main() {
  const { db } = await import("@/lib/db");
  const { resolveVoice } = await import("@/providers/tts/say");

  for (const avatar of SEED_AVATARS) {
    const resolvedVoice = await resolveVoice(avatar.voice);
    if (resolvedVoice !== avatar.voice) {
      console.warn(
        `[seed] voice "${avatar.voice}" is not installed on this machine; using "${resolvedVoice}" for ${avatar.name}`,
      );
    }

    await db.avatar.upsert({
      where: { id: avatar.id },
      update: {
        name: avatar.name,
        imagePath: `avatars/${avatar.file}`,
        voice: resolvedVoice,
        gender: avatar.gender,
        tone: avatar.tone,
        accent: avatar.accent,
      },
      create: {
        id: avatar.id,
        name: avatar.name,
        imagePath: `avatars/${avatar.file}`,
        voice: resolvedVoice,
        gender: avatar.gender,
        tone: avatar.tone,
        accent: avatar.accent,
      },
    });
    console.log(`[seed] upserted avatar "${avatar.name}" (voice: ${resolvedVoice})`);
  }

  console.log(`[seed] done — ${SEED_AVATARS.length} avatars ready.`);
  await db.$disconnect();
}

main().catch(async (err) => {
  console.error("[seed] failed:", err);
  const { db } = await import("@/lib/db");
  await db.$disconnect();
  process.exit(1);
});

// Marks this standalone entry script as a module so its top-level `main`
// doesn't collide with other entry scripts under the same TS program. It has
// no runtime effect and is not a static import, so the env-loading order above
// is unaffected.
export {};
