#!/usr/bin/env python3
"""Import MITRE ATT&CK Enterprise techniques into attack_techniques.json."""

from __future__ import annotations

import json
import re
import sys
import urllib.request
from pathlib import Path

MITRE_URL = (
    "https://raw.githubusercontent.com/mitre/cti/master/"
    "enterprise-attack/enterprise-attack.json"
)

DATA_DIR = Path(__file__).resolve().parent.parent / "app" / "data"
OUTPUT = DATA_DIR / "attack_techniques.json"
EXISTING = OUTPUT

CLOUD_PLATFORMS = {
    "aws",
    "azure",
    "azure ad",
    "gcp",
    "google workspace",
    "office 365",
    "saas",
    "iaas",
    "cloud",
}

TACTIC_LABELS = {
    "reconnaissance": "Reconnaissance",
    "resource-development": "Resource Development",
    "initial-access": "Initial Access",
    "execution": "Execution",
    "persistence": "Persistence",
    "privilege-escalation": "Privilege Escalation",
    "defense-evasion": "Defense Evasion",
    "credential-access": "Credential Access",
    "discovery": "Discovery",
    "lateral-movement": "Lateral Movement",
    "collection": "Collection",
    "command-and-control": "Command and Control",
    "exfiltration": "Exfiltration",
    "impact": "Impact",
}

IDENTITY_KEYWORDS = re.compile(
    r"\b(account|group|domain|directory|kerberos|entra|active directory|"
    r"permission|credential|identity|samr|lsass)\b",
    re.I,
)


def fetch_stix() -> dict:
    with urllib.request.urlopen(MITRE_URL, timeout=120) as resp:
        return json.load(resp)


def mitre_id(obj: dict) -> str | None:
    for ref in obj.get("external_references", []):
        if ref.get("source_name") == "mitre-attack" and ref.get("external_id", "").startswith("T"):
            return ref["external_id"]
    return None


def primary_tactic(obj: dict) -> str:
    phases = [
        p["phase_name"]
        for p in obj.get("kill_chain_phases", [])
        if p.get("kill_chain_name") == "mitre-attack"
    ]
    if not phases:
        return "Unknown"
    return TACTIC_LABELS.get(phases[0], phases[0].replace("-", " ").title())


def infer_requires_cloud(name: str, platforms: list[str]) -> bool:
    lower_name = name.lower()
    if "cloud" in lower_name:
        return True
    normalized = {p.lower() for p in platforms}
    if normalized and normalized.issubset(CLOUD_PLATFORMS):
        return True
    return any(p.lower() in CLOUD_PLATFORMS for p in platforms) and "cloud" in lower_name


def infer_requires_identity(name: str, tactic: str, requires_cloud: bool) -> bool:
    if requires_cloud:
        return False
    identity_tactics = {
        "Discovery",
        "Credential Access",
        "Persistence",
        "Privilege Escalation",
        "Lateral Movement",
    }
    if tactic not in identity_tactics:
        return False
    return bool(IDENTITY_KEYWORDS.search(name))


def default_entry(obj: dict, existing: dict | None) -> dict:
    name = obj.get("name", "")
    tactic = primary_tactic(obj)
    platforms = obj.get("x_mitre_platforms") or []
    requires_cloud = (
        existing["requires_cloud"]
        if existing
        else infer_requires_cloud(name, platforms)
    )
    requires_identity = (
        existing["requires_identity"]
        if existing
        else infer_requires_identity(name, tactic, requires_cloud)
    )
    description = (obj.get("description") or name).strip()
    # STIX descriptions often include citation markers; trim at first newline block
    if "\n\n" in description:
        description = description.split("\n\n")[0].strip()

    return {
        "id": mitre_id(obj),
        "name": name,
        "tactic": tactic,
        "description": description[:2000],
        "detection_endpoint": existing["detection_endpoint"] if existing else "MAYBE",
        "detection_identity": existing["detection_identity"] if existing else "MAYBE",
        "detection_network": existing["detection_network"] if existing else "MAYBE",
        "detection_cloud": existing["detection_cloud"] if existing else "MAYBE",
        "requires_cloud": requires_cloud,
        "requires_identity": requires_identity,
    }


def main() -> int:
    print(f"Fetching {MITRE_URL} ...")
    bundle = fetch_stix()
    objects = bundle.get("objects", [])

    existing_by_id: dict[str, dict] = {}
    if EXISTING.exists():
        with open(EXISTING) as f:
            for row in json.load(f):
                existing_by_id[row["id"]] = row

    techniques: list[dict] = []
    skipped = 0
    for obj in objects:
        if obj.get("type") != "attack-pattern":
            continue
        if obj.get("revoked") or obj.get("x_mitre_deprecated"):
            skipped += 1
            continue
        tid = mitre_id(obj)
        if not tid:
            continue
        entry = default_entry(obj, existing_by_id.get(tid))
        if not entry["id"]:
            continue
        techniques.append(entry)

    def sort_key(t: dict) -> tuple:
        base = t["id"].split(".")[0]
        num = int(base[1:]) if base[1:].isdigit() else 0
        sub = t["id"].split(".")[1] if "." in t["id"] else ""
        return (num, sub)

    techniques.sort(key=sort_key)

    with open(OUTPUT, "w") as f:
        json.dump(techniques, f, indent=2)
        f.write("\n")

    print(f"Wrote {len(techniques)} techniques to {OUTPUT} (skipped {skipped} deprecated/revoked)")
    preserved = sum(1 for t in techniques if t["id"] in existing_by_id)
    print(f"Preserved manual fields for {preserved} existing entries")
    return 0


if __name__ == "__main__":
    sys.exit(main())
