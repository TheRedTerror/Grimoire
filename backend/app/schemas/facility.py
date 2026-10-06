from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class ZoneType(str, Enum):
    PERIMETER = "perimeter"
    ENTRY = "entry"
    PUBLIC = "public"
    RESTRICTED = "restricted"
    SECURE = "secure"
    RF_ENCLOSURE = "rf_enclosure"
    NETWORK = "network"
    EXECUTIVE = "executive"
    PARKING = "parking"
    UTILITY = "utility"


class ControlType(str, Enum):
    CCTV = "cctv"
    GUARD = "guard"
    RFID = "rfid"
    LOCK = "lock"
    BIOMETRIC = "biometric"
    ALARM = "alarm"
    WIFI = "wifi"
    BLE = "ble"
    NFC = "nfc"
    MANTRAP = "mantrap"


class FacilityZone(BaseModel):
    id: str
    label: str
    zone_type: ZoneType
    floor: int = 1
    position: dict[str, float] = Field(default_factory=lambda: {"x": 0, "y": 0})
    size: dict[str, float] | None = None
    controls: list[ControlType] = Field(default_factory=list)
    assets: list[str] = Field(default_factory=list)
    notes: str = ""


class FacilityPath(BaseModel):
    id: str
    source: str
    target: str
    label: str | None = None
    authorized: bool = True


class FacilityCreate(BaseModel):
    name: str = "Target Facility Alpha"
    facility_type: str = "Corporate Office"
    address_label: str = "Lab site — synthetic"
    floors: int = 1
    zones: list[FacilityZone] = Field(default_factory=list)
    paths: list[FacilityPath] = Field(default_factory=list)
    perimeter_notes: str = ""
    authorized_hours: str = "Business hours only"


class PhysicalPhase(BaseModel):
    id: str
    name: str
    order: int
    operator_intent: str
    permitted_simulation: str
    target_zones: list[str]
    rf_considerations: list[str] = Field(default_factory=list)
    evidence_requirement: str
    detection_question: str


class PhysicalAttackPlan(BaseModel):
    facility_name: str
    facility_type: str
    mission: str
    entry_assessment: str
    movement_paths: list[dict[str, Any]]
    phases: list[PhysicalPhase]
    zone_risk_matrix: list[dict[str, Any]]
    rf_surface_summary: list[str]
    physical_roe: list[str]
    success_conditions: list[str]
    graph_nodes: list[dict[str, Any]]
    graph_edges: list[dict[str, Any]]


class FacilityPlanRequest(BaseModel):
    facility: FacilityCreate
    actor_name: str = "Unknown"
    engagement_type: str = "Physical Security Assessment"
    prohibited: list[str] = Field(default_factory=list)
    permitted: list[str] = Field(default_factory=list)
