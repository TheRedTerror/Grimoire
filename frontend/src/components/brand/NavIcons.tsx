"use client";

const icons: Record<string, React.ReactNode> = {
  create: (
    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M8 2v12M2 8h12" />
      <circle cx="8" cy="8" r="6" opacity="0.3" />
    </svg>
  ),
  threat: (
    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M8 1 L14 14 H2 Z" />
      <path d="M8 6v3M8 11h.01" strokeWidth="1.5" />
    </svg>
  ),
  environment: (
    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="2" y="4" width="12" height="9" rx="1" />
      <path d="M5 4V2h6v2M5 8h6M5 10h4" />
    </svg>
  ),
  objectives: (
    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="8" cy="8" r="6" />
      <circle cx="8" cy="8" r="2" fill="currentColor" />
      <path d="M8 2v2M8 12v2M2 8h2M12 8h2" />
    </svg>
  ),
  scope: (
    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="8" cy="8" r="6" />
      <path d="M4 4l8 8" />
    </svg>
  ),
  techniques: (
    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="2" y="2" width="5" height="5" /><rect x="9" y="2" width="5" height="5" />
      <rect x="2" y="9" width="5" height="5" /><rect x="9" y="9" width="5" height="5" />
    </svg>
  ),
  plan: (
    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M2 4h4v4H2zM10 2h4v4h-4zM6 10h4v4H6zM10 10h4v4h-4z" />
      <path d="M6 6h1M9 6h1M6 12h4" opacity="0.5" />
    </svg>
  ),
  detection: (
    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2" />
      <circle cx="8" cy="8" r="6" strokeDasharray="2 2" opacity="0.5" />
    </svg>
  ),
  facility: (
    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="2" y="6" width="12" height="8" />
      <path d="M5 6V3h6v3M8 3v3" />
      <path d="M5 10h2M9 10h2M5 12h6" opacity="0.5" />
    </svg>
  ),
  physical: (
    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M2 14 L8 2 L14 14 Z" opacity="0.3" />
      <circle cx="8" cy="9" r="2" />
      <path d="M8 5v2M6 11h4" />
    </svg>
  ),
  report: (
    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M4 2h6l4 4v8H4z" />
      <path d="M10 2v4h4M6 8h4M6 10h4M6 12h2" />
    </svg>
  ),
};

export function NavIcon({ id }: { id: string }) {
  return <span className="flex-shrink-0 opacity-70">{icons[id] ?? icons.create}</span>;
}
