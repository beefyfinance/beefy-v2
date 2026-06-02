import type { TokenEntity } from '../../../entities/token.ts';
import type { VaultEntity } from '../../../entities/vault.ts';
import type { ZapFeeEndpointMatcher, ZapFeeRule } from '../../config-types.ts';

export const ZAP_FEE_BPS = 5;

export type ZapFeeMatch = {
  effectiveBps: number;
  baseBps: number;
  recipient: string;
  winner?: ZapFeeRule;
};

type VaultMatcher = NonNullable<ZapFeeEndpointMatcher['vault']>;
type TokenMatcher = NonNullable<ZapFeeEndpointMatcher['token']>;

// A sub-matcher is empty when it carries neither chain scope nor any fact — would mean "match anything",
// so config like `{ to: { vault: {} } }` is rejected as fail-open (see isValidZapFeeRule).
function vaultMatcherIsEmpty(m: VaultMatcher): boolean {
  return (
    !m.chainIds &&
    !m.ids &&
    !m.platformIds &&
    !m.strategyTypeIds &&
    !m.assetTypes &&
    !m.assetIds &&
    !m.statuses
  );
}

function tokenMatcherIsEmpty(m: TokenMatcher): boolean {
  return !m.chainIds && !m.ids && !m.addresses && !m.symbols && !m.oracleIds && !m.tags;
}

function endpointMatcherIsEmpty(m: ZapFeeEndpointMatcher): boolean {
  if (m.vault && !vaultMatcherIsEmpty(m.vault)) {
    return false;
  }
  if (m.token && !tokenMatcherIsEmpty(m.token)) {
    return false;
  }
  return true;
}

// Validate against the code vocabulary; invalid rules are dropped (fail-closed).
export function isValidZapFeeRule(rule: ZapFeeRule): boolean {
  if (typeof rule?.id !== 'string') {
    return false;
  }
  if (!Number.isInteger(rule.bps) || rule.bps < 0) {
    return false;
  }
  // At least one side must be constrained; a rule with neither would match every zap (fail-open).
  if (!rule.input && !rule.output) {
    return false;
  }
  // Reject empty matchers (chain-less + fact-less) — they would match anything (fail-open).
  if (rule.input && endpointMatcherIsEmpty(rule.input)) {
    return false;
  }
  if (rule.output && endpointMatcherIsEmpty(rule.output)) {
    return false;
  }
  return true;
}

// A rule can badge a vault only if exactly one side is constrained and that side carries a vault matcher; the
// badge anchors to that side (output → deposit badge, input → exit badge). Multi-sided rules apply at quote
// time but aren't featurable (no single, honest badge). The `featured` flag is the team's opt-in.
export function featurableVaultSide(rule: ZapFeeRule): 'input' | 'output' | undefined {
  const hasInput = !!rule.input;
  const hasOutput = !!rule.output;
  if (hasInput === hasOutput) {
    return undefined;
  }
  if (hasInput) {
    return rule.input?.vault ? 'input' : undefined;
  }
  return rule.output?.vault ? 'output' : undefined;
}

export function isWithinZapFeeWindow(rule: ZapFeeRule, nowSeconds: number): boolean {
  if (rule.startsAt !== undefined && nowSeconds < rule.startsAt) {
    return false;
  }
  if (rule.endsAt !== undefined && nowSeconds > rule.endsAt) {
    return false;
  }
  return true;
}

// Matcher semantics: chain narrows (AND), facts widen (OR); a matcher with no facts matches any
// vault/token on the listed chain(s). Empty matchers are rejected at validation, so "match-all" is
// reachable only via an explicit chain-only matcher.
export function vaultMatchesMatcher(vault: VaultEntity, matcher: VaultMatcher): boolean {
  if (matcher.chainIds && !matcher.chainIds.includes(vault.chainId)) {
    return false;
  }
  const hasFacts =
    !!matcher.ids ||
    !!matcher.platformIds ||
    !!matcher.strategyTypeIds ||
    !!matcher.assetTypes ||
    !!matcher.assetIds ||
    !!matcher.statuses;
  if (!hasFacts) {
    return true;
  }
  return (
    !!matcher.ids?.includes(vault.id) ||
    !!matcher.platformIds?.includes(vault.platformId) ||
    !!matcher.strategyTypeIds?.includes(vault.strategyTypeId) ||
    !!matcher.assetTypes?.includes(vault.assetType) ||
    !!matcher.assetIds?.some(id => vault.assetIds.includes(id)) ||
    !!matcher.statuses?.includes(vault.status)
  );
}

export function tokenMatchesMatcher(token: TokenEntity, matcher: TokenMatcher): boolean {
  if (matcher.chainIds && !matcher.chainIds.includes(token.chainId)) {
    return false;
  }
  const hasFacts =
    !!matcher.ids ||
    !!matcher.addresses ||
    !!matcher.symbols ||
    !!matcher.oracleIds ||
    !!matcher.tags;
  if (!hasFacts) {
    return true;
  }
  const address = token.address.toLowerCase();
  return (
    !!matcher.ids?.includes(token.id) ||
    !!matcher.addresses?.some(a => a.toLowerCase() === address) ||
    !!matcher.symbols?.includes(token.symbol) ||
    !!matcher.oracleIds?.includes(token.oracleId) ||
    !!matcher.tags?.some(tag => token.tags.includes(tag))
  );
}

// Lowest effective bps wins; caller supplies the match predicate (state-bound at quote, pure for featured).
export function pickLowestZapFee(
  rules: ZapFeeRule[],
  baseBps: number,
  recipient: string,
  matches: (rule: ZapFeeRule) => boolean
): ZapFeeMatch {
  let effectiveBps = baseBps;
  let winner: ZapFeeRule | undefined;
  for (const rule of rules) {
    if (!matches(rule)) {
      continue;
    }
    const ruleBps = Math.min(rule.bps, baseBps);
    if (ruleBps < effectiveBps) {
      effectiveBps = ruleBps;
      winner = rule;
    }
    if (effectiveBps <= 0) {
      break;
    }
  }
  return { effectiveBps, baseBps, recipient, winner };
}

// Deposit-side ("free to deposit here") badge: lowest featured rule whose single constrained side is the
// output and whose output.vault matches this vault. (Exit/input-side is the symmetric mirror, added with the
// badge UI.) Rules passed in are already featured + featurable (see selectFeaturedZapFeeRules).
export function matchFeaturedVaultCampaign(
  rules: ZapFeeRule[],
  feeConfig: { recipient: string; bps?: number },
  vault: VaultEntity,
  nowSeconds: number
): ZapFeeMatch | undefined {
  if (!feeConfig.recipient) {
    return undefined;
  }
  const baseBps = feeConfig.bps ?? ZAP_FEE_BPS;
  if (baseBps <= 0) {
    return undefined;
  }
  return pickLowestZapFee(rules, baseBps, feeConfig.recipient, rule => {
    if (!isWithinZapFeeWindow(rule, nowSeconds) || featurableVaultSide(rule) !== 'output') {
      return false;
    }
    const matcher = rule.output?.vault;
    return !!matcher && vaultMatchesMatcher(vault, matcher);
  });
}
