import uuid

from fastapi import APIRouter

from app.schemas.facility import ControlType, FacilityCreate, FacilityPlanRequest, FacilityPath, FacilityZone, ZoneType
from app.services.facility_planner import generate_physical_plan, load_facility_templates, load_zone_types

router = APIRouter(prefix="/api/facilities", tags=["facilities"])


@router.get("/zone-types")
def list_zone_types():
    return load_zone_types()


@router.get("/templates")
def list_facility_templates():
    return load_facility_templates()


@router.post("/plan")
def create_physical_plan(req: FacilityPlanRequest):
    return generate_physical_plan(req)


@router.post("/from-template/{template_id}")
def facility_from_template(template_id: str):
    templates = load_facility_templates()
    tmpl = next((t for t in templates if t["id"] == template_id), None)
    if not tmpl:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Template not found")

    zones = []
    for i, z in enumerate(tmpl["zones"]):
        zone_id = f"zone-{i}"
        controls = [ControlType(c) for c in z.get("controls", [])]
        zones.append(FacilityZone(
            id=zone_id,
            label=z["label"],
            zone_type=ZoneType(z["zone_type"]),
            position=z.get("position", {"x": 100 + i * 120, "y": 200}),
            controls=controls,
        ))

    paths = []
    raw_paths = tmpl.get("paths") or []
    if not raw_paths and len(zones) > 1:
        for i in range(len(zones) - 1):
            paths.append(FacilityPath(
                id=f"path-{i}",
                source=zones[i].id,
                target=zones[i + 1].id,
                label="Movement",
            ))
    else:
        for i, p in enumerate(raw_paths):
            src_idx = int(p["source"].replace("zone-", "")) if "zone-" in p.get("source", "") else i
            tgt_idx = int(p["target"].replace("zone-", "")) if "zone-" in p.get("target", "") else i + 1
            if src_idx < len(zones) and tgt_idx < len(zones):
                paths.append(FacilityPath(
                    id=f"path-{i}",
                    source=zones[src_idx].id,
                    target=zones[tgt_idx].id,
                    label=p.get("label"),
                ))

    return FacilityCreate(
        name=f"{tmpl['name']} — Site Plan",
        facility_type=tmpl["name"],
        zones=zones,
        paths=paths,
    )
