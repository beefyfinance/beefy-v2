import {
  isErc4626AsyncWithdrawVault,
  isErc4626Vault,
  type VaultEntity,
} from '../../entities/vault.ts';
import type BigNumber from 'bignumber.js';
import {
  captureWalletErrors,
  selectVaultTokensToRefresh,
  sendTransaction,
  txStart,
} from './common.ts';
import { selectWalletAddress } from '../../selectors/wallet.ts';
import { getWalletConnectionApi } from '../../apis/instances.ts';
import { rpcClientManager } from '../../apis/rpc-contract/rpc-manager.ts';
import { selectChainById } from '../../selectors/chains.ts';
import { selectErc20TokenByAddress, selectTokenByAddress } from '../../selectors/tokens.ts';
import { fetchWalletContract } from '../../apis/rpc-contract/viem-contract.ts';
import { getGasPriceOptions } from '../../utils/gas-utils.ts';
import { fromWei, toWeiBigInt } from '../../../../helpers/big-number.ts';
import {
  type Address,
  getAddress,
  type getContract,
  parseAbiItem,
  type PublicClient,
  type Transport,
  type WalletClient,
} from 'viem';
import { isTokenErc20 } from '../../entities/token.ts';
import { Erc4626VaultAbi } from '../../../../config/abi/Erc4626VaultAbi.ts';
import { selectUserVaultPendingWithdrawal } from '../../selectors/balance.ts';
import { selectVaultById } from '../../selectors/vaults.ts';
import { formatTokenDisplay } from '../../../../helpers/format.ts';
import { bigintRange } from '../../../../helpers/bigint.ts';
import { readContract } from 'viem/actions';

export const deposit = (vault: VaultEntity, amount: BigNumber) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    if (!isErc4626Vault(vault)) {
      throw new Error('Invalid vault type');
    }

    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      throw new Error('Wallet address not found');
    }

    const account = getAddress(address);
    const walletApi = await getWalletConnectionApi();
    const walletClient = await walletApi.getConnectedViemClient();
    const publicClient = rpcClientManager.getBatchClient(vault.chainId);

    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    if (!isTokenErc20(depositToken)) {
      throw new Error('Deposit token is not an ERC20 token');
    }

    const contractAddress = getAddress(vault.contractAddress);
    const contract = fetchWalletContract(contractAddress, Erc4626VaultAbi, walletClient);
    const uint256Amount = toWeiBigInt(amount, depositToken.decimals);
    const chain = selectChainById(state, vault.chainId);
    const gasPrices = await getGasPriceOptions(chain);

    sendTransaction(
      dispatch,
      () =>
        contract.write.deposit([uint256Amount, account], {
          account,
          ...gasPrices,
          chain: publicClient.chain,
        }),
      publicClient,
      { spender: contractAddress, amount, token: depositToken },
      {
        walletAddress: account,
        chainId: vault.chainId,
        spenderAddress: contractAddress,
        tokens: selectVaultTokensToRefresh(state, vault),
        clearInput: true,
      }
    );
  });
};

async function checkSlashedNotRealized(
  contract: ReturnType<
    typeof getContract<
      Transport,
      Address,
      typeof Erc4626VaultAbi,
      { public: PublicClient; wallet: WalletClient }
    >
  >,
  publicClient: PublicClient
) {
  const numValidators = await contract.read.validatorsLength();
  const validators = await Promise.all(
    bigintRange(0n, numValidators).map(
      async (i: bigint) => await contract.read.validatorByIndex([i])
    )
  );
  // ignore empty, and ignore any that had checkForSlashedValidatorsAndUndelegate called
  const toCheck = validators.filter(v => v.slashedDelegations === 0n && v.delegations > 0n);
  const isSlashed = await Promise.all(
    toCheck.map(async v =>
      readContract(publicClient, {
        address: '0xFC00FACE00000000000000000000000000000000',
        args: [v.id],
        functionName: 'isSlashed',
        abi: [parseAbiItem('function isSlashed(uint256) view returns (bool)')],
      })
    )
  );
  const anySlashed = isSlashed.some(v => v);
  if (anySlashed) {
    throw new Error(
      'An underlying validator with deposits was slashed. Please wait before withdrawing or use the emergency redeem function.'
    );
  }
}

export const requestRedeem = (vault: VaultEntity, oracleAmount: BigNumber, max: boolean) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    if (!isErc4626AsyncWithdrawVault(vault)) {
      throw new Error('Invalid vault type');
    }

    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      throw new Error('Wallet address not found');
    }

    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    if (!isTokenErc20(depositToken)) {
      throw new Error('Deposit token is not an ERC20 token');
    }

    const account = getAddress(address);
    const walletApi = await getWalletConnectionApi();
    const walletClient = await walletApi.getConnectedViemClient();
    const publicClient = rpcClientManager.getBatchClient(vault.chainId);
    const contractAddress = getAddress(vault.contractAddress);
    const contract = fetchWalletContract(
      contractAddress,
      Erc4626VaultAbi,
      walletClient,
      publicClient
    );

    await checkSlashedNotRealized(contract, publicClient);

    const wantedAssets = toWeiBigInt(oracleAmount, depositToken.decimals);
    const [wantedShares, maxShares] = await Promise.all([
      contract.read.convertToShares([wantedAssets]),
      contract.read.balanceOf([account]),
    ]);
    const redeemShares =
      max ? maxShares
      : wantedShares > maxShares ? maxShares
      : wantedShares;

    const chain = selectChainById(state, vault.chainId);
    const gasPrices = await getGasPriceOptions(chain);

    sendTransaction(
      dispatch,
      () =>
        contract.write.requestRedeem([redeemShares, account, account], {
          account,
          ...gasPrices,
          chain: publicClient.chain,
        }),
      publicClient,
      { spender: vault.contractAddress, amount: oracleAmount, token: depositToken },
      {
        vaultId: vault.id,
        chainId: vault.chainId,
        spenderAddress: vault.contractAddress,
        tokens: selectVaultTokensToRefresh(state, vault),
        walletAddress: address,
        clearInput: true,
      }
    );
  });
};

export const fulfillRedeem = (vaultId: VaultEntity['id'], requestId: bigint) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);

    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      throw new Error('Wallet address not found');
    }

    const vault = selectVaultById(state, vaultId);
    if (!isErc4626AsyncWithdrawVault(vault)) {
      throw new Error('Invalid vault type');
    }

    const pendingWithdrawals = selectUserVaultPendingWithdrawal(state, vaultId, address);
    const request = pendingWithdrawals?.requests.find(r => r.id === requestId);
    if (!request) {
      throw new Error(`Request ${requestId} not found`);
    }

    const depositToken = selectErc20TokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const expectedAssets = toWeiBigInt(request.assets, depositToken.decimals);
    const account = getAddress(address);
    const walletApi = await getWalletConnectionApi();
    const walletClient = await walletApi.getConnectedViemClient();
    const publicClient = rpcClientManager.getBatchClient(vault.chainId);
    const contractAddress = getAddress(vault.contractAddress);
    const contract = fetchWalletContract(
      contractAddress,
      Erc4626VaultAbi,
      walletClient,
      publicClient
    );
    const chain = selectChainById(state, vault.chainId);
    const gasPrices = await getGasPriceOptions(chain);
    const buildTx = async () => {
      /*
       * check if less wS is returned than when the request was created (e.g. if a validator was slashed)
       *
       * @dev this simulates the redeem via eth_call which may not work for some contract wallets,
       *      in which case we'll need a different approach
       */
      const { result, request: tx } = await contract.simulate.redeem(
        [requestId, account, account],
        {
          account,
          ...gasPrices,
          chain: publicClient.chain,
        }
      );

      if (result < expectedAssets) {
        throw new Error(
          `Simulation resulted in ${formatTokenDisplay(fromWei(result, depositToken.decimals), depositToken.decimals)} wS, expected ${formatTokenDisplay(request.assets, depositToken.decimals)}`
        );
      }

      return walletClient.writeContract(tx);
    };

    sendTransaction(
      dispatch,
      buildTx,
      publicClient,
      { spender: contractAddress, amount: request.assets, token: depositToken },
      {
        vaultId: vault.id,
        chainId: vault.chainId,
        spenderAddress: vault.contractAddress,
        tokens: selectVaultTokensToRefresh(state, vault),
        walletAddress: address,
        clearInput: true,
      }
    );
  });
};
