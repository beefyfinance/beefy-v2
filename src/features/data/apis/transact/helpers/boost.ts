import type { BoostPromoEntity } from '../../../entities/promo.ts';
import { TransactMode } from '../../../reducers/wallet/transact-types.ts';

/** v1 boosts mint no receipt token, so the zap router could not hold the stake */
export const BOOST_ZAP_MIN_VERSION = 2;

type BoostableOption = { id: string; boostId?: BoostPromoEntity['id'] };

/** the option's boost is the page vault's: a deposit stakes on the destination leg, a withdraw unstakes on the source leg */
export function boostIdForLeg(
  option: { mode: TransactMode; boostId?: BoostPromoEntity['id'] },
  leg: 'source' | 'dest'
): BoostPromoEntity['id'] | undefined {
  const isDeposit = option.mode === TransactMode.Deposit;
  return (leg === 'dest') === isDeposit ? option.boostId : undefined;
}

/** a copy of the option that also stakes into / unstakes from `boostId` */
export function boostedCounterpart<T extends BoostableOption>(
  option: T,
  boostId: BoostPromoEntity['id']
): T {
  return { ...option, id: `${option.id}-boost-${boostId}`.toLowerCase(), boostId };
}
