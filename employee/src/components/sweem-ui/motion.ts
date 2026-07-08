import type { Variants, Transition } from "framer-motion";

/** Premium spring used across entrance + hover transitions. */
export const spring: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 26,
  mass: 0.9,
};

/** Root grid: orchestrates the staggered entrance per column. */
export const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.08 },
  },
};

/** Each column staggers its own cards. */
export const columnVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09 },
  },
};

/** Individual card entrance. */
export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.985 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: spring,
  },
};

/** Top navigation bar entrance. */
export const navVariants: Variants = {
  hidden: { opacity: 0, y: -14 },
  show: { opacity: 1, y: 0, transition: { ...spring, delay: 0.05 } },
};
