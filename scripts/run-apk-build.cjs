/**
 * Android APK build - JAVA_HOME auto-set for Android Studio's bundled JDK
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const JAVA_HOME_CANDIDATES = [
  process.env.JAVA_HOME,
  'C:\\Program Files\\Android\\Android Studio\\jbr',
  'C:\\Program Files\\Android\\openjdk\\jdk-21.0.8',
  'C:\\Program Files\\Android\\Android Studio1\\jbr',
].filter(Boolean);
const isRelease = process.argv[2] === 'release';
const variant = isRelease ? 'release' : 'debug';

function resolveJavaHome() {
  for (const candidate of JAVA_HOME_CANDIDATES) {
    const javaExe = path.join(candidate, 'bin', 'java.exe');
    if (fs.existsSync(javaExe)) return candidate;
  }
  return null;
}

const JAVA_HOME = resolveJavaHome();
if (!JAVA_HOME) {
  console.error(
    'ERROR: No valid Java runtime found. Checked candidates:\n' +
      JAVA_HOME_CANDIDATES.map((p) => `- ${p}`).join('\n')
  );
  process.exit(1);
}

process.env.JAVA_HOME = JAVA_HOME;
process.env.PATH = `${path.join(JAVA_HOME, 'bin')};${process.env.PATH}`;
// Use project-local Gradle cache to avoid Windows/OneDrive file-lock issues
process.env.GRADLE_USER_HOME = path.join(__dirname, '..', 'android', '.gradle-local');

const androidDir = path.join(__dirname, '..', 'android');
const gradlew = path.join(androidDir, process.platform === 'win32' ? 'gradlew.bat' : 'gradlew');
const task = isRelease ? 'assembleRelease' : 'assembleDebug';

const child = spawn(gradlew, [task], {
  cwd: androidDir,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, JAVA_HOME },
  windowsHide: true,
});

child.on('exit', (code) => {
  if (code === 0) {
    const apkPath = `android\\app\\build\\outputs\\apk\\${variant}`;
    console.log(`\n✅ APK ready: ${apkPath}\\app-${variant}.apk`);
  }
  process.exit(code || 0);
});
