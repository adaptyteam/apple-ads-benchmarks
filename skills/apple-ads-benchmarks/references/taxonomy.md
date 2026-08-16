# Category taxonomy

Rows in `data/` key on `category`. Values are lowercase kebab-case.

| Key | App Store category | Notes |
|---|---|---|
| `all` | — | whole-sample figures |
| `utilities` | Utilities | remote controls, VPN, scanners, cleaners |
| `health-fitness` | Health & Fitness | |
| `photo-video` | Photo & Video | includes AI editors |
| `education` | Education | includes language learning |

> **Incomplete.** The 2026 report covers 59 sub-niches; the table above lists only the keys used by
> rows already in `data/`. Extend it as rows are extracted, and keep the keys stable — a vertical
> guide in `apple-ads-cli` references them through its `benchmarks:` frontmatter field, so renaming
> a key silently breaks that link.

## Contract with apple-ads-cli

Vertical guides declare `benchmarks: <key>` in frontmatter. That key, plus the column names in
`data/*.csv`, is the **public interface** of this repository. File paths and directory layout are
not — reorganize freely, but never rename a key or a column without a migration.
