#!/usr/bin/env bash
# Capacitor 8 / AGP 8.13 require Java 21. EAS Android images ship JDK 17, so Gradle fails with:
#   invalid source release: 21
# This hook installs OpenJDK 21 and pins Gradle to use it (EAS Build only).

set -euo pipefail

if [[ "${EAS_BUILD_PLATFORM:-}" != "android" ]]; then
  exit 0
fi

echo "=====> EAS Android: installing OpenJDK 21 for Capacitor (Java 21)"

sudo apt-get update -y
sudo apt-get install -y openjdk-21-jdk

JAVA21_HOME="/usr/lib/jvm/java-21-openjdk-amd64"
if [[ ! -d "$JAVA21_HOME" ]]; then
  JAVA21_HOME="$(ls -d /usr/lib/jvm/java-21-openjdk-* 2>/dev/null | head -1 || true)"
fi

if [[ -z "${JAVA21_HOME}" || ! -d "${JAVA21_HOME}" ]]; then
  echo "=====> ERROR: Could not find OpenJDK 21 installation path."
  exit 1
fi

mkdir -p "${HOME}/.gradle"
GRADLE_PROPS="${HOME}/.gradle/gradle.properties"
touch "${GRADLE_PROPS}"

if grep -q '^org.gradle.java.home=' "${GRADLE_PROPS}" 2>/dev/null; then
  sed -i.bak "s|^org.gradle.java.home=.*|org.gradle.java.home=${JAVA21_HOME}|" "${GRADLE_PROPS}"
else
  echo "org.gradle.java.home=${JAVA21_HOME}" >> "${GRADLE_PROPS}"
fi

export JAVA_HOME="${JAVA21_HOME}"
export PATH="${JAVA_HOME}/bin:${PATH}"

echo "=====> Using JAVA_HOME=${JAVA_HOME}"
java -version
