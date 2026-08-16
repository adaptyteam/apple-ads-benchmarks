# Methodology and provenance

## Source hierarchy

The 2026 PDF is authoritative for metric definitions, scope, methodology, printed values, and
published rounding. The companion workbook fills the country, primary App Store genre, and
sub-niche matrices where the PDF does not print every row. A workbook value never overrides a PDF
value after both are rounded as the PDF presents that metric.

`data/2026/manifest.json` records each non-redistributed source's basename, SHA-256, and role. Every
numeric row has a PDF locator. When its value comes from the workbook, it also has an exact locator
such as `all_by_country!A44:I44` in `value_source_locator`.

Only derived CSV/JSON is distributed. The source PDF and workbook, as well as raw impressions,
taps, downloads, and spend, are excluded from the repository and plugin bundle.

## Period and report-wide sample

The 2026 vintage covers campaigns from January through December 2025. The report-wide sample is
8,000+ subscription apps and 1,000,000+ Apple Ads ad groups across 90 countries.

The published niche eligibility requirements are:

- at least 2 apps;
- at least 200,000 impressions;
- at least 1,000 downloads;
- at least $10,000 annual Apple Ads spend per app.

These are inclusion rules, not row-level sample sizes or significance thresholds. The PDF does not
publish the number of apps behind each row, so `n` remains empty. Never infer it, substitute a
minimum, or claim a row-level confidence level.

## Aggregation and available cuts

The acquisition matrix contains four metrics for each of 90 countries, 22 primary App Store
genres, and 59 report sub-niches. These are three separate marginal cuts. The source does not
contain category-by-country or niche-by-country intersections.

Published medians, P75 values, and weighted averages are separate `scope=overall` rows. Do not
derive a median from the rounded public rows and do not treat a weighted average as a median.

Subscriber economics and effect studies have the scopes printed in the PDF. They do not imply the
same country/genre/niche matrix as the acquisition metrics.

## Rounding

Workbook-backed values are saved at PDF display precision:

- country TTR: one decimal percentage point; country CR: two; country CPT: three dollars;
- country CPA: two dollars;
- genre TTR: one decimal percentage point; genre CR: two; genre CPT/CPA: two dollars;
- sub-niche TTR and CR: one decimal percentage point; sub-niche CPT/CPA: two dollars;
- subscriber and effect metrics: exactly the precision printed in the PDF.

Because CPA, CPT, and CR are independently rounded, `CPA = CPT / (CR / 100)` is approximate in the
public files.

## Limitations

- The figures are aggregates, not competitor or per-app data.
- A benchmark is historical context, not a forecast, bid, target, or statistical significance
  test.
- No numerical adjustment coefficients are published for trial length, price, paywall type, or
  traffic mix.
- The report does not publish category-level trial-to-paid baselines, LTV curves by every segment,
  or absolute default/custom paywall ROAS.
- Tailored-paywall effect rows are relative uplift only.
