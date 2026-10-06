"use client";

import { useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import type { CampaignCreate, EngagementPlan } from "@/types/campaign";
import { downloadReport, openReportPreview } from "@/lib/api";

interface ReportExportProps {
  campaign: CampaignCreate;
  plan: EngagementPlan | null;
  savedId: number | null;
}

export default function ReportExport({ campaign, plan, savedId }: ReportExportProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePreview = async () => {
    setLoading("preview");
    setError(null);
    try {
      await openReportPreview(campaign, savedId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to open report");
    } finally {
      setLoading(null);
    }
  };

  const handleDownload = async (format: "html" | "markdown") => {
    setLoading(format);
    setError(null);
    try {
      await downloadReport(campaign, format, savedId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to download report");
    } finally {
      setLoading(null);
    }
  };

  if (!plan) {
    return (
      <div className="text-grimoire-muted text-sm">
        Generate a plan first to export the engagement report.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <SectionHeader
          refId="SEC-08"
          title="Engagement Report"
          subtitle="Client-ready deliverable for scope sign-off and purple team coordination. HTML includes print-to-PDF."
        />
        {error && (
          <div className="mb-4 p-2 text-xs text-grimoire-danger border border-grimoire-danger rounded">
            {error}
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handlePreview}
            disabled={!!loading}
            className="grimoire-btn-primary disabled:opacity-50"
          >
            {loading === "preview" ? "Opening..." : "Preview Report"}
          </button>
          <button
            onClick={() => handleDownload("html")}
            disabled={!!loading}
            className="grimoire-btn-secondary disabled:opacity-50"
          >
            {loading === "html" ? "Downloading..." : "Download HTML Report"}
          </button>
          <button
            onClick={() => handleDownload("markdown")}
            disabled={!!loading}
            className="grimoire-btn-secondary disabled:opacity-50"
          >
            {loading === "markdown" ? "Downloading..." : "Download Markdown"}
          </button>
        </div>
      </div>

      <div className="grimoire-panel p-4 border border-grimoire-border">
        <h3 className="text-xs uppercase text-grimoire-muted mb-3">Report Contents</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          {[
            "Executive Summary",
            "Mission & Threat Model",
            "Objectives",
            "Assumed Access",
            "ATT&CK Mapping",
            "Rules of Engagement",
            "Risk Assessment",
            "Campaign Phases",
            "Decision Points",
            "Detection Matrix",
            "Detection Validation",
            "Success & Evidence",
          ].map((s) => (
            <div key={s} className="flex items-center gap-2 text-grimoire-text">
              <span className="text-grimoire-accent">✓</span>
              {s}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ReportCard
          title="Executive Summary"
          content={`Structured ${campaign.engagement.type} emulating ${campaign.threat_profile.actor_name} in ${campaign.organization.industry}. ${plan.techniques.length} techniques across ${plan.phases.length} phases. Overall risk: ${plan.overall_risk}.`}
        />
        <ReportCard
          title="Operator Appendix"
          content={`Full ATT&CK table, ${plan.decision_points.length} decision points, phase-by-phase operator intent, permitted simulation boundaries, and evidence requirements.`}
        />
        <ReportCard
          title="Purple Team Appendix"
          content={`Detection matrix for ${plan.detection_matrix.length} techniques across endpoint, identity, network, and cloud telemetry sources.`}
        />
      </div>
    </div>
  );
}

function ReportCard({ title, content }: { title: string; content: string }) {
  return (
    <div className="grimoire-panel p-4 border border-grimoire-border">
      <h3 className="text-grimoire-accent text-sm font-semibold mb-2">{title}</h3>
      <p className="text-xs text-grimoire-text leading-relaxed">{content}</p>
    </div>
  );
}
