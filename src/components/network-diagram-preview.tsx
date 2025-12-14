"use client";

import { motion } from "motion/react";
import { Network, Server, Router, Wifi, Cable } from "lucide-react";

export function NetworkDiagramPreview() {
  return (
    <div className="relative w-full h-full">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-grid-small opacity-20"></div>

      {/* Animated Network Topology */}
      <svg
        className="w-full h-full"
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Connection Lines */}
        <motion.line
          x1="200"
          y1="60"
          x2="200"
          y2="140"
          className="stroke-primary"
          strokeWidth="2"
          strokeDasharray="5,5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 1, delay: 0.2 }}
        />
        <motion.line
          x1="200"
          y1="160"
          x2="100"
          y2="240"
          className="stroke-accent"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.8 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        />
        <motion.line
          x1="200"
          y1="160"
          x2="300"
          y2="240"
          className="stroke-accent"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.8 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        />
        {/* Lines to left devices */}
        <motion.line
          x1="100"
          y1="260"
          x2="60"
          y2="320"
          className="stroke-primary"
          strokeWidth="1.5"
          strokeDasharray="5,5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        />
        <motion.line
          x1="100"
          y1="260"
          x2="100"
          y2="320"
          className="stroke-primary"
          strokeWidth="1.5"
          strokeDasharray="5,5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        />
        <motion.line
          x1="100"
          y1="260"
          x2="140"
          y2="320"
          className="stroke-primary"
          strokeWidth="1.5"
          strokeDasharray="5,5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        />

        {/* Lines to right devices */}
        <motion.line
          x1="300"
          y1="260"
          x2="260"
          y2="320"
          className="stroke-primary"
          strokeWidth="1.5"
          strokeDasharray="5,5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        />
        <motion.line
          x1="300"
          y1="260"
          x2="300"
          y2="320"
          className="stroke-primary"
          strokeWidth="1.5"
          strokeDasharray="5,5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        />
        <motion.line
          x1="300"
          y1="260"
          x2="340"
          y2="320"
          className="stroke-primary"
          strokeWidth="1.5"
          strokeDasharray="5,5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        />

        {/* Internet/Cloud */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <circle
            cx="200"
            cy="40"
            r="30"
            className="fill-card stroke-primary"
            strokeWidth="2"
          />
          <foreignObject x="180" y="20" width="40" height="40">
            <div className="flex items-center justify-center w-full h-full">
              <Network className="w-6 h-6 text-primary" />
            </div>
          </foreignObject>
        </motion.g>

        {/* Router */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <circle
            cx="200"
            cy="150"
            r="35"
            className="fill-card stroke-accent"
            strokeWidth="2.5"
          />
          <foreignObject x="177" y="127" width="46" height="46">
            <div className="flex items-center justify-center w-full h-full">
              <Router className="w-7 h-7 text-accent" />
            </div>
          </foreignObject>
        </motion.g>

        {/* Switch Left */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <circle
            cx="100"
            cy="250"
            r="30"
            className="fill-card stroke-primary"
            strokeWidth="2"
          />
          <foreignObject x="80" y="230" width="40" height="40">
            <div className="flex items-center justify-center w-full h-full">
              <Server className="w-6 h-6 text-primary" />
            </div>
          </foreignObject>
        </motion.g>

        {/* Switch Right */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <circle
            cx="300"
            cy="250"
            r="30"
            className="fill-card stroke-primary"
            strokeWidth="2"
          />
          <foreignObject x="280" y="230" width="40" height="40">
            <div className="flex items-center justify-center w-full h-full">
              <Wifi className="w-6 h-6 text-primary" />
            </div>
          </foreignObject>
        </motion.g>

        {/* Devices Bottom Left */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <circle
            cx="60"
            cy="340"
            r="20"
            className="fill-muted stroke-muted-foreground"
            strokeWidth="1.5"
            opacity="0.6"
          />
          <circle
            cx="100"
            cy="340"
            r="20"
            className="fill-muted stroke-muted-foreground"
            strokeWidth="1.5"
            opacity="0.6"
          />
          <circle
            cx="140"
            cy="340"
            r="20"
            className="fill-muted stroke-muted-foreground"
            strokeWidth="1.5"
            opacity="0.6"
          />
        </motion.g>

        {/* Devices Bottom Right */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <circle
            cx="260"
            cy="340"
            r="20"
            className="fill-muted stroke-muted-foreground"
            strokeWidth="1.5"
            opacity="0.6"
          />
          <circle
            cx="300"
            cy="340"
            r="20"
            className="fill-muted stroke-muted-foreground"
            strokeWidth="1.5"
            opacity="0.6"
          />
          <circle
            cx="340"
            cy="340"
            r="20"
            className="fill-muted stroke-muted-foreground"
            strokeWidth="1.5"
            opacity="0.6"
          />
        </motion.g>

        {/* Data flow animations - split at router to both switches */}
        {/* Left path flow */}
        <motion.circle
          r="3"
          className="fill-primary"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <animateMotion dur="3s" repeatCount="indefinite">
            <mpath href="#dataPathLeft" />
          </animateMotion>
        </motion.circle>

        {/* Right path flow */}
        <motion.circle
          r="3"
          className="fill-accent"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <animateMotion dur="3s" repeatCount="indefinite">
            <mpath href="#dataPathRight" />
          </animateMotion>
        </motion.circle>

        {/* Additional dots for each device */}
        {[60, 100, 140].map((x, i) => (
          <motion.circle
            key={`left-${i}`}
            cx={x}
            cy="340"
            r="2.5"
            className="fill-primary"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.8, 0.8, 0],
              scale: [0, 1.2, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 1.5 + i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}

        {[260, 300, 340].map((x, i) => (
          <motion.circle
            key={`right-${i}`}
            cx={x}
            cy="340"
            r="2.5"
            className="fill-accent"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.8, 0.8, 0],
              scale: [0, 1.2, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 1.5 + i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}

        <defs>
          <path id="dataPathLeft" d="M 200 60 L 200 140 L 100 240 L 60 320" />
          <path id="dataPathRight" d="M 200 60 L 200 140 L 300 240 L 340 320" />
        </defs>
      </svg>

      {/* Floating Labels */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.9 }}
        className="absolute bottom-4 left-4 bg-card/80 backdrop-blur-sm border rounded-lg px-3 py-1.5 text-xs"
      >
        <div className="flex items-center gap-2">
          <Cable className="w-3 h-3 text-primary" />
          <span className="text-muted-foreground">Example Topology</span>
        </div>
      </motion.div>
    </div>
  );
}
