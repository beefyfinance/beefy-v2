import type BigNumber from 'bignumber.js';
import { encodeFunctionData } from 'viem';
import { BoostAbi } from '../../../../../config/abi/BoostAbi.ts';
import { bigNumberToBigInt } from '../../../../../helpers/big-number.ts';
import type { BoostPromoEntity } from '../../../entities/promo.ts';
import type { TokenErc20 } from '../../../entities/token.ts';
import type { AnyStrategyId } from '../strategies/strategy-configs.ts';
import type { ZapStep } from '../zap/types.ts';
import { getInsertIndex } from './zap.ts';
import { selectErc20TokenByAddress } from '../../../selectors/tokens.ts';
import type { ZapTransactHelpers } from '../strategies/IStrategy.ts';

/** v1 boosts mint nothing, so only v2+ (BeefyRewardPool) has a receipt a zap can hand back */
export const BOOST_ZAP_MIN_VERSION = 2;

/**
 * Routes `maybeWrapBoost` decorates in place, and where the withdraw share override applies.
 * Excludes conic/yieldbasis/reward-pool-to-vault, which build their order inline in fetchDepositStep.
 */
const boostDecoratableIds = [
  'vault',
  'single',
  'uniswap-v2',
  'solidly',
  'curve',
  'gamma',
  'balancer',
  'pendle-v2',
  'vault-composer',
] as const satisfies ReadonlyArray<AnyStrategyId>;

export const boostDecoratableStrategyIds: ReadonlySet<AnyStrategyId> = new Set<AnyStrategyId>(
  boostDecoratableIds
);

/** Deposit: cross-chain and vault-to-vault are decorated inside `VaultDestHandler` instead. */
export const boostStakeableStrategyIds: ReadonlySet<AnyStrategyId> = new Set<AnyStrategyId>([
  ...boostDecoratableIds,
  'cross-chain',
  'vault-to-vault-single-token',
]);

/**
 * Withdraw: cross-chain is decorated inside `VaultSourceHandler`. vault-to-vault is deliberately
 * absent — a position split between vault and boost has no agreed UX yet, so the checkbox is not
 * offered there even though the source leg would support it.
 */
export const boostUnstakeableStrategyIds: ReadonlySet<AnyStrategyId> = new Set<AnyStrategyId>([
  ...boostDecoratableIds,
  'cross-chain',
]);

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
 * has no way to pass those on. Rewards stay in the boost for the user to claim themselves.
 */
export function buildBoostWithdrawZapStep(boost: BoostPromoEntity, amountWei: BigNumber): ZapStep {
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
  boost: BoostPromoEntity,
  shareToken: TokenErc20,
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
