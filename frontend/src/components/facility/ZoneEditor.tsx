"use client";

import type { ControlTypeId, FacilityZone, ZoneTypeInfo } from "@/types/facility";
import { CONTROL_LABELS, DEFAULT_ZONE_SIZE } from "@/types/facility";

const ALL_CONTROLS: ControlTypeId[] = [
  "cctv", "guard", "rfid", "lock", "biometric", "alarm", "wifi", "ble", "nfc", "mantrap",
];

interface ZoneEditorProps {
  zone: FacilityZone;
  zoneTypes: ZoneTypeInfo[];
  onChange: (zone: FacilityZone) => void;
  onDelete: () => void;
}

export default function ZoneEditor({ zone, zoneTypes, onChange, onDelete }: ZoneEditorProps) {
  const toggleControl = (c: ControlTypeId) => {
    const controls = zone.controls.includes(c)
      ? zone.controls.filter((x) => x !== c)
      : [...zone.controls, c];
    onChange({ ...zone, controls });
  };

  return (
    <div className="p-3 border border-grimoire-border/40 bg-grimoire-bg/40 space-y-3 h-full">
      <div className="flex justify-between items-start">
        <div className="text-[9px] uppercase tracking-widest text-grimoire-muted">Zone Editor</div>
        <button onClick={onDelete} className="text-[10px] text-grimoire-danger hover:underline">
          Remove (Del)
        </button>
      </div>

      <div>
        <label className="grimoire-label">Label</label>
        <input
          className="grimoire-input text-xs"
          value={zone.label}
          onChange={(e) => onChange({ ...zone, label: e.target.value })}
        />
      </div>

      <div>
        <label className="grimoire-label">Map Size (px)</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min={100}
            max={480}
            className="grimoire-input text-xs"
            value={zone.size?.width ?? DEFAULT_ZONE_SIZE.width}
            onChange={(e) =>
              onChange({
                ...zone,
                size: {
                  width: Number(e.target.value) || DEFAULT_ZONE_SIZE.width,
                  height: zone.size?.height ?? DEFAULT_ZONE_SIZE.height,
                },
              })
            }
          />
          <input
            type="number"
            min={56}
            max={320}
            className="grimoire-input text-xs"
            value={zone.size?.height ?? DEFAULT_ZONE_SIZE.height}
            onChange={(e) =>
              onChange({
                ...zone,
                size: {
                  width: zone.size?.width ?? DEFAULT_ZONE_SIZE.width,
                  height: Number(e.target.value) || DEFAULT_ZONE_SIZE.height,
                },
              })
            }
          />
        </div>
        <p className="text-[9px] text-grimoire-muted/60 mt-1">
          Or select the zone on the map and drag its corner handles to resize.
        </p>
      </div>

      <div>
        <label className="grimoire-label">Zone Type</label>
        <select
          className="grimoire-input text-xs"
          value={zone.zone_type}
          onChange={(e) => onChange({ ...zone, zone_type: e.target.value as FacilityZone["zone_type"] })}
        >
          {zoneTypes.map((zt) => (
            <option key={zt.id} value={zt.id}>{zt.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="grimoire-label">Physical / RF Controls</label>
        <div className="flex flex-wrap gap-1">
          {ALL_CONTROLS.map((c) => (
            <button
              key={c}
              onClick={() => toggleControl(c)}
              className={`text-[9px] px-1.5 py-0.5 border uppercase tracking-wide ${
                zone.controls.includes(c)
                  ? "border-grimoire-accent/60 text-grimoire-accent bg-grimoire-accent/5"
                  : "border-grimoire-border/40 text-grimoire-muted"
              }`}
            >
              {CONTROL_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="grimoire-label">Assets in Zone</label>
        <input
          className="grimoire-input text-xs"
          placeholder="Comma-separated"
          value={zone.assets.join(", ")}
          onChange={(e) =>
            onChange({
              ...zone,
              assets: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
            })
          }
        />
      </div>

      <div>
        <label className="grimoire-label">Operator Notes</label>
        <textarea
          className="grimoire-input text-xs min-h-[60px]"
          value={zone.notes}
          onChange={(e) => onChange({ ...zone, notes: e.target.value })}
          placeholder="Guard routine, lock type, RF bleed…"
        />
      </div>
    </div>
  );
}
