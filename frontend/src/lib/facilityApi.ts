import type { FacilityCreate, PhysicalAttackPlan, ZoneTypeInfo } from "@/types/facility";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getZoneTypes(): Promise<ZoneTypeInfo[]> {
  return fetchJson("/api/facilities/zone-types");
}

export async function getFacilityTemplates(): Promise<
  { id: string; name: string; description: string }[]
> {
  return fetchJson("/api/facilities/templates");
}

export async function loadFacilityTemplate(templateId: string): Promise<FacilityCreate> {
  return fetchJson(`/api/facilities/from-template/${templateId}`, { method: "POST" });
}

export async function generatePhysicalPlan(
  facility: FacilityCreate,
  actorName: string,
  engagementType: string,
  prohibited: string[],
  permitted: string[]
): Promise<PhysicalAttackPlan> {
  return fetchJson("/api/facilities/plan", {
    method: "POST",
    body: JSON.stringify({
      facility,
      actor_name: actorName,
      engagement_type: engagementType,
      prohibited,
      permitted,
    }),
  });
}
