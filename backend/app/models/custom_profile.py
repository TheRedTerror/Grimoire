from datetime import datetime

from sqlalchemy import JSON, DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class CustomThreatProfile(Base):
    __tablename__ = "custom_threat_profiles"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(128), index=True)
    aliases: Mapped[list] = mapped_column(JSON, default=list)
    mitre_group: Mapped[str | None] = mapped_column(String(32), nullable=True)
    actor_type: Mapped[str] = mapped_column(String(128))
    sophistication: Mapped[str] = mapped_column(String(64))
    origin: Mapped[str] = mapped_column(String(256), default="Unknown")
    motivation: Mapped[list] = mapped_column(JSON, default=list)
    target_industries: Mapped[list] = mapped_column(JSON, default=list)
    known_behavior: Mapped[list] = mapped_column(JSON, default=list)
    default_techniques: Mapped[list] = mapped_column(JSON, default=list)
    description: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
