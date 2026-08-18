/**
 * Asset grouping for the simplified vault list.
 *
 * Applied to a token's display SYMBOL, not its addressbook id. Symbols get most of the way there
 * (`MSTRrh` -> MSTR) but still split what users read as one asset: `USDCe`, `USDT0`, `WETHe`.
 * The simplified view lists one row per user-facing asset, so those collapse onto a single key.
 *
 * Only genuinely fungible-by-intent variants are merged: bridged/native issuances of the same
 * underlying. Distinct tokens that merely track the same asset (cbETH, wstETH, cbBTC, ...) are
 * deliberately left alone — they carry their own yield and risk.
 */
const ASSET_ALIASES: Record<string, string> = {
  usdce: 'USDC',
  'usdc.e': 'USDC',
  usdbc: 'USDC',
  usdcn: 'USDC',
  arbusdce: 'USDC',
  opusdce: 'USDC',
  pusdce: 'USDC',
  usdcm: 'USDC',
  usdcs: 'USDC',
  usdt0: 'USDT',
  usdte: 'USDT',
  'usdt.e': 'USDT',
  fusdt: 'USDT',
  xusdt: 'USDT',
  wethe: 'WETH',
  'eth.e': 'WETH',
};

/** Canonical key for a token symbol, e.g. `USDCe` -> `USDC` */
export function normalizeSimplifiedAsset(symbol: string): string {
  return ASSET_ALIASES[symbol.toLowerCase()] || symbol;
}
