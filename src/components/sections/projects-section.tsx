"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "motion/react";

const projects = [
  {
    title: "Corporate Office Buildout",
    type: "Structured Cabling",
    location: "Austin, TX",
  },
  {
    title: "Warehouse WiFi Network",
    type: "Access Points",
    location: "Dallas, TX",
  },
  {
    title: "Retail Security System",
    type: "IP Cameras",
    location: "Houston, TX",
  },
];

export function ProjectsSection() {
  return (
    <section id="projects" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4">Our Work</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Recent Projects
          </h2>
          <p className="text-lg text-muted-foreground">
            See how we&apos;ve helped businesses across Texas build reliable
            network infrastructure.
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {projects.map((project, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <Card className="overflow-hidden group hover:shadow-lg transition-all">
                <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-b">
                  <div className="text-center p-6">
                    <div className="text-muted-foreground text-sm uppercase tracking-wider mb-2">
                      Project Photo
                    </div>
                    <div className="text-base font-semibold text-foreground/60">
                      {project.title}
                    </div>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <CardDescription>
                    <Badge variant="secondary" className="mb-2">
                      {project.type}
                    </Badge>
                    <div className="text-sm">{project.location}</div>
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
