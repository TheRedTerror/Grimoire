"use client";

import type { PhysicalAttackPlan } from "@/types/facility";

export default function PhysicalPlanView({
  plan,
  embedded,
}: {
  plan: PhysicalAttackPlan;
  embedded?: boolean;
}) {
  return (
    <div className={`space-y-6 ${embedded ? "" : "pb-8"}`}>
      {!embedded && (
        <header className="border-b border-grimoire-border/40 pb-4">
          <div className="text-[9px] uppercase tracking-[0.25em] text-grimoire-muted mb-1">
            Physical Attack Plan · Planning Document
          </div>
          <h2 className="font-display text-lg text-grimoire-accent">{plan.facility_name}</h2>
          <p className="text-[11px] text-grimoire-muted mt-1">{plan.facility_type}</p>
        </header>
      )}

      <PlanBlock title="Mission">
        <p>{plan.mission}</p>
      </PlanBlock>

      <PlanBlock title="Entry Assessment">
        <p>{plan.entry_assessment}</p>
      </PlanBlock>

      {plan.movement_paths.length > 0 && (
        <PlanBlock title="Movement Paths">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="text-grimoire-muted border-b border-grimoire-border/40">
                <th className="text-left py-1">From</th>
                <th className="text-left py-1">To</th>
                <th className="text-left py-1">Controls Crossed</th>
              </tr>
            </thead>
            <tbody>
              {plan.movement_paths.map((p, i) => (
                <tr key={i} className="border-b border-grimoire-border/20">
                  <td className="py-1.5">{String(p.from)}</td>
                  <td className="py-1.5">{String(p.to)}</td>
                  <td className="py-1.5 text-grimoire-muted">
                    {(p.controls_crossed as string[])?.join(", ") || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </PlanBlock>
      )}

      <PlanBlock title="Zone Risk Matrix">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {plan.zone_risk_matrix.map((z, i) => (
            <div
              key={i}
              className="p-2 border border-grimoire-border/30 bg-grimoire-bg/40 text-[10px]"
            >
              <div className="flex justify-between mb-1">
                <span className="text-grimoire-text">{String(z.zone)}</span>
                <span className={`risk-${String(z.risk).toLowerCase()}`}>{String(z.risk)}</span>
              </div>
              <div className="text-grimoire-muted">
                {(z.controls as string[])?.join(" · ")}
                {Boolean(z.rf_exposed) && <span className="text-grimoire-accent-dim ml-2">RF</span>}
              </div>
            </div>
          ))}
        </div>
      </PlanBlock>

      <PlanBlock title="RF Surface Summary">
        <ul className="space-y-1 text-[11px]">
          {plan.rf_surface_summary.map((s, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-grimoire-accent">›</span> {s}
            </li>
          ))}
        </ul>
      </PlanBlock>

      <PlanBlock title="Physical ROE">
        <ul className="space-y-1 text-[11px]">
          {plan.physical_roe.map((r, i) => (
            <li key={i} className={r.startsWith("PROHIBITED") ? "text-grimoire-danger" : ""}>
              {r}
            </li>
          ))}
        </ul>
      </PlanBlock>

      <PlanBlock title="Campaign Phases">
        {plan.phases.map((phase) => (
          <div
            key={phase.id}
            className="mb-3 p-3 border-l-2 border-grimoire-accent/40 bg-grimoire-bg/30"
          >
            <div className="font-display text-xs text-grimoire-accent mb-2">
              Phase {phase.order} — {phase.name}
            </div>
            <dl className="grid grid-cols-[100px_1fr] gap-1 text-[10px]">
              <dt className="text-grimoire-muted">Intent</dt>
              <dd>{phase.operator_intent}</dd>
              <dt className="text-grimoire-muted">Permitted</dt>
              <dd>{phase.permitted_simulation}</dd>
              <dt className="text-grimoire-muted">Zones</dt>
              <dd>{phase.target_zones.join(", ")}</dd>
              {phase.rf_considerations.length > 0 && (
                <>
                  <dt className="text-grimoire-muted">RF</dt>
                  <dd>{phase.rf_considerations.join("; ")}</dd>
                </>
              )}
              <dt className="text-grimoire-muted">Detection</dt>
              <dd className="italic">{phase.detection_question}</dd>
            </dl>
          </div>
        ))}
      </PlanBlock>

      <PlanBlock title="Success Conditions">
        <ul className="text-[11px] space-y-1">
          {plan.success_conditions.map((s, i) => (
            <li key={i}>• {s}</li>
          ))}
        </ul>
      </PlanBlock>
    </div>
  );
}

function PlanBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-[10px] uppercase tracking-[0.2em] text-grimoire-muted mb-2 border-b border-grimoire-border/30 pb-1">
        {title}
      </h3>
      <div className="text-[11px] text-grimoire-text/90 leading-relaxed">{children}</div>
    </section>
  );
}
