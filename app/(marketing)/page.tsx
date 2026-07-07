import { Hero } from "@/components/marketing/Hero";
import { TrustBar } from "@/components/marketing/TrustBar";
import { Steps } from "@/components/marketing/Steps";
import { FeatureBento } from "@/components/marketing/FeatureBento";
import { Gallery } from "@/components/marketing/Gallery";
import { CtaBand } from "@/components/marketing/CtaBand";

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <TrustBar />
      <Steps />
      <FeatureBento />
      <Gallery />
      <CtaBand />
    </main>
  );
}
