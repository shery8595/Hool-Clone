import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingFlagsMarquee } from "@/components/landing/landing-flags-marquee";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingReveal } from "@/components/landing/landing-reveal";
import {
  LandingHowItWorks,
  LandingWalrusMemory,
} from "@/components/landing/landing-sections";
import { LandingShowcase } from "@/components/landing/landing-showcase";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-hoolclone-page-bg">
      <LandingHeader />
      <LandingReveal>
        <main>
          <LandingHero />
          <LandingFeatures />
          <LandingFlagsMarquee />
          <LandingHowItWorks />
          <LandingWalrusMemory />
          <LandingShowcase />
        </main>
      </LandingReveal>
      <LandingFooter />
    </div>
  );
}
