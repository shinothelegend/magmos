// Self-contained dark theme. The SDK ships its own inline styles so it renders
// identically regardless of the host app's CSS / Tailwind setup.

export const theme = {
  bg: "#1a1a1c",
  bgInset: "#232328",
  field: "#1b1b1f",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.16)",
  text: "#f4f4f5",
  textMuted: "#9a9aa1",
  textDim: "#6b6b72",
  mint: "#ff6a1a",
  mintHover: "#ff8340",
  radius: 24,
  font: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
} as const;
