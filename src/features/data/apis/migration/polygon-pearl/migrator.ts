import { createAsyncThunk } from '@reduxjs/toolkit';
import type {
  CommonMigrationUpdateFulfilledPayload,
  Migrator,
  MigratorExecuteProps,
  MigratorUnstakeProps,
  MigratorUpdateProps,
} from '../migration-types.ts';
import type { VaultEntity } from '../../../entities/vault.ts';
import type { BigNumber } from 'bignumber.js';
import type { BeefyState } from '../../../../../redux-types.ts';
import { selectVaultById } from '../../../selectors/vaults.ts';
import { getWalletConnectionApi } from '../../instances.ts';
import { selectTokenByAddress } from '../../../selectors/tokens.ts';
import { selectUserBalanceToMigrateByVaultId } from '../../../selectors/migration.ts';
import { SolidlyGaugeAbi } from '../../../../../config/abi/SolidlyGaugeAbi.ts';
import { SolidlyVoterAbi } from '../../../../../config/abi/SolidlyVoterAbi.ts';
import type { Step } from '../../../reducers/wallet/stepper.ts';
import { bigNumberToBigInt, fromWeiBigInt, toWei } from '../../../../../helpers/big-number.ts';
import { startStepperWithSteps } from '../../../actions/stepper.ts';
import { isTokenErc20 } from '../../../entities/token.ts';
import { selectAllowanceByTokenAddress } from '../../../selectors/allowances.ts';
import { fetchContract, fetchWalletContract } from '../../rpc-contract/viem-contract.ts';
import type { Address, Hash } from 'viem';
import { migrateUnstake } from '../../../actions/wallet/migrate.ts';
import { approve } from '../../../actions/wallet/approval.ts';
import { deposit } from '../../../actions/wallet/standard.ts';

const PEARL_VOTER = '0xa26C2A6BfeC5512c13Ae9EacF41Cb4319d30cCF0';

export const fetchPearlStakedBalance = createAsyncThunk<
  CommonMigrationUpdateFulfilledPayload,
  MigratorUpdateProps,
  {
    state: BeefyState;
  }
>('migration/polygon-pearl/update', async ({ vaultId, walletAddress }, { getState }) => {
  const state = getState();
  const vault = selectVaultById(state, vaultId);
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);

  const voterContract = fetchContract(PEARL_VOTER, SolidlyVoterAbi, vault.chainId);
  const gaugeAddress = await voterContract.read.gauges([depositToken.address as Address]);
  const gaugeContract = fetchContract(gaugeAddress, SolidlyGaugeAbi, vault.chainId);
  const balance = await gaugeContract.read.balanceOf([walletAddress as Address]);

  const fixedBalance = fromWeiBigInt(balance, depositToken.decimals);

  return { vaultId, walletAddress, balance: fixedBalance, migrationId: 'polygon-pearl' };
});

async function unstakeCall(
  vault: VaultEntity,
  amount: BigNumber,
  state: BeefyState
): Promise<(args: MigratorUnstakeProps) => Promise<Hash>> {
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const walletApi = await getWalletConnectionApi();
  const walletClient = await walletApi.getConnectedViemClient();

  const voterContract = fetchContract(PEARL_VOTER, SolidlyVoterAbi, vault.chainId);
  const gaugeAddress = await voterContract.read.gauges([depositToken.address as Address]);

  const gaugeContract = fetchWalletContract(gaugeAddress, SolidlyGaugeAbi, walletClient);
  const amountInWei = toWei(amount, depositToken.decimals);

  return (args: MigratorUnstakeProps) =>
    gaugeContract.write.withdraw([bigNumberToBigInt(amountInWei)], args);
}

export const executePearlAction = createAsyncThunk<
  void,
  MigratorExecuteProps,
  {
    state: BeefyState;
  }
>(
  'migration/polygon-pearl/execute',
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

export const migrator: Migrator = { update: fetchPearlStakedBalance, execute: executePearlAction };
