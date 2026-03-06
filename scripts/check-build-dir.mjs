#!/usr/bin/env node
/**
 * Pre-build check: ensure .next is writable.
 * Prevents confusing EACCES when .next is root-owned (e.g. from sudo npm run build).
 * Exit 1 with fix instructions if unwritable.
 */
import { accessSync, constants } from 'fs';
import { existsSync } from 'fs';
import { join } from 'path';

const nextDir = join(process.cwd(), 'dist/next');
if (!existsSync(nextDir)) process.exit(0); // No .next yet; build will create it

try {
  accessSync(nextDir, constants.W_OK);
} catch (err) {
  if (err.code === 'EACCES') {
    console.error('\n\x1b[31mError:\x1b[0m dist/next is not writable (likely root-owned).');
    console.error('Fix: sudo chown -R $(whoami) dist .next .next-build 2>/dev/null');
    console.error('     rm -rf dist .next .next-build');
    console.error('     npm run build\n');
    process.exit(1);
  }
  throw err;
}
