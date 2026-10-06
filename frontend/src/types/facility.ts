export type ZoneTypeId =
  | "perimeter"
  | "entry"
  | "public"
  | "restricted"
  | "secure"
  | "rf_enclosure"
  | "network"
  | "executive"
  | "parking"
  | "utility";

export type ControlTypeId =
  | "cctv"
  | "guard"
  | "rfid"
  | "lock"
  | "biometric"
  | "alarm"
  | "wifi"
  | "ble"
  | "nfc"
  | "mantrap";

export interface ZoneSize {
  width: number;
  height: number;
}

export const DEFAULT_ZONE_SIZE: ZoneSize = { width: 160, height: 88 };

export interface FacilityZone {
  id: string;
  label: string;
  zone_type: ZoneTypeId;
  floor: number;
  position: { x: number; y: number };
  size?: ZoneSize;
  controls: ControlTypeId[];
  assets: string[];
  notes: string;
}

export interface FacilityPath {
  id: string;
  source: string;
  target: string;
  label?: string | null;
  authorized: boolean;
}

export interface FacilityCreate {
  name: string;
  facility_type: string;
  address_label: string;
  floors: number;
  zones: FacilityZone[];
  paths: FacilityPath[];
  perimeter_notes: string;
  authorized_hours: string;
}

export interface PhysicalPhase {
  id: string;
  name: string;
  order: number;
  operator_intent: string;
  permitted_simulation: string;
  target_zones: string[];
  rf_considerations: string[];
  evidence_requirement: string;
  detection_question: string;
}

export interface PhysicalAttackPlan {
  facility_name: string;
  facility_type: string;
  mission: string;
  entry_assessment: string;
  movement_paths: Record<string, unknown>[];
  phases: PhysicalPhase[];
  zone_risk_matrix: Record<string, unknown>[];
  rf_surface_summary: string[];
  physical_roe: string[];
  success_conditions: string[];
  graph_nodes: Record<string, unknown>[];
  graph_edges: Record<string, unknown>[];
}

export interface ZoneTypeInfo {
  id: ZoneTypeId;
  label: string;
  description: string;
  default_controls: ControlTypeId[];
  color: string;
}

export interface FacilityTemplate {
  id: string;
  name: string;
  description: string;
}

export const DEFAULT_FACILITY: FacilityCreate = {
  name: "Target Facility Alpha",
  facility_type: "Corporate Office",
  address_label: "Lab site — synthetic coordinates",
  floors: 1,
  zones: [],
  paths: [],
  perimeter_notes: "",
  authorized_hours: "Mon–Fri 09:00–17:00 — escort required after hours",
};

export const CONTROL_LABELS: Record<ControlTypeId, string> = {
  cctv: "CCTV",
  guard: "Guard Force",
  rfid: "RFID/Badge",
  lock: "Physical Lock",
  biometric: "Biometric",
  alarm: "Alarm",
  wifi: "Wi-Fi",
  ble: "BLE",
  nfc: "NFC",
  mantrap: "Mantrap",
};
