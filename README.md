# GRIMOIRE

**Guided Red-team Intelligence Mapping, Objectives, Rules & Operational Emulation**

Standalone adversary emulation planning tool by [NetPhantom Security](https://netphantomsecurity.com/).

GRIMOIRE helps red team leads, purple team operators, and security consultants scope, plan, and document adversary emulation exercises — without executing attacks.

> **Planning tool only.** No C2, no agents, no recon execution, no autonomous exploitation.

---

## Quick Start

```bash
git clone <your-repo-url> grimoire && cd grimoire
./start.sh
```

- **App:** http://localhost:3000  
- **API:** http://localhost:8000/docs  

Or manually:

```bash
systemctl --user start podman.socket   # Kali / Podman-as-Docker
docker compose up --build
```

---

## What It Does

| Input | Output |
|-------|--------|
| Threat profile (FIN7, APT29, custom…) | Operation plan with mission & objectives |
| Environment (AD, Azure, EDR, SIEM) | ATT&CK mapping filtered by relevance |
| Objectives & constraints | Rules of engagement + risk rating |
| Technique selection | Campaign graph with decision points |
| Defensive controls | Detection matrix + evidence requirements |

**Export:** HTML report (print-to-PDF), Markdown, YAML, JSON

---

## Project Structure

```
grimoire/
├── backend/          FastAPI + PostgreSQL + Jinja2 reports
├── frontend/         Next.js 15 + React Flow
├── campaigns/        Example portable YAML campaign defs
├── docker-compose.yml
└── start.sh          Podman/Docker helper (Kali)
```

---

## Development

**Backend**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
DATABASE_URL=postgresql://grimoire:grimoire@localhost:5432/grimoire \
  uvicorn app.main:app --reload
```

**Frontend**

```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

---

## Roadmap

| Version | Features |
|---------|----------|
| **v0.1** | Campaign creation, threat profiles, ATT&CK selection, graph, export |
| **v0.2** | Engagement wizard, custom profiles, HTML reports, ops UI |
| **v0.3** | Post-operation scoring, multi-audience report generation |

---

## License

MIT — see [LICENSE](LICENSE)

**GRIMOIRE** is an independent open-source project. It is not part of The Black Book Society or any commercial attack platform.
