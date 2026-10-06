"use client";

import { useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type OnNodeDrag,
  type NodeChange,
  MarkerType,
} from "@xyflow/react";
import ZonePalette from "./ZonePalette";
import ZoneNode from "./ZoneNode";
import type { FacilityCreate, ZoneTypeInfo } from "@/types/facility";
import { DEFAULT_ZONE_SIZE } from "@/types/facility";

interface FacilityMapEditorProps {
  facility: FacilityCreate;
  zoneTypes: ZoneTypeInfo[];
  selectedZoneId: string | null;
  focusZoneId: string | null;
  onSelectZone: (id: string | null) => void;
  onChange: (facility: FacilityCreate) => void;
  onAddZone: (zoneType: ZoneTypeInfo) => void;
  onDeleteZone: (zoneId: string) => void;
}

function zoneDimensions(zone: { size?: { width: number; height: number } }) {
  return {
    width: zone.size?.width ?? DEFAULT_ZONE_SIZE.width,
    height: zone.size?.height ?? DEFAULT_ZONE_SIZE.height,
  };
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
  onDeleteZone,
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
      const { width, height } = zoneDimensions(z);
      return {
        id: z.id,
        type: "zone",
        position: z.position,
        width,
        height,
        data: {
          label: z.label,
          zoneType: z.zone_type,
          controls: z.controls,
          color: info?.color || "#4a3030",
          isNew: z.id === focusZoneId,
        },
        selected: z.id === selectedZoneId,
        draggable: true,
        deletable: true,
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

  const persistZoneSize = useCallback(
    (zoneId: string, width: number, height: number) => {
      const updated = facility.zones.map((z) =>
        z.id === zoneId ? { ...z, size: { width: Math.round(width), height: Math.round(height) } } : z
      );
      onChange({ ...facility, zones: updated });
    },
    [facility, onChange]
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
      for (const change of changes) {
        if (
          change.type === "dimensions" &&
          change.dimensions &&
          change.resizing === false
        ) {
          persistZoneSize(change.id, change.dimensions.width, change.dimensions.height);
        }
      }
    },
    [onNodesChange, persistZoneSize]
  );

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

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      deleted.forEach((node) => onDeleteZone(node.id));
    },
    [onDeleteZone]
  );

  return (
    <div className="facility-map-canvas relative">
      {!isEmpty && (
        <div className="absolute top-2 left-2 right-2 z-10 pointer-events-none">
          <span className="text-[9px] uppercase tracking-[0.15em] text-grimoire-muted/70 bg-grimoire-bg/90 px-2 py-1 border border-grimoire-border/30">
            {facility.zones.length} zone{facility.zones.length !== 1 ? "s" : ""} · drag to move · select
            and drag corners to resize · Del to remove · drag dots to connect
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
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodesDelete={onNodesDelete}
        onPaneClick={() => onSelectZone(null)}
        nodeTypes={nodeTypes}
        nodesDraggable
        nodesConnectable
        elementsSelectable
        deleteKeyCode={["Delete", "Backspace"]}
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
