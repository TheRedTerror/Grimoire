import json
from pathlib import Path

from app.schemas.facility import (
    ControlType,
    FacilityCreate,
    FacilityPlanRequest,
    PhysicalAttackPlan,
    PhysicalPhase,
    ZoneType,
)

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

RF_CONTROLS = {ControlType.WIFI, ControlType.BLE, ControlType.NFC, ControlType.RFID}


def _zone_risk(zone_type: ZoneType, control_count: int) -> str:
    base = {
        ZoneType.PERIMETER: "LOW",
        ZoneType.PARKING: "LOW",
        ZoneType.PUBLIC: "LOW",
        ZoneType.ENTRY: "MEDIUM",
        ZoneType.RESTRICTED: "MEDIUM",
        ZoneType.UTILITY: "MEDIUM",
        ZoneType.NETWORK: "HIGH",
        ZoneType.EXECUTIVE: "HIGH",
        ZoneType.RF_ENCLOSURE: "HIGH",
        ZoneType.SECURE: "CRITICAL",
    }.get(zone_type, "MEDIUM")
    if control_count >= 4 and base in ("MEDIUM", "HIGH"):
        return {"MEDIUM": "LOW", "HIGH": "MEDIUM"}.get(base, base)
    if control_count <= 1 and base in ("LOW", "MEDIUM"):
        return {"LOW": "MEDIUM", "MEDIUM": "HIGH"}.get(base, base)
    return base


def generate_physical_plan(req: FacilityPlanRequest) -> PhysicalAttackPlan:
    facility = req.facility
    zones = facility.zones

    entry_zones = [z for z in zones if z.zone_type in (ZoneType.ENTRY, ZoneType.PERIMETER, ZoneType.PARKING)]
    secure_zones = [z for z in zones if z.zone_type in (ZoneType.SECURE, ZoneType.EXECUTIVE, ZoneType.NETWORK, ZoneType.RF_ENCLOSURE)]
    rf_zones = [z for z in zones if any(c in RF_CONTROLS for c in z.controls) or z.zone_type == ZoneType.RF_ENCLOSURE]

    entry_label = entry_zones[0].label if entry_zones else "Designated entry point"
    objective_label = secure_zones[0].label if secure_zones else "Designated objective zone"

    mission = (
        f"Assess whether an adversary emulating {req.actor_name} could reach "
        f"'{objective_label}' at {facility.name} ({facility.facility_type}) "
        f"through authorized physical simulation — without unauthorized entry, "
        f"covert surveillance of non-participants, or production disruption."
    )

    entry_assessment = (
        f"Primary entry vector: {entry_label}. "
        f"Authorized hours: {facility.authorized_hours}. "
        f"{facility.perimeter_notes or 'Perimeter controls to be validated during pre-engagement walkthrough.'}"
    )

    movement_paths = []
    for path in facility.paths:
        src = next((z for z in zones if z.id == path.source), None)
        tgt = next((z for z in zones if z.id == path.target), None)
        if src and tgt:
            movement_paths.append({
                "from": src.label,
                "to": tgt.label,
                "label": path.label or "Movement",
                "authorized": path.authorized,
                "controls_crossed": list(set(src.controls + tgt.controls)),
            })

    if not movement_paths and len(zones) >= 2:
        sorted_z = sorted(zones, key=lambda z: z.position.get("x", 0))
        for i in range(len(sorted_z) - 1):
            movement_paths.append({
                "from": sorted_z[i].label,
                "to": sorted_z[i + 1].label,
                "label": "Inferred path",
                "authorized": True,
                "controls_crossed": list(set(sorted_z[i].controls + sorted_z[i + 1].controls)),
            })

    phases = [
        PhysicalPhase(
            id="phys-pre",
            name="Pre-Engagement & Pattern-of-Life",
            order=1,
            operator_intent="Document baseline security posture, guard routines, and RF emissions inventory.",
            permitted_simulation="Open-source observation, authorized walkthrough, RF spectrum baseline in lab.",
            target_zones=[z.label for z in entry_zones[:2]],
            rf_considerations=["Wi-Fi/BLE enumeration from public boundary only"],
            evidence_requirement="Facility map, control inventory, baseline RF log.",
            detection_question="Would pre-engagement activity appear anomalous?",
        ),
        PhysicalPhase(
            id="phys-approach",
            name="Approach & Timing",
            order=2,
            operator_intent="Validate approach paths and timing windows against authorized ROE.",
            permitted_simulation="Staged approach during testing window with engagement lead present.",
            target_zones=[z.label for z in entry_zones],
            rf_considerations=["Parking garage AP exposure", "BLE beacon leakage at perimeter"],
            evidence_requirement="Timestamped approach log, photos of control placement.",
            detection_question="Would guard force or CCTV identify unauthorized approach?",
        ),
        PhysicalPhase(
            id="phys-entry",
            name="Entry Validation",
            order=3,
            operator_intent=f"Test entry control effectiveness at {entry_label} using authorized methods only.",
            permitted_simulation="Synthetic credentials, authorized tailgating simulation, lock bypass in lab replica.",
            target_zones=[z.label for z in entry_zones],
            rf_considerations=["RFID/NFC reader capture in controlled scope", "Badge clone against test card only"],
            evidence_requirement="Entry attempt log, control bypass evidence (lab only).",
            detection_question="Was entry attempt detected and responded to?",
        ),
        PhysicalPhase(
            id="phys-movement",
            name="Internal Movement",
            order=4,
            operator_intent="Map authorized movement through restricted zones toward objective.",
            permitted_simulation="Escorted or badged movement through designated paths only.",
            target_zones=[p["to"] for p in movement_paths] if movement_paths else [z.label for z in zones if z.zone_type == ZoneType.RESTRICTED],
            rf_considerations=["Cross-zone Wi-Fi roaming", "Internal BLE mesh exposure"],
            evidence_requirement="Zone transition log with timestamps and escort confirmation.",
            detection_question="Were unauthorized zone transitions detected?",
        ),
        PhysicalPhase(
            id="phys-objective",
            name="Objective Access",
            order=5,
            operator_intent=f"Validate access controls protecting {objective_label}.",
            permitted_simulation="Synthetic objective proof — no production asset access.",
            target_zones=[z.label for z in secure_zones],
            rf_considerations=[f"RF trust boundary at {z.label}" for z in rf_zones[:3]],
            evidence_requirement="Proof of boundary reach without production compromise.",
            detection_question="Did physical controls prevent objective reach?",
        ),
        PhysicalPhase(
            id="phys-egress",
            name="Egress & Detection Review",
            order=6,
            operator_intent="Document egress path and compare expected vs observed detections.",
            permitted_simulation="Controlled egress during testing window, debrief with security team.",
            target_zones=[entry_label],
            rf_considerations=[],
            evidence_requirement="Egress timeline, detection matrix completion.",
            detection_question="Was full chain detected before objective completion?",
        ),
    ]

    zone_risk_matrix = [
        {
            "zone": z.label,
            "type": z.zone_type.value,
            "controls": [c.value for c in z.controls],
            "assets": z.assets,
            "risk": _zone_risk(z.zone_type, len(z.controls)),
            "rf_exposed": any(c in RF_CONTROLS for c in z.controls),
        }
        for z in zones
    ]

    rf_surface = []
    for z in rf_zones:
        rf_controls = [c.value for c in z.controls if c in RF_CONTROLS]
        if rf_controls:
            rf_surface.append(f"{z.label}: {', '.join(rf_controls)}")

    physical_roe = list(req.permitted) + [
        "All activity during authorized testing window",
        "Engagement lead or client escort present for restricted zones",
        "No surveillance of non-participating personnel",
        "No bypass of production locks without lab replica",
        "RF capture limited to authorized spectrum logging",
    ]
    for p in req.prohibited:
        if p not in physical_roe:
            physical_roe.insert(0, f"PROHIBITED: {p}")

    success = [
        "All movement documented with zone timestamps",
        "RF surface inventory completed for wireless-adjacent zones",
        "No unauthorized access to production assets",
        "Detection review completed with physical security team",
        "Emergency stop conditions never triggered",
    ]

    graph_nodes = [
        {"id": z.id, "label": z.label, "zone_type": z.zone_type.value, "position": z.position}
        for z in zones
    ]
    graph_edges = [
        {"id": p.id, "source": p.source, "target": p.target, "label": p.label}
        for p in facility.paths
    ]

    return PhysicalAttackPlan(
        facility_name=facility.name,
        facility_type=facility.facility_type,
        mission=mission,
        entry_assessment=entry_assessment,
        movement_paths=movement_paths,
        phases=phases,
        zone_risk_matrix=zone_risk_matrix,
        rf_surface_summary=rf_surface or ["No RF-adjacent zones defined — add controls to network/RF zones."],
        physical_roe=physical_roe,
        success_conditions=success,
        graph_nodes=graph_nodes,
        graph_edges=graph_edges,
    )


def load_zone_types() -> list[dict]:
    with open(DATA_DIR / "zone_types.json") as f:
        return json.load(f)


def load_facility_templates() -> list[dict]:
    with open(DATA_DIR / "facility_templates.json") as f:
        return json.load(f)
