"use client";

import SectionHeader from "@/components/ui/SectionHeader";
import type { EngagementPlan } from "@/types/campaign";

interface DetectionMatrixProps {
  plan: EngagementPlan;
}

export default function DetectionMatrix({ plan }: DetectionMatrixProps) {
  return (
    <div className="overflow-x-auto">
      <SectionHeader
        refId="SEC-07"
        title="Detection Matrix"
        subtitle="Expected detection profile per technique. Post-operation scoring fields ship in v0.3."
      />
      <table className="w-full text-xs">
        <thead>
          <tr className="text-grimoire-muted border-b border-grimoire-border">
            <th className="text-left py-2 pr-4">Technique</th>
            <th className="text-center py-2 px-2">Endpoint</th>
            <th className="text-center py-2 px-2">Identity</th>
            <th className="text-center py-2 px-2">Network</th>
            <th className="text-center py-2 px-2">Cloud</th>
          </tr>
        </thead>
        <tbody>
          {plan.detection_matrix.map((row, i) => (
            <tr key={i} className="border-b border-grimoire-border/50">
              <td className="py-2 pr-4">{String(row.technique)}</td>
              <Cell value={String(row.endpoint)} />
              <Cell value={String(row.identity)} />
              <Cell value={String(row.network)} />
              <Cell value={String(row.cloud)} />
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-8">
        <h3 className="text-grimoire-accent text-sm mb-3">Operational Risk</h3>
        <div className="grid grid-cols-2 gap-2">
          {plan.risk_assessment.map((r) => (
            <div
              key={r.category}
              className="flex justify-between p-2 bg-grimoire-bg rounded border border-grimoire-border text-xs"
            >
              <span>{r.category}</span>
              <RiskBadge level={r.level} />
            </div>
          ))}
        </div>
        <div className="mt-3 p-3 bg-grimoire-bg rounded border border-grimoire-accent text-center">
          <span className="text-xs text-grimoire-muted">Overall Engagement Risk</span>
          <div className="text-lg text-grimoire-accent font-bold">{plan.overall_risk}</div>
        </div>
      </div>
    </div>
  );
}

function Cell({ value }: { value: string }) {
  const colors: Record<string, string> = {
    YES: "text-green-400",
    NO: "text-grimoire-muted",
    MAYBE: "text-yellow-400",
  };
  return (
    <td className={`text-center py-2 px-2 ${colors[value] || ""}`}>{value}</td>
  );
}

function RiskBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    HIGH: "text-grimoire-danger",
    MEDIUM: "text-yellow-400",
    LOW: "text-green-400",
    DISABLED: "text-grimoire-muted",
    PROHIBITED: "text-grimoire-danger",
  };
  return <span className={colors[level] || ""}>{level}</span>;
}
