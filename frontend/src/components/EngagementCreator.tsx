"use client";

import { useMemo, useState } from "react";
import { EngagementIllustration } from "@/components/brand/EngagementIllustrations";
import SectionHeader from "@/components/ui/SectionHeader";
import CustomProfileModal from "./CustomProfileModal";
import type {
  CampaignCreate,
  EngagementTemplate,
  TechniqueInfo,
  ThreatProfile,
} from "@/types/campaign";
import {
  ENVIRONMENT_PRESETS,
  INDUSTRIES,
  buildCampaignFromSelection,
} from "@/types/campaign";

interface EngagementCreatorProps {
  templates: EngagementTemplate[];
  profiles: ThreatProfile[];
  techniques: TechniqueInfo[];
  onComplete: (campaign: CampaignCreate) => void;
  onProfileCreated: (profile: ThreatProfile) => void;
  onCreateProfile: (data: import("@/types/campaign").CustomProfileCreate) => Promise<ThreatProfile>;
}

type WizardStep = "type" | "actor" | "context" | "review";

const STEPS: { id: WizardStep; label: string }[] = [
  { id: "type", label: "Engagement Type" },
  { id: "actor", label: "Threat Actor" },
  { id: "context", label: "Environment" },
  { id: "review", label: "Review" },
];

export default function EngagementCreator({
  templates,
  profiles,
  techniques,
  onComplete,
  onProfileCreated,
  onCreateProfile,
}: EngagementCreatorProps) {
  const [step, setStep] = useState<WizardStep>("type");
  const [selectedTemplate, setSelectedTemplate] = useState<EngagementTemplate | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<ThreatProfile | null>(null);
  const [industry, setIndustry] = useState("Financial Services");
  const [envPreset, setEnvPreset] = useState("Hybrid Windows + Azure");
  const [operationName, setOperationName] = useState("");
  const [actorFilter, setActorFilter] = useState("");
  const [showCustomModal, setShowCustomModal] = useState(false);

  const filteredProfiles = useMemo(() => {
    let list = profiles;
    if (selectedTemplate) {
      const suggested = new Set(selectedTemplate.suggested_actors);
      list = [
        ...profiles.filter((p) => suggested.has(p.id)),
        ...profiles.filter((p) => !suggested.has(p.id)),
      ];
    }
    if (actorFilter) {
      const q = actorFilter.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.aliases.some((a) => a.toLowerCase().includes(q)) ||
          p.actor_type.toLowerCase().includes(q) ||
          p.origin.toLowerCase().includes(q)
      );
    }
    return list;
  }, [profiles, selectedTemplate, actorFilter]);

  const preview = useMemo(() => {
    if (!selectedTemplate || !selectedProfile) return null;
    return buildCampaignFromSelection(
      selectedTemplate,
      selectedProfile,
      industry,
      envPreset,
      operationName || undefined
    );
  }, [selectedTemplate, selectedProfile, industry, envPreset, operationName]);

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const canNext =
    (step === "type" && selectedTemplate) ||
    (step === "actor" && selectedProfile) ||
    (step === "context" && industry && envPreset) ||
    step === "review";

  const goNext = () => {
    const next = STEPS[stepIndex + 1];
    if (next) setStep(next.id);
  };

  const goBack = () => {
    const prev = STEPS[stepIndex - 1];
    if (prev) setStep(prev.id);
  };

  const handleCreate = () => {
    if (preview) onComplete(preview);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Step indicator */}
      <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-grimoire-border/60">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <button
              onClick={() => {
                if (i <= stepIndex) setStep(s.id);
              }}
              className={`wizard-step ${
                step === s.id
                  ? "wizard-step-active"
                  : i < stepIndex
                    ? "wizard-step-done cursor-pointer"
                    : "wizard-step-pending"
              }`}
            >
              <span className="font-mono opacity-60">0{i + 1}</span>
              {s.label}
            </button>
            {i < STEPS.length - 1 && (
              <span className="text-grimoire-border hidden sm:inline">—</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Step 1: Engagement Type */}
        {step === "type" && (
          <div>
            <SectionHeader
              refId="WIZ-01"
              title="Choose Engagement Type"
              subtitle="Each template pre-configures objectives, constraints, and suggested threat actors for a specific exercise class."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t)}
                  className={`group tactical-card text-left ${
                    selectedTemplate?.id === t.id ? "tactical-card-selected" : ""
                  }`}
                >
                  <EngagementIllustration typeId={t.id} />
                  <div className="font-display text-sm text-grimoire-accent mt-3 mb-1.5">
                    {t.name}
                  </div>
                  <p className="text-[11px] text-grimoire-text/80 leading-relaxed mb-3 line-clamp-3">
                    {t.description}
                  </p>
                  <div className="flex gap-3 text-[9px] uppercase tracking-wider text-grimoire-muted">
                    <span>{t.duration_days}d</span>
                    <span>{t.suggested_actors.length} actors</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Threat Actor */}
        {step === "actor" && (
          <div>
            <div className="flex justify-between items-start mb-4 gap-4">
              <SectionHeader
                refId="WIZ-02"
                title="Select Threat Actor"
                subtitle={`Real-world profiles for ${selectedTemplate?.name ?? "this engagement"}. Suggested actors surface first.`}
              />
              <button
                onClick={() => setShowCustomModal(true)}
                className="grimoire-btn-primary text-xs whitespace-nowrap"
              >
                + Custom Profile
              </button>
            </div>

            <input
              className="grimoire-input mb-4 max-w-md"
              placeholder="Search actors, aliases, origin..."
              value={actorFilter}
              onChange={(e) => setActorFilter(e.target.value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredProfiles.map((p) => {
                const isSuggested = selectedTemplate?.suggested_actors.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProfile(p)}
                    className={`tactical-card text-left ${
                      selectedProfile?.id === p.id ? "tactical-card-selected" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <span className="text-grimoire-accent font-semibold">{p.name}</span>
                        {!p.is_builtin && (
                          <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-grimoire-muted/20 text-grimoire-muted rounded">
                            CUSTOM
                          </span>
                        )}
                        {isSuggested && (
                          <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-grimoire-accent/10 text-grimoire-accent rounded">
                            SUGGESTED
                          </span>
                        )}
                      </div>
                      {p.mitre_group && (
                        <span className="text-[10px] text-grimoire-muted">{p.mitre_group}</span>
                      )}
                    </div>
                    {p.aliases.length > 0 && (
                      <p className="text-[10px] text-grimoire-muted mb-1">
                        aka {p.aliases.join(", ")}
                      </p>
                    )}
                    <p className="text-xs text-grimoire-text mb-2 line-clamp-2">
                      {p.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      <Tag label={p.actor_type} />
                      <Tag label={p.sophistication} />
                      <Tag label={p.origin} />
                    </div>
                    <div className="text-[10px] text-grimoire-muted">
                      {p.default_techniques.length} techniques ·{" "}
                      {p.target_industries.slice(0, 3).join(", ")}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Environment Context */}
        {step === "context" && (
          <div>
            <SectionHeader
              refId="WIZ-03"
              title="Environment & Industry"
              subtitle="Target context drives technique filtering, detection expectations, and ROE boundaries."
            />

            <div className="mb-6">
              <label className="grimoire-label">Operation Name</label>
              <input
                className="grimoire-input max-w-md"
                value={operationName}
                onChange={(e) => setOperationName(e.target.value)}
                placeholder={
                  selectedProfile
                    ? `Operation ${selectedProfile.name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12)}`
                    : "Operation Name"
                }
              />
            </div>

            <div className="mb-6">
              <label className="grimoire-label">Industry</label>
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map((ind) => (
                  <Chip
                    key={ind}
                    label={ind}
                    selected={industry === ind}
                    onClick={() => setIndustry(ind)}
                  />
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="grimoire-label">Environment Preset</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.keys(ENVIRONMENT_PRESETS).map((preset) => {
                  const env = ENVIRONMENT_PRESETS[preset];
                  return (
                    <button
                      key={preset}
                      onClick={() => setEnvPreset(preset)}
                      className={`text-left p-3 rounded border transition-all ${
                        envPreset === preset
                          ? "border-grimoire-accent bg-grimoire-bg"
                          : "border-grimoire-border hover:border-grimoire-muted"
                      }`}
                    >
                      <div className="text-sm text-grimoire-accent mb-1">{preset}</div>
                      <div className="text-[10px] text-grimoire-muted space-y-0.5">
                        {env.identity && <div>Identity: {env.identity.join(", ")}</div>}
                        {env.cloud && env.cloud.length > 0 && (
                          <div>Cloud: {env.cloud.join(", ")}</div>
                        )}
                        {env.cloud && env.cloud.length === 0 && (
                          <div>Cloud: None (on-prem)</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === "review" && preview && selectedTemplate && selectedProfile && (
          <div>
            <SectionHeader
              refId="WIZ-04"
              title="Review & Authorize"
              subtitle="Confirm configuration before entering the campaign editor. You can refine all fields after creation."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <ReviewCard title="Engagement">
                <ReviewRow label="Operation" value={preview.engagement.name} />
                <ReviewRow label="Type" value={preview.engagement.type} />
                <ReviewRow label="Duration" value={`${preview.engagement.duration_days} days`} />
                <ReviewRow label="Industry" value={preview.organization.industry} />
              </ReviewCard>

              <ReviewCard title="Threat Actor">
                <ReviewRow label="Actor" value={selectedProfile.name} />
                <ReviewRow label="Type" value={selectedProfile.actor_type} />
                <ReviewRow label="Sophistication" value={selectedProfile.sophistication} />
                <ReviewRow label="Origin" value={selectedProfile.origin} />
                {selectedProfile.mitre_group && (
                  <ReviewRow label="MITRE" value={selectedProfile.mitre_group} />
                )}
              </ReviewCard>

              <ReviewCard title="Environment">
                <ReviewRow label="Preset" value={envPreset} />
                <ReviewRow label="Identity" value={preview.environment.identity.join(", ")} />
                <ReviewRow label="Cloud" value={preview.environment.cloud.join(", ") || "None"} />
                <ReviewRow label="Endpoints" value={preview.environment.endpoints.join(", ")} />
              </ReviewCard>

              <ReviewCard title="Scope">
                <ReviewRow
                  label="Techniques"
                  value={`${preview.selected_techniques.length} selected`}
                />
                <ReviewRow
                  label="Prohibited"
                  value={`${preview.constraints.prohibited.length} rules`}
                />
                <ReviewRow
                  label="Primary Objectives"
                  value={`${preview.objectives.primary.length}`}
                />
              </ReviewCard>
            </div>

            <div className="grimoire-panel p-4 border border-grimoire-border mb-4">
              <h3 className="text-xs uppercase text-grimoire-muted mb-2">Primary Objectives</h3>
              <ul className="text-sm space-y-1">
                {preview.objectives.primary.map((o, i) => (
                  <li key={i}>• {o}</li>
                ))}
              </ul>
            </div>

            <div className="grimoire-panel p-4 border border-grimoire-border">
              <h3 className="text-xs uppercase text-grimoire-muted mb-2">
                Selected Techniques
              </h3>
              <div className="flex flex-wrap gap-1">
                {preview.selected_techniques.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] px-2 py-1 bg-grimoire-bg border border-grimoire-border rounded text-grimoire-accent"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4 mt-4 border-t border-grimoire-border">
        <button
          onClick={goBack}
          disabled={stepIndex === 0}
          className="grimoire-btn-secondary disabled:opacity-30"
        >
          ← Back
        </button>
        <div className="text-xs text-grimoire-muted">
          Step {stepIndex + 1} of {STEPS.length}
        </div>
        {step === "review" ? (
          <button onClick={handleCreate} className="grimoire-btn-primary">
            Create Campaign →
          </button>
        ) : (
          <button
            onClick={goNext}
            disabled={!canNext}
            className="grimoire-btn-primary disabled:opacity-30"
          >
            Next →
          </button>
        )}
      </div>

      {showCustomModal && (
        <CustomProfileModal
          techniques={techniques}
          onSave={async (data) => {
            const profile = await onCreateProfile(data);
            onProfileCreated(profile);
            setSelectedProfile(profile);
          }}
          onClose={() => setShowCustomModal(false)}
        />
      )}
    </div>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span className="text-[9px] px-1.5 py-0.5 bg-grimoire-bg/80 border border-grimoire-border/60 text-grimoire-muted uppercase tracking-wide">
      {label}
    </span>
  );
}

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-[11px] border transition-all uppercase tracking-wide ${
        selected
          ? "border-grimoire-accent bg-grimoire-accent/10 text-grimoire-accent shadow-glow"
          : "border-grimoire-border/60 text-grimoire-text/80 hover:border-grimoire-muted"
      }`}
    >
      {label}
    </button>
  );
}

function ReviewCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grimoire-panel p-4 border border-grimoire-border">
      <h3 className="text-xs uppercase text-grimoire-accent mb-3">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-grimoire-muted">{label}</span>
      <span className="text-grimoire-text text-right max-w-[60%]">{value}</span>
    </div>
  );
}
