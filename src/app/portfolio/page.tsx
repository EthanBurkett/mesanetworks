"use client";

import { motion } from "motion/react";
import { Building2, Network, Shield, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function PortfolioPage() {
  // Ready to showcase your completed projects!
  // Uncomment and add your project details below:
  const projects: Array<{
    id: number;
    title: string;
    category: string;
    description: string;
    icon: React.ComponentType<any>;
    stats: string[];
  }> = [
    // {
    //   id: 1,
    //   title: "Enterprise Office Buildout",
    //   category: "Structured Cabling",
    //   description:
    //     "Complete network infrastructure for a 15,000 sq ft office space including Cat6a cabling, fiber backbone, and organized server room.",
    //   icon: Network,
    //   stats: ["200+ cable runs", "12 IDFs", "2 week completion"],
    // },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Building Excellence
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                We're just getting started, and we're ready to bring the same
                level of expertise and professionalism to your project
              </p>
            </div>

            {/* Coming Soon Message */}
            {projects.length === 0 && (
              <div className="bg-card border rounded-xl p-12 mb-12 shadow-sm text-center">
                <div className="max-w-2xl mx-auto">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Building2 className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold mb-4">
                    Your Project Could Be Our First Showcase
                  </h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    As a new company, we're eager to prove ourselves and build
                    lasting relationships. What we lack in portfolio history, we
                    make up for with dedication, industry expertise, and a
                    commitment to excellence on every installation.
                  </p>
                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    We bring professional-grade skills, competitive pricing, and
                    the attention to detail that comes from building our
                    reputation one satisfied customer at a time.
                  </p>
                  <div className="grid sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-accent/5 rounded-lg p-4">
                      <Network className="w-6 h-6 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium">Expert Installation</p>
                    </div>
                    <div className="bg-accent/5 rounded-lg p-4">
                      <Shield className="w-6 h-6 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium">Quality Guaranteed</p>
                    </div>
                    <div className="bg-accent/5 rounded-lg p-4">
                      <Wifi className="w-6 h-6 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium">Modern Solutions</p>
                    </div>
                  </div>
                  <Link href="/consultation">
                    <Button size="lg" className="gap-2">
                      Be Our First Success Story
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Projects Grid - Ready for future projects */}
            {projects.length > 0 && (
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                {projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                          <project.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-primary mb-1">
                            {project.category}
                          </div>
                          <h3 className="text-lg font-semibold">
                            {project.title}
                          </h3>
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-4">
                        {project.description}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {project.stats.map((stat, i) => (
                          <div
                            key={i}
                            className="px-3 py-1 bg-accent/10 rounded-full text-xs font-medium"
                          >
                            {stat}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Stats Section - Hidden until we have real numbers */}
            {/* <div className="grid sm:grid-cols-3 gap-6 mb-12">
              <div className="bg-card border rounded-xl p-6 text-center shadow-sm">
                <div className="text-3xl font-bold text-primary mb-2">500+</div>
                <div className="text-sm text-muted-foreground">
                  Projects Completed
                </div>
              </div>
              <div className="bg-card border rounded-xl p-6 text-center shadow-sm">
                <div className="text-3xl font-bold text-primary mb-2">98%</div>
                <div className="text-sm text-muted-foreground">
                  Customer Satisfaction
                </div>
              </div>
              <div className="bg-card border rounded-xl p-6 text-center shadow-sm">
                <div className="text-3xl font-bold text-primary mb-2">10+</div>
                <div className="text-sm text-muted-foreground">
                  Years Experience
                </div>
              </div>
            </div> */}

            {/* CTA Section */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 border rounded-xl p-8 sm:p-12 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Ready to Start Your Project?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Let's discuss your network infrastructure needs and create a
                solution that's perfect for your business.
              </p>
              <Link href="/consultation">
                <Button size="lg">Schedule a Consultation</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
}
