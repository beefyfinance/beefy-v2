import type BigNumber from 'bignumber.js';
import type { BeefyState } from '../../../redux-types';
import type { BoostEntity } from '../entities/boost';
import { selectAllowanceByTokenAddress } from './allowances';
import { selectTokenByAddress } from './tokens';
import { selectStandardVaultById } from './vaults';

export const selectIsApprovalNeededForBoostStaking = (
  state: BeefyState,
  spenderAddress: string,
  boost: BoostEntity,
  mooAmount: BigNumber
) => {
  const vault = selectStandardVaultById(state, boost.vaultId);

  const mooToken = selectTokenByAddress(state, vault.chainId, vault.receiptTokenAddress);
  const allowance = selectAllowanceByTokenAddress(
    state,
    vault.chainId,
    mooToken.address,
    spenderAddress
  );

  return allowance.isLessThan(mooAmount);
};

export const selectWalletActions = (state: BeefyState) => state.user.walletActions;
