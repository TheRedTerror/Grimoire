import json
import re
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.custom_profile import CustomThreatProfile
from app.schemas.profile import CustomProfileCreate, CustomProfileResponse, EngagementTemplate
from app.services.attack import load_techniques, load_threat_profiles

router = APIRouter(prefix="/api", tags=["profiles"])

DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def _slugify(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return slug or str(uuid.uuid4())[:8]


def _builtin_to_response(p: dict) -> CustomProfileResponse:
    return CustomProfileResponse(
        id=p["id"],
        name=p["name"],
        aliases=p.get("aliases", []),
        mitre_group=p.get("mitre_group"),
        actor_type=p["actor_type"],
        sophistication=p["sophistication"],
        origin=p.get("origin", "Unknown"),
        motivation=p.get("motivation", []),
        target_industries=p.get("target_industries", []),
        known_behavior=p["known_behavior"],
        default_techniques=p["default_techniques"],
        description=p["description"],
        is_builtin=True,
    )


def _custom_to_response(row: CustomThreatProfile) -> CustomProfileResponse:
    return CustomProfileResponse(
        id=row.id,
        name=row.name,
        aliases=row.aliases or [],
        mitre_group=row.mitre_group,
        actor_type=row.actor_type,
        sophistication=row.sophistication,
        origin=row.origin,
        motivation=row.motivation or [],
        target_industries=row.target_industries or [],
        known_behavior=row.known_behavior or [],
        default_techniques=row.default_techniques or [],
        description=row.description,
        is_builtin=False,
        created_at=row.created_at,
    )


@router.get("/engagement-templates", response_model=list[EngagementTemplate])
def list_engagement_templates():
    with open(DATA_DIR / "engagement_templates.json") as f:
        return json.load(f)


@router.get("/threat-profiles/all", response_model=list[CustomProfileResponse])
def list_all_profiles(db: Session = Depends(get_db)):
    builtin = [_builtin_to_response(p) for p in load_threat_profiles()]
    custom = [_custom_to_response(r) for r in db.query(CustomThreatProfile).all()]
    return builtin + custom


@router.get("/threat-profiles/{profile_id}", response_model=CustomProfileResponse)
def get_profile(profile_id: str, db: Session = Depends(get_db)):
    for p in load_threat_profiles():
        if p["id"] == profile_id:
            return _builtin_to_response(p)
    row = db.query(CustomThreatProfile).filter(CustomThreatProfile.id == profile_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Profile not found")
    return _custom_to_response(row)


@router.post("/threat-profiles/custom", response_model=CustomProfileResponse)
def create_custom_profile(payload: CustomProfileCreate, db: Session = Depends(get_db)):
    valid_ids = {t["id"] for t in load_techniques()}
    invalid = [t for t in payload.default_techniques if t not in valid_ids]
    if invalid:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown technique IDs: {', '.join(invalid)}",
        )

    profile_id = _slugify(payload.name)
    existing = db.query(CustomThreatProfile).filter(CustomThreatProfile.id == profile_id).first()
    if existing:
        profile_id = f"{profile_id}-{str(uuid.uuid4())[:6]}"

    row = CustomThreatProfile(
        id=profile_id,
        name=payload.name,
        aliases=payload.aliases,
        mitre_group=payload.mitre_group,
        actor_type=payload.actor_type,
        sophistication=payload.sophistication,
        origin=payload.origin,
        motivation=payload.motivation,
        target_industries=payload.target_industries,
        known_behavior=payload.known_behavior,
        default_techniques=payload.default_techniques,
        description=payload.description,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _custom_to_response(row)


@router.put("/threat-profiles/custom/{profile_id}", response_model=CustomProfileResponse)
def update_custom_profile(
    profile_id: str, payload: CustomProfileCreate, db: Session = Depends(get_db)
):
    row = db.query(CustomThreatProfile).filter(CustomThreatProfile.id == profile_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Custom profile not found")

    row.name = payload.name
    row.aliases = payload.aliases
    row.mitre_group = payload.mitre_group
    row.actor_type = payload.actor_type
    row.sophistication = payload.sophistication
    row.origin = payload.origin
    row.motivation = payload.motivation
    row.target_industries = payload.target_industries
    row.known_behavior = payload.known_behavior
    row.default_techniques = payload.default_techniques
    row.description = payload.description
    db.commit()
    db.refresh(row)
    return _custom_to_response(row)


@router.delete("/threat-profiles/custom/{profile_id}")
def delete_custom_profile(profile_id: str, db: Session = Depends(get_db)):
    row = db.query(CustomThreatProfile).filter(CustomThreatProfile.id == profile_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Custom profile not found")
    db.delete(row)
    db.commit()
    return {"status": "deleted", "id": profile_id}
