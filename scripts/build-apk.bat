@echo off
REM Kshatr - Android APK Build (alternative: run via npm run cap:apk:debug)
REM Sets JAVA_HOME to Android Studio's bundled JDK

set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "PATH=%JAVA_HOME%\bin;%PATH%"

cd /d "%~dp0..\android"

if "%1"=="release" (
    call gradlew.bat assembleRelease
) else (
    call gradlew.bat assembleDebug
)
