import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function CheckCircle() {
  return (
    <span className="grid size-[18px] shrink-0 place-items-center rounded-full bg-[#22c55e]">
      <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="white" strokeWidth="3" aria-hidden>
        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

type PricingCardProps = {
  name: string;
  subtitle: string;
  price: string;
  period?: string;
  cta: string;
  featured?: boolean;
  features: string[];
};

export function PricingCard({
  name,
  subtitle,
  price,
  period = "/ yearly",
  cta,
  featured = false,
  features,
}: PricingCardProps) {
  return (
    <Card
      className={cn(
        "relative h-full gap-0 rounded-[20px] p-6 shadow-none",
        featured
          ? "border-transparent bg-white ring-2 ring-brand shadow-[0_24px_60px_rgba(28,111,208,0.12)]"
          : "border-border bg-surface",
      )}
    >
      {featured ? (
        <Badge className="absolute right-5 top-5 rounded-full bg-brand text-primary-foreground">
          Most popular
        </Badge>
      ) : null}

      <div>
        <h3 className="text-[17px] font-semibold text-text-primary">{name}</h3>
        <p className="mt-1 text-[13px] text-text-secondary">{subtitle}</p>
      </div>

      <div className="mt-6 flex items-end gap-1.5">
        <span className="text-[38px] font-semibold leading-none tracking-[-0.03em] text-text-primary">
          {price}
        </span>
        <span className="mb-1 text-[12px] text-text-muted">{period}</span>
      </div>

      <Button
        className={cn(
          "mt-5 h-12 w-full rounded-full text-[13px] font-medium",
          featured
            ? "bg-brand-dark text-white hover:bg-brand-dark/90"
            : "border border-border bg-white text-[#344054] hover:bg-[#f9fafb]",
        )}
      >
        {cta}
      </Button>

      <ul className="mt-6 space-y-3.5 border-t border-border pt-6">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2.5 text-[13px] text-[#344054]">
            <CheckCircle />
            {f}
          </li>
        ))}
      </ul>
    </Card>
  );
}
