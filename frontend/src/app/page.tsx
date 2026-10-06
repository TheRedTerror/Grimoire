"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import CampaignForm from "@/components/CampaignForm";
import CampaignGraph from "@/components/CampaignGraph";
import DetailPanel from "@/components/DetailPanel";
import UnifiedPlanView from "@/components/UnifiedPlanView";
import DetectionMatrix from "@/components/DetectionMatrix";
import EngagementCreator from "@/components/EngagementCreator";
import ReportExport from "@/components/ReportExport";
import FacilityWorkspace, { DEFAULT_FACILITY } from "@/components/facility/FacilityWorkspace";
import AppHeader from "@/components/layout/AppHeader";
import StatusBar from "@/components/layout/StatusBar";
import TacticalFrame from "@/components/brand/TacticalFrame";
import { EmptyGraphIllustration } from "@/components/brand/EngagementIllustrations";
import {
  createCampaign,
  createCustomProfile,
  exportUrl,
  getEngagementTemplates,
  getTechniques,
  getThreatProfiles,
  openReportPreview,
  previewCampaign,
} from "@/lib/api";
import {
  DEFAULT_CAMPAIGN,
  type CampaignCreate,
  type CampaignResponse,
  type CustomProfileCreate,
  type EngagementTemplate,
  type NavSection,
  type TechniqueInfo,
  type ThreatProfile,
} from "@/types/campaign";
import type { FacilityCreate, PhysicalAttackPlan } from "@/types/facility";

export default function Home() {
  const [nav, setNav] = useState<NavSection>("create");
  const [campaign, setCampaign] = useState<CampaignCreate>(DEFAULT_CAMPAIGN);
  const [plan, setPlan] = useState<CampaignResponse | null>(null);
  const [threatProfiles, setThreatProfiles] = useState<ThreatProfile[]>([]);
  const [engagementTemplates, setEngagementTemplates] = useState<EngagementTemplate[]>([]);
  const [techniques, setTechniques] = useState<TechniqueInfo[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedTechniqueId, setSelectedTechniqueId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [lastEdited, setLastEdited] = useState<string>("");
  const [facility, setFacility] = useState<FacilityCreate>(DEFAULT_FACILITY);
  const [physicalPlan, setPhysicalPlan] = useState<PhysicalAttackPlan | null>(null);

  const loadReferenceData = useCallback(async () => {
    const [profiles, templates, techs] = await Promise.all([
      getThreatProfiles(),
      getEngagementTemplates(),
      getTechniques(),
    ]);
    setThreatProfiles(profiles);
    setEngagementTemplates(templates);
    setTechniques(techs);
  }, []);

  useEffect(() => {
    loadReferenceData().catch((e) => setError(e.message));
  }, [loadReferenceData]);

  useEffect(() => {
    setLastEdited(
      new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }, [campaign]);

  const hasAnyPlan = !!plan?.plan || !!physicalPlan;
  const campaignStatus = savedId ? "SAVED" : hasAnyPlan ? "PLAN_READY" : "DRAFT";

  const generatePlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await previewCampaign(campaign);
      setPlan(result);
      setNav("plan");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  }, [campaign]);

  const saveCampaign = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await createCampaign(campaign);
      setPlan(result);
      setSavedId(result.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save campaign");
    } finally {
      setLoading(false);
    }
  }, [campaign]);

  const handleCreatorComplete = useCallback((newCampaign: CampaignCreate) => {
    setCampaign(newCampaign);
    setPlan(null);
    setSavedId(null);
    setNav("threat");
  }, []);

  const handleCreateProfile = useCallback(
    async (data: CustomProfileCreate) => {
      const profile = await createCustomProfile(data);
      await loadReferenceData();
      return profile;
    },
    [loadReferenceData]
  );

  const selectedTechnique =
    plan?.plan?.techniques.find((t) => t.id === selectedTechniqueId) || null;

  const isFormSection = ["threat", "environment", "objectives", "scope", "techniques"].includes(
    nav
  );

  const sectionRef = useMemo(() => {
    const refs: Record<string, string> = {
      create: "SEC-00", facility: "SEC-F1",
      threat: "SEC-01", environment: "SEC-02", objectives: "SEC-03",
      scope: "SEC-04", techniques: "SEC-05", plan: "SEC-06",
      detection: "SEC-07", report: "SEC-08",
    };
    return refs[nav] ?? "SEC-00";
  }, [nav]);

  return (
    <div className="h-screen flex flex-col relative z-10">
      <AppHeader
        error={error}
        loading={loading}
        hasPlan={hasAnyPlan}
        onGenerate={generatePlan}
        onSave={saveCampaign}
        onPreviewReport={() =>
          openReportPreview(campaign, savedId).catch((e) => setError(e.message))
        }
        savedId={savedId}
        yamlExportUrl={savedId ? exportUrl(savedId, "yaml") : undefined}
      />

      <StatusBar
        mode="PLANNING"
        campaignStatus={campaignStatus}
        operationName={campaign.engagement.name}
      />

      <div className="flex-1 flex overflow-hidden p-2 gap-2 grid-overlay">
        <Sidebar
          active={nav}
          onNavigate={setNav}
          operationName={campaign.engagement.name}
          actor={campaign.threat_profile.actor_name}
          industry={campaign.organization.industry}
          engagementType={campaign.engagement.type}
          techniqueCount={campaign.selected_techniques.length || plan?.plan?.techniques.length}
          savedId={savedId}
          hasPlan={hasAnyPlan}
          lastEdited={lastEdited}
        />

        <main className="flex-1 grimoire-panel overflow-hidden flex flex-col relative">
          <div className="absolute top-2 right-3 text-[9px] font-mono text-grimoire-muted/40 tracking-widest pointer-events-none">
            {sectionRef}
          </div>

          {nav === "facility" && (
            <div className="p-5 flex-1 flex flex-col min-h-0 overflow-hidden">
              <FacilityWorkspace
                actorName={campaign.threat_profile.actor_name}
                engagementType={campaign.engagement.type}
                prohibited={campaign.constraints.prohibited}
                permitted={campaign.constraints.permitted}
                facility={facility}
                onFacilityChange={setFacility}
                onPhysicalPlanChange={(p) => {
                  setPhysicalPlan(p);
                  if (p) setNav("plan");
                }}
              />
            </div>
          )}

          {nav === "create" && (
            <div className="p-5 overflow-y-auto flex-1">
              <EngagementCreator
                templates={engagementTemplates}
                profiles={threatProfiles}
                techniques={techniques}
                onComplete={handleCreatorComplete}
                onProfileCreated={(p) => setThreatProfiles((prev) => [...prev, p])}
                onCreateProfile={handleCreateProfile}
              />
            </div>
          )}

          {isFormSection && (
            <div className="p-5 overflow-y-auto flex-1">
              <CampaignForm
                section={nav}
                data={campaign}
                onChange={setCampaign}
                threatProfiles={threatProfiles}
                allTechniques={techniques.map((t) => ({
                  id: t.id,
                  name: t.name,
                  tactic: t.tactic,
                }))}
              />
            </div>
          )}

          {nav === "plan" && (
            <div className="flex-1 flex overflow-hidden">
              <TacticalFrame label="Operation Graph" className="flex-1 m-2 flex flex-col overflow-hidden" variant="accent">
                <div className="flex-1 min-h-0">
                  {plan?.plan ? (
                    <CampaignGraph
                      plan={plan.plan}
                      onNodeSelect={setSelectedNodeId}
                      selectedNodeId={selectedNodeId}
                    />
                  ) : physicalPlan ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
                      <EmptyGraphIllustration />
                      <p className="text-grimoire-muted text-xs text-center max-w-xs">
                        Cyber campaign graph not compiled. Physical plan is ready — view the combined operation plan in the panel.
                      </p>
                      <button onClick={generatePlan} className="grimoire-btn-primary text-xs">
                        Generate Cyber Plan
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
                      <EmptyGraphIllustration />
                      <p className="text-grimoire-muted text-xs text-center max-w-xs">
                        Compile cyber and/or physical plans to render the operation graph and combined deliverable.
                      </p>
                      <div className="flex gap-2">
                        <button onClick={generatePlan} className="grimoire-btn-primary text-xs">
                          Generate Cyber Plan
                        </button>
                        <button onClick={() => setNav("facility")} className="grimoire-btn-secondary text-xs">
                          Build Facility Map
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </TacticalFrame>
              <div className="w-[440px] overflow-hidden p-4 border-l border-grimoire-border/60 bg-grimoire-bg/30 flex flex-col min-h-0">
                <UnifiedPlanView
                  cyberPlan={plan?.plan}
                  physicalPlan={physicalPlan}
                  operationName={campaign.engagement.name}
                  onSelectTechnique={(id) => {
                    setSelectedTechniqueId(id);
                    setSelectedNodeId(null);
                  }}
                />
              </div>
            </div>
          )}

          {nav === "detection" && plan?.plan && (
            <div className="p-5 overflow-y-auto flex-1">
              <DetectionMatrix plan={plan.plan} />
            </div>
          )}

          {nav === "detection" && !plan?.plan && (
            <EmptyPanel message="Generate a plan first to view the detection matrix." />
          )}

          {nav === "report" && plan?.plan && (
            <div className="p-5 overflow-y-auto flex-1">
              <ReportExport campaign={campaign} plan={plan.plan} savedId={savedId} />
            </div>
          )}

          {nav === "report" && !plan?.plan && (
            <EmptyPanel message="Generate and save a campaign to export deliverables." />
          )}
        </main>

        {nav !== "create" && nav !== "facility" && !isFormSection && nav !== "plan" && (
          <DetailPanel
            plan={plan?.plan || null}
            selectedNodeId={selectedNodeId}
            selectedTechnique={selectedTechnique}
          />
        )}

        {nav === "plan" && (
          <DetailPanel
            plan={plan?.plan || null}
            selectedNodeId={selectedNodeId}
            selectedTechnique={selectedTechnique}
          />
        )}
      </div>
    </div>
  );
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <EmptyGraphIllustration />
        <p className="text-grimoire-muted text-xs mt-4">{message}</p>
      </div>
    </div>
  );
}
