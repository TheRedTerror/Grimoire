from fastapi import APIRouter

from app.schemas.campaign import TechniqueInfo
from app.services.attack import load_techniques, load_threat_profiles, technique_to_info

router = APIRouter(prefix="/api", tags=["reference"])


@router.get("/techniques", response_model=list[TechniqueInfo])
def list_techniques():
    return [technique_to_info(t) for t in load_techniques()]


@router.get("/threat-profiles")
def list_threat_profiles_legacy():
    """Legacy endpoint — returns built-in profiles only."""
    return load_threat_profiles()
