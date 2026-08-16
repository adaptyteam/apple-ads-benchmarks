#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const archive = path.resolve(process.argv[2] ?? '/tmp/apple-ads-benchmarks.plugin');
if (!fs.existsSync(archive)) {
  console.error(`Plugin archive not found: ${archive}`);
  process.exit(1);
}

const unzip = (...args) => execFileSync('unzip', args, { encoding: 'utf8' });
const entries = unzip('-Z1', archive).trim().split('\n').filter(Boolean);
const errors = [];
const check = (condition, message) => {
  if (!condition) errors.push(message);
};

const requiredEntries = [
  '.claude-plugin/plugin.json',
  'README.md',
  'LICENSE',
  'skills/apple-ads-benchmarks/SKILL.md',
  'skills/apple-ads-benchmarks/references/behavior-fixtures.md',
  'data/2026/manifest.json',
  'data/2026/acquisition.csv',
  'data/2026/subscriber-economics.csv',
  'data/2026/effects.csv',
  'data/2026/taxonomy.csv',
];

for (const entry of requiredEntries) check(entries.includes(entry), `missing bundle entry: ${entry}`);

for (const entry of entries) {
  check(!/\.(pdf|xlsx)$/i.test(entry), `source binary bundled: ${entry}`);
  check(!entry.startsWith('source/'), `source directory bundled: ${entry}`);
  check(!entry.startsWith('scripts/'), `build script bundled: ${entry}`);
  check(!entry.startsWith('tests/'), `test fixture implementation bundled: ${entry}`);
  check(!entry.startsWith('.github/'), `CI metadata bundled: ${entry}`);
}

for (const legacy of ['data/2026/cpi.csv', 'data/2026/conversion.csv', 'data/2026/ltv-curves.csv']) {
  check(!entries.includes(legacy), `legacy dataset bundled: ${legacy}`);
}

let plugin;
let manifest;
try {
  plugin = JSON.parse(unzip('-p', archive, '.claude-plugin/plugin.json'));
  manifest = JSON.parse(unzip('-p', archive, 'data/2026/manifest.json'));
} catch (error) {
  errors.push(`cannot parse bundled JSON: ${error.message}`);
}

if (plugin) check(plugin.version === '0.2.0', `bundled plugin version must be 0.2.0, got ${plugin.version}`);
if (manifest) {
  check(manifest.schema_version === 2, `bundled schema version must be 2, got ${manifest.schema_version}`);
  check(manifest.extraction_status === 'complete', 'bundled manifest must be complete');
  check(manifest.datasets?.['acquisition.csv']?.matrix_rows === 684, 'bundled manifest must declare 684 matrix rows');
}

for (const entry of entries.filter((item) => item.startsWith('data/') && !item.endsWith('/'))) {
  const contents = unzip('-p', archive, entry);
  check(!/\bTODO\b/i.test(contents), `${entry} contains TODO`);
  check(!/conversion_unspecified/i.test(contents), `${entry} contains conversion_unspecified`);
}

if (errors.length > 0) {
  console.error(`Plugin bundle validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Plugin bundle validation passed: ${entries.length} entries, no source binaries or legacy datasets.`);
