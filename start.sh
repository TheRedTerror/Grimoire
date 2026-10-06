#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

# Podman emulates Docker on Kali — socket must be running first
if command -v podman >/dev/null 2>&1; then
  systemctl --user start podman.socket 2>/dev/null || true
fi

echo "Starting GRIMOIRE..."
docker compose up --build "$@"
