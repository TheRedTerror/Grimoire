"use client";

import GrimoireLogo from "@/components/brand/GrimoireLogo";

interface AppHeaderProps {
  error: string | null;
  loading: boolean;
  hasPlan: boolean;
  onGenerate: () => void;
  onSave: () => void;
  onPreviewReport: () => void;
  savedId: number | null;
  yamlExportUrl?: string;
}

export default function AppHeader({
  error,
  loading,
  hasPlan,
  onGenerate,
  onSave,
  onPreviewReport,
  savedId,
  yamlExportUrl,
}: AppHeaderProps) {
  return (
    <header className="app-header relative border-b border-grimoire-border bg-grimoire-panel/95 backdrop-blur-sm">
      <div className="classification-banner">
        PLANNING ONLY — NO EXECUTION · NO AGENTS · NO TARGET INTERACTION
      </div>
      <div className="px-4 py-2.5 flex items-center justify-between gap-4">
        <GrimoireLogo size={36} />

        <div className="flex-1 hidden lg:flex justify-center">
          <div className="text-[10px] text-grimoire-muted tracking-widest uppercase">
            Adversary Emulation · Campaign Design · Detection Validation
          </div>
        </div>

        <div className="flex items-center gap-2">
          {error && (
            <div className="hidden sm:flex items-center gap-2 px-2 py-1 bg-grimoire-danger/10 border border-grimoire-danger/30 rounded text-[10px] text-grimoire-danger max-w-[180px] truncate">
              <span className="animate-pulse">⚠</span> {error}
            </div>
          )}
          <button
            onClick={onGenerate}
            disabled={loading}
            className="grimoire-btn-secondary text-xs disabled:opacity-40"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner /> Compiling…
              </span>
            ) : (
              "Generate Plan"
            )}
          </button>
          <button
            onClick={onSave}
            disabled={loading || !hasPlan}
            className="grimoire-btn-primary text-xs disabled:opacity-40"
          >
            Save
          </button>
          {hasPlan && (
            <button onClick={onPreviewReport} className="grimoire-btn-ghost text-xs">
              Report ↗
            </button>
          )}
          {savedId && yamlExportUrl && (
            <a href={yamlExportUrl} target="_blank" rel="noopener noreferrer" className="grimoire-btn-ghost text-xs">
              YAML
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

function Spinner() {
  return (
    <svg className="w-3 h-3 animate-spin" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20 10" />
    </svg>
  );
}
