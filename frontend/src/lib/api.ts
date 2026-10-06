import type {
  CampaignCreate,
  CampaignResponse,
  CustomProfileCreate,
  EngagementTemplate,
  TechniqueInfo,
  ThreatProfile,
} from "@/types/campaign";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function previewCampaign(
  data: CampaignCreate
): Promise<CampaignResponse> {
  return fetchJson("/api/campaigns/preview", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createCampaign(
  data: CampaignCreate
): Promise<CampaignResponse> {
  return fetchJson("/api/campaigns", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getTechniques(): Promise<TechniqueInfo[]> {
  return fetchJson("/api/techniques");
}

export async function getThreatProfiles(): Promise<ThreatProfile[]> {
  return fetchJson("/api/threat-profiles/all");
}

export async function getEngagementTemplates(): Promise<EngagementTemplate[]> {
  return fetchJson("/api/engagement-templates");
}

export async function createCustomProfile(
  data: CustomProfileCreate
): Promise<ThreatProfile> {
  return fetchJson("/api/threat-profiles/custom", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteCustomProfile(id: string): Promise<void> {
  await fetchJson(`/api/threat-profiles/custom/${id}`, { method: "DELETE" });
}

export function exportUrl(
  campaignId: number,
  format: "markdown" | "yaml" | "json" | "html"
) {
  return `${API_BASE}/api/campaigns/${campaignId}/export/${format}`;
}

function slugify(name: string): string {
  return name.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
}

export async function openReportPreview(
  campaign: CampaignCreate,
  savedId: number | null
): Promise<void> {
  let html: string;
  if (savedId) {
    const res = await fetch(exportUrl(savedId, "html"));
    if (!res.ok) throw new Error(await res.text());
    html = await res.text();
  } else {
    const res = await fetch(`${API_BASE}/api/campaigns/preview/export/html`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(campaign),
    });
    if (!res.ok) throw new Error(await res.text());
    html = await res.text();
  }
  const blob = new Blob([html], { type: "text/html" });
  window.open(URL.createObjectURL(blob), "_blank");
}

export async function downloadReport(
  campaign: CampaignCreate,
  format: "html" | "markdown",
  savedId: number | null
): Promise<void> {
  let content: string;
  let mime: string;
  let ext: string;

  if (savedId) {
    const res = await fetch(exportUrl(savedId, format));
    if (!res.ok) throw new Error(await res.text());
    content = await res.text();
  } else {
    const path =
      format === "html"
        ? "/api/campaigns/preview/export/html"
        : "/api/campaigns/preview/export/markdown";
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(campaign),
    });
    if (!res.ok) throw new Error(await res.text());
    content = await res.text();
  }

  mime = format === "html" ? "text/html" : "text/markdown";
  ext = format === "html" ? "html" : "md";

  const filename = `${slugify(campaign.engagement.name)}-engagement-plan.${ext}`;
  const blob = new Blob([content], { type: mime });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
