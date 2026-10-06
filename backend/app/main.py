from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import campaigns, facilities, profiles, techniques


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="GRIMOIRE",
    description="Guided Red-team Intelligence Mapping, Objectives, Rules & Operational Emulation",
    version="0.1.0",
    lifespan=lifespan,
)

origins = [o.strip() for o in settings.cors_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(campaigns.router)
app.include_router(techniques.router)
app.include_router(profiles.router)
app.include_router(facilities.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "grimoire", "version": "0.1.0"}
