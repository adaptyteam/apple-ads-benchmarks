# Methodology

## What the data is

Aggregate figures from subscription apps running Apple Ads, measured through Adapty. See
`data/<vintage>/manifest.json` for the exact sample and period of the vintage you are quoting.

The 2026 vintage covers **2025 campaigns**: 8,000+ apps, 1,000,000+ ad groups, 90 countries,
59 sub-niches.

## What it is not

- **Not per-app.** No competitor's individual numbers are in here, and no aggregate can be reversed
  into one.
- **Not a forecast.** Past medians across other apps say nothing certain about this app's next
  month.
- **Not a target.** A median is the middle of a distribution, not a goal. Half the sample is below
  it by definition, and many of those apps are profitable.
- **Not Apple's data.** Apple publishes no benchmarks. Spend-side metrics come from the Apple Ads
  API; revenue-side metrics come from subscription events. That is exactly why revenue benchmarks
  exist here and nowhere else.

## Sample thresholds

| `n` | How to report it |
|---|---|
| ≥ `min_sample_for_verdict` in the manifest | Quote normally, with vintage |
| below it | Quote as indicative, and say so in the same sentence as the number |
| empty | The figure is a published headline without a per-row sample size — attribute it to the report and do not build a verdict on it alone |

## Known gaps in this vintage

- Per-niche and per-country tables are **not yet extracted**; those rows carry `value=TODO`.
- The `conversion_unspecified` rows record a published range whose exact conversion step is not
  stated on the public page. Resolve it from the source report before using it for anything.
- LTV curves are stubbed pending extraction.

A `TODO` row means "we have not extracted this yet", never "this is zero" and never "we do not
know". Say which one it is.
