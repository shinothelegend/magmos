import type { ContrastCardData } from "@/app/brand-asset/data";

export function ContrastCard({ card }: { card: ContrastCardData }) {
  return (
    <div className="brand-contrast-card">
      <div className="brand-contrast-swatch">
        <div style={{ background: card.leftColor, color: card.leftTextColor }}>
          <span>{card.left}</span>
          <strong>{card.ratio}</strong>
        </div>
        <div style={{ background: card.rightColor, color: "#298dff" }}>
          <span>{card.right}</span>
          <strong>{card.ratio}</strong>
        </div>
      </div>
      <div className="brand-contrast-results">
        {card.rows.map((row) => (
          <div key={row.label}>
            <span>{row.label}</span>
            <b className="brand-result-pass">AA</b>
            <b className={`brand-result-${row.secondTone}`}>{row.second}</b>
          </div>
        ))}
      </div>
    </div>
  );
}
