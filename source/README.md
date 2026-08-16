# Non-redistributed source material

The published PDF and companion workbook are audit inputs, not repository or plugin assets. Keep
local copies outside this repository. `.gitignore` also rejects accidental copies under `source/`.

The expected sources are recorded in `data/2026/manifest.json`:

- `apple_ads_for_subscription_apps_2026.pdf` — definitions, scope, methodology, printed values,
  and published rounding;
- `ASA benchmarks 2026.xlsx` — complete aggregate matrix values before PDF-style rounding.

The manifest records each basename and SHA-256. Verify those hashes before a manual re-extraction.
If a value printed in the PDF differs from the workbook after applying published rounding, the PDF
wins.

Extraction is a one-off, manually reviewed release task. It is deliberately absent from build and
CI. Only derived CSV/JSON may be committed; never commit or bundle the source files or raw
impressions, taps, downloads, and spend.

Public report: https://adapty.io/apple-ads-for-subscription-apps/
