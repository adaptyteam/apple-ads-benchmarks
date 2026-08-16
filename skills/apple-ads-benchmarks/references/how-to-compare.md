# The normalization protocol

## Why this file is longer than the data

A benchmark table is a commodity. The reason a comparison is usually wrong is that the two numbers
describe different populations, and nothing in the table warns you.

## The five dimensions

Resolve all five before any verdict. If one is unknown, ask; if it stays unknown, say the
comparison is not possible rather than producing one with a caveat attached.

### 1. Geo

Acquisition cost varies by more than an order of magnitude between markets. A global median against
US-only traffic is not a comparison; it is a category error.

- If the user's spend is concentrated in one market, compare against that market's row or say there
  is none.
- If it is spread, weight by spend — not by installs, and not evenly.

### 2. Price and trial length

Trial conversion is largely a function of trial length and price before it is a function of app
quality. A 3-day trial converts differently from a 7-day trial by construction.

Never compare a trial CR across different trial lengths without saying which direction the
difference pushes.

### 3. Traffic source

Organic, Apple Ads and other paid channels convert differently. The report's figures describe Apple
Ads traffic. Comparing them against a user's blended number will make paid traffic look worse than
it is, every time.

### 4. Cohort age

Day-30 revenue against day-90 revenue is a difference in elapsed time, not in performance. Match the
window, or say the windows do not match.

For a monthly subscription, a day-7 number is entirely pre-renewal and always looks like a loss —
that is not a finding.

### 5. Paywall type

Hard and soft paywalls give every downstream rate a different denominator. A soft paywall's
install→trial rate is not comparable to a hard paywall's.

## Worked example

> **User:** our trial conversion is 8.1%, is that bad?
>
> **Wrong:** "The benchmark is 12%, so you are underperforming."
>
> **Right:** "Which markets is that traffic from, how long is your trial, and is that Apple Ads
> traffic or blended? — Given Tier-2 markets on a 3-day trial from Apple Ads: the category median
> is X% (2025 data, N apps), but that median is a 7-day-trial, mixed-geo population. Both of your
> differences push the number down. Normalized, 8.1% sits inside the normal band. The number worth
> looking at instead is trial→paid, where your geo mix matters much less."

The right answer asks two questions, quotes the vintage, names the direction of each difference, and
ends by pointing at a more useful metric.

## The verdict sentence

Always the same four parts:

1. the user's number,
2. the benchmark, with vintage and sample,
3. which dimensions differ and in which direction,
4. the normalized conclusion — and what to do about it.

Drop part 3 and the sentence becomes misinformation.
