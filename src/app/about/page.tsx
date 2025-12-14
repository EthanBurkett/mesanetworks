"use client";

import { motion } from "motion/react";
import { Building2, Users, Award, Target } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function AboutPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                About Mesa Networks
              </h1>
              <p className="text-xl text-muted-foreground">
                Professional network infrastructure for residential and
                commercial properties across Texas
              </p>
            </div>

            {/* Story Section */}
            <div className="bg-card border rounded-xl p-8 mb-8 shadow-sm">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-primary" />
                Our Story
              </h2>
              <p className="text-muted-foreground mb-4">
                Mesa Networks was founded with a simple mission: to provide
                reliable, professional network infrastructure that just works.
                Whether you're a homeowner looking to upgrade your home network
                or a business where your network is the backbone of operations,
                we understand that downtime isn't an option.
              </p>
              <p className="text-muted-foreground">
                Based in Austin, Texas, we serve both residential and commercial
                clients throughout the state with expert installation,
                configuration, and support for structured cabling, wireless
                networks, security systems, and network equipment.
              </p>
            </div>

            {/* Values Grid */}
            <div className="grid sm:grid-cols-3 gap-6 mb-8">
              <div className="bg-card border rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Customer First</h3>
                <p className="text-sm text-muted-foreground">
                  Your success is our priority. We work closely with you to
                  understand your needs and deliver solutions that exceed
                  expectations.
                </p>
              </div>

              <div className="bg-card border rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Quality Work</h3>
                <p className="text-sm text-muted-foreground">
                  We take pride in our craftsmanship. Every cable run, every
                  connection, every installation is done right the first time.
                </p>
              </div>

              <div className="bg-card border rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Results Driven</h3>
                <p className="text-sm text-muted-foreground">
                  We focus on outcomes that matter to your business: reliable
                  connectivity, improved security, and systems that scale with
                  you.
                </p>
              </div>
            </div>

            {/* What We Do */}
            <div className="bg-card border rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">What We Do</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  <strong className="text-foreground">
                    Structured Cabling:
                  </strong>{" "}
                  Professional Cat6/Cat6a and fiber optic installations for
                  homes and businesses that meet industry standards and support
                  your current and future needs.
                </p>
                <p>
                  <strong className="text-foreground">
                    Wireless Networks:
                  </strong>{" "}
                  Reliable WiFi systems for homes and enterprise-grade solutions
                  for businesses, designed for optimal coverage and performance
                  across your entire property.
                </p>
                <p>
                  <strong className="text-foreground">
                    Security Camera Systems:
                  </strong>{" "}
                  Comprehensive surveillance solutions for residential and
                  commercial properties with professional installation and
                  configuration for maximum coverage and clarity.
                </p>
                <p>
                  <strong className="text-foreground">
                    Network Equipment:
                  </strong>{" "}
                  Expert installation and configuration of switches, routers,
                  patch panels, and server racks to keep your network organized
                  and efficient.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
}
