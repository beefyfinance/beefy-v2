import type BigNumber from 'bignumber.js';
import { encodeFunctionData } from 'viem';
import { BoostAbi } from '../../../../../config/abi/BoostAbi.ts';
import { bigNumberToBigInt } from '../../../../../helpers/big-number.ts';
import type { BoostPromoEntity } from '../../../entities/promo.ts';
import type { TokenErc20 } from '../../../entities/token.ts';
import type { AnyStrategyId } from '../strategies/strategy-configs.ts';
import type { ZapStep } from '../zap/types.ts';
import { getInsertIndex } from './zap.ts';

/**
 * v1 boosts hold the staked balance in an internal ledger and mint nothing, so a zap has no token
 * to hand back to the user. v2+ (BeefyRewardPool) mints a transferable 1:1 ERC20 receipt.
 */
export const BOOST_ZAP_MIN_VERSION = 2;

/**
 * Strategies that `TransactApi.getStrategyById` can wrap with the boost decorator directly.
 *
 * Excluded: conic, yieldbasis and reward-pool-to-vault build their order inline inside
 * fetchDepositStep, leaving nothing to decorate.
 */
export const boostDecoratableStrategyIds: ReadonlySet<AnyStrategyId> = new Set<AnyStrategyId>([
  'vault',
  'single',
  'uniswap-v2',
  'solidly',
  'curve',
  'gamma',
  'balancer',
  'pendle-v2',
  'vault-composer',
]);

/**
 * Strategies whose deposit can end in a boost stake, i.e. when the checkbox is offered.
 *
 * Superset of {@link boostDecoratableStrategyIds}: cross-chain and vault-to-vault are never
 * decorated at the strategy level, they run their destination leg through `VaultDestHandler`,
 * which decorates the inner destination strategy itself.
 */
export const boostStakeableStrategyIds: ReadonlySet<AnyStrategyId> = new Set<AnyStrategyId>([
  ...boostDecoratableStrategyIds,
  'cross-chain',
  'vault-to-vault-single-token',
]);

/** The stake step this feature appends, as opposed to a gov/reward-pool strategy's own stake step */
export function isBoostStakeStep(step: {
  type: string;
}): step is { type: 'stake'; boostId: string } {
  const boostId = (step as { boostId?: unknown }).boostId;
  return step.type === 'stake' && typeof boostId === 'string' && boostId.length > 0;
}

export function findBoostStakeStep(
  steps: ReadonlyArray<{ type: string }>
): { boostId: string } | undefined {
  return steps.find(isBoostStakeStep);
}

/**
 * The receipt token is the boost contract itself. It is not in the addressbook and never enters
 * the token store, so it is synthesized on demand. Minted 1:1 against the share token, hence the
 * shared decimals/oracleId.
 */
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
 * `stake` pulls the share token from the caller and mints the receipt to it, so listing the share
 * token in `tokens` does double duty: the router approves the boost to spend it, and rewrites the
 * amount with its own live balance.
 */
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
