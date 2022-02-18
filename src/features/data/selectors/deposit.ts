import { BeefyState } from '../../../redux-types';
import { oracleAmountToMooAmount } from '../utils/ppfs';
import { selectAllowanceByTokenId } from './allowances';
import { selectTokenById } from './tokens';
import { selectVaultById, selectVaultPricePerFullShare } from './vaults';

export const selectIsApprovalEnoughForDeposit = (state: BeefyState, spenderAddress: string) => {
  const tokenId = state.ui.deposit.selectedToken.id;
  const vaultId = state.ui.deposit.vaultId;
  const vault = selectVaultById(state, vaultId);
  const allowance = selectAllowanceByTokenId(state, vault.chainId, tokenId, spenderAddress);
  return allowance.isLessThan(state.ui.deposit.amount);
};

export const selectIsApprovalEnoughForWithdraw = (state: BeefyState, spenderAddress: string) => {
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
