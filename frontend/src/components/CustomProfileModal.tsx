"use client";

import { useState } from "react";
import type { CustomProfileCreate, TechniqueInfo } from "@/types/campaign";

interface CustomProfileModalProps {
  techniques: TechniqueInfo[];
  onSave: (profile: CustomProfileCreate) => Promise<void>;
  onClose: () => void;
}

const ACTOR_TYPES = [
  "Nation-state",
  "Financially motivated",
  "Hacktivist",
  "Insider threat",
  "Ransomware-as-a-Service",
  "Dual-purpose (espionage + financial)",
  "Unknown",
];

const SOPHISTICATION = ["Low", "Medium", "Medium-High", "High", "Very High"];

export default function CustomProfileModal({
  techniques,
  onSave,
  onClose,
}: CustomProfileModalProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CustomProfileCreate>({
    name: "",
    aliases: [],
    mitre_group: null,
    actor_type: "Unknown",
    sophistication: "Medium",
    origin: "Unknown",
    motivation: [],
    target_industries: [],
    known_behavior: [],
    default_techniques: [],
    description: "",
  });
  const [aliasInput, setAliasInput] = useState("");
  const [behaviorInput, setBehaviorInput] = useState("");

  const toggleTechnique = (id: string) => {
    setForm((f) => ({
      ...f,
      default_techniques: f.default_techniques.includes(id)
        ? f.default_techniques.filter((t) => t !== id)
        : [...f.default_techniques, id],
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Profile name is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const byTactic = techniques.reduce(
    (acc, t) => {
      if (!acc[t.tactic]) acc[t.tactic] = [];
      acc[t.tactic].push(t);
      return acc;
    },
    {} as Record<string, TechniqueInfo[]>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="grimoire-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 border border-grimoire-accent">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-grimoire-accent text-lg font-bold">
            Create Custom Threat Profile
          </h2>
          <button onClick={onClose} className="text-grimoire-muted hover:text-grimoire-danger text-xl">
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-grimoire-danger/10 border border-grimoire-danger text-grimoire-danger text-xs rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="grimoire-label">Profile Name *</label>
              <input
                className="grimoire-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Internal Red Team Persona"
              />
            </div>
            <div>
              <label className="grimoire-label">MITRE Group ID</label>
              <input
                className="grimoire-input"
                value={form.mitre_group || ""}
                onChange={(e) =>
                  setForm({ ...form, mitre_group: e.target.value || null })
                }
                placeholder="e.g. G0046 (optional)"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="grimoire-label">Actor Type</label>
              <select
                className="grimoire-input"
                value={form.actor_type}
                onChange={(e) => setForm({ ...form, actor_type: e.target.value })}
              >
                {ACTOR_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="grimoire-label">Sophistication</label>
              <select
                className="grimoire-input"
                value={form.sophistication}
                onChange={(e) => setForm({ ...form, sophistication: e.target.value })}
              >
                {SOPHISTICATION.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="grimoire-label">Origin / Attribution</label>
            <input
              className="grimoire-input"
              value={form.origin}
              onChange={(e) => setForm({ ...form, origin: e.target.value })}
              placeholder="e.g. Unknown, Eastern European suspected"
            />
          </div>

          <div>
            <label className="grimoire-label">Aliases</label>
            <div className="flex gap-2 mb-2">
              <input
                className="grimoire-input flex-1"
                value={aliasInput}
                onChange={(e) => setAliasInput(e.target.value)}
                placeholder="Add alias..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && aliasInput.trim()) {
                    setForm({ ...form, aliases: [...form.aliases, aliasInput.trim()] });
                    setAliasInput("");
                  }
                }}
              />
              <button
                type="button"
                className="grimoire-btn-secondary text-xs"
                onClick={() => {
                  if (aliasInput.trim()) {
                    setForm({ ...form, aliases: [...form.aliases, aliasInput.trim()] });
                    setAliasInput("");
                  }
                }}
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {form.aliases.map((a, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-1 bg-grimoire-bg border border-grimoire-border rounded flex items-center gap-1"
                >
                  {a}
                  <button
                    onClick={() =>
                      setForm({ ...form, aliases: form.aliases.filter((_, j) => j !== i) })
                    }
                    className="text-grimoire-danger"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="grimoire-label">Known Behavior</label>
            <div className="flex gap-2 mb-2">
              <input
                className="grimoire-input flex-1"
                value={behaviorInput}
                onChange={(e) => setBehaviorInput(e.target.value)}
                placeholder="Add observed behavior..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && behaviorInput.trim()) {
                    setForm({
                      ...form,
                      known_behavior: [...form.known_behavior, behaviorInput.trim()],
                    });
                    setBehaviorInput("");
                  }
                }}
              />
              <button
                type="button"
                className="grimoire-btn-secondary text-xs"
                onClick={() => {
                  if (behaviorInput.trim()) {
                    setForm({
                      ...form,
                      known_behavior: [...form.known_behavior, behaviorInput.trim()],
                    });
                    setBehaviorInput("");
                  }
                }}
              >
                Add
              </button>
            </div>
            <div className="space-y-1">
              {form.known_behavior.map((b, i) => (
                <div key={i} className="flex justify-between text-xs p-1 bg-grimoire-bg rounded">
                  <span>{b}</span>
                  <button
                    onClick={() =>
                      setForm({
                        ...form,
                        known_behavior: form.known_behavior.filter((_, j) => j !== i),
                      })
                    }
                    className="text-grimoire-danger"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="grimoire-label">Description</label>
            <textarea
              className="grimoire-input min-h-[60px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief threat intelligence summary..."
            />
          </div>

          <div>
            <label className="grimoire-label">
              Default Techniques ({form.default_techniques.length} selected)
            </label>
            <div className="max-h-40 overflow-y-auto border border-grimoire-border rounded p-2">
              {Object.entries(byTactic).map(([tactic, techs]) => (
                <div key={tactic} className="mb-2">
                  <div className="text-xs text-grimoire-muted mb-1">{tactic}</div>
                  {techs.map((t) => (
                    <label
                      key={t.id}
                      className="flex items-center gap-2 text-xs py-0.5 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={form.default_techniques.includes(t.id)}
                        onChange={() => toggleTechnique(t.id)}
                        className="accent-grimoire-accent"
                      />
                      <span className="text-grimoire-accent w-14">{t.id}</span>
                      <span>{t.name}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-grimoire-border">
          <button onClick={onClose} className="grimoire-btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="grimoire-btn-primary disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Custom Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
