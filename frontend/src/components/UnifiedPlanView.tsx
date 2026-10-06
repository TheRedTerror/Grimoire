"use client";

import { useState } from "react";
import PlanView from "@/components/PlanView";
import PhysicalPlanView from "@/components/facility/PhysicalPlanView";
import type { EngagementPlan } from "@/types/campaign";
import type { PhysicalAttackPlan } from "@/types/facility";

type PlanTab = "overview" | "cyber" | "physical";

interface UnifiedPlanViewProps {
  cyberPlan?: EngagementPlan | null;
  physicalPlan?: PhysicalAttackPlan | null;
  operationName?: string;
  onSelectTechnique?: (id: string) => void;
}

export default function UnifiedPlanView({
  cyberPlan,
  physicalPlan,
  operationName,
  onSelectTechnique,
}: UnifiedPlanViewProps) {
  const hasCyber = !!cyberPlan;
  const hasPhysical = !!physicalPlan;
  const [tab, setTab] = useState<PlanTab>(hasCyber && hasPhysical ? "overview" : hasCyber ? "cyber" : "physical");

  if (!hasCyber && !hasPhysical) {
    return (
      <div className="text-grimoire-muted text-xs space-y-2 p-2">
        <p>No operation plan compiled yet.</p>
        <p className="text-[10px] text-grimoire-muted/70">
          Generate a cyber campaign plan and/or build a facility map and compile the physical plan.
        </p>
      </div>
    );
  }

  const title =
    operationName ||
    cyberPlan?.operation_name ||
    physicalPlan?.facility_name ||
    "Operation Plan";

  const tabs = (
    [
      { id: "overview" as const, label: "Integrated", show: hasCyber && hasPhysical },
      { id: "cyber" as const, label: "Cyber", show: hasCyber },
      { id: "physical" as const, label: "Physical", show: hasPhysical },
    ] as const
  ).filter((t) => t.show);

  return (
    <div className="space-y-4 h-full flex flex-col">
      <header className="pb-3 border-b border-grimoire-border/40 flex-shrink-0">
        <div className="text-[9px] uppercase tracking-[0.25em] text-grimoire-muted mb-1">
          Combined Operation Plan
        </div>
        <h2 className="font-display text-lg text-grimoire-accent tracking-wide">{title}</h2>
        <div className="flex gap-2 mt-2 flex-wrap">
          <StatusBadge active={hasCyber} label="Cyber" detail={hasCyber ? `${cyberPlan!.techniques.length} TTPs` : undefined} />
          <StatusBadge
            active={hasPhysical}
            label="Physical"
            detail={hasPhysical ? physicalPlan!.facility_name : undefined}
          />
        </div>
      </header>

      {tabs.length > 1 && (
        <div className="flex gap-1 border-b border-grimoire-border/40 flex-shrink-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-widest transition-colors ${
                tab === t.id
                  ? "text-grimoire-accent border-b-2 border-grimoire-accent"
                  : "text-grimoire-muted hover:text-grimoire-text"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto pr-2 min-h-0">
        {tab === "overview" && hasCyber && hasPhysical && (
          <IntegratedOverview cyberPlan={cyberPlan!} physicalPlan={physicalPlan!} />
        )}

        {tab === "cyber" && hasCyber && (
          <PlanView plan={cyberPlan!} embedded onSelectTechnique={onSelectTechnique ?? (() => {})} />
        )}

        {tab === "physical" && hasPhysical && (
          <PhysicalPlanView plan={physicalPlan!} embedded />
        )}

        {tab === "overview" && hasCyber && hasPhysical && (
          <div className="mt-8 space-y-8">
            <DomainDivider domain="Cyber Domain" />
            <PlanView plan={cyberPlan!} embedded onSelectTechnique={onSelectTechnique ?? (() => {})} />
            <DomainDivider domain="Physical Domain" />
            <PhysicalPlanView plan={physicalPlan!} embedded />
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({
  active,
  label,
  detail,
}: {
  active: boolean;
  label: string;
  detail?: string;
}) {
  return (
    <span
      className={`text-[9px] uppercase tracking-wider px-2 py-0.5 border ${
        active
          ? "border-grimoire-accent/40 text-grimoire-accent bg-grimoire-accent/5"
          : "border-grimoire-border/30 text-grimoire-muted/50"
      }`}
    >
      {label}
      {detail && active && <span className="text-grimoire-muted normal-case ml-1">· {detail}</span>}
    </span>
  );
}

function DomainDivider({ domain }: { domain: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-grimoire-accent/30" />
      <span className="text-[9px] uppercase tracking-[0.3em] text-grimoire-accent/70">{domain}</span>
      <div className="flex-1 h-px bg-grimoire-accent/30" />
    </div>
  );
}

function IntegratedOverview({
  cyberPlan,
  physicalPlan,
}: {
  cyberPlan: EngagementPlan;
  physicalPlan: PhysicalAttackPlan;
}) {
  const maxPhases = Math.max(cyberPlan.phases.length, physicalPlan.phases.length);

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-grimoire-muted mb-3 border-b border-grimoire-border/30 pb-1">
          Mission Alignment
        </h3>
        <div className="grid grid-cols-1 gap-3 text-[11px]">
          <div className="p-3 border border-grimoire-border/30 bg-grimoire-bg/40">
            <div className="text-[9px] uppercase tracking-wider text-grimoire-accent mb-1">Cyber</div>
            <p>{cyberPlan.mission}</p>
          </div>
          <div className="p-3 border border-grimoire-border/30 bg-grimoire-bg/40">
            <div className="text-[9px] uppercase tracking-wider text-grimoire-accent mb-1">Physical</div>
            <p>{physicalPlan.mission}</p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-grimoire-muted mb-3 border-b border-grimoire-border/30 pb-1">
          Combined Phase Timeline
        </h3>
        <div className="space-y-2">
          {Array.from({ length: maxPhases }, (_, i) => {
            const cyber = cyberPlan.phases[i];
            const physical = physicalPlan.phases[i];
            if (!cyber && !physical) return null;
            return (
              <div
                key={i}
                className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 border border-grimoire-border/20 bg-grimoire-bg/20"
              >
                <PhaseCell
                  domain="Cyber"
                  order={cyber?.order}
                  name={cyber?.name}
                  intent={cyber?.operator_intent}
                  detection={cyber?.detection_question}
                />
                <PhaseCell
                  domain="Physical"
                  order={physical?.order}
                  name={physical?.name}
                  intent={physical?.operator_intent}
                  detection={physical?.detection_question}
                  extra={physical?.target_zones?.length ? `Zones: ${physical.target_zones.join(", ")}` : undefined}
                />
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-grimoire-muted mb-3 border-b border-grimoire-border/30 pb-1">
          Cross-Domain Success Conditions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px]">
          <ul className="space-y-1">
            {cyberPlan.success_conditions.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-grimoire-accent shrink-0">C</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
          <ul className="space-y-1">
            {physicalPlan.success_conditions.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-grimoire-accent shrink-0">P</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {physicalPlan.rf_surface_summary.length > 0 && (
        <section>
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-grimoire-muted mb-3 border-b border-grimoire-border/30 pb-1">
            RF ↔ Cyber Overlap
          </h3>
          <p className="text-[10px] text-grimoire-muted mb-2">
            Physical RF surfaces that may intersect with cyber TTP selection and wireless attack surface.
          </p>
          <ul className="text-[10px] space-y-1">
            {physicalPlan.rf_surface_summary.slice(0, 4).map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-grimoire-accent">›</span>
                {s}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function PhaseCell({
  domain,
  order,
  name,
  intent,
  detection,
  extra,
}: {
  domain: string;
  order?: number;
  name?: string;
  intent?: string;
  detection?: string;
  extra?: string;
}) {
  if (!name) {
    return (
      <div className="p-2 text-[10px] text-grimoire-muted/40 italic border border-dashed border-grimoire-border/20">
        No {domain.toLowerCase()} phase
      </div>
    );
  }
  return (
    <div className="p-2 border-l-2 border-grimoire-accent/30 bg-grimoire-bg/30 text-[10px]">
      <div className="font-display text-grimoire-accent text-[11px] mb-1">
        {domain} · Phase {order} — {name}
      </div>
      <p className="text-grimoire-text/90 mb-1">{intent}</p>
      {extra && <p className="text-grimoire-muted mb-1">{extra}</p>}
      <p className="text-grimoire-muted italic text-[9px]">{detection}</p>
    </div>
  );
}
