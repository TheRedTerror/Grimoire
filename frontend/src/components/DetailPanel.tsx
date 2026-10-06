"use client";

import TacticalFrame from "@/components/brand/TacticalFrame";
import type { EngagementPlan, TechniqueInfo } from "@/types/campaign";

interface DetailPanelProps {
  plan: EngagementPlan | null;
  selectedNodeId: string | null;
  selectedTechnique: TechniqueInfo | null;
}

function riskColor(level: string) {
  switch (level) {
    case "HIGH":
      return "text-grimoire-danger";
    case "MEDIUM":
      return "text-yellow-400";
    case "PROHIBITED":
      return "text-grimoire-danger";
    case "DISABLED":
      return "text-grimoire-muted";
    default:
      return "text-green-400";
  }
}

export default function DetailPanel({
  plan,
  selectedNodeId,
  selectedTechnique,
}: DetailPanelProps) {
  if (!plan) {
    return (
      <aside className="w-72 flex-shrink-0 p-2">
        <TacticalFrame label="Intel Panel" className="h-full">
          <div className="p-4 text-[11px] text-grimoire-muted leading-relaxed">
            Select a campaign phase or ATT&CK technique to inspect operator intent, telemetry expectations, and detection profile.
          </div>
        </TacticalFrame>
      </aside>
    );
  }

  const phase = plan.phases.find((p) => p.id === selectedNodeId);

  if (phase) {
    return (
      <aside className="w-72 flex-shrink-0 p-2 overflow-hidden">
        <TacticalFrame label={`Phase ${phase.order}`} className="h-full overflow-y-auto" variant="accent">
          <div className="p-4">
            <h3 className="font-display text-sm text-grimoire-accent mb-4">{phase.name}</h3>
            <Section title="Operator Intent" content={phase.operator_intent} />
            <Section title="Permitted Simulation" content={phase.permitted_simulation} />
            <Section title="Evidence Requirement" content={phase.evidence_requirement} />
            {phase.expected_telemetry.length > 0 && (
              <div className="mb-3">
                <h4 className="text-[9px] uppercase tracking-[0.18em] text-grimoire-muted mb-2">
                  Expected Telemetry
                </h4>
                <ul className="text-[10px] space-y-1">
                  {phase.expected_telemetry.map((t, i) => (
                    <li key={i} className="flex gap-2 text-grimoire-text/90">
                      <span className="text-grimoire-accent">›</span> {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Section title="Detection Question" content={phase.detection_question} italic />
          </div>
        </TacticalFrame>
      </aside>
    );
  }

  if (selectedTechnique) {
    return (
      <aside className="w-72 flex-shrink-0 p-2 overflow-hidden">
        <TacticalFrame label={selectedTechnique.id} className="h-full overflow-y-auto">
          <div className="p-4">
            <h3 className="font-display text-sm text-grimoire-accent mb-1">
              {selectedTechnique.name}
            </h3>
            <p className="text-[10px] text-grimoire-muted mb-4">{selectedTechnique.tactic}</p>
            <Section title="Description" content={selectedTechnique.description} />
            <div className="mb-3">
              <h4 className="text-[9px] uppercase tracking-[0.18em] text-grimoire-muted mb-2">
                Detection Profile
              </h4>
              <div className="grid grid-cols-2 gap-1.5">
                <DetBadge label="Endpoint" value={selectedTechnique.detection_endpoint} />
                <DetBadge label="Identity" value={selectedTechnique.detection_identity} />
                <DetBadge label="Network" value={selectedTechnique.detection_network} />
                <DetBadge label="Cloud" value={selectedTechnique.detection_cloud} />
              </div>
            </div>
          </div>
        </TacticalFrame>
      </aside>
    );
  }

  return (
    <aside className="w-72 flex-shrink-0 p-2 overflow-hidden">
      <TacticalFrame label="Overview" className="h-full overflow-y-auto">
        <div className="p-4">
          <Section title="Mission" content={plan.mission} />
          <Section title="Threat Model" content={plan.threat_model} />
          <div className="mb-3">
            <h4 className="text-[9px] uppercase tracking-[0.18em] text-grimoire-muted mb-2">
              Risk Assessment
            </h4>
            {plan.risk_assessment.map((r) => (
              <div key={r.category} className="flex justify-between text-[10px] py-1 border-b border-grimoire-border/30">
                <span className="text-grimoire-muted">{r.category}</span>
                <span className={riskColor(r.level)}>{r.level}</span>
              </div>
            ))}
            <div className="mt-2 pt-2 flex justify-between text-xs font-display">
              <span>Overall</span>
              <span className={riskColor(plan.overall_risk)}>{plan.overall_risk}</span>
            </div>
          </div>
        </div>
      </TacticalFrame>
    </aside>
  );
}

function Section({
  title,
  content,
  italic,
}: {
  title: string;
  content: string;
  italic?: boolean;
}) {
  return (
    <div className="mb-3">
      <h4 className="text-[9px] uppercase tracking-[0.18em] text-grimoire-muted mb-1">{title}</h4>
      <p className={`text-[10px] text-grimoire-text/90 leading-relaxed ${italic ? "italic" : ""}`}>
        {content}
      </p>
    </div>
  );
}

function DetBadge({ label, value }: { label: string; value: string }) {
  const colors: Record<string, string> = {
    YES: "border-green-500/30 text-green-400 bg-green-500/5",
    NO: "border-grimoire-border text-grimoire-muted bg-grimoire-bg/40",
    MAYBE: "border-yellow-500/30 text-yellow-400 bg-yellow-500/5",
  };
  return (
    <div
      className={`border px-2 py-1.5 flex justify-between text-[9px] uppercase tracking-wide ${colors[value] || colors.NO}`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
