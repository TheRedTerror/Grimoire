# Grimoire

**Guided Red-team Intelligence Mapping, Objectives, Rules & Operational Emulation**

Grimoire is a standalone adversary emulation planning tool by [NetPhantom Security](https://netphantomsecurity.com/). It helps red team leads, purple team operators, and security consultants scope, plan, and document adversary emulation exercises — without executing attacks.

> **Planning tool only.** No C2, no agents, no recon execution, no autonomous exploitation.

---

## Features

| Module | What it does |
|--------|--------------|
| **Engagement Wizard** | Point-and-click campaign setup with 8 engagement types and 14 built-in threat actor profiles |
| **Threat Modeling** | FIN7, APT29, Scattered Spider, custom profiles, ATT&CK technique selection |
| **Facility Map** | Interactive floor plan — building-style zone cards, movement paths, physical controls, RF surfaces |
| **Operation Plan** | Unified cyber + physical plan view with integrated phase timeline |
| **Campaign Graph** | Kill chain visualization with decision points and technique nodes |
| **Detection Matrix** | Map defensive controls to operator goals and detection questions |
| **Report Export** | HTML (print-to-PDF), Markdown, YAML, JSON |

---

## Facility Map

Build a target site layout for physical security planning (authorized simulations only).

| Capability | How it works |
|------------|--------------|
| **Add zones** | Click **+ Add to Map** for Perimeter, Entry, Secure Vault, RF Enclosure, Network Closet, and more |
| **Floor plan graphics** | Each zone type renders an architectural layout (vault walls, entry door arc, server racks, parking stalls, etc.) |
| **Move** | Drag zone cards on the canvas |
| **Resize** | Select a zone and drag corner handles, or set pixel dimensions in the Zone Editor |
| **Connect paths** | Drag connector dots between zones to define movement routes |
| **Remove** | Select a zone and press **Delete** or **Backspace** |
| **Templates** | Load corporate office, retail branch, or datacenter starter layouts |
| **Compile** | Generate a physical attack plan merged into the unified Operation Plan (SEC-06) |

---

## Quick Start

```bash
git clone https://github.com/TheRedTerror/Grimoire.git
cd Grimoire
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

## Workflow

1. **New Engagement** — pick engagement type, threat actor, and objectives
2. **Facility Map** *(optional)* — build target site plan and compile physical attack plan
3. **Threat / Environment / Scope** — refine actor, target environment, ROE, and constraints
4. **Techniques** — select ATT&CK TTPs filtered by relevance
5. **Operation Plan** — unified cyber + physical deliverable with campaign graph
6. **Detection** — validate defensive coverage against the plan
7. **Report** — export deliverables for stakeholders

---

## Project Structure

```
Grimoire/
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

## Changelog

### v0.2 (current)

- Unified **Operation Plan** — cyber and physical plans in one view with integrated phase timeline
- **Facility Map** — interactive site builder with 10 zone types and floor plan graphics
- Zone **resize** (drag handles), **delete** (Del/Backspace), and **+ Add to Map** controls
- Facility templates, movement path editor, physical plan compiler
- Dark ops-console UI, engagement wizard, custom threat profiles, HTML report export

### v0.1

- Campaign creation, threat profiles, ATT&CK selection, graph, YAML/JSON export

---

## Roadmap

| Version | Features |
|---------|----------|
| **v0.2** | Facility mapping, unified plans, ops UI, custom profiles *(current)* |
| **v0.3** | Persist facility data to campaigns, physical plan in report export |
| **v0.4** | Post-operation scoring, multi-audience report generation |

---

## License

MIT — see [LICENSE](LICENSE)

**Grimoire** is an independent open-source project. It is not part of The Black Book Society or any commercial attack platform.
