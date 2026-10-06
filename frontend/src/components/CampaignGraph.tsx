"use client";

import { useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  MarkerType,
} from "@xyflow/react";
import type { EngagementPlan } from "@/types/campaign";

interface CampaignGraphProps {
  plan: EngagementPlan | null;
  onNodeSelect: (nodeId: string | null) => void;
  selectedNodeId: string | null;
}

const PHASE_CODES: Record<string, string> = {
  "initial-position": "PH-01",
  discovery: "PH-02",
  "controlled-action": "PH-03",
  objective: "PH-04",
  "detection-review": "PH-05",
};

function PhaseNode({
  data,
}: {
  data: { label: string; phaseId: string; index: number };
}) {
  const code = PHASE_CODES[data.phaseId] ?? `PH-${String(data.index + 1).padStart(2, "0")}`;
  return (
    <div className="react-flow__node-phase">
      <div className="phase-node-header">{code}</div>
      <div className="phase-node-body">{data.label}</div>
    </div>
  );
}

const nodeTypes = { phase: PhaseNode };

export default function CampaignGraph({
  plan,
  onNodeSelect,
  selectedNodeId,
}: CampaignGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    if (!plan) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const operational = plan.graph_nodes.filter(
      (n) => !["pre-engagement", "lessons"].includes(n.id)
    );

    const flowNodes: Node[] = plan.graph_nodes.map((n, i) => ({
      id: n.id,
      type: "phase",
      position: n.position.x
        ? { x: n.position.x, y: n.position.y }
        : { x: 280, y: i * 130 },
      data: {
        label: n.label,
        phaseId: n.id,
        index: operational.findIndex((o) => o.id === n.id),
      },
      selected: n.id === selectedNodeId,
    }));

    const flowEdges: Edge[] = plan.graph_edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label || undefined,
      animated: e.label === "Privilege path?",
      markerEnd: { type: MarkerType.ArrowClosed, color: "#935b95" },
      style: {
        stroke: e.label ? "#FF0055" : "#935b95",
        strokeWidth: e.label ? 1.5 : 1,
      },
      labelStyle: { fill: "#FF0055", fontSize: 9, fontFamily: "monospace" },
      labelBgStyle: { fill: "#04030a", fillOpacity: 0.85 },
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [plan, selectedNodeId, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onNodeSelect(node.id);
    },
    [onNodeSelect]
  );

  if (!plan) return null;

  return (
    <div className="h-full w-full bg-grimoire-bg/40">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.4}
        maxZoom={1.5}
      >
        <Background color="#1a3a5c" gap={24} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor="#00E5FF"
          maskColor="rgba(4, 3, 10, 0.85)"
          className="!bg-grimoire-bg !border-grimoire-border !rounded-none"
        />
      </ReactFlow>
    </div>
  );
}
