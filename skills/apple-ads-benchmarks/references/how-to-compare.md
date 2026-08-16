# How to compare a user's metric

## 1. Establish the denominator

Translate the user's term into the report definition before looking up a row:

- TTR = taps / impressions;
- CR = downloads / taps on the App Store product page;
- CPT = spend / taps;
- CPA = spend / downloads.

If the user says CPI, ask whether they mean spend/downloads or spend/installs. The report publishes
the first and calls it CPA; it does not publish the second. Do not silently rename CPA to CPI.

Example: PDF Reader CR is 77.9%. This means 77.9 downloads per 100 product-page taps in the
published sub-niche aggregate. It says nothing about trial starts or paid subscriptions.

## 2. Match only dimensions that matter to the metric

For TTR, CR, CPT, and CPA, match scope, requested geo, Apple Ads traffic, and period. Trial length,
price, and paywall type are downstream and are not acquisition denominators.

For subscriber funnel metrics, additionally match the exact funnel step and the relevant
paywall/trial context. `install_to_trial` and `install_to_paid` are not interchangeable.

For LTV and ROAS, match cohort age. Year-1 LTV is not a Day-30 benchmark. Tailored-paywall ROAS in
this dataset is relative uplift, not an absolute default or custom ROAS value.

For CPP and paywall studies, describe the measured relative effect and study scope. Do not turn it
into a universal target or guaranteed result.

## 3. Keep marginal cuts separate

For "Utilities in Brazil", the source has no combined row. A valid answer can show:

- the global Utilities genre or relevant sub-niche aggregate; and
- the all-category Brazil aggregate.

Label them as two independent marginals. Never average, multiply, or otherwise synthesize them into
a Utilities-in-Brazil benchmark. If the user needs one verdict, say that it is unavailable.

## 4. Do not manufacture normalization

The report contains no adjustment coefficients for trial length, subscription price, paywall type,
or traffic mix. Qualitatively name a relevant mismatch when supported, but do not calculate a
corrected value or "normal band". If the mismatch can reverse the conclusion, withhold the verdict.

## 5. Phrase the result narrowly

A valid comparison should contain:

1. the user's metric and denominator;
2. the published aggregate, its exact scope, and the 2026 vintage covering 2025;
3. the arithmetic difference, clearly labeled;
4. the next diagnostic step.

Say "above/below the published aggregate". Do not say statistically significant, normal, or
abnormal: the public data contains aggregates, not the row-level distribution needed for those
claims.

Include the report-wide sample of 8,000+ apps and 1,000,000+ ad groups. When confidence could be
misread, add that per-row app counts were not published.

## Refusal examples

- Weekly trial-to-paid baseline: unavailable; the report has no matching published baseline.
- Absolute custom-paywall ROAS: unavailable; only relative uplift is published.
- A bid recommendation from a country CPA: refuse; allowed CPA must come from the app's own unit
  economics.
- A requested category-by-country aggregate: unavailable as a single benchmark; offer the two
  marginals instead.
