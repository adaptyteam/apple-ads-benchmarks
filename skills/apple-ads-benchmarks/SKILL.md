---
name: apple-ads-benchmarks
description: Use when someone asks whether an Apple Ads or subscription metric is unusual, what CPA/CPT/TTR/CR was published for a country, App Store genre, or niche, how Apple Ads subscriber economics compare with other paid channels, or what uplift the 2026 report measured for Custom Product Pages and keyword-matched paywalls. Also use when someone says CPI: this report publishes CPA per download, so the denominator must be clarified before comparison. Reads local CSV files and needs no account, CLI, network access, or subscription.
license: MIT
---

# Apple Ads benchmarks for subscription apps

Use Adapty's 2026 report data without turning marginal aggregates into false precision.

Read local CSV files only. Call nothing and require no account.

**Answer in the language the user writes in.** Keep these instructions and data keys in English.

## Start with the metric definition

Use the PDF terminology encoded in `data/2026/manifest.json`:

| Metric | Definition |
|---|---|
| `ttr` | taps / impressions |
| `cr` | downloads / taps on the App Store product page |
| `cpt` | spend / taps |
| `cpa` | spend / downloads |

The report does not provide CPI as spend / installs. If the user says CPI, ask whether their
denominator is downloads or installs. Compare only when it is downloads, and call the benchmark
CPA. Do not create or store a CPI alias.

The 28.9%-77.9% niche range is `cr`, from Time Planner to PDF Reader. It is not install-to-trial or
trial-to-paid, and it is not a target range.

## Select a row without inventing an intersection

1. Read `data/2026/taxonomy.csv` and resolve the requested country, App Store genre, or sub-niche.
2. Read the relevant numeric file:
   - `acquisition.csv` for TTR, CR, CPT, or CPA;
   - `subscriber-economics.csv` for funnel, year-1 LTV, or subscriber-efficiency rows;
   - `effects.csv` for CPP or tailored-paywall measurements.
3. Match every available dimension: metric, scope, category/sub-niche, geo, traffic source,
   variant, cohort day, statistic, and period.
4. Require exactly one matching row. Never choose the first of several partial matches.

Country, genre, and sub-niche acquisition rows are separate marginal aggregates. There is no
category-by-country matrix. For a question such as "Utilities CPA in Brazil", either:

- show the global Utilities CPA and all-category Brazil CPA as two explicitly separate marginals;
- or say a combined benchmark is unavailable.

Never average, multiply, interpolate, or otherwise synthesize the missing intersection.

## Comparability checks depend on the metric

### Acquisition: TTR, CR, CPT, CPA

Match the metric definition, scope, geo when using a country row, Apple Ads traffic source, and
2025 period. Do not ask about trial length, price, paywall type, or cohort age: they are not the
denominators of these acquisition metrics.

### Subscriber funnel

Match the exact step (`install_to_trial` is not `install_to_paid`), traffic source, geo/category
when present, and relevant paywall/trial context from the user. The report has global channel
comparisons, twenty country install-to-paid comparisons, and ten US category medians. It does not
have a general category-level trial-to-paid baseline.

### LTV and ROAS

Match the time window. `year_1_ltv` cannot be compared with Day-30 LTV. Tailored-paywall ROAS rows
are relative uplift at the listed cohort days, not absolute ROAS benchmarks.

### CPP and paywall effects

Report these as measured relative effects from the study population. Never treat an uplift as a
guaranteed result or a universal target.

## No numeric normalization without coefficients

The report publishes no adjustment coefficients for price, trial length, paywall type, traffic
mix, or cohort-age mismatches. If dimensions differ:

- identify the mismatch;
- say the likely direction only when the report supports it;
- do not calculate a normalized value, corrected gap, or "normal band".

If the mismatch can change the conclusion, do not issue a verdict.

## Source and sample sentence

Every answer containing a benchmark must state:

- that it is the 2026 vintage covering January-December 2025 campaigns;
- the report-wide sample context: 8,000+ apps and 1,000,000+ ad groups;
- that per-row app counts were not published, when the answer could otherwise imply row-level
  statistical confidence.

Do not use a fabricated per-row threshold. The published niche eligibility requirements are in
`references/methodology.md`.

## Verdict format

When comparison is valid, use four parts:

1. the user's metric and denominator;
2. the exact published aggregate and scope;
3. the difference in points, percent, or dollars, clearly labeled;
4. the practical next check or action.

Say "above/below the published aggregate", not "statistically normal/abnormal". A single aggregate
is not a distribution and cannot establish significance.

## Refuse or narrow the answer when

- the user's denominator is unknown or differs from the report;
- a requested category-by-country intersection does not exist;
- trial length, price, paywall type, traffic source, or cohort window prevents a valid subscriber
  comparison and cannot be matched;
- the report contains only a relative lift but the user asks for an absolute baseline;
- the requested category/niche has no taxonomy row;
- the question asks for an individual competitor's data;
- the user asks for a bid derived from a benchmark.

Benchmarks do not set bids. Allowed CPA comes from the app's own unit economics.

## References

- `references/methodology.md` - sample, aggregation, source hierarchy, and limitations.
- `references/how-to-compare.md` - metric-specific comparison and refusal examples.
- `references/taxonomy.md` - scopes, stable keys, and non-intersection rule.
- `references/behavior-fixtures.md` - required behavior for representative prompts.

To act on an account, use the Adapty CLI and the `apple-ads` skill:
https://github.com/adaptyteam/apple-ads-cli

Full report: https://adapty.io/apple-ads-for-subscription-apps/
