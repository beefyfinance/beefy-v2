import type { VaultEntity, VaultStandard } from '../../entities/vault.ts';
import type BigNumber from 'bignumber.js';
import {
  bindTransactionEvents,
  captureWalletErrors,
  selectVaultTokensToRefresh,
  txStart,
  txWallet,
} from './common.ts';
import { selectWalletAddress } from '../../selectors/wallet.ts';
import { getWalletConnectionApi } from '../../apis/instances.ts';
import { rpcClientManager } from '../../apis/rpc-contract/rpc-manager.ts';
import { selectChainById } from '../../selectors/chains.ts';
import {
  selectChainNativeToken,
  selectErc20TokenByAddress,
  selectTokenByAddress,
} from '../../selectors/tokens.ts';
import { getVaultWithdrawnFromContract } from '../../apis/transact/helpers/vault.ts';
import { fetchWalletContract } from '../../apis/rpc-contract/viem-contract.ts';
import { StandardVaultAbi } from '../../../../config/abi/StandardVaultAbi.ts';
import { getGasPriceOptions } from '../../utils/gas-utils.ts';
import type { Address } from 'viem';
import { bigNumberToBigInt, toWei } from '../../../../helpers/big-number.ts';

export const deposit = (vault: VaultEntity, amount: BigNumber, max: boolean) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const walletApi = await getWalletConnectionApi();
    const viemClient = await walletApi.getConnectedViemClient();
    const publicClient = rpcClientManager.getBatchClient(vault.chainId);

    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const mooToken = selectErc20TokenByAddress(state, vault.chainId, vault.contractAddress);

    const native = selectChainNativeToken(state, vault.chainId);
    const isNativeToken = depositToken.id === native.id;
    const contractAddr = mooToken.address;
    const contract = fetchWalletContract(contractAddr, StandardVaultAbi, viemClient);
    const rawAmount = toWei(amount, depositToken.decimals);
    const chain = selectChainById(state, vault.chainId);
    const gasPrices = await getGasPriceOptions(chain);

    txWallet(dispatch);
    const transaction = (() => {
      if (isNativeToken) {
        return contract.write.depositBNB({
          value: bigNumberToBigInt(rawAmount),
          ...gasPrices,
          account: address as Address,
          chain: publicClient.chain,
        });
      } else {
        if (max) {
          return contract.write.depositAll({
            account: address as Address,
            ...gasPrices,
            chain: publicClient.chain,
          });
        } else {
          return contract.write.deposit([bigNumberToBigInt(rawAmount)], {
            account: address as Address,
            ...gasPrices,
            chain: publicClient.chain,
          });
        }
      }
    })();

    bindTransactionEvents(
      dispatch,
      transaction,
      publicClient,
      { spender: contractAddr, amount, token: depositToken },
      {
        walletAddress: address,
        chainId: vault.chainId,
        spenderAddress: contractAddr,
        tokens: selectVaultTokensToRefresh(state, vault),
        clearInput: true,
      }
    );
  });
};

export const withdraw = (vault: VaultStandard, oracleAmount: BigNumber, max: boolean) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const walletApi = await getWalletConnectionApi();
    const publicClient = rpcClientManager.getBatchClient(vault.chainId);
    const walletClient = await walletApi.getConnectedViemClient();
    const chain = selectChainById(state, vault.chainId);
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);

    const { sharesToWithdrawWei } = await getVaultWithdrawnFromContract(
      {
        token: depositToken,
        amount: oracleAmount,
        max,
      },
      vault,
      state,
      address
    );

    const native = selectChainNativeToken(state, vault.chainId);
    const isNativeToken = depositToken.id === native.id;
    const contract = fetchWalletContract(vault.contractAddress, StandardVaultAbi, walletClient);
    const gasPrices = await getGasPriceOptions(chain);

    txWallet(dispatch);
    const transaction = (() => {
      if (isNativeToken) {
        if (max) {
          return contract.write.withdrawAllBNB({
            account: address as Address,
            ...gasPrices,
            chain: publicClient.chain,
          });
        } else {
          return contract.write.withdrawBNB([bigNumberToBigInt(sharesToWithdrawWei)], {
            account: address as Address,
            ...gasPrices,
            chain: publicClient.chain,
          });
        }
      } else {
        if (max) {
          return contract.write.withdrawAll({
            account: address as Address,
            ...gasPrices,
            chain: publicClient.chain,
          });
        } else {
          return contract.write.withdraw([bigNumberToBigInt(sharesToWithdrawWei)], {
            account: address as Address,
            ...gasPrices,
            chain: publicClient.chain,
          });
        }
      }
    })();

    bindTransactionEvents(
      dispatch,
      transaction,
      publicClient,
      { spender: vault.contractAddress, amount: oracleAmount, token: depositToken },
      {
        chainId: vault.chainId,
        spenderAddress: vault.contractAddress,
        tokens: selectVaultTokensToRefresh(state, vault),
        walletAddress: address,
        clearInput: true,
      }
    );
  });
};
