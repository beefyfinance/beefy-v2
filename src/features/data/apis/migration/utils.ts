import type BigNumber from 'bignumber.js';
import type { Hash } from 'viem';
import { fromWei } from '../../../../helpers/big-number.ts';
import { stepperStartWithSteps } from '../../actions/wallet/stepper.ts';
import { approve } from '../../actions/wallet/approval.ts';
import { migrateUnstake } from '../../actions/wallet/migrate.ts';
import { deposit } from '../../actions/wallet/standard.ts';
import { isTokenErc20 } from '../../entities/token.ts';
import type { VaultEntity } from '../../entities/vault.ts';
import type { Step } from '../../reducers/wallet/stepper-types.ts';
import { selectAllowanceByTokenAddress } from '../../selectors/allowances.ts';
import { selectUserBalanceToMigrateByVaultId } from '../../selectors/migration.ts';
import { selectTokenByAddress } from '../../selectors/tokens.ts';
import { selectVaultById } from '../../selectors/vaults.ts';
import type { BeefyState } from '../../store/types.ts';
import { createAppAsyncThunk } from '../../utils/store-utils.ts';
import type {
  CommonMigrationUpdateFulfilledPayload,
  MigratorExecuteProps,
  MigratorUnstakeProps,
  MigratorUpdateProps,
} from './migration-types.ts';

export function buildFetchBalance(
  id: string,
  fetchBalance: (vault: VaultEntity, walletAddress: string, state: BeefyState) => Promise<string>
) {
  return createAppAsyncThunk<CommonMigrationUpdateFulfilledPayload, MigratorUpdateProps>(
    `migration/${id}/update`,
    async ({ vaultId, walletAddress }, { getState }) => {
      const state = getState();
      const vault = selectVaultById(state, vaultId);
      const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);

      const balance = await fetchBalance(vault, walletAddress, state);
      const fixedBalance = fromWei(balance, depositToken.decimals);
      console.debug(id, vault.id, fixedBalance.toNumber());
      return { vaultId, walletAddress, balance: fixedBalance, migrationId: id };
    }
  );
}

export function buildExecute(
  id: string,
  unstakeCall: (
    vault: VaultEntity,
    amount: BigNumber,
    state: BeefyState
  ) => Promise<(args: MigratorUnstakeProps) => Promise<Hash>>
) {
  return createAppAsyncThunk<void, MigratorExecuteProps>(
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

      dispatch(stepperStartWithSteps(steps, vault.chainId));
    }
  );
}
