"use client";

import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import Link from "next/link";

export function CtaSection() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-95"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="max-w-3xl mx-auto text-center space-y-8"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground-invert dark:text-foreground">
            Ready to Upgrade Your Network?
          </h2>
          <p className="text-xl text-muted-foreground-invert dark:text-muted-foreground">
            Get a free consultation and quote for your next project. Our team is
            ready to help you build a reliable, high-performance network.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg bg-white text-primary hover:bg-white/90"
              asChild
            >
              <Link href="/consultation">Schedule Consultation</Link>
            </Button>
            <Button
              size="lg"
              variant="outline-white"
              className="text-lg text-foreground-invert dark:text-foreground"
              asChild
            >
              <a href="tel:+15127864561">Call (512) 786-4561</a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
