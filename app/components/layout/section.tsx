import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionProps = {
  id?: string;
  children: ReactNode;
  /** Override background / surface utilities here. */
  className?: string;
  /** Override the inner container (e.g. a narrower max-width). */
  containerClassName?: string;
};

/**
 * Unified section shell — one vertical rhythm and one responsive gutter for the
 * whole landing page. Replaces the per-section `px-24 py-20/24` drift.
 */
export function Section({ id, children, className, containerClassName }: SectionProps) {
  return (
    <section
      id={id}
      className={cn("px-6 py-20 md:px-12 md:py-28 lg:px-24", className)}
    >
      <div className={cn("mx-auto w-full max-w-7xl", containerClassName)}>
        {children}
      </div>
    </section>
  );
}
