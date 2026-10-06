"use client";

import { useCallback, useEffect, useState } from "react";
import FacilityMapEditor from "./FacilityMapEditor";
import ZoneEditor from "./ZoneEditor";
import SectionHeader from "@/components/ui/SectionHeader";
import TacticalFrame from "@/components/brand/TacticalFrame";
import type { FacilityCreate, PhysicalAttackPlan, ZoneTypeInfo } from "@/types/facility";
import { DEFAULT_FACILITY } from "@/types/facility";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getZoneTypes(), getFacilityTemplates()])
      .then(([zt, tm]) => {
        setZoneTypes(zt);
        setTemplates(tm);
      })
      .catch((e) => setError(e.message));
  }, []);

  const selectedZone = facility.zones.find((z) => z.id === selectedZoneId) || null;

  const addZone = (zoneType: ZoneTypeInfo) => {
    const id = `zone-${Date.now()}`;
    const newZone = {
      id,
      label: `${zoneType.label} ${facility.zones.filter((z) => z.zone_type === zoneType.id).length + 1}`,
      zone_type: zoneType.id,
      floor: 1,
      position: { x: 120 + facility.zones.length * 40, y: 180 + (facility.zones.length % 3) * 60 },
      controls: [...zoneType.default_controls],
      assets: [],
      notes: "",
    };
    onFacilityChange({ ...facility, zones: [...facility.zones, newZone] });
    setSelectedZoneId(id);
  };

  const updateZone = (updated: typeof facility.zones[0]) => {
    onFacilityChange({
      ...facility,
      zones: facility.zones.map((z) => (z.id === updated.id ? updated : z)),
    });
  };

  const deleteZone = (id: string) => {
    onFacilityChange({
      ...facility,
      zones: facility.zones.filter((z) => z.id !== id),
      paths: facility.paths.filter((p) => p.source !== id && p.target !== id),
    });
    setSelectedZoneId(null);
  };

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
      setError("Add at least one zone to the facility map");
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
    <div className="h-full flex flex-col gap-3">
      <SectionHeader
        refId="SEC-F1"
        title="Facility Creation Map"
        subtitle="Build the target site plan — zones, physical controls, movement paths, and RF surfaces. Physical plan merges into Operation Plan."
      />

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

      <div className="flex-1 flex gap-2 min-h-0 overflow-hidden">
        <div className="w-44 flex-shrink-0 overflow-y-auto space-y-1 p-2 bg-grimoire-bg/60 border border-grimoire-border/40">
          <div className="text-[9px] uppercase tracking-widest text-grimoire-muted mb-2 px-1">
            Add Zone
          </div>
          {zoneTypes.map((zt) => (
            <button
              key={zt.id}
              onClick={() => addZone(zt)}
              className="w-full text-left px-2 py-1.5 text-[10px] border border-grimoire-border/30 hover:border-grimoire-accent/40 transition-colors"
              style={{ borderLeftColor: zt.color, borderLeftWidth: 2 }}
            >
              <span className="text-grimoire-text">{zt.label}</span>
            </button>
          ))}
        </div>

        <TacticalFrame label="Floor Plan" className="flex-1 min-w-0 flex flex-col" variant="accent">
          <div className="flex-1 min-h-[400px]">
            <FacilityMapEditor
              facility={facility}
              zoneTypes={zoneTypes}
              selectedZoneId={selectedZoneId}
              onSelectZone={setSelectedZoneId}
              onChange={onFacilityChange}
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
            <div className="p-3 text-[10px] text-grimoire-muted border border-grimoire-border/30 h-full">
              Select a zone on the map to edit controls, assets, and notes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { DEFAULT_FACILITY };
