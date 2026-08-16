#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const check = (condition, message) => {
  if (!condition) errors.push(message);
};

const documents = [
  'README.md',
  'skills/apple-ads-benchmarks/SKILL.md',
  'skills/apple-ads-benchmarks/references/methodology.md',
  'skills/apple-ads-benchmarks/references/how-to-compare.md',
  'skills/apple-ads-benchmarks/references/taxonomy.md',
  'skills/apple-ads-benchmarks/references/behavior-fixtures.md',
];

for (const document of documents) {
  check(fs.existsSync(path.join(root, document)), `missing ${document}`);
}

const corpus = documents
  .filter((document) => fs.existsSync(path.join(root, document)))
  .map(read)
  .join('\n');

const requiredConcepts = [
  [/CPA\s*=\s*spend\s*\/\s*downloads/i, 'CPA must be defined as spend/downloads'],
  [/CPI\s*=\s*spend\s*\/\s*installs/i, 'CPI denominator distinction is missing'],
  [/77\.9%[\s\S]{0,180}(downloads|CR)/i, 'PDF Reader CR fixture is missing or unclear'],
  [/no combined Utilities-in-Brazil row/i, 'missing category-country non-intersection behavior'],
  [/trial-to-paid baseline is not published/i, 'missing honest trial-to-paid refusal'],
  [/relative uplift/i, 'relative-only uplift rule is missing'],
  [/8,000\+[\s\S]{0,120}1,000,000\+/i, 'report-wide sample context is missing'],
  [/per-row app counts were not published/i, 'unpublished row-level n rule is missing'],
  [/no adjustment coefficients/i, 'no numeric normalization rule is missing'],
];

for (const [pattern, message] of requiredConcepts) {
  check(pattern.test(corpus), message);
}

const forbiddenPatterns = [
  [/value=TODO/i, 'legacy TODO behavior remains'],
  [/conversion_unspecified/i, 'legacy conversion_unspecified behavior remains'],
  [/min_sample_for_verdict/i, 'fabricated verdict sample threshold remains'],
  [/category median is X%/i, 'invented X/Y worked example remains'],
  [/Normalized, 8\.1%/i, 'invented numerical normalization remains'],
  [/per-niche and per-country tables are not yet extracted/i, 'partial-data status remains'],
];

for (const [pattern, message] of forbiddenPatterns) {
  check(!pattern.test(corpus), message);
}

const fixturePath = path.join(root, 'tests/behavior-fixtures.json');
check(fs.existsSync(fixturePath), 'missing tests/behavior-fixtures.json');

let fixtures = [];
if (fs.existsSync(fixturePath)) {
  try {
    fixtures = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
  } catch (error) {
    errors.push(`invalid behavior fixture JSON: ${error.message}`);
  }
}

const requiredFixtureIds = new Set([
  'pdf-reader-cr-denominator',
  'utilities-brazil-no-intersection',
  'weekly-trial-to-paid-unavailable',
  'cpi-denominator-clarification',
]);

check(Array.isArray(fixtures), 'behavior fixtures must be an array');
if (Array.isArray(fixtures)) {
  check(fixtures.length === requiredFixtureIds.size, `expected ${requiredFixtureIds.size} behavior fixtures`);
  const seen = new Set();
  for (const fixture of fixtures) {
    check(typeof fixture?.id === 'string' && fixture.id.length > 0, 'fixture id must be non-empty');
    check(!seen.has(fixture?.id), `duplicate fixture id: ${fixture?.id}`);
    seen.add(fixture?.id);
    check(typeof fixture?.query === 'string' && fixture.query.length > 0, `${fixture?.id}: query must be non-empty`);
    check(Array.isArray(fixture?.expected) && fixture.expected.length > 0, `${fixture?.id}: expected must be non-empty`);
    check(Array.isArray(fixture?.forbidden) && fixture.forbidden.length > 0, `${fixture?.id}: forbidden must be non-empty`);
  }
  for (const id of requiredFixtureIds) check(seen.has(id), `missing fixture: ${id}`);
}

let plugin;
try {
  plugin = JSON.parse(read('.claude-plugin/plugin.json'));
} catch (error) {
  errors.push(`invalid plugin manifest JSON: ${error.message}`);
}
if (plugin) {
  check(plugin.version === '0.2.0', `plugin version must be 0.2.0, got ${plugin.version}`);
  check(!/\bcpi\b/i.test(plugin.description), 'plugin description must not advertise CPI');
  check(plugin.keywords.includes('cpa') && !plugin.keywords.includes('cpi'), 'plugin keywords must use CPA, not CPI');
}

if (errors.length > 0) {
  console.error(`Skill validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Skill validation passed: ${fixtures.length} behavior fixtures, plugin ${plugin.version}.`);
