import type { BoostPromoEntity } from '../../../entities/promo.ts';

/** v1 boosts mint no receipt token, so the zap router could not hold the stake */
export const BOOST_ZAP_MIN_VERSION = 2;

type BoostableOption = { id: string; boostId?: BoostPromoEntity['id'] };

/** inserts, after each option `canBoost` accepts, a copy of it that also stakes into `boostId` */
export function insertBoostedCounterparts<T extends BoostableOption>(
  options: T[],
  boostId: BoostPromoEntity['id'],
  canBoost: (option: T) => boolean
): T[] {
  return options.flatMap(option =>
    canBoost(option) ?
      [option, { ...option, id: `${option.id}-boost-${boostId}`.toLowerCase(), boostId }]
    : [option]
  );
}
