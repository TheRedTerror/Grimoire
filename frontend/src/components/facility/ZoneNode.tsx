"use client";

import { Handle, NodeResizer, Position } from "@xyflow/react";
import ZoneFloorPlan from "./ZoneFloorPlan";
import type { ControlTypeId, ZoneTypeId } from "@/types/facility";
import { CONTROL_LABELS } from "@/types/facility";

export interface ZoneNodeData {
  label: string;
  zoneType: ZoneTypeId;
  controls: ControlTypeId[];
  color: string;
  isNew?: boolean;
}

export default function ZoneNode({
  data,
  selected,
}: {
  selected?: boolean;
  data: ZoneNodeData;
}) {
  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={100}
        minHeight={72}
        maxWidth={480}
        maxHeight={320}
        lineClassName="facility-zone-resizer-line"
        handleClassName="facility-zone-resizer-handle"
      />
      <div
        className={`facility-zone-node facility-zone-layout facility-zone-layout--${data.zoneType} h-full w-full ${
          data.isNew ? "facility-zone-node-new" : ""
        } ${selected ? "facility-zone-node-selected" : ""}`}
        style={
          {
            "--zone-accent": data.color,
            borderColor: data.color,
          } as React.CSSProperties
        }
      >
        <Handle type="target" position={Position.Top} className="facility-zone-handle" />
        <Handle type="source" position={Position.Bottom} className="facility-zone-handle" />
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          className="facility-zone-handle facility-zone-handle-alt"
        />
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          className="facility-zone-handle facility-zone-handle-alt"
        />

        <div className="facility-zone-plan-layer">
          <ZoneFloorPlan zoneType={data.zoneType} color={data.color} />
        </div>

        <div className="facility-zone-header">
          <span className="facility-zone-type" style={{ color: data.color }}>
            {data.zoneType.replace(/_/g, " ")}
          </span>
          <span className="facility-zone-label">{data.label}</span>
        </div>

        {data.controls.length > 0 && (
          <div className="facility-zone-footer">
            {data.controls.slice(0, 4).map((c) => (
              <span key={c}>{CONTROL_LABELS[c]?.slice(0, 3) || c}</span>
            ))}
            {data.controls.length > 4 && <span>+{data.controls.length - 4}</span>}
          </div>
        )}
      </div>
    </>
  );
}
