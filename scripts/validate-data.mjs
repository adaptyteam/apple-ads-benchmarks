#!/usr/bin/env node
// Data contract validator. A benchmark repo fails in one specific way: a row that looks like
// a fact but has no period, no source and no sample size. This makes that impossible to merge.
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const DATA = join(ROOT, 'data')
const errors = []
const stats = { rows: 0, todo: 0, vintages: 0 }

const REQUIRED = ['metric', 'category', 'geo', 'stat', 'value', 'unit', 'n', 'period', 'source', 'note']

// minimal CSV row splitter that respects double quotes
function split(line) {
  const out = []; let cur = ''; let q = false
  for (const ch of line) {
    if (ch === '"') q = !q
    else if (ch === ',' && !q) { out.push(cur); cur = '' }
    else cur += ch
  }
  out.push(cur)
  return out.map((s) => s.trim())
}

if (!existsSync(DATA)) { console.error('ERROR no data/ directory'); process.exit(1) }

for (const vintage of readdirSync(DATA)) {
  const dir = join(DATA, vintage)
  const manifestPath = join(dir, 'manifest.json')
  if (!existsSync(manifestPath)) { errors.push(`${vintage}: no manifest.json — a vintage without a period and a sample is unusable`); continue }
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  stats.vintages++
  for (const k of ['vintage', 'report', 'data_period', 'sample', 'publisher']) {
    if (!(k in manifest)) errors.push(`${vintage}/manifest.json: missing "${k}"`)
  }
  if (manifest.vintage !== vintage) errors.push(`${vintage}/manifest.json: vintage "${manifest.vintage}" does not match its directory`)

  for (const f of readdirSync(dir).filter((f) => f.endsWith('.csv'))) {
    const lines = readFileSync(join(dir, f), 'utf8').trim().split('\n')
    const header = split(lines[0])
    for (const col of REQUIRED) {
      if (!header.includes(col)) errors.push(`${vintage}/${f}: missing required column "${col}"`)
    }
    const idx = Object.fromEntries(header.map((h, i) => [h, i]))
    lines.slice(1).forEach((line, i) => {
      const row = split(line)
      const at = `${vintage}/${f}:${i + 2}`
      stats.rows++
      if (row.length !== header.length) { errors.push(`${at}: ${row.length} fields, header has ${header.length}`); return }
      const v = row[idx.value]
      if (v === 'TODO') stats.todo++
      else if (v === '' || Number.isNaN(Number(v))) errors.push(`${at}: value "${v}" is neither a number nor TODO`)
      if (!row[idx.period]) errors.push(`${at}: no period — a benchmark without a period is misinformation`)
      if (!row[idx.source]) errors.push(`${at}: no source`)
      if (!row[idx.n] && !row[idx.note]) errors.push(`${at}: empty sample size and no note explaining why`)
    })
  }
}

for (const e of errors) console.error(`ERROR ${e}`)
console.log(`\n${stats.vintages} vintage(s), ${stats.rows} row(s), ${stats.todo} awaiting extraction, ${errors.length} error(s)`)
process.exit(errors.length ? 1 : 0)
