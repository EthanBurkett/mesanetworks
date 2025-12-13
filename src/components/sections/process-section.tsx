"use client";

import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { FileSearch, Map, FileText, Wrench, CheckSquare } from "lucide-react";

const steps = [
  {
    title: "On-site Consultation",
    description:
      "We walk the site with you to understand your layout, equipment needs, and any challenges.",
    icon: FileSearch,
  },
  {
    title: "Camera Angle & Cable Path Mapping",
    description:
      "Before installing anything, we plan out camera views, cable routes, and network topology.",
    icon: Map,
  },
  {
    title: "Transparent Quote",
    description:
      "You get a detailed breakdown of materials, labor, and timeline. No surprises.",
    icon: FileText,
  },
  {
    title: "Professional Installation",
    description:
      "Clean cable runs, proper terminations, and testing. Everything is labeled and documented.",
    icon: Wrench,
  },
  {
    title: "Handoff & Documentation",
    description:
      "You receive network diagrams, camera IP lists, and login credentials. Full transparency.",
    icon: CheckSquare,
  },
];

export function ProcessSection() {
  return (
    <section id="process" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4">Our Process</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            How We Approach Every Project
          </h2>
          <p className="text-lg text-muted-foreground">
            We don&apos;t show up and start drilling holes. Every installation
            is planned, documented, and done right the first time.
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
              transition: { staggerChildren: 0.2 },
            },
          }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="relative bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <step.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-primary mb-1">
                    Step {index + 1}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-accent/10 to-primary/10 border-2 border-accent/20 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
                Example Planning
              </div>
              <div className="text-sm font-semibold text-foreground/60">
                Network Diagram
              </div>
              <div className="text-xs text-foreground/40 mt-1">
                Typical topology we create
              </div>
            </div>
          </div>
          <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-accent/10 to-primary/10 border-2 border-accent/20 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
                Example Planning
              </div>
              <div className="text-sm font-semibold text-foreground/60">
                Camera Angle Layout
              </div>
              <div className="text-xs text-foreground/40 mt-1">
                Field of view mapping
              </div>
            </div>
          </div>
          <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-accent/10 to-primary/10 border-2 border-accent/20 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
                Example Standards
              </div>
              <div className="text-sm font-semibold text-foreground/60">
                Professional Tools
              </div>
              <div className="text-xs text-foreground/40 mt-1">
                Proper testing equipment
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
