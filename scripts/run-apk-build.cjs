/**
 * Android APK build - JAVA_HOME auto-set for Android Studio's bundled JDK
 */
const { spawn } = require('child_process');
const path = require('path');

const JBR_PATH = 'C:\\Program Files\\Android\\Android Studio\\jbr';
const isRelease = process.argv[2] === 'release';
const variant = isRelease ? 'release' : 'debug';

process.env.JAVA_HOME = JBR_PATH;
process.env.PATH = `${path.join(JBR_PATH, 'bin')};${process.env.PATH}`;
// Use project-local Gradle cache to avoid Windows/OneDrive file-lock issues
process.env.GRADLE_USER_HOME = path.join(__dirname, '..', 'android', '.gradle-local');

const androidDir = path.join(__dirname, '..', 'android');
const gradlew = path.join(androidDir, process.platform === 'win32' ? 'gradlew.bat' : 'gradlew');
const task = isRelease ? 'assembleRelease' : 'assembleDebug';

const child = spawn(gradlew, [task], {
  cwd: androidDir,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, JAVA_HOME: JBR_PATH },
  windowsHide: true,
});

child.on('exit', (code) => {
  if (code === 0) {
    const apkPath = `android\\app\\build\\outputs\\apk\\${variant}`;
    console.log(`\n✅ APK ready: ${apkPath}\\app-${variant}.apk`);
  }
  process.exit(code || 0);
});
