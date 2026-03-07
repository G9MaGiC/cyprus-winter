#!/usr/bin/env node
/**
 * Fix permission issues with build artifacts (dist, .next, .next-build).
 * Run: node scripts/fix-permissions.mjs
 * If you get "Permission denied", run the printed commands with sudo.
 */
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const cwd = process.cwd();
const dirs = ['dist', '.next', '.next-build'];

for (const dir of dirs) {
  const path = join(cwd, dir);
  if (!existsSync(path)) continue;
  try {
    execSync(`rm -rf "${path}"`, { cwd, stdio: 'inherit' });
    console.log(`Removed ${dir}/`);
  } catch (err) {
    console.error(`\nPermission denied on ${dir}. Run:`);
    console.error('  sudo rm -rf dist .next .next-build');
    console.error('  sudo chown -R $(whoami) .');
    console.error('\nThen: npm run build\n');
    process.exit(1);
  }
}

console.log('Clean complete. Run: npm run build');
