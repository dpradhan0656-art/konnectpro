/**
 * Android APK build — pick JDK 21+ (Capacitor 8 / AGP require Java 21).
 * Ignores JAVA_HOME when it points to an older JDK (fixes "invalid source release: 21").
 */
const { spawn, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const MIN_JAVA_MAJOR = 21;

const isRelease = process.argv[2] === 'release';
const variant = isRelease ? 'release' : 'debug';

function parseJavaMajor(verStr) {
  const m = /(?:openjdk|java) version "(\d+)/i.exec(verStr);
  if (!m) return 0;
  if (m[1] === '1') {
    const m2 = /version "1\.(\d+)/i.exec(verStr);
    return m2 ? parseInt(m2[1], 10) : 0;
  }
  return parseInt(m[1], 10);
}

function getJavaMajorVersion(javaHome) {
  const javaBin = process.platform === 'win32' ? 'java.exe' : 'java';
  const javaExe = path.join(javaHome, 'bin', javaBin);
  if (!fs.existsSync(javaExe)) {
    return { ok: false, major: 0, line: '(no java binary)' };
  }
  const r = spawnSync(javaExe, ['-version'], { encoding: 'utf8' });
  const verStr = `${r.stderr || ''}${r.stdout || ''}`;
  if (r.error) {
    return { ok: false, major: 0, line: String(r.error.message || r.error) };
  }
  const line = verStr.trim().split('\n')[0] || verStr.trim() || '(empty)';
  return { ok: true, major: parseJavaMajor(verStr), line };
}

function pushUnique(arr, seen, p) {
  if (!p || typeof p !== 'string') return;
  const n = path.normalize(p.trim());
  if (!n || seen.has(n)) return;
  seen.add(n);
  arr.push(n);
}

function readdirSafe(dir) {
  try {
    return fs.readdirSync(dir);
  } catch {
    return [];
  }
}

/**
 * Ordered search: explicit overrides first, then common Android Studio / vendor JDK 21 installs.
 */
function orderedJavaHomeCandidates() {
  const out = [];
  const seen = new Set();

  pushUnique(out, seen, process.env.JDK_21_HOME);
  pushUnique(out, seen, process.env.JAVA_HOME);

  const androidPf = 'C:\\Program Files\\Android';
  for (const name of readdirSafe(androidPf)) {
    if (/^Android Studio/i.test(name)) {
      pushUnique(out, seen, path.join(androidPf, name, 'jbr'));
    }
  }
  pushUnique(out, seen, path.join(androidPf, 'Android Studio', 'jbr'));
  pushUnique(out, seen, path.join(androidPf, 'Android Studio1', 'jbr'));
  pushUnique(out, seen, path.join(androidPf, 'openjdk', 'jdk-21.0.8'));

  const jetBrains = 'C:\\Program Files\\JetBrains';
  for (const name of readdirSafe(jetBrains)) {
    if (/Android Studio/i.test(name)) {
      pushUnique(out, seen, path.join(jetBrains, name, 'jbr'));
    }
  }

  const adoptium = 'C:\\Program Files\\Eclipse Adoptium';
  for (const name of readdirSafe(adoptium)) {
    if (/^jdk-21/i.test(name)) {
      pushUnique(out, seen, path.join(adoptium, name));
    }
  }

  const msBase = 'C:\\Program Files\\Microsoft';
  for (const name of readdirSafe(msBase)) {
    if (/^jdk-21/i.test(name)) {
      pushUnique(out, seen, path.join(msBase, name));
    }
  }

  const javaPf = 'C:\\Program Files\\Java';
  for (const name of readdirSafe(javaPf)) {
    if (/^jdk-21/i.test(name)) {
      pushUnique(out, seen, path.join(javaPf, name));
    }
  }

  return out;
}

function resolveJavaHome() {
  const candidates = orderedJavaHomeCandidates();
  const tried = [];

  for (const home of candidates) {
    if (!fs.existsSync(path.join(home, 'bin'))) {
      tried.push({ home, skip: 'missing bin' });
      continue;
    }
    const { ok, major, line } = getJavaMajorVersion(home);
    tried.push({ home, ok, major, line });
    if (ok && major >= MIN_JAVA_MAJOR) {
      return { javaHome: home, tried };
    }
  }

  return { javaHome: null, tried };
}

const { javaHome: JAVA_HOME, tried } = resolveJavaHome();

if (!JAVA_HOME) {
  console.error(
    `ERROR: Need JDK ${MIN_JAVA_MAJOR}+ for this project (Capacitor Android uses Java ${MIN_JAVA_MAJOR}).\n` +
      'Checked Java installs:\n' +
      tried
        .map((t) => {
          if (t.skip) return `  - ${t.home}\n    (${t.skip})`;
          return `  - ${t.home}\n    ${t.ok ? `Java ${t.major}` : 'error'}: ${t.line}`;
        })
        .join('\n')
  );
  console.error(
    '\nFix: Install JDK 21 (e.g. https://adoptium.net/temurin/releases/?version=21 ) or update Android Studio so its bundled JBR is 21+, then either set JDK_21_HOME to that folder or remove JAVA_HOME if it points to an older JDK.'
  );
  process.exit(1);
}

process.env.JAVA_HOME = JAVA_HOME;
process.env.PATH = `${path.join(JAVA_HOME, 'bin')}${path.delimiter}${process.env.PATH}`;
// Use project-local Gradle cache to avoid Windows/OneDrive file-lock issues
process.env.GRADLE_USER_HOME = path.join(__dirname, '..', 'android', '.gradle-local');

const androidDir = path.join(__dirname, '..', 'android');
const gradlew = path.join(androidDir, process.platform === 'win32' ? 'gradlew.bat' : 'gradlew');
const task = isRelease ? 'assembleRelease' : 'assembleDebug';

console.log(`Using JAVA_HOME=${JAVA_HOME} (Java ${getJavaMajorVersion(JAVA_HOME).major})`);

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
