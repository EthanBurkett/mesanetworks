"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero-section";
import { ServicesSection } from "@/components/sections/services-section";
import { WhyUsSection } from "@/components/sections/why-us-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { CtaSection } from "@/components/sections/cta-section";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <ServicesSection />
      <WhyUsSection />
      <ProjectsSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
