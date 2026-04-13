#!/usr/bin/env bash
# Produce `dist/` and copy web assets into `android/` for Capacitor (EAS Build only).

set -euo pipefail

if [[ "${EAS_BUILD_PLATFORM:-}" != "android" ]]; then
  exit 0
fi

echo "=====> EAS Android: vite build + cap sync"
npm run build
npx cap sync android
