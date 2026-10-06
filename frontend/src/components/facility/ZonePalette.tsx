"use client";

import type { ZoneTypeInfo } from "@/types/facility";
import { ZONE_DEFAULT_SIZES } from "./ZoneFloorPlan";

interface ZonePaletteProps {
  zoneTypes: ZoneTypeInfo[];
  onAdd: (zoneType: ZoneTypeInfo) => void;
  compact?: boolean;
  title?: string;
}

export default function ZonePalette({
  zoneTypes,
  onAdd,
  compact = false,
  title = "Add zones to map",
}: ZonePaletteProps) {
  return (
    <div className={compact ? "space-y-1.5" : "space-y-2"}>
      {!compact && (
        <div className="mb-2">
          <div className="text-[10px] uppercase tracking-widest text-grimoire-accent mb-1">{title}</div>
          <p className="text-[9px] text-grimoire-muted leading-snug">
            Press a button below — each click places a new zone on the floor plan. Then drag zones on
            the map to reposition them.
          </p>
        </div>
      )}
      {zoneTypes.map((zt) => (
        <button
          key={zt.id}
          type="button"
          onClick={() => onAdd(zt)}
          className={`w-full flex items-center justify-between gap-2 border transition-colors group ${
            compact
              ? "px-2 py-1.5 text-[10px] border-grimoire-border/30 hover:border-grimoire-accent/50"
              : "px-3 py-2.5 text-[11px] border-grimoire-border/40 hover:border-grimoire-accent bg-grimoire-bg/60 hover:bg-grimoire-accent/5"
          }`}
          style={{ borderLeftColor: zt.color, borderLeftWidth: 3 }}
        >
          <span className="text-left min-w-0">
            <span className="block text-grimoire-text font-medium">{zt.label}</span>
            {!compact && (
              <span className="block text-[9px] text-grimoire-muted mt-0.5 line-clamp-1">
                {zt.description}
                <span className="text-grimoire-muted/50 ml-1">
                  · {ZONE_DEFAULT_SIZES[zt.id].width}×{ZONE_DEFAULT_SIZES[zt.id].height}
                </span>
              </span>
            )}
          </span>
          <span
            className={`shrink-0 uppercase tracking-wider font-mono ${
              compact
                ? "text-[8px] text-grimoire-accent/70 group-hover:text-grimoire-accent"
                : "text-[9px] px-2 py-1 border border-grimoire-accent/30 text-grimoire-accent group-hover:bg-grimoire-accent group-hover:text-white"
            }`}
          >
            {compact ? "+ Add" : "+ Add to Map"}
          </span>
        </button>
      ))}
    </div>
  );
}
