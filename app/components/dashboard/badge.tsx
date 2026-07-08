export function Badge({
  children,
  tone = "beta",
}: {
  children: React.ReactNode;
  tone?: "beta" | "new";
}) {
  return (
    <span className={`dashboard-badge dashboard-badge-${tone}`}>
      {children}
    </span>
  );
}
