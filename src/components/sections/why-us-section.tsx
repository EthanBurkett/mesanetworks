"use client";

import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { CheckCircle2, FileText, Wrench, Tag } from "lucide-react";

const benefits = [
  {
    title: "Standards-Based Cabling",
    description:
      "We follow TIA/EIA standards for all installations, ensuring your network meets industry requirements.",
    icon: CheckCircle2,
  },
  {
    title: "Clean Installs & Labeled Drops",
    description:
      "Every cable is properly terminated, tested, and labeled. No messy wiring or unlabeled connections.",
    icon: Tag,
  },
  {
    title: "Local, Owner-Operated",
    description:
      "Direct communication with the installer. No middlemen, no outsourcing, no surprises.",
    icon: Wrench,
  },
  {
    title: "Designed First, Installed Second",
    description:
      "We plan camera angles, cable paths, and network layouts before drilling a single hole.",
    icon: FileText,
  },
];

export function WhyUsSection() {
  return (
    <section id="why-us" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-accent/10 to-primary/10 border-2 border-accent/20 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-muted-foreground text-sm uppercase tracking-wider mb-2">
                  Example of Professional Standards
                </div>
                <div className="text-lg font-semibold text-foreground/60">
                  Clean Network Rack
                </div>
                <div className="text-sm text-foreground/40 mt-2">
                  Industry-standard terminations we follow
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <div>
              <Badge className="mb-4">Why Choose MesaNet</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Professional Installations Done Right
              </h2>
              <p className="text-lg text-muted-foreground">
                No upsells. No contracts. Just clean, properly planned network
                installations by someone who knows what they&apos;re doing.
              </p>
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.15 },
                },
              }}
              className="space-y-6"
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <benefit.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
