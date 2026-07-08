export function MisuseVisual({ type }: { type: string }) {
  return (
    <div className="brand-misuse-visual">
      <span className={`brand-misuse-shape brand-misuse-${type}`} />
      <span className="brand-red-line" />
    </div>
  );
}
