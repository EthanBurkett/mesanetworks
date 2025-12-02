"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

export function HeroSection() {
  return (
    <section className="relative -mt-16">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-48 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-8"
          >
            <Badge className="bg-accent/10 text-accent border-accent/20 hover:bg-accent/20">
              Professional Network Infrastructure
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Texas&apos; Premier{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
                Data Cabling
              </span>{" "}
              Specialists
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Expert installation of structured cabling, wireless access points,
              security cameras, network racks, and switches. Professional
              solutions for businesses across Texas—no licenses or permits
              required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" variant="gradient" className="text-lg">
                Request Free Quote
              </Button>
              <Button size="lg" variant="outline-primary" className="text-lg">
                View Our Work
              </Button>
            </div>
            <div className="flex gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">
                  Projects Completed
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent">24/7</div>
                <div className="text-sm text-muted-foreground">
                  Support Available
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">
                  Client Satisfaction
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
            className="relative"
          >
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-muted-foreground text-sm uppercase tracking-wider mb-2">
                  Hero Image
                </div>
                <div className="text-lg font-semibold text-foreground/60">
                  Network Technician Installing
                </div>
                <div className="text-lg font-semibold text-foreground/60">
                  Data Cables in Server Rack
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-48 h-48 rounded-xl bg-gradient-to-br from-accent to-primary opacity-20 blur-2xl"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
