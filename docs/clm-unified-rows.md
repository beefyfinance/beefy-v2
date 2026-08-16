# Unified CLM rows & unified CLM vault page — decisions

Implemented 2026-08-16. Each CLM family (gov reward pool + optional autocompounding standard
vault) now renders as ONE row in the home list, and the vault page is a unified page for the
family with an "Autocompounding" toggle. This file records every product/technical decision,
the alternatives considered, and what to revisit with the team.

Config facts the design relies on (verified across all 31 chain configs, 808 CLMs):
no CLM has more than 1 pool or more than 1 vault (any status); 797/808 have a pool;
0 have a vault without a pool; the 11 wrapper-less bare CLMs are all EOL.

## List

| Decision | Picked | Alternatives / notes | Revisit? |
|---|---|---|---|
| Collapse unit | One row per CLM family, grouped via `cowcentratedIds`, ANY status (retired pairs collapse too) | Active-only collapse (retired stay split) was considered; rejected to keep the retired filter clean too | — |
| Row anchor | The gov pool id (a real vault id) — keeps virtuoso keys, counts, scroll restore simple | Synthetic group ids (more plumbing) | — |
| Row display | Two lines per stat cell: line 1 = vault (autocompound icon), line 2 = pool (CLM icon); fixed order everywhere | Icons are placeholder design language: `autocompound.svg` (new) + existing `clm.svg`; design should supply final glyphs | design |
| Single-product CLM rows | Pool-only (and hypothetical vault-only) rows ALSO show their side's icon on the single value line (`clmSide` prop on the row stat components, home list only) — users learn the icon language on every CLM row, making dual rows instantly readable. Their existing sub-values (underlying TVL, deposited USD) are kept | Added 2026-08-16 after review; dashboard rows unaffected | — |
| APY/Daily when neither side earns | Single plain "-" (no per-side lines/icons) when both sides are hidden (retired / paused-not-earning), in list rows and page header alike | Dual "- / -" carried no information | — |
| Evicted sub-values | Previous subValue content (underlying TVL, deposited USD, unboosted APY) moved to tooltips | — | design |
| Row link | Whole row → active vault, else pool | Per-side click targets (two buttons) deferred — needs anchor restructuring + design for tap targets | later |
| Filters | Row appears iff EITHER member passes; always renders both lines. So "Vaults" strategy filter drops RP-only CLMs; "Pools" shows all | Filters could instead un-collapse into single rows — rejected (complexity) | — |
| Sort keys (invisible) | TVL = status-aware family total (see below); Deposited = sum; APY/Daily = max | User picked "max, but per-stat common sense"; sums for money-in, max for rates | team review |
| Family TVL total | `vault active ? pool + vault : max(pool, vault)` — pool TVL only excludes the vault's stake while the vault is ACTIVE (`middlewares/tvl.ts`), so a naive sum double-counts paused/EOL vaults | Same figure used for the TVL tooltip total | — |
| Relevance (search) sort | Max score over members that PASSED filters only — the score map is populated before the min-TVL filter check, so non-passing members' scores must not rank | — | — |
| Default sort, deposited category | Family ranked by WORST status among members the user deposited in (dead deposits still surface) | Rank by best/link-target status would hide dead deposits | team review |
| Status tags/styling | "Retired" tag + retired row styling only when ALL members retired; "Paused" from the link-target member; promo/free-zap/migrate = any member | — | — |
| CLM tag | Uniform "CLM &#124; fee" tag on ALL CLM rows (family AND pool-only), the vault-page header, and featured/spotlight cards — opt-in `unifiedClmTag` prop. "CLM Pool"/"CLM Vault" naming dropped from these surfaces: the per-product split is carried by the line icons and the page toggle instead. Dashboard and treasury keep product-specific tags (per-product views) | Initially only family rows got the CLM tag while pool-only rows kept "CLM POOL" — revised 2026-08-16 after review: inconsistent, and "Pool" reads as liquidity pool | — |
| Counts | "Showing X of Y" and no-results "Show N matches" are ROW counts now | — | — |
| Deposited display when funds in both | Both lines show own amounts; tooltip shows per-side USD + total | Summing into one number would mislead click-through | — |

## Page

| Decision | Picked | Alternatives / notes | Revisit? |
|---|---|---|---|
| Toggle state | URL is the toggle: `/vault/<poolId>` = off, `/vault/<vaultId>` = on; flip = history.replace to sibling id preserving route shape (network prefix), query and hash | Separate in-page toggle state rejected: URL-as-source-of-truth keeps refresh/share/dashboard links consistent | — |
| Default side | Active vault if it exists, else pool (bare-CLM redirect changed from pool-canonical) — pushes users toward autocompounding | Old behavior: always pool. User-visible change for shared CLM links | — |
| Toggle sides | Exist for ANY-status wrappers; retired side labeled "(Retired)" so depositors can reach its withdraw form from the home list; defaults/redirects/row links never TARGET a retired product | Active-only sides would dead-end depositors of a retired vault (home list row links to the pool) | — |
| Toggle visibility | Hidden when family has no vault at all; never shown on the bare-CLM debug page (`?__disable_redirect`) or non-CLM vaults | — | — |
| Toggle labels | Buttons name the products: "Reward Pool &#124; Autocompound" (no separate label text); retired side gets "(Retired)" suffix | Originally "AUTOCOMPOUNDING Off/On" — revised 2026-08-16: with product naming removed from tags, the toggle is where the products get named | — |
| Header stats | Both products always shown as dual lines (vault first) in TVL/APY/Daily/Deposited; active side highlighted; tooltips bound to active side (except TVL/Deposited which show family totals) | — | design |
| 5th stat cell | Unchanged — CLM-likes already render LastHarvest (covers CLM + vault harvests) | — | — |
| Card remount on flip | Content columns keyed by vault id: Transact re-inits (form reset accepted), HistoricGraphs/Details local state resets (required — stat/tab could be invalid for the other product) | Header block deliberately NOT keyed → no flicker | — |
| Scroll | `ScrollRestorer` skips scroll-to-top for replace navigations flagged `state.preserveScroll` | — | — |
| ClmVaultBanner | Removed (pool page banner advertising the vault) — the toggle supersedes it | Revert = restore `src/components/Banners/ClmVaultBanner/` + `Banner-ClmVault*` keys + `fromVault` branch in `UnstakedClmBannerVault` | — |
| Saved vaults / share | Operate on the active side's id; saved entries remain per-wrapper | Could dedupe saved entries per family | later |

## Out of scope / kept as-is

- Dashboard keeps split per-product rows (accounting view).
- Retired filter shows ONE collapsed row per fully-EOL'd family (members are EOL'd together
  per ops practice; vault-first when split ever happens).
- Split-status edge (active pool + retired vault): row shows both lines, links to the pool;
  the retired vault is reachable via the page toggle, dashboard, or direct URL.
- Per-side deep links from the list row (autocompound/pool buttons) — future iteration once
  the icon language is established.
