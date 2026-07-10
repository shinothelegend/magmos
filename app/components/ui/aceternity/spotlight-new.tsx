"use client";

import React from "react";
import { motion } from "framer-motion";

type Triple = [string, string, string];

type SpotlightProps = {
  /** [primary, secondary, tertiary] radial gradients for the left beam */
  gradientLeft?: Triple;
  /** [primary, secondary, tertiary] radial gradients for the right beam */
  gradientRight?: Triple;
  translateY?: number;
  width?: number;
  height?: number;
  smallWidth?: number;
  duration?: number;
  xOffset?: number;
};

// Brand-tinted, deliberately subtle. Left beam = fire-orange (#ff6a1a ≈ hsl 22°),
// right beam = gold (#ffb43d ≈ hsl 38°) — the Magmos accent palette.
const LEFT: Triple = [
  "radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(22, 88%, 68%, 0.10) 0, hsla(22, 88%, 55%, 0.03) 50%, hsla(22, 88%, 45%, 0) 80%)",
  "radial-gradient(50% 50% at 50% 50%, hsla(22, 88%, 68%, 0.07) 0, hsla(22, 88%, 55%, 0.03) 80%, transparent 100%)",
  "radial-gradient(50% 50% at 50% 50%, hsla(22, 88%, 68%, 0.05) 0, hsla(22, 88%, 45%, 0.02) 80%, transparent 100%)",
];

const RIGHT: Triple = [
  "radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(38, 90%, 78%, 0.12) 0, hsla(38, 85%, 65%, 0.04) 50%, hsla(38, 85%, 55%, 0) 80%)",
  "radial-gradient(50% 50% at 50% 50%, hsla(38, 90%, 78%, 0.08) 0, hsla(38, 85%, 65%, 0.03) 80%, transparent 100%)",
  "radial-gradient(50% 50% at 50% 50%, hsla(38, 90%, 78%, 0.05) 0, hsla(38, 85%, 55%, 0.02) 80%, transparent 100%)",
];

export function SpotlightNew({
  gradientLeft = LEFT,
  gradientRight = RIGHT,
  translateY = -350,
  width = 560,
  height = 1380,
  smallWidth = 240,
  duration = 7,
  xOffset = 100,
}: SpotlightProps = {}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <motion.div
        animate={{ x: [0, xOffset, 0] }}
        transition={{ duration, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        className="pointer-events-none absolute left-0 top-0 z-0 h-screen w-screen"
      >
        <div
          style={{ transform: `translateY(${translateY}px) rotate(-45deg)`, background: gradientLeft[0], width: `${width}px`, height: `${height}px` }}
          className="absolute left-0 top-0"
        />
        <div
          style={{ transform: "rotate(-45deg) translate(5%, -50%)", background: gradientLeft[1], width: `${smallWidth}px`, height: `${height}px` }}
          className="absolute left-0 top-0 origin-top-left"
        />
        <div
          style={{ transform: "rotate(-45deg) translate(-180%, -70%)", background: gradientLeft[2], width: `${smallWidth}px`, height: `${height}px` }}
          className="absolute left-0 top-0 origin-top-left"
        />
      </motion.div>

      <motion.div
        animate={{ x: [0, -xOffset, 0] }}
        transition={{ duration, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        className="pointer-events-none absolute right-0 top-0 z-0 h-screen w-screen"
      >
        <div
          style={{ transform: `translateY(${translateY}px) rotate(45deg)`, background: gradientRight[0], width: `${width}px`, height: `${height}px` }}
          className="absolute right-0 top-0"
        />
        <div
          style={{ transform: "rotate(45deg) translate(-5%, -50%)", background: gradientRight[1], width: `${smallWidth}px`, height: `${height}px` }}
          className="absolute right-0 top-0 origin-top-right"
        />
        <div
          style={{ transform: "rotate(45deg) translate(180%, -70%)", background: gradientRight[2], width: `${smallWidth}px`, height: `${height}px` }}
          className="absolute right-0 top-0 origin-top-right"
        />
      </motion.div>
    </motion.div>
  );
}
