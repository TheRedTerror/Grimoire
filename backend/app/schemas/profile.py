from datetime import datetime

from pydantic import BaseModel, Field


class ThreatProfileBase(BaseModel):
    name: str
    aliases: list[str] = Field(default_factory=list)
    mitre_group: str | None = None
    actor_type: str
    sophistication: str
    origin: str = "Unknown"
    motivation: list[str] = Field(default_factory=list)
    target_industries: list[str] = Field(default_factory=list)
    known_behavior: list[str] = Field(default_factory=list)
    default_techniques: list[str] = Field(default_factory=list)
    description: str = ""


class CustomProfileCreate(ThreatProfileBase):
    pass


class CustomProfileResponse(ThreatProfileBase):
    id: str
    is_builtin: bool = False
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class EngagementTemplate(BaseModel):
    id: str
    name: str
    icon: str
    description: str
    duration_days: int
    primary_objectives: list[str]
    secondary_objectives: list[str]
    default_constraints_prohibited: list[str]
    default_constraints_permitted: list[str]
    suggested_actors: list[str]
