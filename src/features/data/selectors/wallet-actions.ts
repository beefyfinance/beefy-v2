import type BigNumber from 'bignumber.js';
import type { BoostPromoEntity } from '../entities/promo.ts';
import type { BeefyState } from '../store/types.ts';
import { selectAllowanceByTokenAddress } from './allowances.ts';
import { selectTokenByAddress } from './tokens.ts';
import { selectVaultByIdWithReceipt } from './vaults.ts';

export const selectIsApprovalNeededForBoostStaking = (
  state: BeefyState,
  boost: BoostPromoEntity,
  mooAmount: BigNumber
) => {
  const vault = selectVaultByIdWithReceipt(state, boost.vaultId);
  const mooToken = selectTokenByAddress(state, vault.chainId, vault.receiptTokenAddress);
  const allowance = selectAllowanceByTokenAddress(
    state,
    vault.chainId,
    mooToken.address,
    boost.contractAddress
  );

  return allowance.isLessThan(mooAmount);
};

export const selectWalletActions = (state: BeefyState) => state.user.walletActions;
