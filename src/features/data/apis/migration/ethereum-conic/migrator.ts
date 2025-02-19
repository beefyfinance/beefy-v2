import { createAsyncThunk } from '@reduxjs/toolkit';
import type {
  Migrator,
  MigratorUnstakeProps,
  MigratorExecuteProps,
  MigratorUpdateProps,
} from '../migration-types';
import type { VaultEntity } from '../../../entities/vault';
import { BigNumber } from 'bignumber.js';
import type { BeefyState } from '../../../../../redux-types';
import { selectVaultById } from '../../../selectors/vaults';
import { getWalletConnectionApi } from '../../instances';
import { selectTokenByAddress } from '../../../selectors/tokens';
import { selectUserBalanceToMigrateByVaultId } from '../../../selectors/migration';
import { ConicLpTokenStakerAbi } from '../../../../../config/abi/ConicLpTokenStakerAbi';
import type { Step } from '../../../reducers/wallet/stepper';
import { walletActions } from '../../../actions/wallet-actions';
import { bigNumberToBigInt, toWei } from '../../../../../helpers/big-number';
import { startStepperWithSteps } from '../../../actions/stepper';
import { isTokenErc20 } from '../../../entities/token';
import { selectAllowanceByTokenAddress } from '../../../selectors/allowances';
import type { ConicMigrationUpdateFulfilledPayload } from './types';
import { fetchContract, fetchWalletContract } from '../../rpc-contract/viem-contract';
import type { Address } from 'abitype';
import type { Hash } from 'viem';

const CONIC_LP_TOKEN_STAKER = '0xA5241560306298efb9ed80b87427e664FFff0CF9';

export const fetchConicStakedBalance = createAsyncThunk<
  ConicMigrationUpdateFulfilledPayload,
  MigratorUpdateProps,
  { state: BeefyState }
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

  const fixedBalance = new BigNumber(balance.toString(10)).shiftedBy(-depositToken.decimals);

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
  { state: BeefyState }
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

export const migrator: Migrator = { update: fetchConicStakedBalance, execute: executeConicAction };
