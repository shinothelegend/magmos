"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { columnVariants, containerVariants } from "./motion";

/** Root dashboard grid, orchestrates the staggered entrance of all columns. */
export function DashboardGrid({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 lg:grid-cols-12"
    >
      {children}
    </motion.div>
  );
}

/** A vertical dashboard column that staggers its own cards. */
export function Column({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={columnVariants}
      className={cn("flex flex-col gap-4", className)}
    >
      {children}
    </motion.div>
  );
}
