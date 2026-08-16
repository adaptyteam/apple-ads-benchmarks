# Apple Ads Benchmarks

**Published Apple Ads baselines for subscription apps, with the comparison rules that keep unlike
populations apart.**

This agent skill packages Adapty's 2026 report as local, source-traceable CSV data. It covers the
2025 campaign period across 8,000+ apps, 1,000,000+ ad groups, 90 countries, 22 primary App Store
genres, and 59 report niches. It needs no account, CLI, network call, or subscription.

Full report: [Apple Ads for subscription apps 2026](https://adapty.io/apple-ads-for-subscription-apps/)

## What is published

- **Acquisition:** TTR, CR, CPT, and CPA for 90 countries, 22 App Store genres, and 59 niches.
- **Subscriber economics:** published install-to-trial/install-to-paid comparisons, the top country
  and US-category tables, year-1 LTV, cost per paying subscriber, and paying subscribers per $1,000.
- **Measured effects:** Custom Product Page baselines/lifts and relative tailored-paywall uplift,
  including the published Day 0-Day 92 ROAS uplift series.
- **Machine-readable taxonomy and provenance:** stable keys, PDF locators, internal workbook
  locators, source hashes, sample context, and the report's inclusion thresholds.

Only derived CSV/JSON is distributed. The source PDF/XLSX and raw impressions, taps, downloads,
and spend are deliberately excluded from the repository and installable plugin.

## Metric definitions

The names follow the PDF exactly:

| Metric | Denominator |
|---|---|
| `ttr` | taps / impressions |
| `cr` | downloads / taps, measured on the App Store product page |
| `cpt` | spend / taps |
| `cpa` | spend / downloads |

The report does not publish CPI as spend per install. CPA/download is not silently aliased to CPI:
when a user asks about CPI, the skill first checks whether their denominator is downloads or
installs.

The published 28.9%-77.9% niche range is `cr` (tap-to-download): Time Planner is the low end and
PDF Reader the high end. It is not install-to-trial or trial-to-paid.

## Install

```bash
claude plugin marketplace add adaptyteam/apple-ads-cli
claude plugin install apple-ads-benchmarks@adapty
```

<details>
<summary>Other agents</summary>

```bash
npx skills add adaptyteam/apple-ads-benchmarks --all
```

</details>

Pairs with [apple-ads-cli](https://github.com/adaptyteam/apple-ads-cli): this repository describes
what was published; the CLI operates an Apple Ads account.

## Updates and releases

Claude Code installs marketplace plugins into a local cache; it does not read this repository live.
Because `.claude-plugin/plugin.json` declares an explicit version, every published change must bump
that version. Pushing new commits without a version bump will not produce an update for installed
users.

Release checklist for maintainers:

1. Update the plugin and run the validation commands below.
2. Bump the version using semantic versioning: PATCH for fixes, MINOR for new compatible features,
   and MAJOR for breaking changes.
3. Commit and push the plugin repository. Update its entry in the `adapty` marketplace if the
   description, source, or other discovery metadata changed.
4. For Cowork distribution, build and publish a new `.plugin` archive. The archive is a static
   delivery artifact and does not update itself.

Claude Code users can fetch a release manually:

```bash
claude plugin marketplace update adapty
claude plugin update apple-ads-benchmarks@adapty
```

Run `/reload-plugins` in an existing Claude Code session, or start a new session, to load the new
version. Auto-update can be enabled for the `adapty` marketplace in `/plugin` → Marketplaces;
third-party marketplaces do not enable it by default.

Skills bundled inside this plugin update together with the plugin. A skill installed separately
with `npx skills add` follows that tool's separate update/reinstall flow. A Cowork `.plugin` must be
rebuilt, redistributed, and imported again.

See the Claude Code documentation for
[plugin updates and version resolution](https://code.claude.com/docs/en/plugins-reference#version-management)
and [marketplace auto-updates](https://code.claude.com/docs/en/discover-plugins#configure-auto-updates).

## Example questions

```text
What is the published CPA for Remote Control apps?
How does Brazil's Apple Ads CR compare with the country median?
What was the year-1 LTV reported for the US?
How much did keyword-matched paywalls lift ROAS at Day 92?
Can I compare my Utilities CPA in Brazil with this dataset?
```

The last acquisition question has no combined category-by-country row. The skill can show the
global Utilities and all-category Brazil marginals separately, but it will not synthesize an
intersection.

## Data layout

```text
data/2026/
  manifest.json                 schema, coverage, sample context, rounding, source hashes
  acquisition.csv               684 matrix rows plus 6 published distribution summaries
  subscriber-economics.csv      published funnel, LTV, and subscriber-efficiency tables
  effects.csv                   CPP and tailored-paywall measurements
  taxonomy.csv                  stable genre, report-category, and sub-niche keys
skills/apple-ads-benchmarks/
  SKILL.md                       comparison and refusal protocol
  references/                   methodology, comparison, taxonomy, behavior fixtures
```

The numeric CSVs use one schema:

```text
metric,scope,category,sub_niche,geo,traffic_source,variant,cohort_day,stat,value,unit,
period,source_id,source_locator,value_source_id,value_source_locator,n,sample_note,note
```

`scope` is one of `overall`, `country`, `app_store_genre`, or `sub_niche`. Country, genre, and
niche rows are separate marginal aggregates, not a cross-product.

## Source and sample policy

The PDF is authoritative for definitions, publication scope, methodology, printed values, and
display precision. The non-distributed workbook fills matrix values that are not printed on a
slide. If a workbook-derived rounded value conflicts with a printed value, the PDF wins and the row
records that override.

The report does not publish per-row app counts, so `n` is blank for this vintage. Answers must state
the vintage and report-wide sample context; they must not invent a row-level sample size. The PDF
publishes these niche eligibility thresholds:

- at least 2 contributing apps;
- at least 200,000 impressions;
- at least 1,000 downloads;
- at least $10,000 annual spend per app.

## What this data cannot support

- It is not per-app competitor data, a forecast, a target, or a guarantee.
- Its acquisition matrix has no category-by-country intersections. The separate subscriber file
  includes the PDF's US-only category install-to-paid table.
- It has no category-level trial-to-paid baseline or LTV curve.
- It has no numeric adjustment factors for trial length, price, paywall type, or cohort-age
  mismatches.
- A single aggregate point does not define a statistical normal band.
- Tailored-paywall ROAS rows are relative uplift, not absolute ROAS benchmarks.

## Contributing

Stable taxonomy keys and CSV columns are the public interface. The `utilities`, `health-fitness`,
`photo-video`, and `education` keys are already referenced by companion vertical guides.

Before committing:

```bash
node scripts/validate-data.mjs
node scripts/validate-skill.mjs
bash scripts/pack-plugin.sh /tmp/apple-ads-benchmarks.plugin
node scripts/validate-package.mjs /tmp/apple-ads-benchmarks.plugin
```

The validators reject schema drift, missing segments, source leaks, impossible dimensions,
unsupported metrics, broken CPA/CPT/CR relationships, and changes to the published golden anchors.
