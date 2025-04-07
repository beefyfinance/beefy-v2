import { createAsyncThunk } from '@reduxjs/toolkit';
import type {
  Migrator,
  MigratorExecuteProps,
  MigratorUnstakeProps,
  MigratorUpdateProps,
} from '../migration-types.ts';
import type { VaultEntity } from '../../../entities/vault.ts';
import type BigNumber from 'bignumber.js';
import type { BeefyState } from '../../../../../redux-types.ts';
import { selectVaultById } from '../../../selectors/vaults.ts';
import { getWalletConnectionApi } from '../../instances.ts';
import { selectTokenByAddress } from '../../../selectors/tokens.ts';
import { selectUserBalanceToMigrateByVaultId } from '../../../selectors/migration.ts';
import { ConicLpTokenStakerAbi } from '../../../../../config/abi/ConicLpTokenStakerAbi.ts';
import type { Step } from '../../../reducers/wallet/stepper.ts';
import { bigNumberToBigInt, fromWeiBigInt, toWei } from '../../../../../helpers/big-number.ts';
import { startStepperWithSteps } from '../../../actions/stepper.ts';
import { isTokenErc20 } from '../../../entities/token.ts';
import { selectAllowanceByTokenAddress } from '../../../selectors/allowances.ts';
import type { ConicMigrationUpdateFulfilledPayload } from './types.ts';
import { fetchContract, fetchWalletContract } from '../../rpc-contract/viem-contract.ts';
import type { Address } from 'abitype';
import type { Hash } from 'viem';
import { migrateUnstake } from '../../../actions/wallet/migrate.ts';
import { approve } from '../../../actions/wallet/approval.ts';
import { deposit } from '../../../actions/wallet/standard.ts';

const CONIC_LP_TOKEN_STAKER = '0xA5241560306298efb9ed80b87427e664FFff0CF9';

export const fetchConicStakedBalance = createAsyncThunk<
  ConicMigrationUpdateFulfilledPayload,
  MigratorUpdateProps,
  {
    state: BeefyState;
  }
>('migration/ethereum-conic/update', async ({ vaultId, walletAddress }, { getState }) => {
  const state = getState();
  const vault = selectVaultById(state, vaultId);

  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const lpTokenStakerContract = fetchContract(
    CONIC_LP_TOKEN_STAKER,
    ConicLpTokenStakerAbi,
    vault.chainId
  );
  const lpContract = fetchContract(depositToken.address, ConicLpTokenStakerAbi, vault.chainId);

  const conicPoolAddress = await lpContract.read.minter();
  const balance = await lpTokenStakerContract.read.getUserBalanceForPool([
    conicPoolAddress,
    walletAddress as Address,
  ]);

  const fixedBalance = fromWeiBigInt(balance, depositToken.decimals);

  return { vaultId, walletAddress, balance: fixedBalance, migrationId: 'ethereum-conic' };
});

async function unstakeCall(
  vault: VaultEntity,
  amount: BigNumber,
  state: BeefyState
): Promise<(args: MigratorUnstakeProps) => Promise<Hash>> {
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const walletApi = await getWalletConnectionApi();
  const walletClient = await walletApi.getConnectedViemClient();

  const lpContract = fetchContract(depositToken.address, ConicLpTokenStakerAbi, vault.chainId);
  const conicPoolAddress = await lpContract.read.minter();

  const lpStaker = fetchWalletContract(CONIC_LP_TOKEN_STAKER, ConicLpTokenStakerAbi, walletClient);
  const amountInWei = toWei(amount, depositToken.decimals);

  return (args: MigratorUnstakeProps) =>
    lpStaker.write.unstake([bigNumberToBigInt(amountInWei), conicPoolAddress], args);
}

export const executeConicAction = createAsyncThunk<
  void,
  MigratorExecuteProps,
  {
    state: BeefyState;
  }
>(
  'migration/ethereum-conic/execute',
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

export const migrator: Migrator = { update: fetchConicStakedBalance, execute: executeConicAction };
