import type { VaultGov } from '../../entities/vault.ts';
import {
  bindTransactionEvents,
  captureWalletErrors,
  selectVaultTokensToRefresh,
  txStart,
  txWallet,
} from './common.ts';
import { selectWalletAddress } from '../../selectors/wallet.ts';
import {
  selectGovVaultPendingRewards,
  selectGovVaultUserStakedBalanceInDepositToken,
} from '../../selectors/balance.ts';
import { BIG_ZERO, bigNumberToBigInt, toWei } from '../../../../helpers/big-number.ts';
import { getWalletConnectionApi } from '../../apis/instances.ts';
import { rpcClientManager } from '../../apis/rpc-contract/rpc-manager.ts';
import { fetchWalletContract } from '../../apis/rpc-contract/viem-contract.ts';
import { BoostAbi } from '../../../../config/abi/BoostAbi.ts';
import { selectChainById } from '../../selectors/chains.ts';
import { getGasPriceOptions } from '../../utils/gas-utils.ts';
import type { Address } from 'viem';
import { selectTokenByAddress } from '../../selectors/tokens.ts';
import BigNumber from 'bignumber.js';

export const stakeGovVault = (vault: VaultGov, amount: BigNumber) => {
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
    const inputToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);

    const contractAddr = vault.contractAddress;
    const contract = fetchWalletContract(contractAddr, BoostAbi, walletClient);
    const rawAmount = amount.shiftedBy(inputToken.decimals).decimalPlaces(0, BigNumber.ROUND_FLOOR);
    const chain = selectChainById(state, vault.chainId);
    const gasPrices = await getGasPriceOptions(chain);

    txWallet(dispatch);
    const transaction = contract.write.stake([bigNumberToBigInt(rawAmount)], {
      account: address as Address,
      ...gasPrices,
      chain: publicClient.chain,
    });

    bindTransactionEvents(
      dispatch,
      transaction,
      publicClient,
      { spender: contractAddr, amount, token: inputToken },
      {
        walletAddress: address,
        chainId: vault.chainId,
        spenderAddress: contractAddr,
        tokens: selectVaultTokensToRefresh(state, vault),
        govVaultId: vault.id,
        clearInput: true,
      }
    );
  });
};
export const unstakeGovVault = (vault: VaultGov, amount: BigNumber) => {
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
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const rawAmount = toWei(amount, depositToken.decimals);

    const contractAddr = vault.contractAddress;
    const contract = fetchWalletContract(contractAddr, BoostAbi, walletClient);
    const chain = selectChainById(state, vault.chainId);
    const gasPrices = await getGasPriceOptions(chain);

    txWallet(dispatch);
    const transaction = contract.write.withdraw([bigNumberToBigInt(rawAmount)], {
      account: address as Address,
      ...gasPrices,
      chain: publicClient.chain,
    });

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
        govVaultId: vault.id,
        clearInput: true,
      }
    );
  });
};
export const claimGovVault = (vault: VaultGov) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      throw new Error(`Wallet not connected`);
    }

    const pendingRewards = selectGovVaultPendingRewards(state, vault.id, address).filter(r =>
      r.amount.gt(BIG_ZERO)
    );
    if (!pendingRewards.length) {
      throw new Error(`No rewards to claim`);
    }

    const { amount, token } = pendingRewards[0];

    const walletApi = await getWalletConnectionApi();
    const publicClient = rpcClientManager.getBatchClient(vault.chainId);
    const walletClient = await walletApi.getConnectedViemClient();

    const contractAddr = vault.contractAddress;

    const contract = fetchWalletContract(contractAddr, BoostAbi, walletClient);
    const chain = selectChainById(state, vault.chainId);
    const gasPrices = await getGasPriceOptions(chain);

    txWallet(dispatch);
    const transaction = contract.write.getReward({
      account: address as Address,
      ...gasPrices,
      chain: publicClient.chain,
    });

    bindTransactionEvents(
      dispatch,
      transaction,
      publicClient,
      { spender: contractAddr, amount, token },
      {
        walletAddress: address,
        chainId: vault.chainId,
        spenderAddress: contractAddr,
        tokens: selectVaultTokensToRefresh(state, vault),
        govVaultId: vault.id,
        clearInput: true,
      }
    );
  });
};
export const exitGovVault = (vault: VaultGov) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const balanceAmount = selectGovVaultUserStakedBalanceInDepositToken(state, vault.id);
    const token = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);

    const walletApi = await getWalletConnectionApi();
    const publicClient = rpcClientManager.getBatchClient(vault.chainId);
    const walletClient = await walletApi.getConnectedViemClient();
    const contractAddr = vault.contractAddress;

    const contract = fetchWalletContract(contractAddr, BoostAbi, walletClient);

    /**
     * withdraw() and by extension exit() will fail if already withdrawn (Cannot withdraw 0),
     * so if there is only rewards left getReward() should be called instead of exit()
     */
    const chain = selectChainById(state, vault.chainId);
    const gasPrices = await getGasPriceOptions(chain);

    txWallet(dispatch);
    const transaction =
      balanceAmount.gt(0) ?
        contract.write.exit({
          account: address as Address,
          ...gasPrices,
          chain: publicClient.chain,
        })
      : contract.write.getReward({
          account: address as Address,
          ...gasPrices,
          chain: publicClient.chain,
        });

    bindTransactionEvents(
      dispatch,
      transaction,
      publicClient,
      { spender: contractAddr, amount: balanceAmount, token },
      {
        walletAddress: address,
        chainId: vault.chainId,
        spenderAddress: contractAddr,
        tokens: selectVaultTokensToRefresh(state, vault),
        govVaultId: vault.id,
        clearInput: true,
      }
    );
  });
};
