# Taxonomy and stable keys

`data/2026/taxonomy.csv` is the authoritative label-to-key map. Resolve labels through it instead
of inventing slugs in an answer or integration.

It contains three independently usable entity scopes:

| Scope | Rows | Purpose |
|---|---:|---|
| `app_store_genre` | 22 | Primary App Store genres from the workbook |
| `report_category` | 15 | The 14 PDF category families plus one explicit unclassified bucket |
| `sub_niche` | 59 | Report niches used by the acquisition matrix |

The `parent_key` on a sub-niche points to a report category. The workbook tag `Apps` is not assigned
to a category on the PDF taxonomy page, so it is kept under `unclassified`; no parent was inferred.

Existing public keys remain stable, including `utilities`, `health-fitness`, `photo-video`, and
`education`. Keys are lowercase kebab-case. The singular `photo-video` key is intentionally kept
even when a source label uses an ampersand.

Country rows use ISO 3166-1 alpha-2 codes in `geo`. Countries are not duplicated into this taxonomy
file.

## No compound taxonomy

Country, App Store genre, and sub-niche acquisition rows are separate marginal aggregates. The
acquisition matrix has no category-by-country or niche-by-country rows. A consumer must never build
a compound acquisition key or synthesize an intersection. Subscriber economics is a separate
dataset and includes the PDF's explicitly scoped US-only category install-to-paid medians; those
rows must not be reused as acquisition benchmarks.

## Contract with apple-ads-cli

Vertical guides may declare `benchmarks: <key>` in frontmatter. That key and the public CSV columns
form the integration contract. Renaming a key requires an explicit migration; display labels may be
updated without changing the key.
