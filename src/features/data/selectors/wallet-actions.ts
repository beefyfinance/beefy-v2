import { BeefyState } from '../../../redux-types';
import { oracleAmountToMooAmount } from '../utils/ppfs';
import { selectAllowanceByTokenId } from './allowances';
import { selectBoostById } from './boosts';
import { selectTokenById } from './tokens';
import { selectStandardVaultById, selectVaultById, selectVaultPricePerFullShare } from './vaults';

export const selectIsApprovalNeededForDeposit = (state: BeefyState, spenderAddress: string) => {
  const tokenId = state.ui.deposit.selectedToken.id;
  const vaultId = state.ui.deposit.vaultId;
  const vault = selectVaultById(state, vaultId);
  const allowance = selectAllowanceByTokenId(state, vault.chainId, tokenId, spenderAddress);
  return allowance.isLessThan(state.ui.deposit.amount);
};

export const selectIsApprovalNeededForWithdraw = (state: BeefyState, spenderAddress: string) => {
  // to withdraw, the spender must have access to the moo token
  const vaultId = state.ui.withdraw.vaultId;
  const vault = selectVaultById(state, vaultId);
  const mooToken = selectTokenById(state, vault.chainId, vault.earnedTokenId);
  const oracleToken = selectTokenById(state, vault.chainId, vault.oracleId);
  const allowance = selectAllowanceByTokenId(state, vault.chainId, mooToken.id, spenderAddress);
  const ppfs = selectVaultPricePerFullShare(state, vaultId);
  // the amount is expressed in oracletoken amount
  const oracleAmount = state.ui.withdraw.amount;
  const mooAmount = oracleAmountToMooAmount(mooToken, oracleToken, ppfs, oracleAmount);

  return allowance.isLessThan(mooAmount);
};

export const selectIsApprovalNeededForBoostStaking = (
  state: BeefyState,
  spenderAddress: string
) => {
  // to withdraw, the spender must have access to the moo token
  const boostId = state.ui.boostModal.boostId;
  const boost = selectBoostById(state, boostId);
  const vault = selectStandardVaultById(state, boost.vaultId);

  const mooToken = selectTokenById(state, vault.chainId, vault.earnedTokenId);
  const allowance = selectAllowanceByTokenId(state, vault.chainId, mooToken.id, spenderAddress);
  const mooAmount = state.ui.boostModal.amount;

  return allowance.isLessThan(mooAmount);
};
