import { isTokenEqual, type TokenEntity } from '../../../entities/token.ts';
import type { ZapTransactHelpers } from './IStrategy.ts';
import type { StrategySwapConfig } from './strategy-configs.ts';

// Identity matches are trivially routable to themselves; verify the OTHER pool tokens are
// reachable, matching aggregatorTokenSupport's `.every` filter that gates fetchDepositOptions.
export async function canRouteToAllOf(
  helpers: ZapTransactHelpers,
  swap: StrategySwapConfig | undefined,
  poolTokens: TokenEntity[],
  token: TokenEntity
): Promise<boolean> {
  const targets = poolTokens.filter(pt => !isTokenEqual(pt, token));
  if (targets.length === 0) return true;
  const { swapAggregator, vault, getState } = helpers;
  const state = getState();
  const results = await Promise.all(
    targets.map(pt =>
      swapAggregator.canSwapTokenPair(token, pt, vault.id, vault.chainId, state, swap)
    )
  );
  return results.every(Boolean);
}

export async function canRouteToAnyOf(
  helpers: ZapTransactHelpers,
  swap: StrategySwapConfig | undefined,
  poolTokens: TokenEntity[],
  token: TokenEntity
): Promise<boolean> {
  if (poolTokens.some(pt => isTokenEqual(pt, token))) return true;
  const { swapAggregator, vault, getState } = helpers;
  const state = getState();
  const results = await Promise.all(
    poolTokens.map(pt =>
      swapAggregator.canSwapTokenPair(token, pt, vault.id, vault.chainId, state, swap)
    )
  );
  return results.some(Boolean);
}
