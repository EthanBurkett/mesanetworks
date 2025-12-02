"use client";

import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

export function CtaSection() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-95"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center text-white space-y-8"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            Ready to Upgrade Your Network Infrastructure?
          </h2>
          <p className="text-xl text-white/90">
            Get a free consultation and quote for your next project. Our team is
            ready to help you build a reliable, high-performance network.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg bg-white text-primary hover:bg-white/90"
            >
              Schedule Consultation
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg border-2 border-white text-white hover:bg-white/20 bg-white/10"
            >
              Call (555) 123-4567
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
