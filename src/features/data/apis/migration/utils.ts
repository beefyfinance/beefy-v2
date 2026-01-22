import { fromWei } from '../../../../helpers/big-number.ts';
import { approve } from '../../actions/wallet/approval.ts';
import { migrateUnstake } from '../../actions/wallet/migrate.ts';
import { deposit } from '../../actions/wallet/standard.ts';
import { isTokenErc20 } from '../../entities/token.ts';
import type { Step } from '../../reducers/wallet/stepper-types.ts';
import { selectAllowanceByTokenAddress } from '../../selectors/allowances.ts';
import { selectTokenByAddress } from '../../selectors/tokens.ts';
import type { BaseUserData, ExecuteFn, UpdateFn } from './migration-types.ts';
import type {
  BuildExecuteOptions,
  BuildUnstakeCallFn,
  BuildUpdateOptions,
  FetchBalanceFn,
} from './utils-types.ts';
import { getWalletConnectionApi } from '../instances.ts';

export function buildUpdate<TId extends string = string>(
  id: TId,
  fetchBalance: FetchBalanceFn,
  { useDepositTokenSymbol = false }: BuildUpdateOptions = {}
): UpdateFn<TId> {
  return async ({ vault, walletAddress, getState }) => {
    const state = getState();
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const balance = await fetchBalance(vault, walletAddress, state);
    const fixedBalance = fromWei(balance, depositToken.decimals);
    return {
      migrationId: id,
      data: {
        balance: fixedBalance,
        symbol: useDepositTokenSymbol ? depositToken.symbol : undefined,
      },
    };
  };
}

export function buildExecute<
  TId extends string = string,
  TData extends BaseUserData = BaseUserData,
>(
  id: TId,
  buildUnstakeCall: BuildUnstakeCallFn<TId, TData>,
  { depositMax = false }: BuildExecuteOptions = {}
): ExecuteFn<TId, TData> {
  return async params => {
    const {
      vault,
      t,
      getState,
      data: { balance },
    } = params;
    const steps: Step[] = [];
    const state = getState();
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const walletApi = await getWalletConnectionApi();
    const walletClient = await walletApi.getConnectedViemClient();
    const unstakeCall = await buildUnstakeCall({
      ...params,
      walletClient,
    });

    steps.push({
      step: 'migration',
      message: t('Vault-MigrationStart'),
      action: migrateUnstake(unstakeCall, vault, balance, id),
      pending: false,
      extraInfo: { vaultId: vault.id },
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
      action: deposit(vault, balance, depositMax),
      pending: false,
      extraInfo: { vaultId: vault.id },
    });

    return {
      migrationId: id,
      steps,
    };
  };
}
