import { createAsyncThunk } from '@reduxjs/toolkit';
import type {
  CommonMigrationUpdateFulfilledPayload,
  MigratorUnstakeProps,
  MigratorExecuteProps,
  MigratorUpdateProps,
} from './migration-types';
import type { BeefyState } from '../../../../redux-types';
import { selectVaultById } from '../../selectors/vaults';
import { selectTokenByAddress } from '../../selectors/tokens';
import { selectUserBalanceToMigrateByVaultId } from '../../selectors/migration';
import type { Step } from '../../reducers/wallet/stepper';
import { walletActions } from '../../actions/wallet-actions';
import { startStepperWithSteps } from '../../actions/stepper';
import { isTokenErc20 } from '../../entities/token';
import { selectAllowanceByTokenAddress } from '../../selectors/allowances';
import type { VaultEntity } from '../../entities/vault';
import { BigNumber } from 'bignumber.js';
import type { Hash } from 'viem';

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
    const fixedBalance = new BigNumber(balance).shiftedBy(-depositToken.decimals);
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
    //  // / / / // // ss eslint-disable-next-line
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
        action: walletActions.migrateUnstake(
          call,
          vault,
          balance.shiftedBy(depositToken.decimals),
          migrationId
        ),
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
            action: walletActions.approval(depositToken, vault.contractAddress, balance),
            pending: false,
          });
        }
      }

      steps.push({
        step: 'deposit',
        message: t('Vault-TxnConfirm', { type: t('Deposit-noun') }),
        action: walletActions.deposit(vault, balance, true),
        pending: false,
        extraInfo: { vaultId: vault.id },
      });

      dispatch(startStepperWithSteps(steps, vault.chainId));
    }
  );
}
