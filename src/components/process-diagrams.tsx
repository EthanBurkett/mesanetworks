"use client";

import { motion } from "motion/react";
import { Camera, Cable } from "lucide-react";

export function CablePathDiagram() {
  return (
    <div className="relative w-full h-full p-4">
      <svg className="w-full h-full" viewBox="0 0 300 200" fill="none">
        {/* Floor plan outline */}
        <rect
          x="10"
          y="10"
          width="280"
          height="180"
          className="stroke-muted-foreground fill-muted"
          strokeWidth="1.5"
          strokeDasharray="5,3"
          fillOpacity="0.05"
        />

        {/* Room divisions */}
        <line
          x1="95"
          y1="10"
          x2="95"
          y2="190"
          className="stroke-muted-foreground"
          strokeWidth="1"
          strokeDasharray="3,3"
          opacity="0.3"
        />
        <line
          x1="205"
          y1="10"
          x2="205"
          y2="190"
          className="stroke-muted-foreground"
          strokeWidth="1"
          strokeDasharray="3,3"
          opacity="0.3"
        />

        {/* Cable paths */}
        <motion.path
          d="M 150 15 L 150 95 M 150 95 L 52 95 M 150 95 L 248 95 M 52 95 L 52 155 M 248 95 L 248 155"
          className="stroke-primary"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
        />

        {/* Network rack with better detail */}
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <rect
            x="130"
            y="5"
            width="40"
            height="30"
            rx="3"
            className="fill-accent/20 stroke-accent"
            strokeWidth="2"
          />
          <rect
            x="135"
            y="10"
            width="30"
            height="20"
            rx="1"
            className="fill-accent"
            opacity="0.8"
          />
          <circle cx="138" cy="15" r="1.5" className="fill-card" />
          <circle cx="138" cy="25" r="1.5" className="fill-card" />
          <circle cx="162" cy="15" r="1.5" className="fill-card" />
          <circle cx="162" cy="25" r="1.5" className="fill-card" />
          <text
            x="150"
            y="48"
            textAnchor="middle"
            className="text-[9px] fill-muted-foreground font-medium"
          >
            Network Rack
          </text>
        </motion.g>

        {/* End points with port details */}
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1 }}
        >
          <circle
            cx="52"
            cy="155"
            r="10"
            className="fill-card stroke-primary"
            strokeWidth="2.5"
          />
          <circle
            cx="52"
            cy="155"
            r="3"
            className="fill-primary"
            opacity="0.6"
          />
          <text
            x="52"
            y="175"
            textAnchor="middle"
            className="text-[8px] fill-muted-foreground font-medium"
          >
            Office A
          </text>
          <text
            x="52"
            y="185"
            textAnchor="middle"
            className="text-[6px] fill-muted-foreground"
            opacity="0.7"
          >
            8 Ports
          </text>
        </motion.g>

        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.2 }}
        >
          <circle
            cx="248"
            cy="155"
            r="10"
            className="fill-card stroke-primary"
            strokeWidth="2.5"
          />
          <circle
            cx="248"
            cy="155"
            r="3"
            className="fill-primary"
            opacity="0.6"
          />
          <text
            x="248"
            y="175"
            textAnchor="middle"
            className="text-[8px] fill-muted-foreground font-medium"
          >
            Office B
          </text>
          <text
            x="248"
            y="185"
            textAnchor="middle"
            className="text-[6px] fill-muted-foreground"
            opacity="0.7"
          >
            6 Ports
          </text>
        </motion.g>

        {/* Distance labels */}
        <text
          x="150"
          y="90"
          textAnchor="middle"
          className="text-[7px] fill-primary/70"
        >
          45m
        </text>
      </svg>

      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <Cable className="w-3 h-3 text-primary" />
        <span>Planned Cable Routes</span>
      </div>
    </div>
  );
}

export function CameraLayoutDiagram() {
  return (
    <div className="relative w-full h-full p-4">
      <svg className="w-full h-full" viewBox="0 0 320 220" fill="none">
        {/* Building outline */}
        <rect
          x="20"
          y="40"
          width="280"
          height="160"
          className="stroke-muted-foreground fill-muted"
          strokeWidth="2"
          fillOpacity="0.08"
          rx="2"
        />

        {/* Interior walls */}
        <line
          x1="160"
          y1="40"
          x2="160"
          y2="200"
          className="stroke-muted-foreground"
          strokeWidth="1.5"
          opacity="0.4"
        />
        <line
          x1="20"
          y1="120"
          x2="160"
          y2="120"
          className="stroke-muted-foreground"
          strokeWidth="1.5"
          opacity="0.4"
        />

        {/* Entry door */}
        <rect
          x="145"
          y="40"
          width="30"
          height="4"
          className="fill-accent"
          opacity="0.9"
        />
        <text
          x="160"
          y="33"
          textAnchor="middle"
          className="text-[9px] fill-muted-foreground font-medium"
        >
          Front Entrance
        </text>

        {/* Side door */}
        <rect
          x="300"
          y="110"
          width="4"
          height="25"
          className="fill-accent"
          opacity="0.9"
        />
        <text
          x="313"
          y="123"
          textAnchor="start"
          className="text-[8px] fill-muted-foreground"
        >
          Side
        </text>

        {/* Camera 1 - Front Left */}
        <g>
          <motion.path
            d="M 45 55 L 90 110 L 20 110 Z"
            className="fill-primary stroke-primary"
            fillOpacity="0.12"
            strokeWidth="1.5"
            strokeDasharray="3,2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          />
          <motion.circle
            cx="45"
            cy="55"
            r="7"
            className="fill-primary stroke-card"
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          />
          <foreignObject x="38" y="48" width="14" height="14">
            <Camera className="w-3.5 h-3.5 text-primary-foreground" />
          </foreignObject>
          <text
            x="45"
            y="70"
            textAnchor="middle"
            className="text-[6px] fill-primary"
            fontWeight="600"
          >
            CAM 1
          </text>
        </g>

        {/* Camera 2 - Front Right */}
        <g>
          <motion.path
            d="M 275 55 L 230 110 L 300 110 Z"
            className="fill-primary stroke-primary"
            fillOpacity="0.12"
            strokeWidth="1.5"
            strokeDasharray="3,2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          />
          <motion.circle
            cx="275"
            cy="55"
            r="7"
            className="fill-primary stroke-card"
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          />
          <foreignObject x="268" y="48" width="14" height="14">
            <Camera className="w-3.5 h-3.5 text-primary-foreground" />
          </foreignObject>
          <text
            x="275"
            y="70"
            textAnchor="middle"
            className="text-[6px] fill-primary"
            fontWeight="600"
          >
            CAM 2
          </text>
        </g>

        {/* Camera 3 - Rear Center */}
        <g>
          <motion.path
            d="M 160 180 L 120 200 L 200 200 Z"
            className="fill-primary stroke-primary"
            fillOpacity="0.12"
            strokeWidth="1.5"
            strokeDasharray="3,2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          />
          <motion.circle
            cx="160"
            cy="180"
            r="7"
            className="fill-primary stroke-card"
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
          />
          <foreignObject x="153" y="173" width="14" height="14">
            <Camera className="w-3.5 h-3.5 text-primary-foreground" />
          </foreignObject>
          <text
            x="160"
            y="195"
            textAnchor="middle"
            className="text-[6px] fill-primary"
            fontWeight="600"
          >
            CAM 3
          </text>
        </g>

        {/* Room labels */}
        <text
          x="90"
          y="85"
          textAnchor="middle"
          className="text-[8px] fill-muted-foreground/60"
        >
          Lobby
        </text>
        <text
          x="230"
          y="120"
          textAnchor="middle"
          className="text-[8px] fill-muted-foreground/60"
        >
          Main Area
        </text>
        <text
          x="90"
          y="165"
          textAnchor="middle"
          className="text-[8px] fill-muted-foreground/60"
        >
          Office
        </text>
      </svg>

      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <Camera className="w-3 h-3 text-primary" />
        <span>Coverage Planning</span>
      </div>
    </div>
  );
}

export function NetworkRackDiagram() {
  return (
    <div className="relative w-full h-full p-4">
      <svg
        className="w-full h-full"
        viewBox="0 0 220 300"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Rack frame with rails */}
        <g>
          {/* Left rail */}
          <rect
            x="40"
            y="20"
            width="12"
            height="260"
            className="stroke-muted-foreground fill-muted"
            strokeWidth="2"
            fillOpacity="0.3"
          />
          {/* Right rail */}
          <rect
            x="168"
            y="20"
            width="12"
            height="260"
            className="stroke-muted-foreground fill-muted"
            strokeWidth="2"
            fillOpacity="0.3"
          />
          {/* Center background */}
          <rect
            x="52"
            y="20"
            width="116"
            height="260"
            className="fill-background"
            opacity="0.8"
          />
          {/* Top and bottom */}
          <rect
            x="40"
            y="20"
            width="140"
            height="8"
            className="stroke-muted-foreground fill-muted-foreground"
            strokeWidth="1"
            fillOpacity="0.2"
          />
          <rect
            x="40"
            y="272"
            width="140"
            height="8"
            className="stroke-muted-foreground fill-muted-foreground"
            strokeWidth="1"
            fillOpacity="0.2"
          />
        </g>
        {/* Mounting holes on rails */}
        {[...Array(8)].map((_, i) => (
          <g key={`holes-${i}`}>
            <circle
              cx="46"
              cy={35 + i * 30}
              r="1.5"
              className="fill-muted-foreground"
              opacity="0.4"
            />
            <circle
              cx="46"
              cy={50 + i * 30}
              r="1.5"
              className="fill-muted-foreground"
              opacity="0.4"
            />
            <circle
              cx="174"
              cy={35 + i * 30}
              r="1.5"
              className="fill-muted-foreground"
              opacity="0.4"
            />
            <circle
              cx="174"
              cy={50 + i * 30}
              r="1.5"
              className="fill-muted-foreground"
              opacity="0.4"
            />
          </g>
        ))}
        ){/* Rack units */}
        {[
          { label: "Switch", active: true },
          { label: "Router", active: true },
          { label: "Firewall", active: true },
          { label: "Server", active: true },
          { label: "U5", active: false },
          { label: "U6", active: false },
          { label: "U7", active: false },
          { label: "U8", active: false },
        ].map((unit, i) => (
          <g key={i}>
            <motion.rect
              x="57"
              y={30 + i * 30}
              width="106"
              height="25"
              rx="2"
              className={
                unit.active
                  ? "fill-primary/20 stroke-primary"
                  : "fill-muted/10 stroke-muted-foreground/30"
              }
              strokeWidth="1.5"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 57, opacity: 1 }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 180 }}
            />

            {/* Equipment face details */}
            {unit.active && (
              <>
                {/* Vent holes */}
                {[...Array(8)].map((_, v) => (
                  <line
                    key={`vent-${i}-${v}`}
                    x1={65 + v * 6}
                    y1={35 + i * 30}
                    x2={65 + v * 6}
                    y2={48 + i * 30}
                    className="stroke-muted-foreground"
                    strokeWidth="0.5"
                    opacity="0.2"
                  />
                ))}

                {/* LED indicators */}
                <motion.circle
                  cx="125"
                  cy={40 + i * 30}
                  r="2.5"
                  className="fill-accent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ delay: i * 0.1, duration: 2, repeat: Infinity }}
                />
                <motion.circle
                  cx="135"
                  cy={40 + i * 30}
                  r="2.5"
                  className="fill-primary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    delay: i * 0.1 + 0.5,
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
                <motion.circle
                  cx="145"
                  cy={40 + i * 30}
                  r="2.5"
                  className="fill-green-500"
                  opacity="0.8"
                />

                {/* Port indicators */}
                {[...Array(4)].map((_, p) => (
                  <rect
                    key={`port-${i}-${p}`}
                    x={125 + p * 8}
                    y={47 + i * 30}
                    width="5"
                    height="3"
                    rx="0.5"
                    className="fill-muted-foreground"
                    opacity="0.3"
                  />
                ))}
              </>
            )}

            {/* Unit label */}
            <text
              x="120"
              y={45 + i * 30}
              textAnchor="middle"
              className={`text-[8px] font-medium ${
                unit.active ? "fill-primary" : "fill-muted-foreground/50"
              }`}
            >
              {unit.label}
            </text>
          </g>
        ))}
        {/* Cable management */}
        <motion.path
          d="M 163 30 Q 185 150 163 270"
          className="stroke-primary/40"
          strokeWidth="4"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.6, ease: "easeInOut" }}
        />
        {/* U label markers */}
        <text
          x="35"
          y="45"
          textAnchor="end"
          className="text-[7px] fill-muted-foreground/40"
        >
          U1
        </text>
        <text
          x="35"
          y="255"
          textAnchor="end"
          className="text-[7px] fill-muted-foreground/40"
        >
          U8
        </text>
      </svg>

      <div className="absolute bottom-2 left-2 text-[10px] text-muted-foreground font-medium">
        Organized Rack Layout
      </div>
    </div>
  );
}
