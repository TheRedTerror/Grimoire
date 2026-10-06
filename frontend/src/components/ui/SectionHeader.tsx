"use client";

interface SectionHeaderProps {
  refId: string;
  title: string;
  subtitle?: string;
}

export default function SectionHeader({ refId, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="section-header mb-6 pb-4 border-b border-grimoire-border/60">
      <div className="flex items-baseline gap-3 mb-1">
        <span className="text-[10px] font-mono text-grimoire-muted tracking-widest">{refId}</span>
        <h2 className="font-display text-xl tracking-wide text-grimoire-accent">{title}</h2>
      </div>
      {subtitle && (
        <p className="text-sm text-grimoire-muted/90 max-w-2xl leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}
