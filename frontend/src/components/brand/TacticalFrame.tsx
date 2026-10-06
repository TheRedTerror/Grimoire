"use client";

interface TacticalFrameProps {
  children: React.ReactNode;
  className?: string;
  label?: string;
  variant?: "default" | "accent" | "danger";
}

export default function TacticalFrame({
  children,
  className = "",
  label,
  variant = "default",
}: TacticalFrameProps) {
  const borderColor =
    variant === "accent"
      ? "border-grimoire-accent/40"
      : variant === "danger"
        ? "border-grimoire-danger/40"
        : "border-grimoire-border";

  return (
    <div className={`relative ${className}`}>
      {label && (
        <div className="absolute -top-2.5 left-4 px-2 bg-grimoire-panel text-[9px] uppercase tracking-[0.2em] text-grimoire-muted z-10">
          {label}
        </div>
      )}
      <div className={`relative border ${borderColor} bg-grimoire-panel/80 backdrop-blur-sm`}>
        {/* HUD corner brackets */}
        <svg className="absolute top-0 left-0 w-4 h-4 text-grimoire-accent/40" viewBox="0 0 16 16">
          <path d="M1 6V1h5" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        <svg className="absolute top-0 right-0 w-4 h-4 text-grimoire-accent/60" viewBox="0 0 16 16">
          <path d="M15 6V1h-5" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        <svg className="absolute bottom-0 left-0 w-4 h-4 text-grimoire-accent/60" viewBox="0 0 16 16">
          <path d="M1 10v5h5" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        <svg className="absolute bottom-0 right-0 w-4 h-4 text-grimoire-accent/60" viewBox="0 0 16 16">
          <path d="M15 10v5h-5" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        {children}
      </div>
    </div>
  );
}
