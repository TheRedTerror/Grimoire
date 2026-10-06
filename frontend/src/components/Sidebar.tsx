"use client";

import GrimoireLogo from "@/components/brand/GrimoireLogo";
import { NavIcon } from "@/components/brand/NavIcons";
import CampaignDossier from "@/components/ui/CampaignDossier";
import type { NavSection } from "@/types/campaign";

const NAV_ITEMS: { id: NavSection; label: string; ref: string }[] = [
  { id: "create", label: "New Engagement", ref: "00" },
  { id: "facility", label: "Facility Map", ref: "F1" },
  { id: "threat", label: "Threat Model", ref: "01" },
  { id: "environment", label: "Environment", ref: "02" },
  { id: "objectives", label: "Objectives", ref: "03" },
  { id: "scope", label: "Scope & ROE", ref: "04" },
  { id: "techniques", label: "Techniques", ref: "05" },
  { id: "plan", label: "Operation Plan", ref: "06" },
  { id: "detection", label: "Detection", ref: "07" },
  { id: "report", label: "Report", ref: "08" },
];

interface SidebarProps {
  active: NavSection;
  onNavigate: (section: NavSection) => void;
  operationName: string;
  actor?: string;
  industry?: string;
  engagementType?: string;
  techniqueCount?: number;
  savedId?: number | null;
  hasPlan?: boolean;
  lastEdited?: string;
}

export default function Sidebar({
  active,
  onNavigate,
  operationName,
  actor,
  industry,
  engagementType,
  techniqueCount,
  savedId,
  hasPlan,
  lastEdited,
}: SidebarProps) {
  const activeIndex = NAV_ITEMS.findIndex((n) => n.id === active);

  return (
    <aside className="w-60 flex-shrink-0 grimoire-panel flex flex-col h-full relative overflow-hidden">
      <div className="scanline-overlay absolute inset-0 pointer-events-none opacity-30" />

      <div className="p-4 border-b border-grimoire-border/60 relative">
        <GrimoireLogo size={32} />
      </div>

      <div className="p-3 relative flex-1 flex flex-col overflow-hidden">
        <CampaignDossier
          operationName={operationName}
          actor={actor}
          industry={industry}
          engagementType={engagementType}
          techniqueCount={techniqueCount}
          savedId={savedId}
          lastEdited={lastEdited}
        />

        <div className="text-[9px] uppercase tracking-[0.2em] text-grimoire-muted mb-2 px-1">
          Workflow
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item, i) => {
            const isActive = active === item.id;
            const isComplete = i < activeIndex || (hasPlan && i <= 6 && item.id !== "create");
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`nav-item ${
                  isActive
                    ? "nav-item-active"
                    : isComplete
                      ? "nav-item-complete"
                      : "nav-item-inactive"
                }`}
              >
                <span className="text-[9px] font-mono text-grimoire-muted/60 w-4">
                  {item.ref}
                </span>
                <NavIcon id={item.id} />
                <span className="flex-1 text-left">{item.label}</span>
                {isComplete && !isActive && (
                  <span className="text-grimoire-accent/50 text-[10px]">✓</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-3 pt-3 border-t border-grimoire-border/40 space-y-2">
          <div className="flex items-center justify-between text-[9px] text-grimoire-muted">
            <span>CLASSIFICATION</span>
            <span className="stamp text-grimoire-danger border-grimoire-danger/50">
              PLANNING
            </span>
          </div>
          <p className="text-[9px] text-grimoire-muted/60 leading-relaxed">
            Campaign design only. No C2, agents, recon execution, or target interaction.
          </p>
        </div>
      </div>
    </aside>
  );
}
