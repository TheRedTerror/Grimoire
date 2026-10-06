from app.schemas.campaign import (
    CampaignCreate,
    CampaignEdge,
    CampaignNode,
    CampaignPhase,
    DecisionPoint,
    EngagementPlan,
    ExcludedTechnique,
    RiskAssessment,
    RiskLevel,
)
from app.services.attack import filter_techniques_for_environment, load_threat_profiles, technique_to_info


def _resolve_technique_ids(campaign: CampaignCreate) -> list[str]:
    if campaign.selected_techniques:
        return campaign.selected_techniques

    for profile in load_threat_profiles():
        if profile["name"].lower() == campaign.threat_profile.actor_name.lower():
            return profile.get("default_techniques", [])

    return ["T1087", "T1069", "T1555", "T1021", "T1078"]


def _build_phases(campaign: CampaignCreate) -> list[CampaignPhase]:
    actor = campaign.threat_profile.actor_name
    return [
        CampaignPhase(
            id="pre-engagement",
            name="Pre-Engagement",
            order=1,
            operator_intent="Establish threat model, scope, assumptions, and success criteria.",
            permitted_simulation="Documentation review, stakeholder alignment, baseline telemetry capture.",
            evidence_requirement="Signed ROE, scope document, emergency contact list.",
            expected_telemetry=["Baseline log volume", "Control inventory"],
            detection_question="Are defensive controls documented and baselined?",
        ),
        CampaignPhase(
            id="initial-position",
            name="Initial Position",
            order=2,
            operator_intent=f"Establish assumed access consistent with {actor} initial foothold patterns.",
            permitted_simulation=campaign.assumed_access.initial_privilege,
            evidence_requirement="Document initial account, endpoint, and privilege context.",
            expected_telemetry=[
                "Authentication logs",
                "Endpoint process telemetry",
                "Conditional Access evaluations",
            ],
            detection_question="Would initial assumed-access activity appear anomalous?",
        ),
        CampaignPhase(
            id="discovery",
            name="Discovery",
            order=3,
            operator_intent="Map environment, identity relationships, and privilege boundaries.",
            permitted_simulation="Authorized enumeration of lab directory and cloud tenant resources.",
            evidence_requirement="Identity relationship diagram, group membership evidence.",
            expected_telemetry=[
                "Directory enumeration events",
                "Authentication logs",
                "Cloud audit activity",
                "Endpoint process telemetry",
            ],
            detection_question="Would the SOC identify unusual identity enumeration?",
        ),
        CampaignPhase(
            id="controlled-action",
            name="Controlled Adversary Action",
            order=4,
            operator_intent="Execute authorized simulation steps aligned with threat profile behavior.",
            permitted_simulation="Synthetic accounts, designated test resources, controlled lateral movement.",
            evidence_requirement="Timestamp, operator action, endpoint, account, log/event identifiers.",
            expected_telemetry=[
                "Lateral movement indicators",
                "Credential access events",
                "Cloud role assignment changes",
            ],
            detection_question="Are simulation steps detected before objective completion?",
        ),
        CampaignPhase(
            id="objective",
            name="Objective",
            order=5,
            operator_intent=campaign.objectives.primary[0] if campaign.objectives.primary else "Reach synthetic objective.",
            permitted_simulation="Access synthetic privileged resource without production data exposure.",
            evidence_requirement="Proof of access to designated objective resource.",
            expected_telemetry=[
                "Cloud audit logs",
                "Privileged access events",
                "Data access telemetry",
            ],
            detection_question="Was objective completion prevented by defensive controls?",
        ),
        CampaignPhase(
            id="detection-review",
            name="Detection Review",
            order=6,
            operator_intent="Compare expected vs observed defensive telemetry.",
            permitted_simulation="SOC collaboration, alert review, timeline reconstruction.",
            evidence_requirement="Detection matrix completion, time-to-detection metrics.",
            expected_telemetry=["Alert history", "Incident tickets", "SIEM queries"],
            detection_question="What percentage of planned techniques generated actionable alerts?",
        ),
        CampaignPhase(
            id="lessons",
            name="Lessons Learned",
            order=7,
            operator_intent="Document attack path, detection gaps, and architectural weaknesses.",
            permitted_simulation="Debrief sessions, report generation, remediation prioritization.",
            evidence_requirement="Executive summary, operator report, purple team report.",
            expected_telemetry=[],
            detection_question="Are recommendations actionable and prioritized by business impact?",
        ),
    ]


def _build_graph(phases: list[CampaignPhase]) -> tuple[list[CampaignNode], list[CampaignEdge]]:
    nodes = []
    edges = []
    y_spacing = 120

    for i, phase in enumerate(phases):
        if phase.id in ("pre-engagement", "lessons"):
            continue
        nodes.append(CampaignNode(
            id=phase.id,
            label=phase.name,
            phase=phase.id,
            type="phase",
            position={"x": 250, "y": i * y_spacing},
        ))

    operational = [p for p in phases if p.id not in ("pre-engagement", "lessons")]
    for i in range(len(operational) - 1):
        src = operational[i]
        tgt = operational[i + 1]
        label = None
        if src.id == "discovery":
            label = "Privilege path?"
        edges.append(CampaignEdge(
            id=f"e-{src.id}-{tgt.id}",
            source=src.id,
            target=tgt.id,
            label=label,
        ))

    edges.append(CampaignEdge(
        id="e-discovery-alt",
        source="discovery",
        target="controlled-action",
        label="Alternate path",
    ))

    return nodes, edges


def _build_decision_points(campaign: CampaignCreate) -> list[DecisionPoint]:
    return [
        DecisionPoint(
            id="dp-01",
            question="Was initial assumed access validated in the lab environment?",
            yes_action="Proceed to environment discovery phase.",
            no_action="Halt engagement; reconcile access assumptions with client.",
            stop_condition="Production credentials discovered during validation.",
        ),
        DecisionPoint(
            id="dp-02",
            question="Was a viable privilege escalation path identified?",
            yes_action="Continue to controlled privilege validation.",
            no_action="Evaluate alternate authorized identity paths.",
            stop_condition="Unexpected production credential material discovered.",
        ),
        DecisionPoint(
            id="dp-03",
            question="Was the synthetic objective reached without production data exposure?",
            yes_action="Proceed to detection review and evidence collection.",
            no_action="Document control effectiveness; do not pursue further escalation.",
            stop_condition="Any access to production customer data.",
        ),
        DecisionPoint(
            id="dp-04",
            question="Did defensive controls generate alerts before objective completion?",
            yes_action="Document detection timeline and SOC response quality.",
            no_action="Flag as detection gap; prioritize in purple team report.",
            stop_condition="Production degradation detected.",
        ),
    ]


def _assess_risk(campaign: CampaignCreate) -> tuple[list[RiskAssessment], RiskLevel]:
    prohibited = [p.lower() for p in campaign.constraints.prohibited]
    has_cloud = bool(campaign.environment.cloud)
    has_identity = bool(campaign.environment.identity)

    social_disabled = any("phishing" in p for p in prohibited)
    destructive_prohibited = any("destructive" in p for p in prohibited)

    assessments = [
        RiskAssessment(
            category="Identity Testing",
            level=RiskLevel.MEDIUM if has_identity else RiskLevel.DISABLED,
        ),
        RiskAssessment(
            category="Endpoint Testing",
            level=RiskLevel.MEDIUM if campaign.environment.endpoints else RiskLevel.DISABLED,
        ),
        RiskAssessment(
            category="Cloud Testing",
            level=RiskLevel.MEDIUM if has_cloud else RiskLevel.DISABLED,
        ),
        RiskAssessment(
            category="Social Engineering",
            level=RiskLevel.DISABLED if social_disabled else RiskLevel.HIGH,
        ),
        RiskAssessment(
            category="Physical Testing",
            level=RiskLevel.DISABLED,
        ),
        RiskAssessment(
            category="Destructive Testing",
            level=RiskLevel.PROHIBITED if destructive_prohibited else RiskLevel.HIGH,
        ),
    ]

    active = [a for a in assessments if a.level in (RiskLevel.MEDIUM, RiskLevel.HIGH)]
    if any(a.level == RiskLevel.HIGH for a in active):
        overall = RiskLevel.HIGH
    elif active:
        overall = RiskLevel.MEDIUM
    else:
        overall = RiskLevel.LOW

    return assessments, overall


def generate_plan(campaign: CampaignCreate) -> EngagementPlan:
    has_cloud = bool(campaign.environment.cloud)
    has_identity = bool(campaign.environment.identity)

    technique_ids = _resolve_technique_ids(campaign)
    included, excluded_raw = filter_techniques_for_environment(
        technique_ids,
        has_cloud=has_cloud,
        has_identity=has_identity,
        prohibited=campaign.constraints.prohibited,
    )

    techniques = [technique_to_info(t) for t in included]
    excluded = [ExcludedTechnique(**e) for e in excluded_raw]

    phases = _build_phases(campaign)
    graph_nodes, graph_edges = _build_graph(phases)
    decision_points = _build_decision_points(campaign)
    risk_assessment, overall_risk = _assess_risk(campaign)

    actor = campaign.threat_profile.actor_name
    industry = campaign.organization.industry

    mission = (
        f"Evaluate whether compromise of a standard corporate workstation could "
        f"lead to privileged access in the organization's hybrid identity environment, "
        f"emulating {actor} TTPs relevant to {industry}."
    )

    threat_model = (
        f"{campaign.threat_profile.actor_type} adversary ({actor}) with "
        f"established access to one workstation. Sophistication: "
        f"{campaign.threat_profile.sophistication}."
    )

    roe = {
        "testing_window": campaign.engagement.testing_window,
        "duration_days": campaign.engagement.duration_days,
        "authorized_systems": campaign.constraints.authorized_systems,
        "explicitly_prohibited": campaign.constraints.prohibited,
        "explicitly_permitted": campaign.constraints.permitted,
        "emergency_stop_conditions": campaign.constraints.emergency_stop,
        "escalation_contact": campaign.engagement.escalation_contact,
        "evidence_handling": "All artifacts encrypted and retained for 30 days.",
    }

    detection_matrix = [
        {
            "technique": t.name,
            "technique_id": t.id,
            "endpoint": t.detection_endpoint.value,
            "identity": t.detection_identity.value,
            "network": t.detection_network.value,
            "cloud": t.detection_cloud.value,
            "detected": None,
            "alert_generated": None,
            "soc_triaged": None,
            "contained": None,
        }
        for t in techniques
    ]

    success_conditions = [
        "Synthetic objective reached or control prevented escalation",
        "All operator actions documented with evidence IDs",
        "Detection matrix completed with observed vs expected telemetry",
        "No production disruption or unauthorized data access",
        "Emergency stop conditions never triggered",
    ]

    evidence_requirements = [
        "Timestamped operator action log for each simulation step",
        "Screenshot or log export for each technique executed",
        "Identity relationship evidence (groups, roles, paths)",
        "Detection validation notes per technique",
        "Executive summary suitable for non-technical stakeholders",
    ]

    detection_validation = [
        {
            "stage": phase.name,
            "operator_goal": phase.operator_intent,
            "expected_telemetry": phase.expected_telemetry,
            "detection_question": phase.detection_question,
            "evidence_required": phase.evidence_requirement,
        }
        for phase in phases
        if phase.id not in ("pre-engagement", "lessons")
    ]

    return EngagementPlan(
        operation_name=campaign.engagement.name.upper(),
        mission=mission,
        threat_model=threat_model,
        initial_assumptions=campaign.assumed_access.assumptions,
        primary_objectives=campaign.objectives.primary,
        secondary_objectives=campaign.objectives.secondary,
        phases=phases,
        techniques=techniques,
        excluded_techniques=excluded,
        rules_of_engagement=roe,
        risk_assessment=risk_assessment,
        overall_risk=overall_risk,
        success_conditions=success_conditions,
        detection_validation=detection_validation,
        evidence_requirements=evidence_requirements,
        decision_points=decision_points,
        graph_nodes=graph_nodes,
        graph_edges=graph_edges,
        detection_matrix=detection_matrix,
    )
