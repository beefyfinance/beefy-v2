import BigNumber from 'bignumber.js';
import type { TFunction } from 'react-i18next';
import type { BoostPromoEntity } from '../../entities/promo';
export declare const claimBoost: (boostId: BoostPromoEntity["id"]) => import("../../store/types").BeefyThunk;
export declare const exitBoost: (boostId: BoostPromoEntity["id"]) => import("../../store/types").BeefyThunk;
export declare const startStakeBoostSteps: (boostId: BoostPromoEntity["id"], t: TFunction, amount: BigNumber) => import("../../store/types").BeefyThunk;
export declare const stakeBoost: (boostId: BoostPromoEntity["id"], amount: BigNumber) => import("../../store/types").BeefyThunk;
export declare const startUnstakeBoostSteps: (boostId: BoostPromoEntity["id"], t: TFunction, amount: BigNumber, max: boolean) => import("../../store/types").BeefyThunk;
export declare const unstakeBoost: (boostId: BoostPromoEntity["id"], amount: BigNumber) => import("../../store/types").BeefyThunk;
