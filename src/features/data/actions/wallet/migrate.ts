import type { MigratorUnstakeProps } from '../../apis/migration/migration-types.ts';
import type { Hash } from 'viem';
import type { VaultEntity } from '../../entities/vault.ts';
import type BigNumber from 'bignumber.js';
import type { MigrationConfig } from '../../reducers/wallet/migration-types.ts';
import {
  bindTransactionEvents,
  captureWalletErrors,
  selectVaultTokensToRefresh,
  txStart,
  txWallet,
} from './common.ts';
import { selectWalletAddress } from '../../selectors/wallet.ts';
import { rpcClientManager } from '../../apis/rpc-contract/rpc-manager.ts';
import { selectTokenByAddress } from '../../selectors/tokens.ts';
import { selectChainById } from '../../selectors/chains.ts';
import { getGasPriceOptions } from '../../utils/gas-utils.ts';
import type { Address } from 'viem';

export const migrateUnstake = (
  unstakeCall: (args: MigratorUnstakeProps) => Promise<Hash>,
  vault: VaultEntity,
  amount: BigNumber,
  migrationId: MigrationConfig['id']
) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const publicClient = rpcClientManager.getBatchClient(vault.chainId);
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const chain = selectChainById(state, vault.chainId);
    const gasPrices = await getGasPriceOptions(chain);
    txWallet(dispatch);
    const transaction = unstakeCall({
      account: address as Address,
      ...gasPrices,
      chain: publicClient.chain,
    });

    bindTransactionEvents(
      dispatch,
      transaction,
      publicClient,
      { spender: vault.contractAddress, amount, token: depositToken },
      {
        walletAddress: address,
        chainId: vault.chainId,
        spenderAddress: vault.contractAddress,
        tokens: selectVaultTokensToRefresh(state, vault),
        migrationId,
        vaultId: vault.id,
      }
    );
  });
};
