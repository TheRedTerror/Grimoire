"use client";

import type { EngagementPlan } from "@/types/campaign";

interface PlanViewProps {
  plan: EngagementPlan;
  onSelectTechnique: (id: string) => void;
  embedded?: boolean;
}

export default function PlanView({ plan, onSelectTechnique, embedded }: PlanViewProps) {
  return (
    <div className={`space-y-6 ${embedded ? "" : "overflow-y-auto h-full pr-2"}`}>
      {!embedded && (
        <header className="mb-2 pb-4 border-b border-grimoire-border/40">
          <div className="text-[9px] uppercase tracking-[0.25em] text-grimoire-muted mb-1">
            Compiled Operation Plan
          </div>
          <h2 className="font-display text-lg text-grimoire-accent tracking-wide">
            {plan.operation_name}
          </h2>
        </header>
      )}

      <PlanSection title="MISSION">
        <p>{plan.mission}</p>
      </PlanSection>

      <PlanSection title="OBJECTIVES">
        <h4 className="text-grimoire-accent text-xs mb-1">Primary</h4>
        <ul className="list-disc list-inside space-y-1 mb-3">
          {plan.primary_objectives.map((o, i) => (
            <li key={i}>{o}</li>
          ))}
        </ul>
        <h4 className="text-grimoire-accent text-xs mb-1">Secondary</h4>
        <ul className="list-disc list-inside space-y-1">
          {plan.secondary_objectives.map((o, i) => (
            <li key={i}>{o}</li>
          ))}
        </ul>
      </PlanSection>

      <PlanSection title="RELEVANT TTPs">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-grimoire-muted border-b border-grimoire-border">
              <th className="text-left py-2">Tactic</th>
              <th className="text-left py-2">Technique</th>
              <th className="text-left py-2">ID</th>
            </tr>
          </thead>
          <tbody>
            {plan.techniques.map((t) => (
              <tr
                key={t.id}
                className="border-b border-grimoire-border/50 hover:bg-grimoire-bg cursor-pointer"
                onClick={() => onSelectTechnique(t.id)}
              >
                <td className="py-2">{t.tactic}</td>
                <td className="py-2">{t.name}</td>
                <td className="py-2 text-grimoire-accent">{t.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {plan.excluded_techniques.length > 0 && (
          <div className="mt-4">
            <h4 className="text-grimoire-muted text-xs mb-2">Excluded Techniques</h4>
            {plan.excluded_techniques.map((e) => (
              <div key={e.technique_id} className="text-xs mb-2 p-2 bg-grimoire-bg rounded">
                <span className="text-grimoire-danger">{e.technique_name}</span>
                <span className="text-grimoire-muted"> — {e.reason}</span>
              </div>
            ))}
          </div>
        )}
      </PlanSection>

      <PlanSection title="ASSUMED ACCESS">
        <ul className="list-disc list-inside space-y-1">
          {plan.initial_assumptions.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </PlanSection>

      <PlanSection title="RULES OF ENGAGEMENT">
        <RoeBlock plan={plan} />
      </PlanSection>

      <PlanSection title="SUCCESS CONDITIONS">
        <ul className="list-disc list-inside space-y-1">
          {plan.success_conditions.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </PlanSection>

      <PlanSection title="DETECTION VALIDATION">
        {plan.detection_validation.map((dv, i) => (
          <div key={i} className="mb-4 p-3 bg-grimoire-bg rounded border border-grimoire-border">
            <h4 className="text-grimoire-accent text-sm mb-2">{String(dv.stage)}</h4>
            <p className="text-xs mb-2">{String(dv.operator_goal)}</p>
            <p className="text-xs text-grimoire-muted">
              <strong>Detection Question:</strong> {String(dv.detection_question)}
            </p>
          </div>
        ))}
      </PlanSection>

      <PlanSection title="EVIDENCE REQUIREMENTS">
        <ul className="list-disc list-inside space-y-1">
          {plan.evidence_requirements.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      </PlanSection>

      <PlanSection title="DECISION POINTS">
        {plan.decision_points.map((dp) => (
          <div key={dp.id} className="mb-4 p-3 bg-grimoire-bg rounded border border-grimoire-border">
            <h4 className="text-grimoire-accent text-sm mb-2">{dp.id}</h4>
            <p className="text-xs mb-2">{dp.question}</p>
            <div className="text-xs space-y-1 text-grimoire-muted">
              <p>
                <span className="text-green-400">YES</span> → {dp.yes_action}
              </p>
              <p>
                <span className="text-yellow-400">NO</span> → {dp.no_action}
              </p>
              <p>
                <span className="text-grimoire-danger">STOP IF</span> → {dp.stop_condition}
              </p>
            </div>
          </div>
        ))}
      </PlanSection>
    </div>
  );
}

function PlanSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="text-grimoire-accent text-sm font-semibold tracking-wider border-b border-grimoire-border pb-2 mb-3">
        {title}
      </h3>
      <div className="text-sm text-grimoire-text leading-relaxed">{children}</div>
    </section>
  );
}

function RoeBlock({ plan }: { plan: EngagementPlan }) {
  const roe = plan.rules_of_engagement;
  return (
    <div className="space-y-3 text-xs">
      <p>
        <strong>Testing Window:</strong> {String(roe.testing_window)}
      </p>
      <div>
        <strong>Authorized Systems:</strong>
        <ul className="list-disc list-inside mt-1">
          {(roe.authorized_systems as string[]).map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>
      <div>
        <strong>Explicitly Prohibited:</strong>
        <ul className="list-disc list-inside mt-1 text-grimoire-danger/80">
          {(roe.explicitly_prohibited as string[]).map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>
      <div>
        <strong>Emergency Stop:</strong>
        <ul className="list-disc list-inside mt-1">
          {(roe.emergency_stop_conditions as string[]).map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
