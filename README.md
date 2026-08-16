# Apple Ads Benchmarks

**What a normal Apple Ads number looks like for a subscription app — and whether your comparison is even valid.**

Adapty's Apple Ads benchmarks, packaged as an agent skill: CPI, CPT, conversion, ROAS and LTV by
niche and country, plus the normalization protocol that stops bad comparisons.

Needs no account, no CLI and no subscription. It reads local CSV files and calls nothing.

> **2026 vintage — 2025 campaigns.** 8,000+ subscription apps, 1,000,000+ ad groups, 90 countries,
> 59 sub-niches. Full report: [Apple Ads benchmarks 2026: CPI & CR by niche](https://adapty.io/apple-ads-for-subscription-apps/)

---

## Why a skill and not a PDF

A PDF answers "what is the median CPI". It cannot answer the question people actually have:

```
Our trial conversion is 8.1%. Is that bad?
```

Which it usually is not — because the benchmark was measured on 7-day trials across mixed markets,
and the asker runs a 3-day trial in Tier-2 geos. Both differences push the number down, and the raw
comparison inverts the conclusion.

So this skill does two things a table cannot: it **normalizes before it judges**, and it **refuses**
when the dimensions needed to normalize are missing. A confident wrong baseline is worse than no
baseline, because someone changes live bids on it.

---

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

Pairs with [**apple-ads-cli**](https://github.com/adaptyteam/apple-ads-cli) — benchmarks tell you
whether a number is unusual; that repo does something about it.

---

## Try it

```
> What's a normal CPI for a utility app in Brazil?
> Our trial conversion is 8.1%. Is that bad?
> We pay $2.51 per install in the US. Is that the market or is it us?
> What should I expect trial-to-paid to be for a weekly subscription?
```

---

## What's inside

```
data/2026/
  manifest.json     period, sample size, publication date, source report
  cpi.csv           cost per install by category and country
  conversion.csv    trial and paid conversion rates
  effects.csv       measured effects — custom product page lift, channel comparison
  ltv-curves.csv    cumulative revenue by cohort day
skills/apple-ads-benchmarks/
  SKILL.md          the comparison protocol
  references/       methodology, normalization protocol, category taxonomy
```

Data is in long format — one metric, one segment, one row — so an agent filters to the row it needs
instead of reading a whole table into its answer. Every row carries `n`, `period` and `source`.

**Vintages are directories.** `data/2026/`, never `data/`. A benchmark quoted without its period is
misinformation the moment the next report lands, and the skill states the vintage with every number.

---

## Status

Headline figures are transcribed and usable. **Per-niche and per-country tables are not yet
extracted** — those rows carry `value=TODO`, and the skill reports them as missing rather than
guessing. `node scripts/validate-data.mjs` shows how many remain.

A `TODO` row means "not extracted yet". It never means zero, and it never means unknown.

---

## What this data is not

- **Not per-app.** No competitor's individual numbers are here, and no aggregate can be reversed
  into one.
- **Not a target.** A median is the middle of a distribution. Half the sample sits below it, and
  plenty of those apps are profitable.
- **Not a forecast**, and not a contractual number.
- **Not Apple's data.** Apple publishes no benchmarks. Spend comes from the Apple Ads API; revenue
  comes from subscription events — which is exactly why revenue benchmarks exist here and nowhere
  else.

---

## Contributing

The public interface of this repo is the **category keys** and the **CSV column names** — vertical
guides in `apple-ads-cli` reference keys through their `benchmarks:` frontmatter field. Reorganize
files freely; never rename a key or a column without a migration.

`node scripts/validate-data.mjs` must pass. It rejects any row without a period, a source, and
either a sample size or a note explaining its absence.
