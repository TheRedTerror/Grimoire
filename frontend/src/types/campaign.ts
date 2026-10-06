export interface EngagementInput {
  name: string;
  type: string;
  duration_days: number;
  testing_window: string;
  escalation_contact: string;
}

export interface OrganizationInput {
  industry: string;
  critical_assets: string[];
}

export interface EnvironmentInput {
  identity: string[];
  endpoints: string[];
  cloud: string[];
  security_controls: string[];
}

export interface ThreatProfileInput {
  actor_name: string;
  actor_type: string;
  sophistication: string;
  known_behavior: string[];
}

export interface ObjectivesInput {
  primary: string[];
  secondary: string[];
}

export interface ConstraintsInput {
  prohibited: string[];
  permitted: string[];
  authorized_systems: string[];
  emergency_stop: string[];
}

export interface AssumedAccessInput {
  initial_privilege: string;
  initial_system: string;
  identity_context: string;
  assumptions: string[];
}

export interface CampaignCreate {
  engagement: EngagementInput;
  organization: OrganizationInput;
  environment: EnvironmentInput;
  threat_profile: ThreatProfileInput;
  objectives: ObjectivesInput;
  constraints: ConstraintsInput;
  assumed_access: AssumedAccessInput;
  selected_techniques: string[];
}

export interface TechniqueInfo {
  id: string;
  name: string;
  tactic: string;
  description: string;
  detection_endpoint: string;
  detection_identity: string;
  detection_network: string;
  detection_cloud: string;
}

export interface CampaignPhase {
  id: string;
  name: string;
  order: number;
  operator_intent: string;
  permitted_simulation: string;
  evidence_requirement: string;
  expected_telemetry: string[];
  detection_question: string;
}

export interface DecisionPoint {
  id: string;
  question: string;
  yes_action: string;
  no_action: string;
  stop_condition: string;
}

export interface CampaignNode {
  id: string;
  label: string;
  phase: string;
  type: string;
  position: { x: number; y: number };
}

export interface CampaignEdge {
  id: string;
  source: string;
  target: string;
  label?: string | null;
}

export interface RiskAssessment {
  category: string;
  level: string;
}

export interface ExcludedTechnique {
  technique_id: string;
  technique_name: string;
  reason: string;
}

export interface EngagementPlan {
  operation_name: string;
  mission: string;
  threat_model: string;
  initial_assumptions: string[];
  primary_objectives: string[];
  secondary_objectives: string[];
  phases: CampaignPhase[];
  techniques: TechniqueInfo[];
  excluded_techniques: ExcludedTechnique[];
  rules_of_engagement: Record<string, unknown>;
  risk_assessment: RiskAssessment[];
  overall_risk: string;
  success_conditions: string[];
  detection_validation: Record<string, unknown>[];
  evidence_requirements: string[];
  decision_points: DecisionPoint[];
  graph_nodes: CampaignNode[];
  graph_edges: CampaignEdge[];
  detection_matrix: Record<string, unknown>[];
}

export interface CampaignResponse {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  input_data: CampaignCreate;
  plan: EngagementPlan | null;
}

export interface ThreatProfile {
  id: string;
  name: string;
  aliases: string[];
  mitre_group: string | null;
  actor_type: string;
  sophistication: string;
  origin: string;
  motivation: string[];
  target_industries: string[];
  known_behavior: string[];
  default_techniques: string[];
  description: string;
  is_builtin: boolean;
  created_at?: string;
}

export interface EngagementTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  duration_days: number;
  primary_objectives: string[];
  secondary_objectives: string[];
  default_constraints_prohibited: string[];
  default_constraints_permitted: string[];
  suggested_actors: string[];
}

export interface CustomProfileCreate {
  name: string;
  aliases: string[];
  mitre_group: string | null;
  actor_type: string;
  sophistication: string;
  origin: string;
  motivation: string[];
  target_industries: string[];
  known_behavior: string[];
  default_techniques: string[];
  description: string;
}

export type NavSection =
  | "create"
  | "facility"
  | "threat"
  | "environment"
  | "objectives"
  | "scope"
  | "techniques"
  | "plan"
  | "detection"
  | "report";

export const INDUSTRIES = [
  "Financial Services",
  "Healthcare",
  "Technology",
  "Government",
  "Energy",
  "Retail",
  "Manufacturing",
  "Telecommunications",
  "Critical Infrastructure",
  "Legal",
  "Education",
];

export const ENVIRONMENT_PRESETS: Record<string, Partial<EnvironmentInput>> = {
  "Hybrid Windows + Azure": {
    identity: ["Active Directory", "Entra ID"],
    endpoints: ["Windows 11", "Windows Server"],
    cloud: ["Azure"],
    security_controls: ["Microsoft Defender for Endpoint", "Sentinel", "Conditional Access"],
  },
  "Cloud-Only SaaS": {
    identity: ["Entra ID", "Okta"],
    endpoints: ["macOS", "Windows 11"],
    cloud: ["Azure", "AWS", "Google Workspace"],
    security_controls: ["CrowdStrike Falcon", "Cloud SIEM", "CASB"],
  },
  "On-Prem AD": {
    identity: ["Active Directory"],
    endpoints: ["Windows 11", "Windows Server"],
    cloud: [],
    security_controls: ["Defender for Endpoint", "On-prem SIEM", "Group Policy"],
  },
  "OT / ICS Adjacent": {
    identity: ["Active Directory"],
    endpoints: ["Windows Server", "Engineering Workstations"],
    cloud: ["Azure"],
    security_controls: ["Network segmentation", "OT monitoring", "Jump hosts"],
  },
};

export const DEFAULT_CAMPAIGN: CampaignCreate = {
  engagement: {
    name: "Operation Glasshouse",
    type: "Adversary Emulation",
    duration_days: 5,
    testing_window: "Monday–Friday 09:00–17:00 ET",
    escalation_contact: "Engagement Lead",
  },
  organization: {
    industry: "Financial Services",
    critical_assets: ["Customer data", "Payment systems", "Identity infrastructure"],
  },
  environment: {
    identity: ["Active Directory", "Entra ID"],
    endpoints: ["Windows 11", "Windows Server"],
    cloud: ["Azure"],
    security_controls: [
      "Microsoft Defender for Endpoint",
      "Sentinel",
      "Conditional Access",
    ],
  },
  threat_profile: {
    actor_name: "FIN7",
    actor_type: "Financially motivated",
    sophistication: "High",
    known_behavior: [
      "Credential theft",
      "Remote access",
      "Cloud identity abuse",
      "Data exfiltration",
    ],
  },
  objectives: {
    primary: [
      "Demonstrate whether privileged cloud access can be reached from a compromised workstation",
    ],
    secondary: [
      "Evaluate identity segmentation",
      "Measure detection coverage",
      "Validate escalation paths",
      "Assess response workflow",
    ],
  },
  constraints: {
    prohibited: [
      "Production disruption",
      "Destructive actions",
      "Real customer data access",
      "External phishing",
      "Persistence beyond engagement end",
    ],
    permitted: [
      "Lab accounts",
      "Synthetic credentials",
      "Controlled lateral movement",
      "Non-destructive persistence testing",
    ],
    authorized_systems: [
      "192.168.50.0/24",
      "lab.contoso.example",
      "Tenant test resources",
    ],
    emergency_stop: [
      "Production degradation",
      "Unexpected sensitive-data exposure",
      "Security incident unrelated to engagement",
      "Testing outside authorized scope",
    ],
  },
  assumed_access: {
    initial_privilege: "Low-privilege domain account",
    initial_system: "Managed corporate workstation",
    identity_context: "Hybrid AD + Entra ID",
    assumptions: [
      "Valid low-privilege domain account",
      "Access to one managed endpoint",
      "No administrative privileges",
      "Defender for Endpoint active",
      "Conditional Access enabled",
    ],
  },
  selected_techniques: [],
};

export function buildCampaignFromSelection(
  template: EngagementTemplate,
  profile: ThreatProfile,
  industry: string,
  envPreset: string,
  operationName?: string
): CampaignCreate {
  const env = ENVIRONMENT_PRESETS[envPreset] || ENVIRONMENT_PRESETS["Hybrid Windows + Azure"];
  const opName =
    operationName ||
    `Operation ${profile.name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12)}`;

  return {
    ...DEFAULT_CAMPAIGN,
    engagement: {
      ...DEFAULT_CAMPAIGN.engagement,
      name: opName,
      type: template.name,
      duration_days: template.duration_days,
    },
    organization: {
      industry,
      critical_assets: DEFAULT_CAMPAIGN.organization.critical_assets,
    },
    environment: {
      identity: env.identity || DEFAULT_CAMPAIGN.environment.identity,
      endpoints: env.endpoints || DEFAULT_CAMPAIGN.environment.endpoints,
      cloud: env.cloud ?? DEFAULT_CAMPAIGN.environment.cloud,
      security_controls:
        env.security_controls || DEFAULT_CAMPAIGN.environment.security_controls,
    },
    threat_profile: {
      actor_name: profile.name,
      actor_type: profile.actor_type,
      sophistication: profile.sophistication,
      known_behavior: [...profile.known_behavior],
    },
    objectives: {
      primary: [...template.primary_objectives],
      secondary: [...template.secondary_objectives],
    },
    constraints: {
      ...DEFAULT_CAMPAIGN.constraints,
      prohibited: [
        ...new Set([
          ...template.default_constraints_prohibited,
          ...DEFAULT_CAMPAIGN.constraints.prohibited,
        ]),
      ],
      permitted: [
        ...new Set([
          ...template.default_constraints_permitted,
          ...DEFAULT_CAMPAIGN.constraints.permitted,
        ]),
      ],
    },
    selected_techniques: [...profile.default_techniques],
  };
}
