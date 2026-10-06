import json
from datetime import datetime, timezone
from pathlib import Path

import yaml
from jinja2 import Environment, FileSystemLoader, select_autoescape

from app.schemas.campaign import CampaignCreate, EngagementPlan

TEMPLATE_DIR = Path(__file__).resolve().parent.parent / "templates"


def _render_context(
    plan: EngagementPlan,
    campaign: CampaignCreate,
    campaign_id: int | None = None,
) -> dict:
    return {
        "plan": plan,
        "campaign": campaign,
        "campaign_id": campaign_id,
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
    }


def _jinja_env() -> Environment:
    return Environment(
        loader=FileSystemLoader(str(TEMPLATE_DIR)),
        autoescape=select_autoescape(["html", "xml"]),
    )


def campaign_to_yaml(campaign: CampaignCreate) -> str:
    data = campaign.model_dump()
    return yaml.dump(data, default_flow_style=False, sort_keys=False, allow_unicode=True)


def plan_to_markdown(
    plan: EngagementPlan,
    campaign: CampaignCreate,
    campaign_id: int | None = None,
) -> str:
    template = _jinja_env().get_template("engagement_plan.md.j2")
    return template.render(**_render_context(plan, campaign, campaign_id))


def plan_to_html(
    plan: EngagementPlan,
    campaign: CampaignCreate,
    campaign_id: int | None = None,
) -> str:
    template = _jinja_env().get_template("engagement_plan.html.j2")
    return template.render(**_render_context(plan, campaign, campaign_id))


def plan_to_json(plan: EngagementPlan) -> str:
    return json.dumps(plan.model_dump(), indent=2, default=str)
