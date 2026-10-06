from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse, PlainTextResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.campaign import Campaign
from app.schemas.campaign import CampaignCreate, CampaignListItem, CampaignResponse, EngagementPlan
from app.services.export import campaign_to_yaml, plan_to_html, plan_to_json, plan_to_markdown
from app.services.planner import generate_plan

router = APIRouter(prefix="/api/campaigns", tags=["campaigns"])


@router.get("", response_model=list[CampaignListItem])
def list_campaigns(db: Session = Depends(get_db)):
    rows = db.query(Campaign).order_by(Campaign.created_at.desc()).all()
    return [
        CampaignListItem(
            id=r.id,
            name=r.name,
            actor=r.actor,
            industry=r.industry,
            created_at=r.created_at,
        )
        for r in rows
    ]


@router.post("", response_model=CampaignResponse)
def create_campaign(payload: CampaignCreate, db: Session = Depends(get_db)):
    plan = generate_plan(payload)
    yaml_export = campaign_to_yaml(payload)

    row = Campaign(
        name=payload.engagement.name,
        actor=payload.threat_profile.actor_name,
        industry=payload.organization.industry,
        input_data=payload.model_dump(),
        plan_data=plan.model_dump(),
        yaml_export=yaml_export,
    )
    db.add(row)
    db.commit()
    db.refresh(row)

    return CampaignResponse(
        id=row.id,
        name=row.name,
        created_at=row.created_at,
        updated_at=row.updated_at,
        input_data=payload,
        plan=plan,
    )


@router.post("/preview", response_model=CampaignResponse)
def preview_campaign(payload: CampaignCreate):
    plan = generate_plan(payload)
    return CampaignResponse(
        id=0,
        name=payload.engagement.name,
        created_at=__import__("datetime").datetime.utcnow(),
        updated_at=__import__("datetime").datetime.utcnow(),
        input_data=payload,
        plan=plan,
    )


@router.get("/{campaign_id}", response_model=CampaignResponse)
def get_campaign(campaign_id: int, db: Session = Depends(get_db)):
    row = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Campaign not found")

    from app.schemas.campaign import EngagementPlan

    plan = EngagementPlan(**row.plan_data) if row.plan_data else None
    return CampaignResponse(
        id=row.id,
        name=row.name,
        created_at=row.created_at,
        updated_at=row.updated_at,
        input_data=CampaignCreate(**row.input_data),
        plan=plan,
    )


@router.delete("/{campaign_id}")
def delete_campaign(campaign_id: int, db: Session = Depends(get_db)):
    row = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Campaign not found")
    db.delete(row)
    db.commit()
    return {"status": "deleted"}


@router.post("/preview/export/html", response_class=HTMLResponse)
def preview_export_html(payload: CampaignCreate):
    plan = generate_plan(payload)
    return plan_to_html(plan, payload)


@router.post("/preview/export/markdown", response_class=PlainTextResponse)
def preview_export_markdown(payload: CampaignCreate):
    plan = generate_plan(payload)
    return plan_to_markdown(plan, payload)


@router.get("/{campaign_id}/export/html", response_class=HTMLResponse)
def export_html(campaign_id: int, db: Session = Depends(get_db)):
    row = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Campaign not found")
    plan = EngagementPlan(**row.plan_data)
    campaign = CampaignCreate(**row.input_data)
    return plan_to_html(plan, campaign, campaign_id=campaign_id)


@router.get("/{campaign_id}/export/markdown", response_class=PlainTextResponse)
def export_markdown(campaign_id: int, db: Session = Depends(get_db)):
    row = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Campaign not found")
    plan = EngagementPlan(**row.plan_data)
    campaign = CampaignCreate(**row.input_data)
    return plan_to_markdown(plan, campaign, campaign_id=campaign_id)


@router.get("/{campaign_id}/export/yaml", response_class=PlainTextResponse)
def export_yaml(campaign_id: int, db: Session = Depends(get_db)):
    row = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return row.yaml_export or campaign_to_yaml(CampaignCreate(**row.input_data))


@router.get("/{campaign_id}/export/json", response_class=PlainTextResponse)
def export_json(campaign_id: int, db: Session = Depends(get_db)):
    row = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Campaign not found")

    plan = EngagementPlan(**row.plan_data)
    return plan_to_json(plan)
