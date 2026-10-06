"use client";

import { useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type OnNodeDrag,
  MarkerType,
} from "@xyflow/react";
import type { ControlTypeId, FacilityCreate, FacilityZone, ZoneTypeId, ZoneTypeInfo } from "@/types/facility";
import { CONTROL_LABELS } from "@/types/facility";

interface FacilityMapEditorProps {
  facility: FacilityCreate;
  zoneTypes: ZoneTypeInfo[];
  selectedZoneId: string | null;
  onSelectZone: (id: string | null) => void;
  onChange: (facility: FacilityCreate) => void;
}

function ZoneNode({
  data,
}: {
  data: {
    label: string;
    zoneType: ZoneTypeId;
    controls: ControlTypeId[];
    color: string;
    risk?: string;
  };
}) {
  return (
    <div
      className="facility-zone-node"
      style={{ borderColor: data.color, boxShadow: `0 0 12px ${data.color}33` }}
    >
      <div className="facility-zone-type" style={{ background: `${data.color}22`, color: data.color }}>
        {data.zoneType.replace("_", " ")}
      </div>
      <div className="facility-zone-label">{data.label}</div>
      {data.controls.length > 0 && (
        <div className="facility-zone-controls">
          {data.controls.slice(0, 3).map((c) => (
            <span key={c}>{CONTROL_LABELS[c]?.slice(0, 3) || c}</span>
          ))}
          {data.controls.length > 3 && <span>+{data.controls.length - 3}</span>}
        </div>
      )}
    </div>
  );
}

const nodeTypes = { zone: ZoneNode };

export default function FacilityMapEditor({
  facility,
  zoneTypes,
  selectedZoneId,
  onSelectZone,
  onChange,
}: FacilityMapEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const typeMap = useMemo(
    () => Object.fromEntries(zoneTypes.map((z) => [z.id, z])),
    [zoneTypes]
  );

  useEffect(() => {
    const flowNodes: Node[] = facility.zones.map((z) => {
      const info = typeMap[z.zone_type];
      return {
        id: z.id,
        type: "zone",
        position: z.position,
        data: {
          label: z.label,
          zoneType: z.zone_type,
          controls: z.controls,
          color: info?.color || "#4a3030",
        },
        selected: z.id === selectedZoneId,
        draggable: true,
      };
    });

    const flowEdges: Edge[] = facility.paths.map((p) => ({
      id: p.id,
      source: p.source,
      target: p.target,
      label: p.label || undefined,
      animated: !p.authorized,
      markerEnd: { type: MarkerType.ArrowClosed, color: p.authorized ? "#3a2020" : "#8b0010" },
      style: {
        stroke: p.authorized ? "#3a3030" : "#8b0010",
        strokeWidth: 1.5,
      },
      labelStyle: { fill: "#6a5050", fontSize: 9 },
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [facility, selectedZoneId, typeMap, setNodes, setEdges]);

  const onNodeDragStop: OnNodeDrag = useCallback(
    (_, node) => {
      const updated = facility.zones.map((z) =>
        z.id === node.id ? { ...z, position: node.position } : z
      );
      onChange({ ...facility, zones: updated });
    },
    [facility, onChange]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const newPath = {
        id: `path-${Date.now()}`,
        source: connection.source!,
        target: connection.target!,
        label: "Movement",
        authorized: true,
      };
      onChange({ ...facility, paths: [...facility.paths, newPath] });
      setEdges((eds) => addEdge(connection, eds));
    },
    [facility, onChange, setEdges]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => onSelectZone(node.id),
    [onSelectZone]
  );

  return (
    <div className="h-full w-full facility-map-bg relative">
      <div className="absolute top-2 left-2 z-10 text-[9px] uppercase tracking-[0.2em] text-grimoire-muted/60 pointer-events-none">
        Site Plan · Drag zones · Connect paths
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={() => onSelectZone(null)}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.4 }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.3}
        maxZoom={2}
      >
        <Background color="#1a1010" gap={32} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(n) => (n.data as { color?: string })?.color || "#3a2020"}
          maskColor="rgba(2, 2, 2, 0.92)"
          className="!bg-grimoire-bg !border-grimoire-border !rounded-none"
        />
      </ReactFlow>
    </div>
  );
}
