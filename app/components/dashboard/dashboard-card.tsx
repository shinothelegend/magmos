import Link from "next/link";
import { Icon, type IconName } from "./icons";

type DashboardCardIcon = Extract<IconName, "code" | "link" | "invoice">;

export function DashboardCard({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  href,
}: {
  icon: DashboardCardIcon;
  title: string;
  description: string;
  primaryAction?: string;
  secondaryAction: string;
  /** When set, the whole card becomes a link and actions render as button-styled spans. */
  href?: string;
}) {
  const actions = (
    <div className="dashboard-card-actions">
      {primaryAction ? (
        <span className="dashboard-button dashboard-button-primary">
          <Icon name="plus" size={15} strokeWidth={2.4} />
          {primaryAction}
        </span>
      ) : null}
      <span className={`dashboard-button dashboard-button-${primaryAction ? "ghost" : "primary"}`}>
        {secondaryAction}
        {primaryAction ? (
          <span aria-hidden="true" className="text-[15px] leading-none">
            ›
          </span>
        ) : null}
      </span>
    </div>
  );

  const body = (
    <>
      <div className="dashboard-action-head">
        <span className="dashboard-action-icon">
          <Icon name={icon} size={22} strokeWidth={2.8} />
        </span>
        <h2>{title}</h2>
      </div>
      <p>{description}</p>
      {actions}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="dashboard-action-card dashboard-dot-pattern">
        {body}
      </Link>
    );
  }

  return <article className="dashboard-action-card dashboard-dot-pattern">{body}</article>;
}
