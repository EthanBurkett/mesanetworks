"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero-section";
import { ServicesSection } from "@/components/sections/services-section";
import { WhyUsSection } from "@/components/sections/why-us-section";
import { ProcessSection } from "@/components/sections/process-section";
import { NetworkShowcaseSection } from "@/components/sections/network-showcase-section";
import { CtaSection } from "@/components/sections/cta-section";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <ServicesSection />
      <WhyUsSection />
      <ProcessSection />
      <NetworkShowcaseSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
