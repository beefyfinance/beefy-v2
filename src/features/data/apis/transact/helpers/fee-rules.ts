import type { TokenEntity } from '../../../entities/token.ts';
import type { VaultEntity } from '../../../entities/vault.ts';
import type { ZapFeeEndpointMatcher, ZapFeeRule } from '../../config-types.ts';

// Max allowed feeBps; a higher value in zaps.json is treated as a typo and clamped.
export const ZAP_FEE_BPS_MAX = 5;

export function clampZapFeeBps(bps: number): number {
  if (bps <= ZAP_FEE_BPS_MAX) {
    return bps;
  }
  console.warn(`zap feeBps ${bps} exceeds max ${ZAP_FEE_BPS_MAX}; clamping`);
  return ZAP_FEE_BPS_MAX;
}

export type ZapFeeMatch = {
  effectiveBps: number;
  baseBps: number;
  recipient: string;
  winner?: ZapFeeRule;
};

type VaultMatcher = NonNullable<ZapFeeEndpointMatcher['vault']>;
type TokenMatcher = NonNullable<ZapFeeEndpointMatcher['token']>;

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

export function isValidZapFeeRule(rule: ZapFeeRule): boolean {
  if (typeof rule?.id !== 'string') {
    return false;
  }
  if (!Number.isInteger(rule.bps) || rule.bps < 0) {
    return false;
  }
  if (!rule.input && !rule.output) {
    return false;
  }
  // empty matchers would match anything (fail-open)
  if (rule.input && endpointMatcherIsEmpty(rule.input)) {
    return false;
  }
  if (rule.output && endpointMatcherIsEmpty(rule.output)) {
    return false;
  }
  return true;
}

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

export function matchFeaturedVaultCampaign(
  rules: ZapFeeRule[],
  feeConfig: { recipient: string; bps: number },
  vault: VaultEntity,
  nowSeconds: number
): ZapFeeMatch | undefined {
  if (!feeConfig.recipient) {
    return undefined;
  }
  const baseBps = feeConfig.bps;
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
