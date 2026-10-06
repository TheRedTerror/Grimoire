from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    DISABLED = "DISABLED"
    PROHIBITED = "PROHIBITED"


class DetectionCoverage(str, Enum):
    YES = "YES"
    NO = "NO"
    MAYBE = "MAYBE"


class EngagementInput(BaseModel):
    name: str = "Operation Glasshouse"
    type: str = "Adversary Emulation"
    duration_days: int = 5
    testing_window: str = "Monday–Friday 09:00–17:00 ET"
    escalation_contact: str = "Engagement Lead"


class OrganizationInput(BaseModel):
    industry: str = "Financial Services"
    critical_assets: list[str] = Field(default_factory=lambda: [
        "Customer data", "Payment systems", "Identity infrastructure"
    ])


class EnvironmentInput(BaseModel):
    identity: list[str] = Field(default_factory=lambda: ["Active Directory", "Entra ID"])
    endpoints: list[str] = Field(default_factory=lambda: ["Windows 11", "Windows Server"])
    cloud: list[str] = Field(default_factory=lambda: ["Azure"])
    security_controls: list[str] = Field(default_factory=lambda: [
        "Microsoft Defender for Endpoint", "Sentinel", "Conditional Access"
    ])


class ThreatProfileInput(BaseModel):
    actor_name: str = "FIN7"
    actor_type: str = "Financially motivated"
    sophistication: str = "High"
    known_behavior: list[str] = Field(default_factory=lambda: [
        "Credential theft", "Remote access", "Cloud identity abuse", "Data exfiltration"
    ])


class ObjectivesInput(BaseModel):
    primary: list[str] = Field(default_factory=lambda: [
        "Demonstrate whether privileged cloud access can be reached from a compromised workstation"
    ])
    secondary: list[str] = Field(default_factory=lambda: [
        "Evaluate identity segmentation",
        "Measure detection coverage",
        "Validate escalation paths",
        "Assess response workflow",
    ])


class ConstraintsInput(BaseModel):
    prohibited: list[str] = Field(default_factory=lambda: [
        "Production disruption",
        "Destructive actions",
        "Real customer data access",
        "External phishing",
        "Persistence beyond engagement end",
    ])
    permitted: list[str] = Field(default_factory=lambda: [
        "Lab accounts",
        "Synthetic credentials",
        "Controlled lateral movement",
        "Non-destructive persistence testing",
    ])
    authorized_systems: list[str] = Field(default_factory=lambda: [
        "192.168.50.0/24", "lab.contoso.example", "Tenant test resources"
    ])
    emergency_stop: list[str] = Field(default_factory=lambda: [
        "Production degradation",
        "Unexpected sensitive-data exposure",
        "Security incident unrelated to engagement",
        "Testing outside authorized scope",
    ])


class AssumedAccessInput(BaseModel):
    initial_privilege: str = "Low-privilege domain account"
    initial_system: str = "Managed corporate workstation"
    identity_context: str = "Hybrid AD + Entra ID"
    assumptions: list[str] = Field(default_factory=lambda: [
        "Valid low-privilege domain account",
        "Access to one managed endpoint",
        "No administrative privileges",
        "Defender for Endpoint active",
        "Conditional Access enabled",
    ])


class CampaignCreate(BaseModel):
    engagement: EngagementInput = Field(default_factory=EngagementInput)
    organization: OrganizationInput = Field(default_factory=OrganizationInput)
    environment: EnvironmentInput = Field(default_factory=EnvironmentInput)
    threat_profile: ThreatProfileInput = Field(default_factory=ThreatProfileInput)
    objectives: ObjectivesInput = Field(default_factory=ObjectivesInput)
    constraints: ConstraintsInput = Field(default_factory=ConstraintsInput)
    assumed_access: AssumedAccessInput = Field(default_factory=AssumedAccessInput)
    selected_techniques: list[str] = Field(default_factory=list)


class TechniqueInfo(BaseModel):
    id: str
    name: str
    tactic: str
    description: str
    detection_endpoint: DetectionCoverage = DetectionCoverage.NO
    detection_identity: DetectionCoverage = DetectionCoverage.NO
    detection_network: DetectionCoverage = DetectionCoverage.NO
    detection_cloud: DetectionCoverage = DetectionCoverage.NO


class CampaignPhase(BaseModel):
    id: str
    name: str
    order: int
    operator_intent: str
    permitted_simulation: str
    evidence_requirement: str
    expected_telemetry: list[str]
    detection_question: str


class DecisionPoint(BaseModel):
    id: str
    question: str
    yes_action: str
    no_action: str
    stop_condition: str


class CampaignNode(BaseModel):
    id: str
    label: str
    phase: str
    type: str = "phase"
    position: dict[str, float] = Field(default_factory=dict)


class CampaignEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str | None = None


class RiskAssessment(BaseModel):
    category: str
    level: RiskLevel


class ExcludedTechnique(BaseModel):
    technique_id: str
    technique_name: str
    reason: str


class EngagementPlan(BaseModel):
    operation_name: str
    mission: str
    threat_model: str
    initial_assumptions: list[str]
    primary_objectives: list[str]
    secondary_objectives: list[str]
    phases: list[CampaignPhase]
    techniques: list[TechniqueInfo]
    excluded_techniques: list[ExcludedTechnique]
    rules_of_engagement: dict[str, Any]
    risk_assessment: list[RiskAssessment]
    overall_risk: RiskLevel
    success_conditions: list[str]
    detection_validation: list[dict[str, Any]]
    evidence_requirements: list[str]
    decision_points: list[DecisionPoint]
    graph_nodes: list[CampaignNode]
    graph_edges: list[CampaignEdge]
    detection_matrix: list[dict[str, Any]]


class CampaignResponse(BaseModel):
    id: int
    name: str
    created_at: datetime
    updated_at: datetime
    input_data: CampaignCreate
    plan: EngagementPlan | None = None

    model_config = {"from_attributes": True}


class CampaignListItem(BaseModel):
    id: int
    name: str
    actor: str
    industry: str
    created_at: datetime

    model_config = {"from_attributes": True}
