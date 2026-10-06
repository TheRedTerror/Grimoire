"use client";

interface CampaignDossierProps {
  operationName: string;
  actor?: string;
  industry?: string;
  engagementType?: string;
  techniqueCount?: number;
  savedId?: number | null;
  lastEdited?: string;
}

export default function CampaignDossier({
  operationName,
  actor,
  industry,
  engagementType,
  techniqueCount,
  savedId,
  lastEdited,
}: CampaignDossierProps) {
  return (
    <div className="dossier-card p-3 mb-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-16 h-16 opacity-[0.07]">
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
          <path d="M32 4 L60 56 H4 Z" stroke="#00E5FF" strokeWidth="2" />
        </svg>
      </div>
      <div className="text-[9px] uppercase tracking-[0.25em] text-grimoire-muted mb-1">
        Active Operation
      </div>
      <div className="font-display text-sm text-grimoire-accent truncate mb-2">
        {operationName}
      </div>
      <dl className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
        {actor && (
          <>
            <dt className="text-grimoire-muted">Actor</dt>
            <dd className="text-grimoire-text truncate">{actor}</dd>
          </>
        )}
        {industry && (
          <>
            <dt className="text-grimoire-muted">Sector</dt>
            <dd className="text-grimoire-text truncate">{industry}</dd>
          </>
        )}
        {engagementType && (
          <>
            <dt className="text-grimoire-muted">Type</dt>
            <dd className="text-grimoire-text truncate">{engagementType}</dd>
          </>
        )}
        {techniqueCount !== undefined && (
          <>
            <dt className="text-grimoire-muted">TTPs</dt>
            <dd className="text-grimoire-text">{techniqueCount} mapped</dd>
          </>
        )}
        {savedId && (
          <>
            <dt className="text-grimoire-muted">Doc ID</dt>
            <dd className="text-grimoire-accent font-mono">GRM-{savedId}</dd>
          </>
        )}
      </dl>
      {lastEdited && (
        <div className="mt-2 pt-2 border-t border-grimoire-border/40 text-[9px] text-grimoire-muted/70">
          Last edit {lastEdited}
        </div>
      )}
    </div>
  );
}
