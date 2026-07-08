import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";

type SectionHeadingProps = {
  eyebrow: string;
  eyebrowIcon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** "center" stacks everything centered; "left" splits title / description+actions into a row. */
  align?: "left" | "center";
  actions?: ReactNode;
  className?: string;
};

/**
 * One heading treatment for every section: brand eyebrow, title, optional
 * description + actions. Keeps the type scale and bottom spacing consistent so
 * sections read as one system instead of nine bespoke headers.
 */
export function SectionHeading({
  eyebrow,
  eyebrowIcon,
  title,
  description,
  align = "left",
  actions,
  className,
}: SectionHeadingProps) {
  const centered = align === "center";

  const eyebrowEl = (
    <p className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand">
      {eyebrowIcon}
      {eyebrow}
    </p>
  );

  const titleEl = (
    <h2 className="mt-3 text-[clamp(28px,4vw,44px)] font-medium leading-[1.1] tracking-[-0.02em] text-text-primary">
      {title}
    </h2>
  );

  if (centered) {
    return (
      <Reveal
        className={cn(
          "mx-auto mb-12 flex max-w-2xl flex-col items-center text-center md:mb-16",
          className,
        )}
      >
        {eyebrowEl}
        {titleEl}
        {description ? (
          <p className="mt-4 text-[14px] leading-6 text-text-secondary">{description}</p>
        ) : null}
        {actions ? <div className="mt-7">{actions}</div> : null}
      </Reveal>
    );
  }

  return (
    <Reveal
      className={cn(
        "mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="max-w-xl">
        {eyebrowEl}
        {titleEl}
      </div>
      {description || actions ? (
        <div className="flex flex-col items-start gap-4 md:max-w-sm md:items-end md:text-right">
          {description ? (
            <p className="text-[14px] leading-6 text-text-secondary">{description}</p>
          ) : null}
          {actions}
        </div>
      ) : null}
    </Reveal>
  );
}
