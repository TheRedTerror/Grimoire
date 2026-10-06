import json
from pathlib import Path

from app.schemas.campaign import DetectionCoverage, TechniqueInfo

DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def load_techniques() -> list[dict]:
    with open(DATA_DIR / "attack_techniques.json") as f:
        return json.load(f)


def load_threat_profiles() -> list[dict]:
    with open(DATA_DIR / "threat_profiles.json") as f:
        return json.load(f)


def get_technique_by_id(technique_id: str) -> dict | None:
    for t in load_techniques():
        if t["id"] == technique_id:
            return t
    return None


def technique_to_info(tech: dict) -> TechniqueInfo:
    return TechniqueInfo(
        id=tech["id"],
        name=tech["name"],
        tactic=tech["tactic"],
        description=tech["description"],
        detection_endpoint=DetectionCoverage(tech["detection_endpoint"]),
        detection_identity=DetectionCoverage(tech["detection_identity"]),
        detection_network=DetectionCoverage(tech["detection_network"]),
        detection_cloud=DetectionCoverage(tech["detection_cloud"]),
    )


def filter_techniques_for_environment(
    technique_ids: list[str],
    has_cloud: bool,
    has_identity: bool,
    prohibited: list[str],
) -> tuple[list[dict], list[dict]]:
    """Return (included, excluded) techniques based on environment relevance."""
    included = []
    excluded = []

    phishing_prohibited = any(
        "phishing" in p.lower() for p in prohibited
    )

    for tid in technique_ids:
        tech = get_technique_by_id(tid)
        if not tech:
            continue

        if tech.get("requires_cloud") and not has_cloud:
            excluded.append({
                "technique_id": tid,
                "technique_name": tech["name"],
                "reason": "Target environment does not contain relevant cloud services.",
            })
            continue

        if tech.get("requires_identity") and not has_identity:
            excluded.append({
                "technique_id": tid,
                "technique_name": tech["name"],
                "reason": "Target environment does not contain relevant identity infrastructure.",
            })
            continue

        if tech["id"] == "T1566" and phishing_prohibited:
            excluded.append({
                "technique_id": tid,
                "technique_name": tech["name"],
                "reason": "External phishing explicitly prohibited by engagement constraints.",
            })
            continue

        if tech["id"] == "T1486" and any(
            "destructive" in p.lower() for p in prohibited
        ):
            excluded.append({
                "technique_id": tid,
                "technique_name": tech["name"],
                "reason": "Destructive impact techniques prohibited by engagement constraints.",
            })
            continue

        included.append(tech)

    return included, excluded
