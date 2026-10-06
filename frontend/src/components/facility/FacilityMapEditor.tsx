"use client";

import { useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type OnNodeDrag,
  MarkerType,
} from "@xyflow/react";
import ZonePalette from "./ZonePalette";
import type { ControlTypeId, FacilityCreate, ZoneTypeId, ZoneTypeInfo } from "@/types/facility";
import { CONTROL_LABELS } from "@/types/facility";

interface FacilityMapEditorProps {
  facility: FacilityCreate;
  zoneTypes: ZoneTypeInfo[];
  selectedZoneId: string | null;
  focusZoneId: string | null;
  onSelectZone: (id: string | null) => void;
  onChange: (facility: FacilityCreate) => void;
  onAddZone: (zoneType: ZoneTypeInfo) => void;
}

function ZoneNode({
  data,
}: {
  data: {
    label: string;
    zoneType: ZoneTypeId;
    controls: ControlTypeId[];
    color: string;
    isNew?: boolean;
  };
}) {
  return (
    <div
      className={`facility-zone-node ${data.isNew ? "facility-zone-node-new" : ""}`}
      style={{ borderColor: data.color, boxShadow: `0 0 12px ${data.color}33` }}
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

function FitViewOnChange({ zoneCount, focusZoneId }: { zoneCount: number; focusZoneId: string | null }) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (zoneCount === 0) return;
    const t = setTimeout(() => {
      if (focusZoneId) {
        fitView({ nodes: [{ id: focusZoneId }], padding: 0.5, duration: 300, maxZoom: 1.1 });
      } else {
        fitView({ padding: 0.4, duration: 300, maxZoom: 1 });
      }
    }, 80);
    return () => clearTimeout(t);
  }, [zoneCount, focusZoneId, fitView]);

  return null;
}

function FacilityMapCanvas({
  facility,
  zoneTypes,
  selectedZoneId,
  focusZoneId,
  onSelectZone,
  onChange,
  onAddZone,
}: FacilityMapEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const typeMap = useMemo(
    () => Object.fromEntries(zoneTypes.map((z) => [z.id, z])),
    [zoneTypes]
  );

  const isEmpty = facility.zones.length === 0;

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
          isNew: z.id === focusZoneId,
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
  }, [facility.zones, facility.paths, selectedZoneId, focusZoneId, typeMap, setNodes, setEdges]);

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
    <div className="facility-map-canvas relative">
      {!isEmpty && (
        <div className="absolute top-2 left-2 right-2 z-10 pointer-events-none">
          <span className="text-[9px] uppercase tracking-[0.15em] text-grimoire-muted/70 bg-grimoire-bg/90 px-2 py-1 border border-grimoire-border/30">
            {facility.zones.length} zone{facility.zones.length !== 1 ? "s" : ""} on map · drag cards to
            move · drag dots to connect
          </span>
        </div>
      )}

      {isEmpty && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4 pointer-events-none">
          <div className="pointer-events-auto max-w-md w-full border border-grimoire-accent/30 bg-grimoire-bg/95 p-4 shadow-2xl max-h-[90%] overflow-y-auto">
            <div className="text-[10px] uppercase tracking-[0.25em] text-grimoire-accent mb-2">
              Step 1 · Build your site
            </div>
            <h3 className="font-display text-sm text-grimoire-text mb-2">Add zones to the floor plan</h3>
            <p className="text-[10px] text-grimoire-muted mb-3 leading-relaxed">
              Click <strong className="text-grimoire-text">+ Add to Map</strong> — the zone card will
              appear on the canvas below this panel.
            </p>
            <ZonePalette zoneTypes={zoneTypes} onAdd={onAddZone} title="Quick add" compact />
          </div>
        </div>
      )}

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
        nodesDraggable
        nodesConnectable
        elementsSelectable
        panOnDrag={[1, 2]}
        panOnScroll
        zoomOnScroll
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
        <FitViewOnChange zoneCount={facility.zones.length} focusZoneId={focusZoneId} />
      </ReactFlow>
    </div>
  );
}

export default function FacilityMapEditor(props: FacilityMapEditorProps) {
  return (
    <ReactFlowProvider>
      <FacilityMapCanvas {...props} />
    </ReactFlowProvider>
  );
}
