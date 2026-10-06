"use client";

import { useMemo, useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import ListEditor from "./ListEditor";
import type { CampaignCreate, NavSection, ThreatProfile } from "@/types/campaign";

const SECTION_META: Record<string, { ref: string; title: string; subtitle: string }> = {
  threat: {
    ref: "SEC-01",
    title: "Threat Model",
    subtitle: "Define the adversary profile, operation parameters, and initial access assumptions.",
  },
  environment: {
    ref: "SEC-02",
    title: "Environment Profile",
    subtitle: "Identity, endpoints, cloud, and defensive controls in scope.",
  },
  objectives: {
    ref: "SEC-03",
    title: "Objectives",
    subtitle: "Primary and secondary outcomes that define engagement success.",
  },
  scope: {
    ref: "SEC-04",
    title: "Scope & Constraints",
    subtitle: "Authorized systems, prohibited actions, and emergency stop conditions.",
  },
  techniques: {
    ref: "SEC-05",
    title: "ATT&CK Technique Selection",
    subtitle: "Threat intel → observed behavior → applicable behavior → authorized simulation.",
  },
};

interface CampaignFormProps {
  section: NavSection;
  data: CampaignCreate;
  onChange: (data: CampaignCreate) => void;
  threatProfiles: ThreatProfile[];
  allTechniques: { id: string; name: string; tactic: string }[];
}

function TechniqueSelection({
  meta,
  data,
  allTechniques,
  onToggle,
}: {
  meta?: { ref: string; title: string; subtitle: string };
  data: CampaignCreate;
  allTechniques: { id: string; name: string; tactic: string }[];
  onToggle: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [tacticFilter, setTacticFilter] = useState("all");
  const [selectedOnly, setSelectedOnly] = useState(false);

  const selected = useMemo(() => new Set(data.selected_techniques), [data.selected_techniques]);

  const tactics = useMemo(
    () => [...new Set(allTechniques.map((t) => t.tactic))].sort(),
    [allTechniques]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allTechniques.filter((t) => {
      if (selectedOnly && !selected.has(t.id)) return false;
      if (tacticFilter !== "all" && t.tactic !== tacticFilter) return false;
      if (!q) return true;
      return (
        t.id.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.tactic.toLowerCase().includes(q)
      );
    });
  }, [allTechniques, query, selected, selectedOnly, tacticFilter]);

  const byTactic = useMemo(
    () =>
      filtered.reduce(
        (acc, t) => {
          if (!acc[t.tactic]) acc[t.tactic] = [];
          acc[t.tactic].push(t);
          return acc;
        },
        {} as Record<string, typeof allTechniques>
      ),
    [filtered]
  );

  return (
    <div className="space-y-4">
      {meta && <SectionHeader refId={meta.ref} title={meta.title} subtitle={meta.subtitle} />}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs text-grimoire-muted block mb-1">Search</label>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ID, name, or tactic…"
            className="w-full bg-grimoire-bg border border-grimoire-border rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-grimoire-muted block mb-1">Tactic</label>
          <select
            value={tacticFilter}
            onChange={(e) => setTacticFilter(e.target.value)}
            className="bg-grimoire-bg border border-grimoire-border rounded px-3 py-2 text-sm"
          >
            <option value="all">All tactics</option>
            {tactics.map((tactic) => (
              <option key={tactic} value={tactic}>
                {tactic}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm pb-2 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedOnly}
            onChange={(e) => setSelectedOnly(e.target.checked)}
            className="accent-grimoire-accent"
          />
          Selected only ({selected.size})
        </label>
      </div>
      <p className="text-xs text-grimoire-muted">
        Showing {filtered.length} of {allTechniques.length} MITRE ATT&CK techniques
      </p>
      {filtered.length === 0 ? (
        <p className="text-sm text-grimoire-muted">No techniques match your filters.</p>
      ) : (
        Object.entries(byTactic).map(([tactic, techniques]) => (
          <div key={tactic}>
            <h3 className="text-sm text-grimoire-muted mb-2">
              {tactic} ({techniques.length})
            </h3>
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {techniques.map((t) => (
                <label
                  key={t.id}
                  className={`flex items-center gap-3 p-2 rounded cursor-pointer border ${
                    selected.has(t.id)
                      ? "border-grimoire-accent bg-grimoire-bg"
                      : "border-transparent hover:border-grimoire-border"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(t.id)}
                    onChange={() => onToggle(t.id)}
                    className="accent-grimoire-accent"
                  />
                  <span className="text-grimoire-accent text-xs w-20 shrink-0">{t.id}</span>
                  <span className="text-sm">{t.name}</span>
                </label>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default function CampaignForm({
  section,
  data,
  onChange,
  threatProfiles,
  allTechniques,
}: CampaignFormProps) {
  const applyThreatProfile = (profileId: string) => {
    const profile = threatProfiles.find((p) => p.id === profileId);
    if (!profile) return;
    onChange({
      ...data,
      threat_profile: {
        actor_name: profile.name,
        actor_type: profile.actor_type,
        sophistication: profile.sophistication,
        known_behavior: [...profile.known_behavior],
      },
      selected_techniques: profile.default_techniques.length
        ? [...profile.default_techniques]
        : data.selected_techniques,
    });
  };

  const builtinProfiles = threatProfiles.filter((p) => p.is_builtin);
  const customProfiles = threatProfiles.filter((p) => !p.is_builtin);

  const toggleTechnique = (id: string) => {
    const selected = data.selected_techniques.includes(id)
      ? data.selected_techniques.filter((t) => t !== id)
      : [...data.selected_techniques, id];
    onChange({ ...data, selected_techniques: selected });
  };

  const meta = SECTION_META[section];

  if (section === "threat") {
    return (
      <div className="space-y-4">
        {meta && <SectionHeader refId={meta.ref} title={meta.title} subtitle={meta.subtitle} />}
        <div>
          <label className="grimoire-label">Threat Profile Template</label>
          <select
            className="grimoire-input"
            onChange={(e) => applyThreatProfile(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>
              Load profile...
            </option>
            <optgroup label="Built-in Threat Actors">
              {builtinProfiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.actor_type}
                  {p.mitre_group ? ` (${p.mitre_group})` : ""}
                </option>
              ))}
            </optgroup>
            {customProfiles.length > 0 && (
              <optgroup label="Custom Profiles">
                {customProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.actor_type}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
        <div>
          <label className="grimoire-label">Operation Name</label>
          <input
            className="grimoire-input"
            value={data.engagement.name}
            onChange={(e) =>
              onChange({
                ...data,
                engagement: { ...data.engagement, name: e.target.value },
              })
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="grimoire-label">Threat Actor</label>
            <input
              className="grimoire-input"
              value={data.threat_profile.actor_name}
              onChange={(e) =>
                onChange({
                  ...data,
                  threat_profile: {
                    ...data.threat_profile,
                    actor_name: e.target.value,
                  },
                })
              }
            />
          </div>
          <div>
            <label className="grimoire-label">Actor Type</label>
            <input
              className="grimoire-input"
              value={data.threat_profile.actor_type}
              onChange={(e) =>
                onChange({
                  ...data,
                  threat_profile: {
                    ...data.threat_profile,
                    actor_type: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="grimoire-label">Sophistication</label>
            <input
              className="grimoire-input"
              value={data.threat_profile.sophistication}
              onChange={(e) =>
                onChange({
                  ...data,
                  threat_profile: {
                    ...data.threat_profile,
                    sophistication: e.target.value,
                  },
                })
              }
            />
          </div>
          <div>
            <label className="grimoire-label">Duration (days)</label>
            <input
              type="number"
              className="grimoire-input"
              value={data.engagement.duration_days}
              onChange={(e) =>
                onChange({
                  ...data,
                  engagement: {
                    ...data.engagement,
                    duration_days: parseInt(e.target.value) || 1,
                  },
                })
              }
            />
          </div>
        </div>
        <ListEditor
          label="Known Behavior"
          items={data.threat_profile.known_behavior}
          onChange={(items) =>
            onChange({
              ...data,
              threat_profile: { ...data.threat_profile, known_behavior: items },
            })
          }
        />
        <ListEditor
          label="Initial Assumptions"
          items={data.assumed_access.assumptions}
          onChange={(items) =>
            onChange({
              ...data,
              assumed_access: { ...data.assumed_access, assumptions: items },
            })
          }
        />
      </div>
    );
  }

  if (section === "environment") {
    return (
      <div className="space-y-4">
        {meta && <SectionHeader refId={meta.ref} title={meta.title} subtitle={meta.subtitle} />}
        <div>
          <label className="grimoire-label">Industry</label>
          <input
            className="grimoire-input"
            value={data.organization.industry}
            onChange={(e) =>
              onChange({
                ...data,
                organization: { ...data.organization, industry: e.target.value },
              })
            }
          />
        </div>
        <ListEditor
          label="Critical Assets"
          items={data.organization.critical_assets}
          onChange={(items) =>
            onChange({
              ...data,
              organization: { ...data.organization, critical_assets: items },
            })
          }
        />
        <ListEditor
          label="Identity"
          items={data.environment.identity}
          onChange={(items) =>
            onChange({
              ...data,
              environment: { ...data.environment, identity: items },
            })
          }
        />
        <ListEditor
          label="Endpoints"
          items={data.environment.endpoints}
          onChange={(items) =>
            onChange({
              ...data,
              environment: { ...data.environment, endpoints: items },
            })
          }
        />
        <ListEditor
          label="Cloud"
          items={data.environment.cloud}
          onChange={(items) =>
            onChange({
              ...data,
              environment: { ...data.environment, cloud: items },
            })
          }
        />
        <ListEditor
          label="Security Controls"
          items={data.environment.security_controls}
          onChange={(items) =>
            onChange({
              ...data,
              environment: { ...data.environment, security_controls: items },
            })
          }
        />
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <label className="grimoire-label">Initial Privilege</label>
            <input
              className="grimoire-input"
              value={data.assumed_access.initial_privilege}
              onChange={(e) =>
                onChange({
                  ...data,
                  assumed_access: {
                    ...data.assumed_access,
                    initial_privilege: e.target.value,
                  },
                })
              }
            />
          </div>
          <div>
            <label className="grimoire-label">Initial System</label>
            <input
              className="grimoire-input"
              value={data.assumed_access.initial_system}
              onChange={(e) =>
                onChange({
                  ...data,
                  assumed_access: {
                    ...data.assumed_access,
                    initial_system: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>
      </div>
    );
  }

  if (section === "objectives") {
    return (
      <div className="space-y-4">
        {meta && <SectionHeader refId={meta.ref} title={meta.title} subtitle={meta.subtitle} />}
        <ListEditor
          label="Primary Objectives"
          items={data.objectives.primary}
          onChange={(items) =>
            onChange({
              ...data,
              objectives: { ...data.objectives, primary: items },
            })
          }
        />
        <ListEditor
          label="Secondary Objectives"
          items={data.objectives.secondary}
          onChange={(items) =>
            onChange({
              ...data,
              objectives: { ...data.objectives, secondary: items },
            })
          }
        />
      </div>
    );
  }

  if (section === "scope") {
    return (
      <div className="space-y-4">
        {meta && <SectionHeader refId={meta.ref} title={meta.title} subtitle={meta.subtitle} />}
        <ListEditor
          label="Prohibited Actions"
          items={data.constraints.prohibited}
          onChange={(items) =>
            onChange({
              ...data,
              constraints: { ...data.constraints, prohibited: items },
            })
          }
        />
        <ListEditor
          label="Permitted Actions"
          items={data.constraints.permitted}
          onChange={(items) =>
            onChange({
              ...data,
              constraints: { ...data.constraints, permitted: items },
            })
          }
        />
        <ListEditor
          label="Authorized Systems"
          items={data.constraints.authorized_systems}
          onChange={(items) =>
            onChange({
              ...data,
              constraints: { ...data.constraints, authorized_systems: items },
            })
          }
        />
        <ListEditor
          label="Emergency Stop Conditions"
          items={data.constraints.emergency_stop}
          onChange={(items) =>
            onChange({
              ...data,
              constraints: { ...data.constraints, emergency_stop: items },
            })
          }
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="grimoire-label">Testing Window</label>
            <input
              className="grimoire-input"
              value={data.engagement.testing_window}
              onChange={(e) =>
                onChange({
                  ...data,
                  engagement: {
                    ...data.engagement,
                    testing_window: e.target.value,
                  },
                })
              }
            />
          </div>
          <div>
            <label className="grimoire-label">Escalation Contact</label>
            <input
              className="grimoire-input"
              value={data.engagement.escalation_contact}
              onChange={(e) =>
                onChange({
                  ...data,
                  engagement: {
                    ...data.engagement,
                    escalation_contact: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>
      </div>
    );
  }

  if (section === "techniques") {
    return (
      <TechniqueSelection
        meta={meta}
        data={data}
        allTechniques={allTechniques}
        onToggle={toggleTechnique}
      />
    );
  }

  return null;
}
