/**
 * EAS Build from a monorepo subfolder: force VCS "root" to this app so
 * projectRootDirectory is "." (see eas-cli prepareJob.js + noVcs.js).
 * Without this, relative(gitRoot, appDir) stays "expert-expo-app" and the
 * worker can fail PRE_INSTALL_HOOK with missing .../build/expert-expo-app/package.json.
 */
const { spawnSync } = require('child_process');
const path = require('path');

const appRoot = path.resolve(__dirname, '..');
process.env.EAS_NO_VCS = '1';
process.env.EAS_PROJECT_ROOT = appRoot;

const extraArgs = process.argv.slice(2);
const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const r = spawnSync(cmd, ['eas-cli', 'build', ...extraArgs], {
  stdio: 'inherit',
  cwd: appRoot,
  env: { ...process.env },
  shell: process.platform === 'win32',
});

process.exit(r.status === null ? 1 : r.status);
