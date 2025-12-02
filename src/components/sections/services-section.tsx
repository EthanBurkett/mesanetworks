"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "motion/react";

const services = [
  {
    title: "Structured Cabling",
    description:
      "Cat5e, Cat6, Cat6a, and fiber optic cable installation for reliable, high-speed data transmission.",
    icon: "Cable Network Icon",
  },
  {
    title: "Wireless Access Points",
    description:
      "Enterprise-grade WiFi solutions for seamless coverage across your facility.",
    icon: "WiFi Icon",
  },
  {
    title: "Security Cameras",
    description:
      "IP camera installation and network video recorder setup for comprehensive surveillance.",
    icon: "Security Camera Icon",
  },
  {
    title: "Network Racks",
    description:
      "Professional rack installation and cable management for organized infrastructure.",
    icon: "Server Rack Icon",
  },
  {
    title: "Network Switches",
    description:
      "Managed and unmanaged switch installation and configuration for optimal network performance.",
    icon: "Network Switch Icon",
  },
  {
    title: "Cable Management",
    description:
      "Clean, organized cable routing and labeling for easy maintenance and troubleshooting.",
    icon: "Cable Management Icon",
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4">Our Services</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Complete Network Infrastructure Solutions
          </h2>
          <p className="text-lg text-muted-foreground">
            From structured cabling to wireless networks, we provide end-to-end
            installation and support for your business connectivity needs.
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50 bg-card">
                <CardHeader>
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <div className="text-xs text-center text-muted-foreground">
                      {service.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
