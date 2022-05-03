import { BeefyState } from '../../../redux-types';
import { oracleAmountToMooAmount } from '../utils/ppfs';
import { selectAllowanceByTokenAddress } from './allowances';
import { selectBoostById } from './boosts';
import { selectTokenByAddress } from './tokens';
import { selectStandardVaultById, selectVaultById, selectVaultPricePerFullShare } from './vaults';

export const selectIsApprovalNeededForDeposit = (state: BeefyState, spenderAddress: string) => {
  const tokenAddress = state.ui.deposit.selectedToken.address;
  const vaultId = state.ui.deposit.vaultId;
  const vault = selectVaultById(state, vaultId);
  const allowance = selectAllowanceByTokenAddress(
    state,
    vault.chainId,
    tokenAddress,
    spenderAddress
  );
  return allowance.isLessThan(state.ui.deposit.amount);
};

export const selectIsApprovalNeededForWithdraw = (state: BeefyState, spenderAddress: string) => {
  // to withdraw, the spender must have access to the moo token
  const vaultId = state.ui.withdraw.vaultId;
  const vault = selectVaultById(state, vaultId);
  const mooToken = selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddress);
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const allowance = selectAllowanceByTokenAddress(
    state,
    vault.chainId,
    mooToken.address,
    spenderAddress
  );
  const ppfs = selectVaultPricePerFullShare(state, vaultId);
  // the amount is expressed in depositToken amount
  const oracleAmount = state.ui.withdraw.amount;
  const mooAmount = oracleAmountToMooAmount(mooToken, depositToken, ppfs, oracleAmount);

  return allowance.isLessThan(mooAmount);
};

export const selectIsApprovalNeededForBoostStaking = (
  state: BeefyState,
  spenderAddress: string
) => {
  // to withdraw, the spender must have access to the moo token
  const boostId = state.ui.boostModal.boostId;
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
  const mooAmount = state.ui.boostModal.amount;

  return allowance.isLessThan(mooAmount);
};
