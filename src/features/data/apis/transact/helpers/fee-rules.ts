import type { TokenEntity } from '../../../entities/token.ts';
import type { VaultEntity } from '../../../entities/vault.ts';
import type { ZapFeeEndpointMatcher, ZapFeeRule } from '../../config-types.ts';

export const ZAP_FEE_BPS = 5;

export const ZAP_FEE_CONDITION_IDS = ['zapIn', 'zapOut', 'migrate'] as const;
export type ZapFeeConditionId = (typeof ZAP_FEE_CONDITION_IDS)[number];

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
  if (rule.kind !== 'waive' && rule.kind !== 'discount') {
    return false;
  }
  if (rule.kind === 'discount' && (!Number.isInteger(rule.bps) || (rule.bps ?? -1) < 0)) {
    return false;
  }
  // A featured rule with no condition would badge every vault on every chain — disallowed.
  if (rule.featured && rule.condition === undefined) {
    return false;
  }
  if (rule.condition !== undefined) {
    if (!(ZAP_FEE_CONDITION_IDS as readonly string[]).includes(rule.condition)) {
      return false;
    }
    if (rule.condition === 'zapIn' && !rule.params?.from) {
      return false;
    }
    if (rule.condition === 'zapOut' && !rule.params?.to) {
      return false;
    }
    if (rule.condition === 'migrate' && !(rule.params?.from && rule.params?.to)) {
      return false;
    }
    // Reject empty sub-matchers (chain-less + fact-less) — they would match anything (fail-open).
    if (rule.params?.from && endpointMatcherIsEmpty(rule.params.from)) {
      return false;
    }
    if (rule.params?.to && endpointMatcherIsEmpty(rule.params.to)) {
      return false;
    }
  }
  return true;
}

// Only input-agnostic rules may be featured on the vault list: no "free" that secretly needs a specific input.
export function isInputAgnosticZapFeeRule(rule: ZapFeeRule): boolean {
  if (rule.params?.from) {
    return false;
  }
  return rule.condition === undefined || rule.condition === 'zapOut';
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

// Input unknown on the vault list, so in/migrate conditions (which need the input side) can never apply here.
export function featuredRuleApplies(
  rule: ZapFeeRule,
  vault: VaultEntity,
  nowSeconds: number
): boolean {
  if (!isWithinZapFeeWindow(rule, nowSeconds)) {
    return false;
  }
  if (rule.condition === undefined) {
    return true;
  }
  if (rule.condition === 'zapOut') {
    const matcher = rule.params?.to?.vault;
    return !!matcher && vaultMatchesMatcher(vault, matcher);
  }
  return false;
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
    const ruleBps = rule.kind === 'discount' ? Math.min(rule.bps ?? baseBps, baseBps) : 0;
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

export function matchFeaturedZapCampaign(
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
  return pickLowestZapFee(rules, baseBps, feeConfig.recipient, rule =>
    featuredRuleApplies(rule, vault, nowSeconds)
  );
}
