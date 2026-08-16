#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DATA = join(ROOT, 'data', '2026')
const errors = []

const NUMERIC_HEADER = [
  'metric', 'scope', 'category', 'sub_niche', 'geo', 'traffic_source', 'variant', 'cohort_day',
  'stat', 'value', 'unit', 'period', 'source_id', 'source_locator', 'value_source_id',
  'value_source_locator', 'n', 'sample_note', 'note',
]
const TAXONOMY_HEADER = [
  'scope', 'key', 'label', 'parent_key', 'app_store_genre_id', 'source_id', 'source_locator',
  'value_source_id', 'value_source_locator', 'note',
]
const MATRIX_METRICS = ['ttr', 'cr', 'cpt', 'cpa']
const FORBIDDEN_METRICS = new Set([
  'cpi', 'conversion_unspecified', 'trial_cr', 'trial_to_paid', 'cumulative_arpu', 'retained_share',
])
const ALLOWED_SCOPES = new Set(['overall', 'country', 'app_store_genre', 'sub_niche'])
const ALLOWED_STATS = new Set(['aggregate', 'median', 'p75', 'spend_weighted_mean', 'relative_lift', 'relative_ratio'])
const ALLOWED_UNITS = new Set(['percent', 'usd', 'ratio', 'count_per_1000_usd', 'count_per_1000_impressions'])
const ALLOWED_TRAFFIC = new Set(['apple_ads', 'other_paid'])
const ISO_ALPHA2 = new Set(`
AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS
BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG
EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR
HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR
LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG
NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE
SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA
UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW
`.trim().split(/\s+/))

function parseCsv(path) {
  const text = readFileSync(path, 'utf8')
  const records = []
  let row = []
  let field = ''
  let quoted = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (char === '"') {
        quoted = false
      } else {
        field += char
      }
    } else if (char === '"') {
      quoted = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field.replace(/\r$/, ''))
      if (row.some((value) => value !== '')) records.push(row)
      row = []
      field = ''
    } else {
      field += char
    }
  }
  if (quoted) errors.push(`${path}: unterminated quoted field`)
  if (field || row.length) {
    row.push(field)
    if (row.some((value) => value !== '')) records.push(row)
  }
  const [header = [], ...body] = records
  return {
    header,
    rows: body.map((values, index) => ({
      line: index + 2,
      values,
      data: Object.fromEntries(header.map((column, columnIndex) => [column, values[columnIndex] ?? ''])),
    })),
  }
}

function sameHeader(actual, expected) {
  return actual.length === expected.length && actual.every((value, index) => value === expected[index])
}

function expect(condition, message) {
  if (!condition) errors.push(message)
}

function readDataset(name, expectedHeader) {
  const path = join(DATA, name)
  expect(existsSync(path), `${name}: missing dataset`)
  if (!existsSync(path)) return { header: [], rows: [] }
  const parsed = parseCsv(path)
  expect(sameHeader(parsed.header, expectedHeader), `${name}: header does not match schema v2`)
  for (const row of parsed.rows) {
    if (row.values.length !== parsed.header.length) {
      errors.push(`${name}:${row.line}: ${row.values.length} fields, header has ${parsed.header.length}`)
    }
  }
  return parsed
}

function walk(dir) {
  const found = []
  for (const entry of readdirSync(dir)) {
    if (entry === '.git' || entry === '.tmp') continue
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) found.push(...walk(path))
    else found.push(path)
  }
  return found
}

expect(existsSync(DATA), 'data/2026: missing vintage directory')
const manifestPath = join(DATA, 'manifest.json')
expect(existsSync(manifestPath), 'data/2026/manifest.json: missing')
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {}

expect(manifest.schema_version === 2, 'manifest: schema_version must be 2')
expect(manifest.vintage === '2026', 'manifest: vintage must match data/2026')
expect(manifest.data_period?.start === '2025-01-01' && manifest.data_period?.end === '2025-12-31',
  'manifest: data period must cover January-December 2025')
expect(manifest.sample?.apps === '8000+', 'manifest: report-wide app sample must be 8000+')
expect(manifest.sample?.ad_groups === '1000000+', 'manifest: report-wide ad-group sample must be 1000000+')
expect(manifest.sample?.row_sample_sizes_published === false, 'manifest: per-row sample sizes must be marked unpublished')
expect(!('min_sample_for_verdict' in manifest), 'manifest: unsupported min_sample_for_verdict must be removed')
expect(manifest.niche_eligibility?.minimum_apps === 2, 'manifest: minimum_apps must match PDF methodology')
expect(manifest.niche_eligibility?.minimum_impressions === 200000, 'manifest: minimum_impressions must match PDF methodology')
expect(manifest.niche_eligibility?.minimum_downloads === 1000, 'manifest: minimum_downloads must match PDF methodology')
expect(manifest.niche_eligibility?.minimum_annual_spend_per_app_usd === 10000,
  'manifest: annual spend threshold must match PDF methodology')
expect(manifest.coverage?.category_country_intersections_available === false,
  'manifest: category-country intersections must be marked unavailable')
expect(/acquisition matrix/i.test(manifest.coverage?.category_country_intersections_note ?? ''),
  'manifest: non-intersection scope must be identified as the acquisition matrix')
expect(JSON.stringify(manifest.coverage?.matrix_metrics) === JSON.stringify(MATRIX_METRICS),
  'manifest: matrix metrics must be exactly TTR, CR, CPT, and CPA')
expect(manifest.coverage?.scopes?.country === 90, 'manifest: country coverage must be 90')
expect(manifest.coverage?.scopes?.app_store_genre === 22, 'manifest: App Store genre coverage must be 22')
expect(manifest.coverage?.scopes?.sub_niche === 59, 'manifest: sub-niche coverage must be 59')
expect(manifest.extraction_status === 'complete', 'manifest: extraction status must be complete')

const expectedSources = {
  'report-2026': {
    filename: 'apple_ads_for_subscription_apps_2026.pdf',
    sha256: 'ad98f7739a199ff1f73bb0602b7fe8e488ff1644ba7908118c20408deced818e',
  },
  'workbook-2026': {
    filename: 'ASA benchmarks 2026.xlsx',
    sha256: '30549bd40e81ddd0f5cd40c16bb818ba10c037fbc05c74c0001c1fb3d2661c7f',
  },
}
for (const [sourceId, expectedSource] of Object.entries(expectedSources)) {
  const source = manifest.sources?.[sourceId]
  expect(Boolean(source), `manifest: missing source ${sourceId}`)
  if (!source) continue
  expect(source.filename === expectedSource.filename,
    `manifest: ${sourceId} filename must be ${expectedSource.filename}`)
  expect(source.sha256 === expectedSource.sha256, `manifest: ${sourceId} SHA-256 does not match the reviewed source`)
  expect(Boolean(source.role), `manifest: ${sourceId} role is required`)
  expect(source.redistributed === false, `manifest: ${sourceId} must not be redistributed`)
}

const trackedFiles = execFileSync('git', ['ls-files', '-z'], { cwd: ROOT, encoding: 'utf8' }).split('\0').filter(Boolean)
for (const trackedFile of trackedFiles) {
  if (['.pdf', '.xlsx'].includes(extname(trackedFile).toLowerCase())) {
    errors.push(`${trackedFile}: source binary must not be tracked`)
  }
}
for (const path of walk(ROOT)) {
  if (['.pdf', '.xlsx'].includes(extname(path).toLowerCase())) {
    errors.push(`${path}: source binary must not be tracked or packaged`)
  }
}
for (const legacy of ['cpi.csv', 'conversion.csv', 'ltv-curves.csv']) {
  expect(!existsSync(join(DATA, legacy)), `${legacy}: legacy dataset must be removed`)
}

const acquisition = readDataset('acquisition.csv', NUMERIC_HEADER)
const subscriber = readDataset('subscriber-economics.csv', NUMERIC_HEADER)
const effects = readDataset('effects.csv', NUMERIC_HEADER)
const taxonomy = readDataset('taxonomy.csv', TAXONOMY_HEADER)

const taxonomyKeys = new Map()
const categories = new Set()
const genres = new Set()
const niches = new Map()
for (const row of taxonomy.rows) {
  const at = `taxonomy.csv:${row.line}`
  const data = row.data
  expect(['report_category', 'app_store_genre', 'sub_niche'].includes(data.scope), `${at}: invalid scope ${data.scope}`)
  expect(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.key), `${at}: invalid stable key ${data.key}`)
  expect(Boolean(data.label), `${at}: label is required`)
  expect(Boolean(manifest.sources?.[data.source_id]), `${at}: unknown source_id ${data.source_id}`)
  expect(Boolean(data.source_locator), `${at}: source_locator is required`)
  expect(Boolean(manifest.sources?.[data.value_source_id]), `${at}: unknown value_source_id ${data.value_source_id}`)
  expect(Boolean(data.value_source_locator), `${at}: value_source_locator is required`)
  const unique = `${data.scope}:${data.key}`
  expect(!taxonomyKeys.has(unique), `${at}: duplicate taxonomy key ${unique}`)
  taxonomyKeys.set(unique, data)
  if (data.scope === 'report_category') categories.add(data.key)
  if (data.scope === 'app_store_genre') {
    genres.add(data.key)
    expect(/^\d+$/.test(data.app_store_genre_id), `${at}: app_store_genre_id is required`)
  }
  if (data.scope === 'sub_niche') niches.set(data.key, data.parent_key)
}
for (const [key, parent] of niches) {
  expect(categories.has(parent), `taxonomy.csv: sub-niche ${key} has unknown parent ${parent}`)
}
expect(categories.size === manifest.datasets?.['taxonomy.csv']?.report_categories,
  `taxonomy.csv: expected ${manifest.datasets?.['taxonomy.csv']?.report_categories} report categories, found ${categories.size}`)
expect(taxonomy.rows.length === 96, `taxonomy.csv: expected 96 rows, found ${taxonomy.rows.length}`)
expect(categories.size === 15, `taxonomy.csv: expected 15 report categories, found ${categories.size}`)
expect(genres.size === 22, `taxonomy.csv: expected 22 app-store genres, found ${genres.size}`)
expect(niches.size === 59, `taxonomy.csv: expected 59 sub-niches, found ${niches.size}`)
for (const stableKey of ['utilities', 'health-fitness', 'photo-video', 'education']) {
  expect(categories.has(stableKey), `taxonomy.csv: stable report-category key ${stableKey} is missing`)
}

const fileMetrics = {
  'acquisition.csv': new Set(MATRIX_METRICS),
  'subscriber-economics.csv': new Set([
    'install_to_trial', 'install_to_paid', 'install_to_trial_advantage', 'install_to_paid_advantage',
    'install_to_paid_lift', 'year_1_ltv', 'cost_per_paying_subscriber', 'paid_subscribers_per_1000_usd',
  ]),
  'effects.csv': new Set([
    'ttr', 'cr', 'cpp_ttr_lift', 'cpp_cr_lift', 'downloads_per_1000_impressions', 'cpp_download_lift',
    'tailored_paywall_install_to_trial_lift', 'tailored_paywall_trial_to_paid_lift',
    'tailored_paywall_paying_user_lift', 'tailored_paywall_roas_lift',
  ]),
}

const datasets = new Map([
  ['acquisition.csv', acquisition],
  ['subscriber-economics.csv', subscriber],
  ['effects.csv', effects],
])

for (const [name, dataset] of datasets) {
  const uniqueRows = new Set()
  const expectedRows = manifest.datasets?.[name]?.rows
  expect(dataset.rows.length === expectedRows, `${name}: expected ${expectedRows} rows, found ${dataset.rows.length}`)
  for (const row of dataset.rows) {
    const at = `${name}:${row.line}`
    const data = row.data
    expect(fileMetrics[name].has(data.metric), `${at}: metric ${data.metric} is not allowed in this dataset`)
    expect(!FORBIDDEN_METRICS.has(data.metric), `${at}: forbidden metric ${data.metric}`)
    expect(ALLOWED_SCOPES.has(data.scope), `${at}: invalid scope ${data.scope}`)
    expect(ALLOWED_STATS.has(data.stat), `${at}: invalid stat ${data.stat}`)
    expect(ALLOWED_UNITS.has(data.unit), `${at}: invalid unit ${data.unit}`)
    expect(ALLOWED_TRAFFIC.has(data.traffic_source), `${at}: invalid traffic source ${data.traffic_source}`)
    expect(data.period === '2025', `${at}: period must be 2025`)
    expect(data.geo === 'global' || ISO_ALPHA2.has(data.geo), `${at}: geo must be global or a valid ISO alpha-2 code`)
    expect(data.cohort_day === '' || /^\d+$/.test(data.cohort_day), `${at}: cohort_day must be blank or a non-negative integer`)
    expect(Boolean(manifest.sources?.[data.source_id]), `${at}: unknown source_id ${data.source_id}`)
    expect(Boolean(data.source_locator), `${at}: source_locator is required`)
    expect(data.source_id === 'report-2026' && /^p\d+(?:-\d+)?(?:,p\d+(?:-\d+)?)*$/.test(data.source_locator),
      `${at}: every numeric row requires a PDF source locator`)
    expect(Boolean(manifest.sources?.[data.value_source_id]), `${at}: unknown value_source_id ${data.value_source_id}`)
    expect(Boolean(data.value_source_locator), `${at}: value_source_locator is required`)
    if (data.value_source_id === 'workbook-2026') {
      const expectedLocator = data.scope === 'country'
        ? /^all_by_country!A\d+:I\d+$/
        : data.scope === 'app_store_genre'
          ? /^ttr_by_genre!A\d+:J\d+$/
          : data.scope === 'sub_niche'
            ? /^all_by_tag!A\d+:L\d+$/
            : null
      expect(Boolean(expectedLocator?.test(data.value_source_locator)),
        `${at}: workbook-backed value requires an exact full-row locator`)
    }
    expect(data.n === '', `${at}: n must be empty because per-row counts are not published`)
    expect(Boolean(data.sample_note), `${at}: sample_note is required when row-level n is unpublished`)
    const value = Number(data.value)
    expect(Number.isFinite(value), `${at}: value must be numeric`)
    expect(value >= 0, `${at}: value must not be negative`)
    if (data.unit === 'percent' && data.stat !== 'relative_lift') {
      expect(value <= 100, `${at}: absolute percentage must not exceed 100`)
    }
    if (data.scope === 'overall') {
      expect(data.geo === 'global', `${at}: overall rows must use global geo`)
      expect(data.category === 'all' && data.sub_niche === 'all', `${at}: overall rows must not name a segment`)
    }
    if (data.scope === 'country') {
      expect(data.geo !== 'global', `${at}: country rows require a country geo`)
      expect(data.category === 'all' && data.sub_niche === 'all', `${at}: country rows must not synthesize a segment intersection`)
    }
    if (data.scope === 'app_store_genre') {
      expect(genres.has(data.category), `${at}: unknown app-store genre ${data.category}`)
      expect(data.sub_niche === 'all', `${at}: app-store genre rows must use sub_niche=all`)
      if (name === 'acquisition.csv') {
        expect(data.geo === 'global', `${at}: acquisition genre rows must use global geo`)
      } else {
        expect(data.geo === 'US', `${at}: the published subscriber genre table is US-only`)
      }
    }
    if (data.scope === 'sub_niche') {
      expect(niches.has(data.sub_niche), `${at}: unknown sub-niche ${data.sub_niche}`)
      expect(niches.get(data.sub_niche) === data.category,
        `${at}: sub-niche ${data.sub_niche} must belong to ${niches.get(data.sub_niche)}`)
      expect(data.geo === 'global', `${at}: sub-niche rows must use global geo`)
    }
    const key = [data.metric, data.scope, data.category, data.sub_niche, data.geo, data.traffic_source,
      data.variant, data.cohort_day, data.stat, data.period].join('|')
    expect(!uniqueRows.has(key), `${at}: duplicate benchmark key ${key}`)
    uniqueRows.add(key)
  }
}

const matrixRows = acquisition.rows.filter(({ data }) =>
  data.stat === 'aggregate' && ['country', 'app_store_genre', 'sub_niche'].includes(data.scope))
expect(matrixRows.length === 684, `acquisition.csv: expected 684 matrix rows, found ${matrixRows.length}`)
expect(acquisition.rows.length - matrixRows.length === 6, 'acquisition.csv: expected 6 published summary rows')

const maxDecimals = (value) => value.includes('.') ? value.length - value.indexOf('.') - 1 : 0
for (const row of matrixRows) {
  const { data } = row
  const precision = data.scope === 'country'
    ? { ttr: 1, cr: 2, cpt: 3, cpa: 2 }
    : data.scope === 'app_store_genre'
      ? { ttr: 1, cr: 2, cpt: 2, cpa: 2 }
      : { ttr: 1, cr: 1, cpt: 2, cpa: 2 }
  expect(maxDecimals(data.value) <= precision[data.metric],
    `acquisition.csv:${row.line}: ${data.metric} exceeds PDF-style precision for ${data.scope}`)
}

const matrixGroups = new Map()
for (const row of matrixRows) {
  const data = row.data
  if (data.scope !== 'country') expect(data.geo === 'global', `acquisition.csv:${row.line}: no category-country intersections are published`)
  const key = [data.scope, data.category, data.sub_niche, data.geo].join('|')
  if (!matrixGroups.has(key)) matrixGroups.set(key, new Map())
  matrixGroups.get(key).set(data.metric, Number(data.value))
}

const scopeCounts = { country: 0, app_store_genre: 0, sub_niche: 0 }
for (const [key, metrics] of matrixGroups) {
  const [scope] = key.split('|')
  scopeCounts[scope]++
  expect(metrics.size === 4 && MATRIX_METRICS.every((metric) => metrics.has(metric)),
    `acquisition.csv: ${key} must contain TTR, CR, CPT, and CPA`)
  if (metrics.has('cr') && metrics.has('cpt') && metrics.has('cpa')) {
    const expectedCpa = metrics.get('cpt') / (metrics.get('cr') / 100)
    expect(Math.abs(expectedCpa - metrics.get('cpa')) <= 0.08,
      `acquisition.csv: ${key} violates CPA ≈ CPT / CR after published rounding`)
  }
}
expect(scopeCounts.country === 90, `acquisition.csv: expected 90 country segments, found ${scopeCounts.country}`)
expect(scopeCounts.app_store_genre === 22, `acquisition.csv: expected 22 genre segments, found ${scopeCounts.app_store_genre}`)
expect(scopeCounts.sub_niche === 59, `acquisition.csv: expected 59 sub-niche segments, found ${scopeCounts.sub_niche}`)

function assertValue(name, dataset, criteria, expected) {
  const matches = dataset.rows.filter(({ data }) => Object.entries(criteria).every(([key, value]) => data[key] === String(value)))
  expect(matches.length === 1, `${name}: expected one row for ${JSON.stringify(criteria)}, found ${matches.length}`)
  if (matches.length === 1) {
    expect(Math.abs(Number(matches[0].data.value) - expected) < 1e-9,
      `${name}:${matches[0].line}: expected ${expected}, found ${matches[0].data.value}`)
  }
}

assertValue('acquisition.csv', acquisition, { metric: 'cr', scope: 'sub_niche', sub_niche: 'time-planner' }, 28.9)
assertValue('acquisition.csv', acquisition, { metric: 'cr', scope: 'sub_niche', sub_niche: 'pdf-reader' }, 77.9)
assertValue('acquisition.csv', acquisition, { metric: 'cpa', scope: 'country', geo: 'US' }, 2.51)
assertValue('acquisition.csv', acquisition, { metric: 'cr', scope: 'country', geo: 'US' }, 62.71)
assertValue('acquisition.csv', acquisition, { metric: 'cpt', scope: 'country', geo: 'US' }, 1.576)
assertValue('acquisition.csv', acquisition, { metric: 'cpa', scope: 'overall', stat: 'median' }, 0.51)
assertValue('acquisition.csv', acquisition, { metric: 'cpt', scope: 'overall', stat: 'median' }, 0.32)
assertValue('acquisition.csv', acquisition, { metric: 'cr', scope: 'overall', stat: 'median' }, 62.23)
assertValue('effects.csv', effects, { metric: 'cpp_ttr_lift' }, 12.1)
assertValue('effects.csv', effects, { metric: 'cpp_cr_lift' }, 9.6)
assertValue('effects.csv', effects, { metric: 'cpp_download_lift' }, 22.9)
assertValue('effects.csv', effects, { metric: 'tailored_paywall_install_to_trial_lift' }, 41.5)
assertValue('effects.csv', effects, { metric: 'tailored_paywall_trial_to_paid_lift' }, 24.2)
assertValue('effects.csv', effects, { metric: 'tailored_paywall_roas_lift', cohort_day: '0' }, 48.4)
assertValue('effects.csv', effects, { metric: 'tailored_paywall_roas_lift', cohort_day: '92' }, 82.5)
assertValue('subscriber-economics.csv', subscriber, { metric: 'year_1_ltv', scope: 'overall', stat: 'median' }, 26.04)

const publishedText = [
  readFileSync(join(DATA, 'acquisition.csv'), 'utf8'),
  readFileSync(join(DATA, 'subscriber-economics.csv'), 'utf8'),
  readFileSync(join(DATA, 'effects.csv'), 'utf8'),
  readFileSync(join(DATA, 'taxonomy.csv'), 'utf8'),
  readFileSync(manifestPath, 'utf8'),
].join('\n')
expect(!/\bTODO\b/.test(publishedText), 'data/2026: TODO values are forbidden in a complete vintage')
expect(!/\bconversion_unspecified\b/.test(publishedText), 'data/2026: conversion_unspecified is forbidden')
expect(!/\bcpi\b/i.test(publishedText), 'data/2026: CPI is not a canonical PDF metric')
for (const rawColumn of ['impressions', 'taps', 'downloads', 'spend']) {
  expect(!NUMERIC_HEADER.includes(rawColumn), `schema: raw column ${rawColumn} must not be published`)
}

for (const [name, dataset] of datasets) {
  const metricCounts = new Map()
  for (const { data } of dataset.rows) metricCounts.set(data.metric, (metricCounts.get(data.metric) || 0) + 1)
  if (metricCounts.size === 0) errors.push(`${name}: no metrics found`)
}

for (const error of errors) console.error(`ERROR ${error}`)
const numericRows = acquisition.rows.length + subscriber.rows.length + effects.rows.length
console.log(`\n1 vintage, ${numericRows} numeric rows, ${matrixRows.length} matrix rows, 0 TODO, ${errors.length} error(s)`)
process.exit(errors.length ? 1 : 0)
