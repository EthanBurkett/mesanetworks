"use client";

import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { Award, PackageCheck, Zap, DollarSign } from "lucide-react";

const benefits = [
  {
    title: "Certified Technicians",
    description:
      "Our team holds industry certifications and stays current with the latest technologies and best practices.",
    icon: Award,
  },
  {
    title: "Quality Materials",
    description:
      "We use only premium cables, connectors, and equipment from trusted manufacturers.",
    icon: PackageCheck,
  },
  {
    title: "Fast Turnaround",
    description:
      "Efficient project management ensures your network is up and running on schedule.",
    icon: Zap,
  },
  {
    title: "Competitive Pricing",
    description:
      "Transparent quotes with no hidden fees. Great value without compromising quality.",
    icon: DollarSign,
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
                  Featured Image
                </div>
                <div className="text-lg font-semibold text-foreground/60">
                  Professional Team
                </div>
                <div className="text-lg font-semibold text-foreground/60">
                  Working on Network Installation
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <div>
              <Badge className="mb-4">Why Mesa Networks</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Built on Excellence & Reliability
              </h2>
              <p className="text-lg text-muted-foreground">
                We combine technical expertise with exceptional customer service
                to deliver network infrastructure solutions that power your
                business.
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
