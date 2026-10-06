function hexLuminance(hex: string): number {
  const h = hex.replace("#", "");
  if (h.length < 6) return 0;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/** High-contrast floor plan palette — readable on near-black map canvas */
export function zonePlanColors(accent: string) {
  const stroke = hexLuminance(accent) < 0.25 ? "#c49090" : accent;
  return {
    stroke,
    fill: `${stroke}28`,
    faint: `${stroke}cc`,
    ink: "rgba(225, 205, 205, 0.95)",
    dim: "rgba(180, 155, 155, 0.7)",
  };
}
