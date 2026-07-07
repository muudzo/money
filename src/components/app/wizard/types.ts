import type { Tone } from "@/providers/types";

/** Serializable avatar shape passed from the server page into the wizard. */
export interface AvatarOption {
  id: string;
  name: string;
  imagePath: string;
  voice: string;
  tone: string | null;
  gender: string | null;
  accent: string | null;
}

export type ScriptMode = "ai" | "own";

export interface WizardData {
  name: string;
  brand: string;
  product: string;
  audience: string;
  tone: Tone;
  scriptMode: ScriptMode;
  script: string;
  avatarId: string | null;
  durationSec: number;
}

export const INITIAL_DATA: WizardData = {
  name: "",
  brand: "",
  product: "",
  audience: "",
  tone: "energetic",
  scriptMode: "ai",
  script: "",
  avatarId: null,
  durationSec: 30,
};

export const STEP_LABELS = [
  "Brief",
  "Script",
  "Avatar",
  "Format",
  "Review",
] as const;

export const TONES: { id: Tone; label: string; blurb: string }[] = [
  { id: "energetic", label: "Energetic", blurb: "Fast, punchy, hype — classic TikTok delivery." },
  { id: "friendly", label: "Friendly", blurb: "Warm and conversational, like a friend's rec." },
  { id: "calm", label: "Calm", blurb: "Soft-spoken and soothing — great for wellness." },
  { id: "authoritative", label: "Authoritative", blurb: "Confident expert voice that builds trust." },
];

export const DURATION_MIN = 10;
export const DURATION_MAX = 60;

/** Rough spoken-word budget at UGC pacing (~2.3 words/sec). */
export function wordsForDuration(sec: number): number {
  return Math.round(sec * 2.3);
}

export type StepErrors = Partial<Record<keyof WizardData, string>>;

export function validateStep(step: number, data: WizardData, hasAvatars: boolean): StepErrors {
  const errors: StepErrors = {};
  if (step === 0) {
    if (!data.name.trim()) errors.name = "Give this ad a name so you can find it later.";
    if (!data.brand.trim()) errors.brand = "Enter your brand name.";
    if (!data.product.trim()) errors.product = "Describe what you're selling.";
    else if (data.product.trim().length > 600) errors.product = "Keep the description under 600 characters.";
  }
  if (step === 1 && data.scriptMode === "own") {
    if (data.script.trim().length < 10) {
      errors.script = "Write at least a sentence — or switch back to AI writing.";
    } else if (data.script.trim().length > 2400) {
      errors.script = "Scripts are capped at 2,400 characters.";
    }
  }
  if (step === 2 && hasAvatars && !data.avatarId) {
    errors.avatarId = "Pick a presenter for your ad.";
  }
  return errors;
}
