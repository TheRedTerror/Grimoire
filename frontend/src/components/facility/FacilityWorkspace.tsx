"use client";

import { useCallback, useEffect, useState } from "react";
import FacilityMapEditor from "./FacilityMapEditor";
import FacilityMapGuide from "./FacilityMapGuide";
import ZoneEditor from "./ZoneEditor";
import ZonePalette from "./ZonePalette";
import SectionHeader from "@/components/ui/SectionHeader";
import TacticalFrame from "@/components/brand/TacticalFrame";
import type { FacilityCreate, PhysicalAttackPlan, ZoneTypeInfo } from "@/types/facility";
import { DEFAULT_FACILITY } from "@/types/facility";
import { ZONE_DEFAULT_SIZES } from "@/components/facility/ZoneFloorPlan";
import {
  generatePhysicalPlan,
  getFacilityTemplates,
  getZoneTypes,
  loadFacilityTemplate,
} from "@/lib/facilityApi";

interface FacilityWorkspaceProps {
  actorName: string;
  engagementType: string;
  prohibited: string[];
  permitted: string[];
  facility: FacilityCreate;
  onFacilityChange: (f: FacilityCreate) => void;
  onPhysicalPlanChange: (p: PhysicalAttackPlan | null) => void;
}

export default function FacilityWorkspace({
  actorName,
  engagementType,
  prohibited,
  permitted,
  facility,
  onFacilityChange,
  onPhysicalPlanChange,
}: FacilityWorkspaceProps) {
  const [zoneTypes, setZoneTypes] = useState<ZoneTypeInfo[]>([]);
  const [templates, setTemplates] = useState<{ id: string; name: string; description: string }[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [focusZoneId, setFocusZoneId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getZoneTypes(), getFacilityTemplates()])
      .then(([zt, tm]) => {
        setZoneTypes(zt);
        setTemplates(tm);
      })
      .catch((e) => setError(e.message));
  }, []);

  const selectedZone = facility.zones.find((z) => z.id === selectedZoneId) || null;

  const addZone = useCallback(
    (zoneType: ZoneTypeInfo) => {
      const id = `zone-${Date.now()}`;
      const count = facility.zones.filter((z) => z.zone_type === zoneType.id).length;
      const col = facility.zones.length % 4;
      const row = Math.floor(facility.zones.length / 4);
      const newZone = {
        id,
        label: `${zoneType.label} ${count + 1}`,
        zone_type: zoneType.id,
        floor: 1,
        position: { x: 80 + col * 180, y: 80 + row * 120 },
        size: { ...ZONE_DEFAULT_SIZES[zoneType.id] },
        controls: [...zoneType.default_controls],
        assets: [],
        notes: "",
      };
      onFacilityChange({ ...facility, zones: [...facility.zones, newZone] });
      setSelectedZoneId(id);
      setFocusZoneId(id);
      setAddedToast(`${zoneType.label} added to map`);
      setError(null);
      window.setTimeout(() => setFocusZoneId(null), 800);
      window.setTimeout(() => setAddedToast(null), 2500);
    },
    [facility, onFacilityChange]
  );

  const updateZone = (updated: typeof facility.zones[0]) => {
    onFacilityChange({
      ...facility,
      zones: facility.zones.map((z) => (z.id === updated.id ? updated : z)),
    });
  };

  const deleteZone = useCallback(
    (id: string) => {
      onFacilityChange({
        ...facility,
        zones: facility.zones.filter((z) => z.id !== id),
        paths: facility.paths.filter((p) => p.source !== id && p.target !== id),
      });
      setSelectedZoneId(null);
    },
    [facility, onFacilityChange]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      if (!selectedZoneId) return;
      const target = e.target as HTMLElement | null;
      if (
        target?.closest("input, textarea, select, [contenteditable='true']")
      ) {
        return;
      }
      e.preventDefault();
      deleteZone(selectedZoneId);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedZoneId, deleteZone]);

  const loadTemplate = async (templateId: string) => {
    setLoading(true);
    try {
      const f = await loadFacilityTemplate(templateId);
      onFacilityChange(f);
      onPhysicalPlanChange(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load template");
    } finally {
      setLoading(false);
    }
  };

  const compilePhysicalPlan = useCallback(async () => {
    if (facility.zones.length === 0) {
      setError("Add at least one zone using the + Add to Map buttons");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const plan = await generatePhysicalPlan(
        facility,
        actorName,
        engagementType,
        prohibited,
        permitted
      );
      onPhysicalPlanChange(plan);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Plan generation failed");
    } finally {
      setLoading(false);
    }
  }, [facility, actorName, engagementType, prohibited, permitted, onPhysicalPlanChange]);

  return (
    <div className="flex-1 flex flex-col gap-3 min-h-0">
      <SectionHeader
        refId="SEC-F1"
        title="Facility Creation Map"
        subtitle="Use + Add to Map buttons to place zones, then drag them on the canvas to lay out your site."
      />

      {addedToast && (
        <div className="text-[10px] text-grimoire-accent border border-grimoire-accent/30 px-3 py-2 bg-grimoire-accent/5 animate-pulse">
          ✓ {addedToast} — drag it on the map to reposition
        </div>
      )}

      {error && (
        <div className="text-[10px] text-grimoire-danger border border-grimoire-danger/30 px-3 py-2 bg-grimoire-danger/5">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="grimoire-label">Facility Name</label>
          <input
            className="grimoire-input"
            value={facility.name}
            onChange={(e) => onFacilityChange({ ...facility, name: e.target.value })}
          />
        </div>
        <div className="w-48">
          <label className="grimoire-label">Load Template</label>
          <select
            className="grimoire-input"
            defaultValue=""
            onChange={(e) => e.target.value && loadTemplate(e.target.value)}
            disabled={loading}
          >
            <option value="" disabled>
              Select…
            </option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={compilePhysicalPlan}
          disabled={loading}
          className="grimoire-btn-primary text-xs"
        >
          {loading ? "Compiling…" : "Compile Physical Plan"}
        </button>
      </div>

      <details className="group shrink-0 border border-grimoire-border/40 bg-grimoire-bg/50">
        <summary className="cursor-pointer px-3 py-2 text-[11px] text-grimoire-text list-none flex justify-between items-center">
          <span>
            <span className="text-[9px] font-mono text-grimoire-accent tracking-widest mr-2">GUIDE</span>
            How to use the facility map
          </span>
          <span className="text-[10px] text-grimoire-muted group-open:hidden">Show</span>
          <span className="text-[10px] text-grimoire-muted hidden group-open:inline">Hide</span>
        </summary>
        <div className="border-t border-grimoire-border/30 max-h-48 overflow-y-auto">
          <FacilityMapGuide hasZones={facility.zones.length > 0} />
        </div>
      </details>

      <div className="flex-1 flex gap-2 min-h-[420px] overflow-hidden">
        <div className="w-52 flex-shrink-0 overflow-y-auto p-3 bg-grimoire-bg/60 border border-grimoire-border/40">
          <ZonePalette zoneTypes={zoneTypes} onAdd={addZone} />
          <p className="text-[9px] text-grimoire-muted/60 mt-3 pt-2 border-t border-grimoire-border/20">
            {facility.zones.length} zone{facility.zones.length !== 1 ? "s" : ""} on map
          </p>
        </div>

        <TacticalFrame label="Floor Plan" className="flex-1 min-w-0 flex flex-col min-h-[420px]" variant="accent">
          <div className="flex-1 min-h-[420px] h-full">
            <FacilityMapEditor
              facility={facility}
              zoneTypes={zoneTypes}
              selectedZoneId={selectedZoneId}
              focusZoneId={focusZoneId}
              onSelectZone={setSelectedZoneId}
              onChange={onFacilityChange}
              onAddZone={addZone}
              onDeleteZone={deleteZone}
            />
          </div>
        </TacticalFrame>

        <div className="w-56 flex-shrink-0 overflow-y-auto">
          {selectedZone ? (
            <ZoneEditor
              zone={selectedZone}
              zoneTypes={zoneTypes}
              onChange={updateZone}
              onDelete={() => deleteZone(selectedZone.id)}
            />
          ) : (
            <div className="p-3 text-[10px] text-grimoire-muted border border-grimoire-border/30 h-full space-y-2">
              <p className="text-grimoire-text/80">No zone selected</p>
              <p>
                First, click <strong className="text-grimoire-accent">+ Add to Map</strong> in the
                left panel to place a zone. Then click the zone on the canvas to edit it here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { DEFAULT_FACILITY };
