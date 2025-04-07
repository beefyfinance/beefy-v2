import { createAsyncThunk } from '@reduxjs/toolkit';
import type {
  CommonMigrationUpdateFulfilledPayload,
  MigratorUnstakeProps,
  MigratorExecuteProps,
  MigratorUpdateProps,
} from './migration-types.ts';
import type { BeefyState } from '../../../../redux-types.ts';
import { selectVaultById } from '../../selectors/vaults.ts';
import { selectTokenByAddress } from '../../selectors/tokens.ts';
import { selectUserBalanceToMigrateByVaultId } from '../../selectors/migration.ts';
import type { Step } from '../../reducers/wallet/stepper.ts';
import { startStepperWithSteps } from '../../actions/stepper.ts';
import { isTokenErc20 } from '../../entities/token.ts';
import { selectAllowanceByTokenAddress } from '../../selectors/allowances.ts';
import type { VaultEntity } from '../../entities/vault.ts';
import type BigNumber from 'bignumber.js';
import type { Hash } from 'viem';
import { fromWeiString } from '../../../../helpers/big-number.ts';
import { migrateUnstake } from '../../actions/wallet/migrate.ts';
import { approve } from '../../actions/wallet/approval.ts';
import { deposit } from '../../actions/wallet/standard.ts';

export function buildFetchBalance(
  id: string,
  fetchBalance: (vault: VaultEntity, walletAddress: string, state: BeefyState) => Promise<string>
) {
  return createAsyncThunk<
    CommonMigrationUpdateFulfilledPayload,
    MigratorUpdateProps,
    { state: BeefyState }
  >(`migration/${id}/update`, async ({ vaultId, walletAddress }, { getState }) => {
    const state = getState();
    const vault = selectVaultById(state, vaultId);
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);

    const balance = await fetchBalance(vault, walletAddress, state);
    const fixedBalance = fromWeiString(balance, depositToken.decimals);
    console.debug(id, vault.id, fixedBalance.toNumber());
    return { vaultId, walletAddress, balance: fixedBalance, migrationId: id };
  });
}

export function buildExecute(
  id: string,
  unstakeCall: (
    vault: VaultEntity,
    amount: BigNumber,
    state: BeefyState
  ) => Promise<(args: MigratorUnstakeProps) => Promise<Hash>>
) {
  return createAsyncThunk<void, MigratorExecuteProps, { state: BeefyState }>(
    `migration/${id}/execute`,
    async ({ vaultId, t, migrationId }, { getState, dispatch }) => {
      const steps: Step[] = [];
      const state = getState();
      const vault = selectVaultById(state, vaultId);
      const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
      const { balance } = selectUserBalanceToMigrateByVaultId(state, vaultId, migrationId);

      const call = await unstakeCall(vault, balance, state);

      steps.push({
        step: 'migration',
        message: t('Vault-MigrationStart'),
        action: migrateUnstake(call, vault, balance.shiftedBy(depositToken.decimals), migrationId),
        pending: false,
        extraInfo: { vaultId },
      });

      if (isTokenErc20(depositToken)) {
        const allowance = selectAllowanceByTokenAddress(
          state,
          depositToken.chainId,
          depositToken.address,
          vault.contractAddress
        );
        if (allowance.lt(balance)) {
          steps.push({
            step: 'approve',
            message: t('Vault-ApproveMsg'),
            action: approve(depositToken, vault.contractAddress, balance),
            pending: false,
          });
        }
      }

      steps.push({
        step: 'deposit',
        message: t('Vault-TxnConfirm', { type: t('Deposit-noun') }),
        action: deposit(vault, balance, true),
        pending: false,
        extraInfo: { vaultId: vault.id },
      });

      dispatch(startStepperWithSteps(steps, vault.chainId));
    }
  );
}
