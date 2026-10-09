import type BigNumber from 'bignumber.js';
import { encodeFunctionData } from 'viem';
import { BoostAbi } from '../../../../../config/abi/BoostAbi.ts';
import { bigNumberToBigInt } from '../../../../../helpers/big-number.ts';
import type { BoostPromoEntity } from '../../../entities/promo.ts';
import type { TokenErc20 } from '../../../entities/token.ts';
import type { ZapStep } from '../zap/types.ts';
import { getInsertIndex } from './zap.ts';
import { selectErc20TokenByAddress } from '../../../selectors/tokens.ts';
import {
  type ComposableSurface,
  type IStrategy,
  isComposableStrategy,
  type ZapTransactHelpers,
} from '../strategies/IStrategy.ts';

/** v1 boosts mint nothing, so only v2+ (BeefyRewardPool) has a receipt a zap can hand back */
export const BOOST_ZAP_MIN_VERSION = 2;

/** Declared by the routes whose boost leg a handler applies, where support cannot be derived */
export type BoostRouteSupport = {
  stake: boolean;
  unstake: boolean;
};

function declaresBoostSupport(
  strategy: IStrategy
): strategy is IStrategy & { boostSupport: BoostRouteSupport } {
  return 'boostSupport' in strategy;
}

const noBoostSupport: BoostRouteSupport = { stake: false, unstake: false };
const fullBoostSupport: BoostRouteSupport = { stake: true, unstake: true };

/**
 * What the boost decorator can wrap: anything that can hand over a zap breakdown to append the stake
 * to — every composable zap, plus the plain vault route. A basic zap strategy builds its order
 * inline in fetchDepositStep, so there is nothing to append to.
 */
export function canDecorateForBoost(
  strategy: IStrategy
): strategy is IStrategy & ComposableSurface {
  return isComposableStrategy(strategy);
}

function boostSupportOf(strategy: IStrategy): BoostRouteSupport {
  if (declaresBoostSupport(strategy)) {
    return strategy.boostSupport;
  }
  return canDecorateForBoost(strategy) ? fullBoostSupport : noBoostSupport;
}

/**
 * The checkbox selectors are synchronous and have no strategy instance, so the answer rides along on
 * the options the strategy produced. Unstamped means no checkbox, so every option must be stamped
 * before it reaches the store.
 */
export function markOptionsBoostable<T extends { boostable?: boolean }>(
  options: T[],
  strategy: IStrategy,
  side: 'stake' | 'unstake'
): T[] {
  const boostable = boostSupportOf(strategy)[side];
  for (const option of options) {
    option.boostable = boostable;
  }
  return options;
}

export function isOptionBoostable(option: { boostable?: boolean }): boolean {
  return option.boostable === true;
}

/** `boostId` is what separates our steps from a gov/reward-pool strategy's own stake/unstake steps */
function isBoostStep<T extends 'stake' | 'unstake'>(
  step: { type: string },
  type: T
): step is { type: T; boostId: string } {
  const boostId = (step as { boostId?: unknown }).boostId;
  return step.type === type && typeof boostId === 'string' && boostId.length > 0;
}

export const isBoostStakeStep = (step: { type: string }) => isBoostStep(step, 'stake');
export const isBoostUnstakeStep = (step: { type: string }) => isBoostStep(step, 'unstake');

export const findBoostStakeStep = (steps: ReadonlyArray<{ type: string }>) =>
  steps.find(isBoostStakeStep);
export const findBoostUnstakeStep = (steps: ReadonlyArray<{ type: string }>) =>
  steps.find(isBoostUnstakeStep);

export function getBoostRouteTokens(helpers: ZapTransactHelpers, boost: BoostPromoEntity) {
  const { vault, getState } = helpers;
  const shareToken = selectErc20TokenByAddress(getState(), vault.chainId, vault.contractAddress);
  return { shareToken, receiptToken: getBoostReceiptToken(boost, shareToken) };
}

/** The boost contract is itself the receipt token; it never enters the token store, so synthesize it */
export function getBoostReceiptToken(boost: BoostPromoEntity, shareToken: TokenErc20): TokenErc20 {
  return {
    type: 'erc20',
    id: `${boost.id}-receipt`,
    chainId: boost.chainId,
    address: boost.contractAddress,
    decimals: shareToken.decimals,
    symbol: `r${shareToken.symbol}`,
    oracleId: shareToken.oracleId,
    providerId: shareToken.providerId,
    buyUrl: undefined,
    website: undefined,
    description: undefined,
    documentation: undefined,
    tags: [],
  };
}

/**
 * `withdraw` burns the receipt from the caller, so nothing needs approving; listing the receipt
 * rewrites the amount with the router's live balance.
 *
 * Deliberately not `exit()`: that also claims every reward to the caller — the router — and the zap
 * has no way to pass those on. `maybeBoostClaimStep` batches a `getReward()` ahead of the zap instead,
 * so the rewards reach the user's own wallet.
 */
export function buildBoostWithdrawZapStep(
  boost: Pick<BoostPromoEntity, 'contractAddress'>,
  amountWei: BigNumber
): ZapStep {
  return {
    target: boost.contractAddress,
    value: '0',
    data: encodeFunctionData({
      abi: BoostAbi,
      functionName: 'withdraw',
      args: [bigNumberToBigInt(amountWei)],
    }),
    tokens: [{ token: boost.contractAddress, index: getInsertIndex(0) }],
  };
}

/** Listing the share token in `tokens` both approves the boost to pull it and rewrites the amount */
export function buildBoostStakeZapStep(
  boost: Pick<BoostPromoEntity, 'contractAddress'>,
  shareToken: Pick<TokenErc20, 'address'>,
  amountWei: BigNumber
): ZapStep {
  return {
    target: boost.contractAddress,
    value: '0',
    data: encodeFunctionData({
      abi: BoostAbi,
      functionName: 'stake',
      args: [bigNumberToBigInt(amountWei)],
    }),
    tokens: [
      {
        token: shareToken.address,
        index: getInsertIndex(0),
      },
    ],
  };
}
