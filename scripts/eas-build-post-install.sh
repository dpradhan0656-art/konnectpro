#!/usr/bin/env bash
# Produce `dist/` and copy web assets into `android/` for Capacitor (EAS Build only).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/eas-capacitor-eas-skip.sh
source "${SCRIPT_DIR}/eas-capacitor-eas-skip.sh"
if konnectpro_eas_should_skip_cap_hooks; then
  exit 0
fi

if [[ "${EAS_BUILD_PLATFORM:-}" != "android" ]]; then
  exit 0
fi

echo "=====> EAS Android: vite build + cap sync"
npm run build
npx cap sync android
