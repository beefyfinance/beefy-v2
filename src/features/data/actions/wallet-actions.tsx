import { BigNumber } from 'bignumber.js';
import { first, groupBy, uniqBy } from 'lodash-es';
import type { Action } from 'redux';
import { BoostAbi } from '../../../config/abi/BoostAbi';
import { ERC20Abi } from '../../../config/abi/ERC20Abi';
import { StandardVaultAbi } from '../../../config/abi/StandardVaultAbi';
import { MinterAbi } from '../../../config/abi/MinterAbi';
import type { BeefyState, BeefyThunk } from '../../../redux-types';
import { getOneInchApi, getWalletConnectionApi } from '../apis/instances';
import type { BoostEntity } from '../entities/boost';
import type { ChainEntity } from '../entities/chain';
import type { TokenEntity, TokenErc20 } from '../entities/token';
import { isTokenEqual, isTokenNative } from '../entities/token';
import {
  isCowcentratedLikeVault,
  isCowcentratedVault,
  isGovVault,
  isStandardVault,
  type VaultCowcentrated,
  type VaultEntity,
  type VaultGov,
  type VaultStandard,
} from '../entities/vault';
import {
  createWalletActionErrorAction,
  createWalletActionPendingAction,
  createWalletActionResetAction,
  createWalletActionSuccessAction,
  type TrxError,
  type TxAdditionalData,
} from '../reducers/wallet/wallet-action';
import {
  selectBoostUserBalanceInToken,
  selectGovVaultPendingRewards,
  selectGovVaultUserStakedBalanceInDepositToken,
} from '../selectors/balance';
import {
  selectChainNativeToken,
  selectChainWrappedNativeToken,
  selectErc20TokenByAddress,
  selectGovVaultEarnedTokens,
  selectTokenByAddress,
  selectTokenByAddressOrUndefined,
  selectTokenByIdOrUndefined,
} from '../selectors/tokens';
import { selectStandardVaultById, selectVaultById } from '../selectors/vaults';
import { selectWalletAddress } from '../selectors/wallet';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from './tokens';
import { getGasPriceOptions } from '../utils/gas-utils';
import { convertAmountToRawNumber, errorToString } from '../../../helpers/format';
import { FriendlyError } from '../utils/error-utils';
import type { MinterEntity } from '../entities/minter';
import { reloadReserves } from './minters';
import { selectChainById } from '../selectors/chains';
import {
  BIG_ZERO,
  bigNumberToBigInt,
  fromWei,
  toWei,
  toWeiString,
} from '../../../helpers/big-number';
import { startStepperWithSteps, updateSteps } from './stepper';
import { type Step, StepContent, stepperActions } from '../reducers/wallet/stepper';
import type { ThunkDispatch } from '@reduxjs/toolkit';
import { selectOneInchSwapAggregatorForChain, selectZapByChainId } from '../selectors/zap';
import type { UserlessZapRequest, ZapOrder, ZapStep } from '../apis/transact/zap/types';
import { ZERO_ADDRESS } from '../../../helpers/addresses';
import { getVaultWithdrawnFromContract } from '../apis/transact/helpers/vault';
import { migratorUpdate } from './migrator';
import type { MigrationConfig } from '../reducers/wallet/migration';
import type { IBridgeQuote } from '../apis/bridge/providers/provider-types';
import type { BeefyAnyBridgeConfig } from '../apis/config-types';
import { transactActions } from '../reducers/wallet/transact';
import { BeefyCommonBridgeAbi } from '../../../config/abi/BeefyCommonBridgeAbi';
import {
  BeefyZapRouterAbi,
  BeezyZapRouterPayableExecuteAbi,
} from '../../../config/abi/BeefyZapRouterAbi';
import { BeefyCowcentratedLiquidityVaultAbi } from '../../../config/abi/BeefyCowcentratedLiquidityVaultAbi';
import { selectTransactSelectedQuote, selectTransactSlippage } from '../selectors/transact';
import { AngleMerklDistributorAbi } from '../../../config/abi/AngleMerklDistributor';
import { isDefined } from '../utils/array-utils';
import { slipAllBy } from '../apis/transact/helpers/amounts';
import {
  fetchUserMerklRewardsAction,
  MERKL_SUPPORTED_CHAINS,
} from './user-rewards/merkl-user-rewards';
import { fetchUserStellaSwapRewardsAction } from './user-rewards/stellaswap-user-rewards';
import { stellaswapRewarderAbi } from '../../../config/abi/StellaSwapRewarder';
import { selectBoostById } from '../selectors/boosts';
import { selectIsApprovalNeededForBoostStaking } from '../selectors/wallet-actions';
import type { TFunction } from 'react-i18next';
import { fetchWalletContract } from '../apis/rpc-contract/viem-contract';
import type { Address } from 'abitype';
import { rpcClientManager } from '../apis/rpc-contract/rpc-manager';
import { waitForTransactionReceipt } from 'viem/actions';
import type { Chain, Hash, PublicClient, TransactionReceipt } from 'viem';
import type { MigratorUnstakeProps } from '../apis/migration/migration-types';
import type { GasPricing } from '../apis/gas-prices';

const MIN_APPROVAL_AMOUNT = new BigNumber('8000000000000000000000000000'); // wei

export const WALLET_ACTION = 'WALLET_ACTION';
export const WALLET_ACTION_RESET = 'WALLET_ACTION_RESET';

type TxRefreshOnSuccess = {
  walletAddress: string;
  chainId: ChainEntity['id'];
  spenderAddress: string;
  tokens: TokenEntity[];
  govVaultId?: VaultEntity['id'];
  boostId?: BoostEntity['id'];
  minterId?: MinterEntity['id'];
  vaultId?: VaultEntity['id'];
  migrationId?: MigrationConfig['id'];
  rewards?: boolean;
  clearInput?: boolean;
};

type TxContext = {
  additionalData?: TxAdditionalData;
  refreshOnSuccess?: TxRefreshOnSuccess;
};

type TxWriteProps = {
  account: Address;
  chain: Chain | undefined;
} & GasPricing;

/**
 * Called before building a transaction
 */
function txStart(dispatch: ThunkDispatch<BeefyState, unknown, Action<string>>) {
  dispatch(createWalletActionResetAction());
  // should already be set by Stepper
  // dispatch(stepperActions.setStepContent({ stepContent: StepContent.StartTx }));
}

/**
 * Must call just before calling .send() on a transaction
 */
function txWallet(dispatch: ThunkDispatch<BeefyState, unknown, Action<string>>) {
  dispatch(stepperActions.setStepContent({ stepContent: StepContent.WalletTx }));
}

/**
 * Called when .send() succeeds / tx is submitted to RPC
 */
function txSubmitted(
  dispatch: ThunkDispatch<BeefyState, unknown, Action<string>>,
  context: TxContext,
  hash: Hash
) {
  const { additionalData } = context;
  dispatch(createWalletActionPendingAction(hash, additionalData));
  dispatch(stepperActions.setStepContent({ stepContent: StepContent.WaitingTx }));
}

/**
 * Called when tx is successfully mined
 */
function txMined(
  dispatch: ThunkDispatch<BeefyState, unknown, Action<string>>,
  context: TxContext,
  receipt: TransactionReceipt
) {
  const { additionalData, refreshOnSuccess } = context;

  dispatch(createWalletActionSuccessAction(receipt, additionalData));
  dispatch(updateSteps());

  // fetch new balance and allowance of native token (gas spent) and allowance token
  if (refreshOnSuccess) {
    const {
      walletAddress,
      chainId,
      govVaultId,
      boostId,
      spenderAddress,
      tokens,
      minterId,
      vaultId,
      migrationId,
      clearInput,
      rewards,
    } = refreshOnSuccess;

    dispatch(
      reloadBalanceAndAllowanceAndGovRewardsAndBoostData({
        walletAddress: walletAddress,
        chainId: chainId,
        govVaultId: govVaultId,
        boostId: boostId,
        spenderAddress: spenderAddress,
        tokens: tokens,
      })
    );

    if (minterId) {
      dispatch(
        reloadReserves({
          chainId: chainId,
          minterId: minterId,
        })
      );
    }

    if (migrationId && vaultId && walletAddress) {
      dispatch(migratorUpdate({ vaultId, migrationId, walletAddress }));
    }

    if (clearInput) {
      dispatch(transactActions.clearInput());
    }

    if (rewards) {
      // Wait 60s before checking rewards after tx success
      setTimeout(
        () =>
          dispatch(
            fetchUserMerklRewardsAction({
              walletAddress,
              force: true,
            })
          ),
        60 * 1000
      );
    }
  }
}

/**
 * Called when tx fails
 */
function txError(
  dispatch: ThunkDispatch<BeefyState, unknown, Action<string>>,
  context: TxContext,
  error: TrxError
) {
  const { additionalData } = context;

  dispatch(createWalletActionErrorAction(error, additionalData));
  dispatch(stepperActions.setStepContent({ stepContent: StepContent.ErrorTx }));
}

const approval = (token: TokenErc20, spenderAddress: string, amount: BigNumber) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const walletApi = await getWalletConnectionApi();
    const client = rpcClientManager.getBatchClient(token.chainId);
    const walletClient = await walletApi.getConnectedViemClient();
    const viemContract = fetchWalletContract(token.address, ERC20Abi, walletClient);
    const native = selectChainNativeToken(state, token.chainId);

    const amountWei = toWei(amount, token.decimals);
    const approvalAmountWei = amountWei.gt(MIN_APPROVAL_AMOUNT) ? amountWei : MIN_APPROVAL_AMOUNT;
    const chain = selectChainById(state, token.chainId);
    const gasPrices = await getGasPriceOptions(chain);

    txWallet(dispatch);
    const transaction = viemContract.write.approve(
      [spenderAddress as Address, bigNumberToBigInt(approvalAmountWei)],
      {
        account: address as Address,
        ...gasPrices,
        chain: walletClient.chain,
      }
    );

    bindTransactionEvents(
      dispatch,
      transaction,
      client,
      { spender: spenderAddress, amount: fromWei(approvalAmountWei, token.decimals), token: token },
      {
        walletAddress: address,
        chainId: token.chainId,
        spenderAddress,
        tokens: uniqBy([token, native], 'id'),
      }
    );
  });
};

const migrateUnstake = (
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

    const walletApi = await getWalletConnectionApi();
    const walletClient = await walletApi.getConnectedViemClient();
    const publicClient = rpcClientManager.getBatchClient(vault.chainId);
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const chain = selectChainById(state, vault.chainId);
    const gasPrices = await getGasPriceOptions(chain);
    txWallet(dispatch);
    const transaction = unstakeCall({
      account: address as Address,
      ...gasPrices,
      chain: walletClient.chain,
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

const deposit = (vault: VaultEntity, amount: BigNumber, max: boolean) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const walletApi = await getWalletConnectionApi();
    const viemClient = await walletApi.getConnectedViemClient();
    const publicClient = await rpcClientManager.getBatchClient(vault.chainId);

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
          chain: viemClient.chain,
        });
      } else {
        if (max) {
          return contract.write.depositAll({
            account: address as Address,
            ...gasPrices,
            chain: viemClient.chain,
          });
        } else {
          return contract.write.deposit([bigNumberToBigInt(rawAmount)], {
            account: address as Address,
            ...gasPrices,
            chain: viemClient.chain,
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

const v3Deposit = (vault: VaultCowcentrated, amountToken0: BigNumber, amountToken1: BigNumber) => {
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
        chain: walletClient.chain,
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

const withdraw = (vault: VaultStandard, oracleAmount: BigNumber, max: boolean) => {
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
            chain: walletClient.chain,
          });
        } else {
          return contract.write.withdrawBNB([bigNumberToBigInt(sharesToWithdrawWei)], {
            account: address as Address,
            ...gasPrices,
            chain: walletClient.chain,
          });
        }
      } else {
        if (max) {
          return contract.write.withdrawAll({
            account: address as Address,
            ...gasPrices,
            chain: walletClient.chain,
          });
        } else {
          return contract.write.withdraw([bigNumberToBigInt(sharesToWithdrawWei)], {
            account: address as Address,
            ...gasPrices,
            chain: walletClient.chain,
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

const v3Withdraw = (vault: VaultCowcentrated, withdrawAmount: BigNumber, max: boolean) => {
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
          chain: walletClient.chain,
        });
      } else {
        return contract.write.withdraw(
          [BigInt(sharesToWithdrawWei), BigInt(minOutputsWei[0]), BigInt(minOutputsWei[1])],
          {
            account: address as Address,
            ...gasPrices,
            chain: walletClient.chain,
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

const stakeGovVault = (vault: VaultGov, amount: BigNumber) => {
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
      chain: walletClient.chain,
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

const unstakeGovVault = (vault: VaultGov, amount: BigNumber) => {
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
      chain: walletClient.chain,
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

const claimGovVault = (vault: VaultGov) => {
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
      chain: walletClient.chain,
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

const exitGovVault = (vault: VaultGov) => {
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
    const transaction = balanceAmount.gt(0)
      ? contract.write.exit({
          account: address as Address,
          ...gasPrices,
          chain: walletClient.chain,
        })
      : contract.write.getReward({
          account: address as Address,
          ...gasPrices,
          chain: walletClient.chain,
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

const claimBoost = (boostId: BoostEntity['id']) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }
    const boost = selectBoostById(state, boostId);
    const vault = selectStandardVaultById(state, boost.vaultId);
    const mooToken = selectTokenByAddress(state, vault.chainId, vault.receiptTokenAddress);

    const walletApi = await getWalletConnectionApi();
    const publicClient = rpcClientManager.getBatchClient(vault.chainId);
    const walletClient = await walletApi.getConnectedViemClient();
    const contractAddr = boost.contractAddress;

    const contract = fetchWalletContract(contractAddr, BoostAbi, walletClient);
    const chain = selectChainById(state, vault.chainId);
    const gasPrices = await getGasPriceOptions(chain);

    txWallet(dispatch);
    const transaction = contract.write.getReward({
      account: address as Address,
      ...gasPrices,
      chain: walletClient.chain,
    });

    bindTransactionEvents(
      dispatch,
      transaction,
      publicClient,
      {
        type: 'boost',
        boostId: boost.id,
        amount: BIG_ZERO,
        token: mooToken,
        walletAddress: address,
      },
      {
        walletAddress: address,
        chainId: vault.chainId,
        spenderAddress: contractAddr,
        tokens: selectVaultTokensToRefresh(state, vault),
        boostId: boost.id,
      }
    );
  });
};

const exitBoost = (boostId: BoostEntity['id']) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const boost = selectBoostById(state, boostId);
    const boostAmount = selectBoostUserBalanceInToken(state, boost.id);
    const vault = selectStandardVaultById(state, boost.vaultId);
    const mooToken = selectTokenByAddress(state, vault.chainId, vault.receiptTokenAddress);

    const walletApi = await getWalletConnectionApi();
    const publicClient = rpcClientManager.getBatchClient(vault.chainId);
    const walletClient = await walletApi.getConnectedViemClient();
    const contractAddr = boost.contractAddress;

    const contract = fetchWalletContract(contractAddr, BoostAbi, walletClient);

    /**
     * withdraw() and by extension exit() will fail if already withdrawn (Cannot withdraw 0),
     * so if there is only rewards left getReward() should be called instead of exit()
     */
    const chain = selectChainById(state, vault.chainId);
    const gasPrices = await getGasPriceOptions(chain);

    txWallet(dispatch);
    const transaction = boostAmount.gt(0)
      ? contract.write.exit({
          account: address as Address,
          ...gasPrices,
          chain: walletClient.chain,
        })
      : contract.write.getReward({
          account: address as Address,
          ...gasPrices,
          chain: walletClient.chain,
        });

    bindTransactionEvents(
      dispatch,
      transaction,
      publicClient,
      {
        type: 'boost',
        boostId: boost.id,
        amount: boostAmount,
        token: mooToken,
        walletAddress: address,
      },
      {
        walletAddress: address,
        chainId: boost.chainId,
        spenderAddress: contractAddr,
        tokens: selectVaultTokensToRefresh(state, vault),
        boostId: boost.id,
      }
    );
  });
};

export const startStakeBoostSteps = (
  boostId: BoostEntity['id'],
  t: TFunction,
  amount: BigNumber
) => {
  return captureWalletErrors(async (dispatch, getState) => {
    const state = getState();
    const boost = selectBoostById(state, boostId);
    const vault = selectStandardVaultById(state, boost.vaultId);
    const needsApproval = selectIsApprovalNeededForBoostStaking(state, boost, amount);
    const receiptToken = selectErc20TokenByAddress(state, vault.chainId, vault.receiptTokenAddress);
    const steps: Step[] = [];

    if (needsApproval) {
      steps.push({
        step: 'approve',
        message: t('Vault-ApproveMsg'),
        action: walletActions.approval(receiptToken, boost.contractAddress, amount),
        pending: false,
      } satisfies Step);
    }

    steps.push({
      step: 'boost-stake',
      message: t('Vault-TxnConfirm', { type: t('Stake-noun') }),
      action: walletActions.stakeBoost(boostId, amount),
      pending: false,
    });

    dispatch(startStepperWithSteps(steps, boost.chainId));
  });
};

const stakeBoost = (boostId: BoostEntity['id'], amount: BigNumber) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const boost = selectBoostById(state, boostId);
    const vault = selectStandardVaultById(state, boost.vaultId);
    const mooToken = selectTokenByAddress(state, vault.chainId, vault.receiptTokenAddress);

    const walletApi = await getWalletConnectionApi();
    const publicClient = rpcClientManager.getBatchClient(boost.chainId);
    const walletClient = await walletApi.getConnectedViemClient();

    const contractAddr = boost.contractAddress;
    const contract = fetchWalletContract(contractAddr, BoostAbi, walletClient);
    const rawAmount = amount.shiftedBy(mooToken.decimals).decimalPlaces(0, BigNumber.ROUND_FLOOR);
    const chain = selectChainById(state, vault.chainId);
    const gasPrices = await getGasPriceOptions(chain);

    txWallet(dispatch);
    const transaction = contract.write.stake([bigNumberToBigInt(rawAmount)], {
      account: address as Address,
      ...gasPrices,
      chain: walletClient.chain,
    });

    bindTransactionEvents(
      dispatch,
      transaction,
      publicClient,
      { type: 'boost', boostId: boost.id, amount, token: mooToken, walletAddress: address },
      {
        walletAddress: address,
        chainId: vault.chainId,
        spenderAddress: contractAddr,
        tokens: selectVaultTokensToRefresh(state, vault),
        boostId: boost.id,
      }
    );
  });
};

export const startUnstakeBoostSteps = (
  boostId: BoostEntity['id'],
  t: TFunction,
  amount: BigNumber,
  max: boolean
) => {
  return captureWalletErrors(async (dispatch, getState) => {
    const state = getState();
    const boost = selectBoostById(state, boostId);
    const steps: Step[] = [];

    // If user is withdrawing all their assets, UI won't allow to claim individually later on, so claim as well
    if (max) {
      steps.push({
        step: 'boost-claim-unstake',
        message: t('Vault-TxnConfirm', { type: t('Claim-Unstake-noun') }),
        action: walletActions.exitBoost(boost.id),
        pending: false,
      });
    } else {
      steps.push({
        step: 'boost-unstake',
        message: t('Vault-TxnConfirm', { type: t('Unstake-noun') }),
        action: walletActions.unstakeBoost(boost.id, amount),
        pending: false,
      });
    }

    dispatch(startStepperWithSteps(steps, boost.chainId));
  });
};

const unstakeBoost = (boostId: BoostEntity['id'], amount: BigNumber) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }
    const boost = selectBoostById(state, boostId);
    const vault = selectStandardVaultById(state, boost.vaultId);
    const mooToken = selectTokenByAddress(state, vault.chainId, vault.receiptTokenAddress);

    const walletApi = await getWalletConnectionApi();
    const publicClient = rpcClientManager.getBatchClient(boost.chainId);
    const walletClient = await walletApi.getConnectedViemClient();

    const contractAddr = boost.contractAddress;
    const contract = fetchWalletContract(contractAddr, BoostAbi, walletClient);
    const rawAmount = amount.shiftedBy(mooToken.decimals).decimalPlaces(0, BigNumber.ROUND_FLOOR);
    const chain = selectChainById(state, vault.chainId);
    const gasPrices = await getGasPriceOptions(chain);

    txWallet(dispatch);
    const transaction = contract.write.withdraw([bigNumberToBigInt(rawAmount)], {
      account: address as Address,
      ...gasPrices,
      chain: walletClient.chain,
    });

    bindTransactionEvents(
      dispatch,
      transaction,
      publicClient,
      { type: 'boost', boostId: boost.id, amount, token: mooToken, walletAddress: address },
      {
        walletAddress: address,
        chainId: vault.chainId,
        spenderAddress: contractAddr,
        tokens: selectVaultTokensToRefresh(state, vault),
        boostId: boost.id,
      }
    );
  });
};

const mintDeposit = (
  minter: MinterEntity,
  payToken: TokenEntity,
  mintedToken: TokenEntity,
  amount: BigNumber,
  max: boolean,
  slippageTolerance: number = 0.01
) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const { minterAddress, chainId, canZapInWithOneInch } = minter;
    const gasToken = selectChainNativeToken(state, chainId);
    const walletApi = await getWalletConnectionApi();
    const publicClient = rpcClientManager.getBatchClient(chainId);
    const walletClient = await walletApi.getConnectedViemClient();
    const contract = fetchWalletContract(minterAddress, MinterAbi, walletClient);
    const chain = selectChainById(state, chainId);
    const gasPrices = await getGasPriceOptions(chain);
    const amountInWei = toWei(amount, payToken.decimals);
    const amountInWeiString = amountInWei.toString(10);
    const isNative = isTokenNative(payToken);
    const txProps: TxWriteProps = {
      account: address as Address,
      ...gasPrices,
      chain: walletClient.chain,
    };

    const buildCall = async (args: TxWriteProps) => {
      if (canZapInWithOneInch) {
        const swapInToken = isNative ? selectChainWrappedNativeToken(state, chainId) : payToken;
        const oneInchSwapAgg = selectOneInchSwapAggregatorForChain(state, chain.id);
        if (!oneInchSwapAgg) {
          throw new Error(`No 1inch swap aggregator found for ${chain.id}`);
        }

        const oneInchApi = await getOneInchApi(chain);
        const swapData = await oneInchApi.getSwap({
          disableEstimate: true, // otherwise will fail due to no allowance
          from: minterAddress,
          amount: amountInWeiString,
          src: swapInToken.address,
          dst: mintedToken.address,
          slippage: slippageTolerance * 100,
        });
        const amountOutWei = new BigNumber(swapData.dstAmount);
        const amountOutWeiAfterSlippage = amountOutWei
          .multipliedBy(1 - slippageTolerance)
          .decimalPlaces(0, BigNumber.ROUND_FLOOR);
        const shouldMint = amountOutWeiAfterSlippage.isLessThan(amountInWei);

        // mint is better
        if (shouldMint) {
          return isNative
            ? contract.write.depositNative(['0x', true], {
                ...args,
                value: BigInt(amountInWeiString),
              })
            : contract.write.deposit([BigInt(amountInWeiString), '0x', true], args);
        }

        // swap after max slippage is better
        return isNative
          ? contract.write.depositNative([swapData.tx.data as `0x${string}`, false], {
              ...args,
              value: BigInt(amountInWeiString),
            })
          : // contract.methods.depositNative(swapData.tx.data, false)
            contract.write.deposit(
              [BigInt(amountInWeiString), swapData.tx.data as `0x${string}`, false],
              args
            );
      }

      // non-zap
      if (isNative) {
        return contract.write.depositNative({
          ...args,
          value: BigInt(amountInWeiString),
        });
      }

      if (max) {
        return contract.write.depositAll(args);
      }

      return contract.write.deposit([BigInt(amountInWeiString)], args);
    };
    txWallet(dispatch);
    const transaction = buildCall(txProps);

    bindTransactionEvents(
      dispatch,
      transaction,
      publicClient,
      {
        amount: amount,
        token: mintedToken,
      },
      {
        walletAddress: address,
        chainId: chainId,
        spenderAddress: minterAddress,
        tokens: uniqBy([gasToken, payToken, mintedToken], 'id'),
        minterId: minter.id,
      }
    );
  });
};

const burnWithdraw = (
  chainId: ChainEntity['id'],
  contractAddr: string,
  withdrawnToken: TokenEntity,
  burnedToken: TokenEntity,
  amount: BigNumber,
  max: boolean,
  minterId: MinterEntity['id']
) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const gasToken = selectChainNativeToken(state, chainId);
    const walletApi = await getWalletConnectionApi();
    const publicClient = rpcClientManager.getBatchClient(chainId);
    const walletClient = await walletApi.getConnectedViemClient();
    const contract = fetchWalletContract(contractAddr, MinterAbi, walletClient);
    const chain = selectChainById(state, chainId);
    const gasPrices = await getGasPriceOptions(chain);

    txWallet(dispatch);
    const transaction = (() => {
      const rawAmount = convertAmountToRawNumber(amount, burnedToken.decimals);
      return contract.write.withdraw([BigInt(rawAmount)], {
        account: address as Address,
        ...gasPrices,
        chain: walletClient.chain,
      });
    })();

    bindTransactionEvents(
      dispatch,
      transaction,
      publicClient,
      {
        amount: amount,
        token: burnedToken,
      },
      {
        walletAddress: address,
        chainId: chainId,
        spenderAddress: contractAddr,
        tokens: uniqBy([gasToken, withdrawnToken, burnedToken], 'id'),
        minterId,
      }
    );
  });
};

const bridgeViaCommonInterface = (quote: IBridgeQuote<BeefyAnyBridgeConfig>) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    const state = getState();
    const fromAddress = selectWalletAddress(state);
    if (!fromAddress) {
      return;
    }

    const { input, output, fee, config } = quote;
    const fromChainConfig = config.chains[input.token.chainId];
    if (!fromChainConfig) {
      throw new Error(`No config found for chain ${input.token.chainId}`);
    }
    const viaBeefyBridgeAddress = fromChainConfig.bridge;
    const fromChainId = input.token.chainId;
    const toChainId = output.token.chainId;
    const fromChain = selectChainById(state, fromChainId);
    const toChain = selectChainById(state, toChainId);
    const gasToken = selectChainNativeToken(state, fromChainId);
    const inputWei = toWeiString(input.amount, input.token.decimals);
    const feeWei = toWeiString(fee.amount, fee.token.decimals);
    const receiverAddress = quote.receiver || fromAddress;

    if (!isTokenEqual(gasToken, fee.token)) {
      console.debug(gasToken, fee.token);
      throw new Error(`Only native fee token is supported`);
    }

    const walletApi = await getWalletConnectionApi();
    const publicClient = rpcClientManager.getBatchClient(fromChainId);
    const walletClient = await walletApi.getConnectedViemClient();
    const contract = fetchWalletContract(viaBeefyBridgeAddress, BeefyCommonBridgeAbi, walletClient);
    const gasPrices = await getGasPriceOptions(fromChain);

    txWallet(dispatch);
    const transaction = contract.write.bridge(
      [BigInt(toChain.networkChainId), BigInt(inputWei), receiverAddress as Address],
      {
        ...gasPrices,
        account: fromAddress as Address,
        value: BigInt(feeWei),
        chain: walletClient.chain,
      }
    );

    bindTransactionEvents(
      dispatch,
      transaction,
      publicClient,
      {
        type: 'bridge',
        amount: input.amount,
        token: input.token,
        quote: quote,
      },
      {
        walletAddress: fromAddress,
        chainId: fromChainId,
        spenderAddress: viaBeefyBridgeAddress,
        tokens: uniqBy([gasToken, input.token], 'id'),
      }
    );
  });
};

const zapExecuteOrder = (
  vaultId: VaultEntity['id'],
  params: UserlessZapRequest,
  expectedTokens: TokenEntity[]
) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      throw new Error(`No wallet connected`);
    }

    const vault = selectVaultById(state, vaultId);
    const chain = selectChainById(state, vault.chainId);
    const zap = selectZapByChainId(state, vault.chainId);
    if (!zap) {
      throw new Error(`No zap found for chain ${chain.id}`);
    }
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);

    const order: ZapOrder = {
      ...params.order,
      inputs: params.order.inputs.filter(i => BIG_ZERO.lt(i.amount)), // remove <= zero amounts
      user: address,
      recipient: address,
    };
    if (!order.inputs.length) {
      throw new Error('No inputs provided');
    }

    const castedOrder = {
      relay: {
        target: params.order.relay.target as Address,
        data: params.order.relay.data as `0x${string}`,
        value: BigInt(params.order.relay.value),
      },
      inputs: params.order.inputs
        .filter(i => BIG_ZERO.lt(i.amount))
        .map(i => ({
          amount: BigInt(i.amount),
          token: i.token as Address,
        })), // remove <= zero amounts
      outputs: params.order.outputs.map(o => ({
        minOutputAmount: BigInt(o.minOutputAmount),
        token: o.token as Address,
      })),
      user: address as Address,
      recipient: address as Address,
    };

    const steps: ZapStep[] = params.steps;
    if (!steps.length) {
      throw new Error('No steps provided');
    }
    const castedSteps = params.steps.map(step => ({
      data: step.data as `0x${string}`,
      target: step.target as Address,
      value: BigInt(step.value),
      tokens: step.tokens.map(t => ({
        token: t.token as Address,
        index: t.index,
      })),
    }));

    const walletApi = await getWalletConnectionApi();
    const publicClient = rpcClientManager.getBatchClient(vault.chainId);
    const walletClient = await walletApi.getConnectedViemClient();
    const gasPrices = await getGasPriceOptions(chain);
    const nativeInput = castedOrder.inputs.find(input => input.token === ZERO_ADDRESS);

    const contract = fetchWalletContract(zap.router, BeefyZapRouterAbi, walletClient);

    const buildTransaction = () => {
      if (nativeInput) {
        const options = {
          ...gasPrices,
          account: castedOrder.user,
          chain: walletClient.chain,
          value: nativeInput ? nativeInput.amount : undefined,
        };
        const contract = fetchWalletContract(
          zap.router,
          BeezyZapRouterPayableExecuteAbi,
          walletClient
        );
        console.debug('executeOrder payable', { order: order, steps, options });
        return contract.write.executeOrder([castedOrder, castedSteps], options);
      } else {
        const options = {
          ...gasPrices,
          account: castedOrder.user,
          chain: walletClient.chain,
        };
        console.debug('executeOrder', { order: castedOrder, steps, options });
        return contract.write.executeOrder([castedOrder, castedSteps], options);
      }
    };

    txWallet(dispatch);
    const transaction = buildTransaction();

    bindTransactionEvents(
      dispatch,
      transaction,
      publicClient,
      {
        type: 'zap',
        amount: BIG_ZERO,
        token: depositToken,
        expectedTokens,
        vaultId: vault.id,
      },
      {
        walletAddress: address,
        chainId: vault.chainId,
        spenderAddress: zap.manager,
        tokens: selectZapTokensToRefresh(state, vault, order),
        clearInput: true,
        ...(isGovVault(vault) ? { govVaultId: vault.id } : {}),
      }
    );
  });
};

const claimMerkl = (chainId: ChainEntity['id']) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const distributorAddress = MERKL_SUPPORTED_CHAINS[chainId];
    if (!distributorAddress) {
      throw new Error(`No Merkl contract found for chain ${chainId}`);
    }

    const chain = selectChainById(state, chainId);
    const native = selectChainNativeToken(state, chainId);
    const { byChainId } = await dispatch(
      fetchUserMerklRewardsAction({ walletAddress: address, force: true })
    ).unwrap();
    const unclaimedRewards = (byChainId[chain.id] || []).map(({ token, accumulated, proof }) => ({
      token: token.address,
      amount: toWeiString(accumulated, token.decimals), // proof requires 'accumulated' amount
      proof: proof,
    }));
    if (!unclaimedRewards.length) {
      throw new Error('No unclaimed merkl rewards found');
    }

    const users = new Array<string>(unclaimedRewards.length).fill(address);
    const tokens = unclaimedRewards.map(reward => reward.token);
    const amounts = unclaimedRewards.map(reward => reward.amount);
    const proofs = unclaimedRewards.map(reward => reward.proof);

    const walletApi = await getWalletConnectionApi();
    const publicClient = rpcClientManager.getBatchClient(chainId);
    const walletClient = await walletApi.getConnectedViemClient();
    const contract = fetchWalletContract(
      distributorAddress,
      AngleMerklDistributorAbi,
      walletClient
    );
    const gasPrices = await getGasPriceOptions(chain);

    txWallet(dispatch);
    const transaction = contract.write.claim(
      [
        users as Address[],
        tokens as Address[],
        amounts.map(amount => BigInt(amount)),
        proofs.map(proof => proof as Address[]),
      ],
      {
        account: address as Address,
        ...gasPrices,
        chain: walletClient.chain,
      }
    );

    bindTransactionEvents(
      dispatch,
      transaction,
      publicClient,
      { amount: BIG_ZERO, token: native }, // TODO fix so these are not required
      {
        walletAddress: address,
        chainId: chainId,
        spenderAddress: distributorAddress, // TODO fix so these are not required
        tokens: tokens
          .map(token => selectTokenByAddressOrUndefined(state, chainId, token))
          .filter(isDefined),
        rewards: true,
      }
    );
  });
};

const claimStellaSwap = (chainId: ChainEntity['id'], vaultId: VaultEntity['id']) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }
    if (chainId !== 'moonbeam') {
      throw new Error(`Can't claimStellaSwap on ${chainId}`);
    }

    const chain = selectChainById(state, chainId);
    const native = selectChainNativeToken(state, chainId);
    const { byVaultId } = await dispatch(
      fetchUserStellaSwapRewardsAction({ walletAddress: address, force: true })
    ).unwrap();
    const vaultRewards = byVaultId[vaultId];
    if (!vaultRewards) {
      throw new Error(`No unclaimed stellaswap rewards found for ${vaultId}`);
    }
    const unclaimedRewards = vaultRewards
      .filter(({ unclaimed }) => unclaimed.gt(BIG_ZERO))
      .map(({ token, accumulated, proofs, position, isNative, claimContractAddress }) => ({
        claimContractAddress,
        claim: {
          user: address,
          position,
          token: token.address,
          amount: toWeiString(accumulated, token.decimals), // TODO proof requires 'accumulated' amount?
          isNative,
          proof: proofs,
        },
      }));
    if (!unclaimedRewards.length) {
      throw new Error(`No unclaimed stellaswap rewards found for ${vaultId}`);
    }

    const claimsByContract = Object.values(
      groupBy(unclaimedRewards, r => r.claimContractAddress)
    ).map(rewards => ({
      to: rewards[0].claimContractAddress,
      claims: rewards.map(({ claim }) => claim),
    }));

    const walletApi = await getWalletConnectionApi();
    const publicClient = rpcClientManager.getBatchClient(chainId);
    const walletClient = await walletApi.getConnectedViemClient();
    const gasPrices = await getGasPriceOptions(chain);

    const makeTransaction = () => {
      if (claimsByContract.length === 1) {
        const { to, claims } = claimsByContract[0];
        console.log(claims);
        const contract = fetchWalletContract(to, stellaswapRewarderAbi, walletClient);
        return contract.write.claim(
          [
            claims.map(claim => ({
              user: claim.user as Address,
              token: claim.token as Address,
              amount: BigInt(claim.amount),
              position: BigInt(claim.position),
              isNative: claim.isNative,
              proof: claim.proof as Address[],
            })),
          ],
          {
            account: address as Address,
            ...gasPrices,
            chain: walletClient.chain,
          }
        );
      } else {
        throw new Error('TODO: implement multi-rewarder contract claim');
      }
    };

    txWallet(dispatch);
    const transaction = makeTransaction();

    const spenderAddress = first(unclaimedRewards)!.claimContractAddress;
    const tokens = unclaimedRewards.map(r => r.claim.token);
    bindTransactionEvents(
      dispatch,
      transaction,
      publicClient,
      { amount: BIG_ZERO, token: native }, // TODO fix so these are not required
      {
        walletAddress: address,
        chainId: chainId,
        spenderAddress, // TODO fix so these are not required
        tokens: tokens
          .map(token => selectTokenByAddressOrUndefined(state, chainId, token))
          .filter(isDefined),
        rewards: true,
      }
    );
  });
};

const resetWallet = () => {
  return captureWalletErrors(async dispatch => {
    dispatch(createWalletActionResetAction());
  });
};

export const walletActions = {
  approval,
  deposit,
  v3Deposit,
  withdraw,
  v3Withdraw,
  stakeGovVault,
  unstakeGovVault,
  claimGovVault,
  exitGovVault,
  exitBoost,
  claimBoost,
  stakeBoost,
  unstakeBoost,
  mintDeposit,
  burnWithdraw,
  resetWallet,
  zapExecuteOrder,
  migrateUnstake,
  bridgeViaCommonInterface,
  claimMerkl,
  claimStellaSwap,
};

export function captureWalletErrors(
  func: BeefyThunk<Promise<unknown>>
): BeefyThunk<Promise<unknown>> {
  return async (dispatch, getState, extraArgument) => {
    try {
      return await func(dispatch, getState, extraArgument);
    } catch (error) {
      const txError =
        error instanceof FriendlyError
          ? { message: errorToString(error.getInnerError()), friendlyMessage: error.message }
          : { message: errorToString(error) };

      console.error('captureWalletErrors', error);
      dispatch(createWalletActionErrorAction(txError, undefined));
      dispatch(stepperActions.setStepContent({ stepContent: StepContent.ErrorTx }));
    }
  };
}

async function bindTransactionEvents(
  dispatch: ThunkDispatch<BeefyState, unknown, Action<unknown>>,
  transactionHashPromise: Promise<Hash>,
  client: PublicClient,
  additionalData: TxAdditionalData,
  refreshOnSuccess?: TxRefreshOnSuccess
) {
  const context: TxContext = { additionalData, refreshOnSuccess };
  const hash = await transactionHashPromise.then(hash => {
    txSubmitted(dispatch, context, hash);
    return hash;
  });

  waitForTransactionReceipt(client, { hash })
    .then(receipt => {
      const success = receipt.status === 'success';
      if (success) {
        txMined(dispatch, context, receipt);
      } else {
        txError(dispatch, context, { message: 'Transaction failed.' });
      }
    })
    .catch(error => {
      txError(dispatch, context, { message: String(error) });
    });
}

function selectVaultTokensToRefresh(state: BeefyState, vault: VaultEntity) {
  const tokens: TokenEntity[] = [];

  // token0/1 for CLM-like
  if (isCowcentratedLikeVault(vault)) {
    vault.depositTokenAddresses.forEach(tokenAddress => {
      tokens.push(selectTokenByAddress(state, vault.chainId, tokenAddress));
    });
  }

  // depositTokenAddress for CLM is the pool address not an ERC20 therefore we just updated token0/1
  if (!isCowcentratedVault(vault)) {
    tokens.push(selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress));
  }

  // receipt token
  // gov v1 vaults do not have a receipt token
  if ('receiptTokenAddress' in vault) {
    tokens.push(selectTokenByAddress(state, vault.chainId, vault.receiptTokenAddress));
  }

  // related tokens
  if (isStandardVault(vault)) {
    // assets from LP that may have been split
    vault.assetIds
      .map(assetId => selectTokenByIdOrUndefined(state, vault.chainId, assetId))
      .filter(isDefined)
      .forEach(token => tokens.push(token));
  } else if (isGovVault(vault)) {
    // any earned token user may have claimed
    selectGovVaultEarnedTokens(state, vault.chainId, vault.id).forEach(token => tokens.push(token));
  }

  // and native token because we spent gas
  tokens.push(selectChainNativeToken(state, vault.chainId));

  return uniqBy(tokens, 'id');
}

function selectZapTokensToRefresh(
  state: BeefyState,
  vault: VaultEntity,
  order: ZapOrder
): TokenEntity[] {
  const tokens: TokenEntity[] = selectVaultTokensToRefresh(state, vault);

  for (const { token: tokenAddress } of order.inputs) {
    const token = selectTokenByAddressOrUndefined(state, vault.chainId, tokenAddress);
    if (token) {
      tokens.push(token);
    }
  }

  for (const { token: tokenAddress } of order.outputs) {
    const token = selectTokenByAddressOrUndefined(state, vault.chainId, tokenAddress);
    if (token) {
      tokens.push(token);
    }
  }

  return uniqBy(tokens, 'id');
}
