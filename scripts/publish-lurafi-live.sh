#!/usr/bin/env bash
# Publish the configured live theme and verify mitipi.eu (alias for publish-theme-live.sh).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec "${ROOT}/scripts/publish-theme-live.sh"
