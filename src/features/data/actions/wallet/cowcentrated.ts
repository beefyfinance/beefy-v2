import type { VaultCowcentrated } from '../../entities/vault.ts';
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
import { selectTransactSelectedQuote, selectTransactSlippage } from '../../selectors/transact.ts';
import { fetchWalletContract } from '../../apis/rpc-contract/viem-contract.ts';
import { BeefyCowcentratedLiquidityVaultAbi } from '../../../../config/abi/BeefyCowcentratedLiquidityVaultAbi.ts';
import { getGasPriceOptions } from '../../utils/gas-utils.ts';
import { slipAllBy } from '../../apis/transact/helpers/amounts.ts';
import { toWeiString } from '../../../../helpers/big-number.ts';
import type { Address } from 'viem';
import { selectTokenByAddress } from '../../selectors/tokens.ts';

export const v3Deposit = (
  vault: VaultCowcentrated,
  amountToken0: BigNumber,
  amountToken1: BigNumber
) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const walletApi = await getWalletConnectionApi();
    const publicClient = rpcClientManager.getBatchClient(vault.chainId);
    const walletClient = await walletApi.getConnectedViemClient();
    const contract = fetchWalletContract(
      vault.contractAddress,
      BeefyCowcentratedLiquidityVaultAbi,
      walletClient
    );

    const chain = selectChainById(state, vault.chainId);
    const tokens = vault.depositTokenAddresses.map(address =>
      selectTokenByAddress(state, vault.chainId, address)
    );
    const rawAmounts = [amountToken0, amountToken1].map((amount, i) =>
      toWeiString(amount, tokens[i].decimals)
    );
    const gasPrices = await getGasPriceOptions(chain);

    const estimatedLiquidity = toWeiString(
      selectTransactSelectedQuote(state)?.outputs[0].amount.times(0.99),
      18
    );
    txWallet(dispatch);

    const transaction = contract.write.deposit(
      [BigInt(rawAmounts[0]), BigInt(rawAmounts[1]), BigInt(estimatedLiquidity)],
      {
        account: address as Address,
        ...gasPrices,
        chain: publicClient.chain,
      }
    );

    bindTransactionEvents(
      dispatch,
      transaction,
      publicClient,
      {
        spender: vault.contractAddress,
        amount: selectTransactSelectedQuote(state)?.outputs[0].amount,
        token: depositToken,
      },
      {
        walletAddress: address,
        chainId: vault.chainId,
        spenderAddress: vault.contractAddress,
        tokens: selectVaultTokensToRefresh(state, vault),
        clearInput: true,
      }
    );
  });
};
export const v3Withdraw = (vault: VaultCowcentrated, withdrawAmount: BigNumber, max: boolean) => {
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
    const slippage = selectTransactSlippage(state);

    const contract = fetchWalletContract(
      vault.contractAddress,
      BeefyCowcentratedLiquidityVaultAbi,
      walletClient
    );
    const gasPrices = await getGasPriceOptions(chain);

    const outputs = selectTransactSelectedQuote(state).outputs;
    const minOutputs = slipAllBy(outputs, slippage);
    const minOutputsWei = minOutputs.map(output =>
      toWeiString(output.amount, output.token.decimals)
    );
    const sharesToWithdrawWei = toWeiString(withdrawAmount, 18);

    txWallet(dispatch);
    const transaction = (() => {
      if (max) {
        return contract.write.withdrawAll([BigInt(minOutputsWei[0]), BigInt(minOutputsWei[1])], {
          account: address as Address,
          ...gasPrices,
          chain: publicClient.chain,
        });
      } else {
        return contract.write.withdraw(
          [BigInt(sharesToWithdrawWei), BigInt(minOutputsWei[0]), BigInt(minOutputsWei[1])],
          {
            account: address as Address,
            ...gasPrices,
            chain: publicClient.chain,
          }
        );
      }
    })();

    bindTransactionEvents(
      dispatch,
      transaction,
      publicClient,
      {
        spender: vault.contractAddress,
        amount: withdrawAmount,
        token: selectTokenByAddress(state, vault.chainId, vault.contractAddress),
      },
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
