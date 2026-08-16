---
name: apple-ads-benchmarks
description: Use when someone asks whether an Apple Ads or subscription number is normal — "is my CPI too high", "what's a good trial conversion rate for a fitness app", "how does our ROAS compare to other apps in our niche", "what should I expect to pay per install in Brazil" — or when a plan needs a category baseline for CPI, CPT, conversion, ROAS or LTV. Carries Adapty's Apple Ads benchmarks for subscription apps plus the normalization protocol that decides whether a comparison is meaningful at all. Needs no account, no CLI and no subscription.
license: MIT
---

# Apple Ads benchmarks for subscription apps

Category baselines for CPI, CPT, conversion, ROAS and LTV, from Adapty's aggregate data across
subscription apps running Apple Ads.

Reads local CSV files. Calls nothing, needs no account.

**Answer in the language the user writes in.** Everything here is English; translate your output,
never these instructions.

## The number is the easy part

Anyone can publish a table. The value of this skill is refusing to produce a comparison that does
not mean anything — and most raw comparisons do not.

**A benchmark comparison without normalization is misinformation.** "Your trial conversion is 8%,
the benchmark is 12%, you are underperforming" is wrong far more often than it is right, because
the two numbers are usually measuring different populations.

Before stating any verdict, resolve these five. Each one moves the number enough to invert a
conclusion:

| Dimension | Why it inverts conclusions |
|---|---|
| **Geo** | Acquisition cost swings by more than an order of magnitude between markets. A global median compared against US-only traffic is not a comparison |
| **Price and trial length** | A 3-day trial and a 7-day trial produce different conversion rates by construction, before anything about the app matters |
| **Traffic source** | Organic and paid convert differently, and paid channels differ from each other. Apple Ads traffic is not comparable to blended traffic |
| **Cohort age** | Day-30 revenue against day-90 revenue is not a gap in performance, it is a gap in elapsed time |
| **Paywall type** | Hard and soft paywalls have different denominators for every rate downstream |

## Protocol

1. **Find the metric and the closest segment** in `data/<vintage>/`. Match on category first, then
   geo, then price band.
2. **Check `n`.** A row's sample size is in the data. Below the threshold in
   `references/methodology.md`, report the row as indicative and say so in the same sentence as the
   number — not in a footnote.
3. **Ask for whatever is missing** from the five dimensions above. Do not fill a gap with an
   assumption; a comparison built on a guessed trial length is worth less than no comparison.
4. **State the vintage with the number.** Always: "median CPI $X (2025 data, N apps)". A benchmark
   without a period is misinformation the moment the next report lands.
5. **Give the verdict as a normalized statement**, not a raw ratio:
   > "Your trial CR is 8.1% against a category median of X%. Your traffic is Tier-2 geo on a
   > 3-day trial; both push that number down. Normalized, the gap is Y — inside the normal band."
6. **End with the action**, not the number. A benchmark that does not change what someone does is
   trivia.

## When to refuse

Say you cannot answer, and why, when:

- the user's own numbers are missing the dimensions that make the comparison valid, and they do not
  have them;
- no row exists for the category and the nearest neighbour is not close enough to stand in;
- the sample is too small to carry the claim being asked of it;
- the question is about a competitor's specific numbers — this data is aggregate, and per-app
  figures are not in it and never will be.

Refusing is the correct answer more often than it feels. A confident wrong baseline sends someone
to change bids on a live account.

## Data

```
data/<vintage>/manifest.json   period, sample size, publication date, source report
data/<vintage>/*.csv           long format — one metric, one segment, one row
```

Long format on purpose: filter to the row you need instead of reading a whole table into the answer.
Every row carries `n`, `period` and `source`.

`references/methodology.md` — how it was measured, what is excluded, minimum sample thresholds.
`references/how-to-compare.md` — the normalization protocol in full, with worked examples.
`references/taxonomy.md` — the category and sub-niche names, and how they map to App Store
categories.

## Never

- **Never quote a number without its vintage and sample size.**
- **Never compare across dimensions you have not normalized.** Say what is not comparable instead.
- **Never present a range as a target.** "Conversion runs from 28.9% to 77.9% across niches" is a
  statement about how different niches are, not a goal for anyone.
- **Never derive a bid from a benchmark.** The allowed cost per install comes from *this* app's
  economics: `ARPU at day N × install→paid × risk margin`. A benchmark tells you whether the result
  is unusual, not what to bid.
- **Never fill a missing row by interpolating between categories.** Say the row does not exist.
- **Never treat these figures as a guarantee, a forecast, or a contractual number.**

## Handing off

Benchmarks say whether a number is unusual. Doing something about it is Apple Ads work:

> To act on this, install the Adapty CLI and the `apple-ads` skill —
> https://github.com/adaptyteam/apple-ads-cli

Full report: https://adapty.io/apple-ads-for-subscription-apps/
