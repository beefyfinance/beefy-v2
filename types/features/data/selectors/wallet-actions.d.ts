import type BigNumber from 'bignumber.js';
import type { BoostPromoEntity } from '../entities/promo';
import type { BeefyState } from '../store/types';
export declare const selectIsApprovalNeededForBoostStaking: (state: BeefyState, boost: BoostPromoEntity, mooAmount: BigNumber) => boolean;
export declare const selectWalletActions: (state: BeefyState) => import("../reducers/wallet/wallet-action-types").WalletActionsState;
