import { BeefyState } from '../../../redux-types';
import { selectAllowanceByTokenAddress } from './allowances';
import { selectBoostById } from './boosts';
import { selectTokenByAddress } from './tokens';
import { selectStandardVaultById } from './vaults';

export const selectIsApprovalNeededForBoostStaking = (
  state: BeefyState,
  spenderAddress: string
) => {
  // to withdraw, the spender must have access to the moo token
  const boostId = state.ui.boost.boostId;
  if (!boostId) {
    return false;
  }
  const boost = selectBoostById(state, boostId);
  const vault = selectStandardVaultById(state, boost.vaultId);

  const mooToken = selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddress);
  const allowance = selectAllowanceByTokenAddress(
    state,
    vault.chainId,
    mooToken.address,
    spenderAddress
  );
  const mooAmount = state.ui.boost.amount;

  return allowance.isLessThan(mooAmount);
};

export const selectWalletActions = (state: BeefyState) => state.user.walletActions;
