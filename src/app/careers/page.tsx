"use client";

import { motion } from "motion/react";
import { Briefcase, MapPin, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function CareersPage() {
  // Job openings will be managed through the dashboard in the future
  // Uncomment and add job details below when positions open:
  const jobOpenings: Array<{
    id: number;
    title: string;
    type: string;
    location: string;
    postedDate: string;
    description: string;
    requirements: string[];
  }> = [
    // {
    //   id: 1,
    //   title: "Network Installation Technician",
    //   type: "Full-time",
    //   location: "Austin, TX",
    //   postedDate: "2 days ago",
    //   description: "We're looking for an experienced network technician...",
    //   requirements: [
    //     "2+ years experience with structured cabling",
    //     "Knowledge of Cat6/Cat6a and fiber optic installations",
    //     "Valid driver's license required",
    //     "Ability to lift 50+ lbs and work on ladders",
    //   ],
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
            className="max-w-4xl mx-auto"
          >
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Join Our Team
              </h1>
              <p className="text-xl text-muted-foreground">
                Build your career with a growing network infrastructure company
              </p>
            </div>

            {/* Why Work Here */}
            <div className="bg-card border rounded-xl p-8 mb-12 shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">
                Why Mesa Networks?
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  At Mesa Networks, you'll work on diverse projects across
                  Texas, from small business installations to large commercial
                  deployments. We invest in our team's growth and provide
                  opportunities to work with the latest networking technologies.
                </p>
                <p>
                  We believe in work-life balance, competitive compensation, and
                  creating an environment where skilled professionals can
                  thrive.
                </p>
              </div>
            </div>

            {/* Current Openings */}
            <div className="space-y-6 mb-12">
              <h2 className="text-2xl font-semibold">Current Openings</h2>

              {jobOpenings.length === 0 ? (
                <div className="bg-card border rounded-xl p-12 shadow-sm text-center">
                  <div className="max-w-2xl mx-auto">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Briefcase className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">
                      No Open Positions at This Time
                    </h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      We're currently not hiring, but we're always interested in
                      connecting with talented professionals in the network
                      infrastructure field. As we grow, we'll be looking for
                      skilled technicians and engineers to join our team.
                    </p>
                    <p className="text-muted-foreground mb-8 leading-relaxed">
                      If you'd like to be considered for future opportunities,
                      please reach out and introduce yourself. We'd love to keep
                      your information on file.
                    </p>
                    <Link href="/consultation">
                      <Button size="lg" className="gap-2">
                        Express Interest
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  {/* Job listings will appear here when available */}
                  {jobOpenings.map((job) => (
                    <div
                      key={job.id}
                      className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-2">
                            {job.title}
                          </h3>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4" />
                              {job.type}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Posted {job.postedDate}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        {job.description}
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 mb-4 ml-4 list-disc">
                        {job.requirements.map((req, i) => (
                          <li key={i}>{req}</li>
                        ))}
                      </ul>
                      <Link href="/consultation">
                        <Button variant="outline" className="gap-2">
                          Apply Now
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Contact Section */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 border rounded-xl p-8 text-center">
              <h2 className="text-2xl font-semibold mb-4">Stay Connected</h2>
              <p className="text-muted-foreground mb-6">
                Interested in future opportunities at Mesa Networks? Get in
                touch and let us know about your background and interests.
              </p>
              <Link href="/consultation">
                <Button size="lg" className="gap-2">
                  Get in Touch
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
}
