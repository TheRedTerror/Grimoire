"use client";

import type { ZoneTypeId } from "@/types/facility";
import { zonePlanColors } from "./zonePlanColors";

interface ZoneFloorPlanProps {
  zoneType: ZoneTypeId;
  color: string;
}

/** Architectural floor-plan decoration per zone type */
export default function ZoneFloorPlan({ zoneType, color }: ZoneFloorPlanProps) {
  const c = zonePlanColors(color);

  return (
    <svg
      className="facility-zone-floorplan"
      viewBox="0 0 160 88"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <pattern id={`hatch-${zoneType}`} width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 8 L8 0" stroke={c.dim} strokeWidth="1" />
        </pattern>
        <pattern id={`grid-${zoneType}`} width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M12 0 V12 M0 12 H12" stroke={c.dim} strokeWidth="0.6" />
        </pattern>
        <pattern id={`mesh-${zoneType}`} width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="none" stroke={c.faint} strokeWidth="0.8" />
        </pattern>
        <pattern id={`stalls-${zoneType}`} width="20" height="28" patternUnits="userSpaceOnUse">
          <path d="M0 28 L20 28 M10 28 L10 6" stroke={c.dim} strokeWidth="1" />
        </pattern>
      </defs>

      {/* Base room fill */}
      <rect x="3" y="3" width="154" height="82" fill={c.fill} stroke={c.stroke} strokeWidth="1.5" rx="1" />

      {zoneType === "perimeter" && (
        <>
          <rect x="8" y="8" width="144" height="72" fill="none" stroke={c.ink} strokeWidth="2" strokeDasharray="8 5" />
          <rect x="16" y="16" width="128" height="56" fill={`url(#hatch-${zoneType})`} opacity="0.8" />
          <path d="M24 68 L48 44 L72 68" fill="none" stroke={c.faint} strokeWidth="1.5" />
          <text x="20" y="30" fill={c.ink} fontSize="8" fontFamily="monospace" fontWeight="600">
            EXT WALL
          </text>
        </>
      )}

      {zoneType === "entry" && (
        <>
          <line x1="52" y1="8" x2="52" y2="80" stroke={c.dim} strokeWidth="1" strokeDasharray="4 3" />
          <line x1="108" y1="8" x2="108" y2="80" stroke={c.dim} strokeWidth="1" strokeDasharray="4 3" />
          <path d="M80 80 L80 36 A22 22 0 0 1 104 36 L104 80" fill="none" stroke={c.ink} strokeWidth="2" />
          <rect x="70" y="76" width="20" height="5" fill={c.stroke} />
          <circle cx="80" cy="54" r="3" fill={c.faint} />
          <text x="18" y="26" fill={c.ink} fontSize="8" fontFamily="monospace" fontWeight="600">
            ENTRY / REV
          </text>
        </>
      )}

      {zoneType === "public" && (
        <>
          <ellipse cx="80" cy="32" rx="30" ry="14" fill="none" stroke={c.faint} strokeWidth="1.2" />
          {[20, 62, 104].map((x) => (
            <rect key={x} x={x} y="50" width="36" height="20" fill="none" stroke={c.dim} strokeWidth="1" rx="1" />
          ))}
          <text x="18" y="24" fill={c.ink} fontSize="8" fontFamily="monospace" fontWeight="600">
            OPEN FLOOR
          </text>
        </>
      )}

      {zoneType === "restricted" && (
        <>
          <rect x="10" y="10" width="140" height="68" fill={`url(#grid-${zoneType})`} opacity="0.9" />
          {[0, 1, 2].map((row) =>
            [0, 1, 2, 3].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={14 + col * 34}
                y={18 + row * 20}
                width="28"
                height="14"
                fill={c.fill}
                stroke={c.dim}
                strokeWidth="0.8"
              />
            ))
          )}
          <text x="16" y="18" fill={c.ink} fontSize="8" fontFamily="monospace" fontWeight="600">
            BADGE AREA
          </text>
        </>
      )}

      {zoneType === "secure" && (
        <>
          <rect x="10" y="10" width="140" height="68" fill="none" stroke={c.ink} strokeWidth="3" />
          <rect x="22" y="22" width="116" height="44" fill="none" stroke={c.faint} strokeWidth="1.5" />
          <rect x="54" y="30" width="52" height="28" fill={`url(#hatch-${zoneType})`} stroke={c.ink} strokeWidth="1.5" />
          <circle cx="80" cy="44" r="9" fill="none" stroke={c.ink} strokeWidth="2" />
          <line x1="80" y1="35" x2="80" y2="53" stroke={c.ink} strokeWidth="1.5" />
          <line x1="71" y1="44" x2="89" y2="44" stroke={c.ink} strokeWidth="1.5" />
          <text x="16" y="18" fill={c.ink} fontSize="8" fontFamily="monospace" fontWeight="600">
            VAULT
          </text>
        </>
      )}

      {zoneType === "rf_enclosure" && (
        <>
          <rect x="10" y="10" width="140" height="68" fill={`url(#mesh-${zoneType})`} opacity="0.95" />
          <rect x="28" y="22" width="104" height="44" fill={c.fill} stroke={c.ink} strokeWidth="1.2" strokeDasharray="3 2" />
          <path d="M28 22 L132 66 M132 22 L28 66" stroke={c.faint} strokeWidth="0.8" />
          <text x="16" y="18" fill={c.ink} fontSize="8" fontFamily="monospace" fontWeight="600">
            RF / SCIF
          </text>
        </>
      )}

      {zoneType === "network" && (
        <>
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <rect x={20 + i * 26} y="18" width="16" height="52" fill="none" stroke={c.faint} strokeWidth="1" />
              {[0, 1, 2, 3, 4, 5, 6].map((u) => (
                <rect key={u} x={22 + i * 26} y={20 + u * 7} width="12" height="4" fill={c.dim} />
              ))}
            </g>
          ))}
          <text x="16" y="16" fill={c.ink} fontSize="8" fontFamily="monospace" fontWeight="600">
            IDF / MDF
          </text>
        </>
      )}

      {zoneType === "executive" && (
        <>
          <rect x="38" y="26" width="84" height="36" fill="none" stroke={c.dim} strokeWidth="1" rx="2" />
          <ellipse cx="80" cy="44" rx="26" ry="12" fill="none" stroke={c.ink} strokeWidth="1.5" />
          <rect x="14" y="62" width="22" height="14" fill="none" stroke={c.dim} strokeWidth="0.8" />
          <rect x="124" y="62" width="22" height="14" fill="none" stroke={c.dim} strokeWidth="0.8" />
          <text x="16" y="18" fill={c.ink} fontSize="8" fontFamily="monospace" fontWeight="600">
            EXEC / BOARD
          </text>
        </>
      )}

      {zoneType === "parking" && (
        <>
          <rect x="6" y="6" width="148" height="76" fill={`url(#stalls-${zoneType})`} opacity="0.85" />
          <path d="M6 44 H154" stroke={c.ink} strokeWidth="1.5" />
          {[30, 60, 90, 120].map((x) => (
            <path key={x} d={`M${x} 6 V82`} stroke={c.dim} strokeWidth="0.7" />
          ))}
          <rect x="12" y="52" width="26" height="14" fill={c.fill} stroke={c.faint} strokeWidth="1" transform="rotate(-12 25 59)" />
          <text x="14" y="20" fill={c.ink} fontSize="8" fontFamily="monospace" fontWeight="600">
            APPROACH
          </text>
        </>
      )}

      {zoneType === "utility" && (
        <>
          <circle cx="50" cy="44" r="16" fill="none" stroke={c.faint} strokeWidth="1.2" />
          <circle cx="50" cy="44" r="7" fill="none" stroke={c.dim} strokeWidth="0.8" />
          <path d="M50 28 L50 36 M50 52 L50 60 M34 44 L42 44 M58 44 L66 44" stroke={c.dim} strokeWidth="0.8" />
          <rect x="92" y="26" width="32" height="36" fill="none" stroke={c.faint} strokeWidth="1" />
          <path d="M98 34 H118 M98 44 H118 M98 54 H118" stroke={c.dim} strokeWidth="0.8" />
          <text x="16" y="18" fill={c.ink} fontSize="8" fontFamily="monospace" fontWeight="600">
            MEP / SVC
          </text>
        </>
      )}
    </svg>
  );
}

export const ZONE_DEFAULT_SIZES: Record<
  ZoneTypeId,
  { width: number; height: number }
> = {
  perimeter: { width: 200, height: 100 },
  entry: { width: 160, height: 110 },
  public: { width: 200, height: 140 },
  restricted: { width: 220, height: 150 },
  secure: { width: 180, height: 130 },
  rf_enclosure: { width: 180, height: 120 },
  network: { width: 140, height: 150 },
  executive: { width: 190, height: 120 },
  parking: { width: 240, height: 110 },
  utility: { width: 150, height: 110 },
};
