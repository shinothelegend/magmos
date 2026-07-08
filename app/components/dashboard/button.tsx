import { Icon } from "./icons";

export function Button({
  children,
  icon,
  variant = "primary",
}: {
  children: React.ReactNode;
  icon?: "plus";
  variant?: "primary" | "ghost";
}) {
  return (
    <button
      className={`dashboard-button dashboard-button-${variant}`}
      type="button"
    >
      {icon ? <Icon name={icon} size={15} strokeWidth={2.4} /> : null}
      {children}
      {variant === "ghost" ? (
        <span aria-hidden="true" className="text-[15px] leading-none">
          ›
        </span>
      ) : null}
    </button>
  );
}
