import type { ColorSwatch } from "@/app/brand-asset/data";

export function PaletteColumn({ colors }: { colors: readonly ColorSwatch[] }) {
  return (
    <div className="brand-palette-column">
      {colors.map(([label, color]) => (
        <div className="brand-palette-row" key={label} style={{ background: color }}>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
