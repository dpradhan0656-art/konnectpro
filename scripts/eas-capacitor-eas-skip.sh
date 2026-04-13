#!/usr/bin/env bash
# Shared guard for KonnectPro Capacitor-only EAS lifecycle hooks.
# expert-expo-app sets KONNECTPRO_EAS_EXPERT_EXPO=1 in eas.json; monorepo installs
# from the repo root must not run Java/vite/cap steps during that app's EAS build.

konnectpro_eas_should_skip_cap_hooks() {
  if [[ "${KONNECTPRO_EAS_EXPERT_EXPO:-}" == "1" ]]; then
    echo "=====> Skipping KonnectPro Capacitor EAS hook (KONNECTPRO_EAS_EXPERT_EXPO=1)"
    return 0
  fi

  local wd="${EAS_BUILD_WORKINGDIR:-${PWD:-.}}"
  if [[ "${wd}" == *"/expert-expo-app"* ]] || [[ "${wd}" == *"\\expert-expo-app"* ]]; then
    echo "=====> Skipping KonnectPro Capacitor EAS hook (EAS working directory is expert-expo-app)"
    return 0
  fi

  if [[ ! -f "capacitor.config.json" && ! -f "capacitor.config.ts" ]]; then
    echo "=====> Skipping KonnectPro Capacitor EAS hook (no capacitor.config at cwd)"
    return 0
  fi

  return 1
}
