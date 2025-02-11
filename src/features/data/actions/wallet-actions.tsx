import { BigNumber } from 'bignumber.js';
import { first, groupBy, uniqBy } from 'lodash-es';
import type { Action } from 'redux';
import boostAbi from '../../../config/abi/boost.json';
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
  type TrxHash,
  type TrxReceipt,
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
import type { AbiItem } from 'web3-utils';
import { convertAmountToRawNumber, errorToString } from '../../../helpers/format';
import { FriendlyError } from '../utils/error-utils';
import type { MinterEntity } from '../entities/minter';
import { reloadReserves } from './minters';
import { selectChainById } from '../selectors/chains';
import { BIG_ZERO, fromWei, toWei, toWeiString } from '../../../helpers/big-number';
import { startStepperWithSteps, updateSteps } from './stepper';
import { type Step, StepContent, stepperActions } from '../reducers/wallet/stepper';
import type { PromiEvent } from 'web3-core';
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
import { viemToWeb3Abi } from '../../../helpers/web3';
import { BeefyCommonBridgeAbi } from '../../../config/abi/BeefyCommonBridgeAbi';
import { BeefyZapRouterAbi } from '../../../config/abi/BeefyZapRouterAbi';
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
  hash: TrxHash
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
  receipt: TrxReceipt
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
    const web3 = await walletApi.getConnectedWeb3Instance();
    const native = selectChainNativeToken(state, token.chainId);

    const contract = new web3.eth.Contract(viemToWeb3Abi(ERC20Abi), token.address);
    const amountWei = toWei(amount, token.decimals);
    const approvalAmountWei = amountWei.gt(MIN_APPROVAL_AMOUNT) ? amountWei : MIN_APPROVAL_AMOUNT;
    const chain = selectChainById(state, token.chainId);
    const gasPrices = await getGasPriceOptions(chain);

    txWallet(dispatch);
    const transaction = contract.methods
      .approve(spenderAddress, approvalAmountWei.toString(10))
      .send({ from: address, ...gasPrices });

    bindTransactionEvents(
      dispatch,
      transaction,
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
  unstakeCall,
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

    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const chain = selectChainById(state, vault.chainId);
    const gasPrices = await getGasPriceOptions(chain);
    txWallet(dispatch);
    const transaction = unstakeCall.send({ from: address, ...gasPrices });

    bindTransactionEvents(
      dispatch,
      transaction,
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
    const web3 = await walletApi.getConnectedWeb3Instance();

    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const mooToken = selectErc20TokenByAddress(state, vault.chainId, vault.contractAddress);

    const native = selectChainNativeToken(state, vault.chainId);
    const isNativeToken = depositToken.id === native.id;
    const contractAddr = mooToken.address;
    const contract = new web3.eth.Contract(viemToWeb3Abi(StandardVaultAbi), contractAddr);
    const rawAmount = toWei(amount, depositToken.decimals);
    const chain = selectChainById(state, vault.chainId);
    const gasPrices = await getGasPriceOptions(chain);

    txWallet(dispatch);
    const transaction = (() => {
      if (isNativeToken) {
        if (max) {
          return contract.methods
            .depositAllBNB()
            .send({ from: address, value: rawAmount.toString(10), ...gasPrices });
        } else {
          return contract.methods
            .depositBNB()
            .send({ from: address, value: rawAmount.toString(10), ...gasPrices });
        }
      } else {
        if (max) {
          return contract.methods.depositAll().send({ from: address, ...gasPrices });
        } else {
          return contract.methods
            .deposit(rawAmount.toString(10))
            .send({ from: address, ...gasPrices });
        }
      }
    })();

    bindTransactionEvents(
      dispatch,
      transaction,
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
    const chain = selectChainById(state, vault.chainId);
    const web3 = await walletApi.getConnectedWeb3Instance();
    const contract = new web3.eth.Contract(
      viemToWeb3Abi(BeefyCowcentratedLiquidityVaultAbi),
      vault.contractAddress
    );
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

    const transaction = (() => {
      return contract.methods
        .deposit(rawAmounts[0], rawAmounts[1], estimatedLiquidity)
        .send({ from: address, ...gasPrices });
    })();

    bindTransactionEvents(
      dispatch,
      transaction,
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
    const web3 = await walletApi.getConnectedWeb3Instance();
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
    const contract = new web3.eth.Contract(viemToWeb3Abi(StandardVaultAbi), vault.contractAddress);
    const gasPrices = await getGasPriceOptions(chain);

    txWallet(dispatch);
    const transaction = (() => {
      if (isNativeToken) {
        if (max) {
          return contract.methods.withdrawAllBNB().send({ from: address, ...gasPrices });
        } else {
          return contract.methods
            .withdrawBNB(sharesToWithdrawWei.toString(10))
            .send({ from: address, ...gasPrices });
        }
      } else {
        if (max) {
          return contract.methods.withdrawAll().send({ from: address, ...gasPrices });
        } else {
          return contract.methods
            .withdraw(sharesToWithdrawWei.toString(10))
            .send({ from: address, ...gasPrices });
        }
      }
    })();

    bindTransactionEvents(
      dispatch,
      transaction,
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
    const web3 = await walletApi.getConnectedWeb3Instance();
    const chain = selectChainById(state, vault.chainId);
    const slippage = selectTransactSlippage(state);

    const contract = new web3.eth.Contract(
      viemToWeb3Abi(BeefyCowcentratedLiquidityVaultAbi),
      vault.contractAddress
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
        return contract.methods
          .withdrawAll(minOutputsWei[0], minOutputsWei[1])
          .send({ from: address, ...gasPrices });
      } else {
        return contract.methods
          .withdraw(sharesToWithdrawWei, minOutputsWei[0], minOutputsWei[1])
          .send({ from: address, ...gasPrices });
      }
    })();

    bindTransactionEvents(
      dispatch,
      transaction,
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
    const web3 = await walletApi.getConnectedWeb3Instance();
    const inputToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);

    const contractAddr = vault.contractAddress;
    const contract = new web3.eth.Contract(boostAbi as AbiItem[], contractAddr);
    const rawAmount = amount.shiftedBy(inputToken.decimals).decimalPlaces(0, BigNumber.ROUND_FLOOR);
    const chain = selectChainById(state, vault.chainId);
    const gasPrices = await getGasPriceOptions(chain);

    txWallet(dispatch);
    const transaction = contract.methods
      .stake(rawAmount.toString(10))
      .send({ from: address, ...gasPrices });

    bindTransactionEvents(
      dispatch,
      transaction,
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
    const web3 = await walletApi.getConnectedWeb3Instance();
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const rawAmount = toWei(amount, depositToken.decimals);

    const contractAddr = vault.contractAddress;
    const contract = new web3.eth.Contract(boostAbi as AbiItem[], contractAddr);
    const chain = selectChainById(state, vault.chainId);
    const gasPrices = await getGasPriceOptions(chain);

    txWallet(dispatch);
    const transaction = contract.methods
      .withdraw(rawAmount.toString(10))
      .send({ from: address, ...gasPrices });

    bindTransactionEvents(
      dispatch,
      transaction,
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
    const web3 = await walletApi.getConnectedWeb3Instance();
    const contractAddr = vault.contractAddress;

    const contract = new web3.eth.Contract(boostAbi as AbiItem[], contractAddr);
    const chain = selectChainById(state, vault.chainId);
    const gasPrices = await getGasPriceOptions(chain);

    txWallet(dispatch);
    const transaction = contract.methods.getReward().send({ from: address, ...gasPrices });

    bindTransactionEvents(
      dispatch,
      transaction,
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
    const web3 = await walletApi.getConnectedWeb3Instance();
    const contractAddr = vault.contractAddress;

    const contract = new web3.eth.Contract(boostAbi as AbiItem[], contractAddr);

    /**
     * withdraw() and by extension exit() will fail if already withdrawn (Cannot withdraw 0),
     * so if there is only rewards left getReward() should be called instead of exit()
     */
    const chain = selectChainById(state, vault.chainId);
    const gasPrices = await getGasPriceOptions(chain);

    txWallet(dispatch);
    const transaction = balanceAmount.gt(0)
      ? contract.methods.exit().send({ from: address, ...gasPrices })
      : contract.methods.getReward().send({ from: address, ...gasPrices });

    bindTransactionEvents(
      dispatch,
      transaction,
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
    const web3 = await walletApi.getConnectedWeb3Instance();
    const contractAddr = boost.contractAddress;

    const contract = new web3.eth.Contract(boostAbi as AbiItem[], contractAddr);
    const chain = selectChainById(state, vault.chainId);
    const gasPrices = await getGasPriceOptions(chain);

    txWallet(dispatch);
    const transaction = contract.methods.getReward().send({ from: address, ...gasPrices });

    bindTransactionEvents(
      dispatch,
      transaction,
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
    const web3 = await walletApi.getConnectedWeb3Instance();
    const contractAddr = boost.contractAddress;

    const contract = new web3.eth.Contract(boostAbi as AbiItem[], contractAddr);

    /**
     * withdraw() and by extension exit() will fail if already withdrawn (Cannot withdraw 0),
     * so if there is only rewards left getReward() should be called instead of exit()
     */
    const chain = selectChainById(state, vault.chainId);
    const gasPrices = await getGasPriceOptions(chain);

    txWallet(dispatch);
    const transaction = boostAmount.gt(0)
      ? contract.methods.exit().send({ from: address, ...gasPrices })
      : contract.methods.getReward().send({ from: address, ...gasPrices });

    bindTransactionEvents(
      dispatch,
      transaction,
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

    const walletApi = await getWalletConnectionApi();
    const web3 = await walletApi.getConnectedWeb3Instance();

    const boost = selectBoostById(state, boostId);
    const vault = selectStandardVaultById(state, boost.vaultId);
    const mooToken = selectTokenByAddress(state, vault.chainId, vault.receiptTokenAddress);

    const contractAddr = boost.contractAddress;
    const contract = new web3.eth.Contract(boostAbi as AbiItem[], contractAddr);
    const rawAmount = amount.shiftedBy(mooToken.decimals).decimalPlaces(0, BigNumber.ROUND_FLOOR);
    const chain = selectChainById(state, vault.chainId);
    const gasPrices = await getGasPriceOptions(chain);

    txWallet(dispatch);
    const transaction = contract.methods
      .stake(rawAmount.toString(10))
      .send({ from: address, ...gasPrices });

    bindTransactionEvents(
      dispatch,
      transaction,
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

    const walletApi = await getWalletConnectionApi();
    const web3 = await walletApi.getConnectedWeb3Instance();
    const boost = selectBoostById(state, boostId);
    const vault = selectStandardVaultById(state, boost.vaultId);
    const mooToken = selectTokenByAddress(state, vault.chainId, vault.receiptTokenAddress);

    const contractAddr = boost.contractAddress;
    const contract = new web3.eth.Contract(boostAbi as AbiItem[], contractAddr);
    const rawAmount = amount.shiftedBy(mooToken.decimals).decimalPlaces(0, BigNumber.ROUND_FLOOR);
    const chain = selectChainById(state, vault.chainId);
    const gasPrices = await getGasPriceOptions(chain);

    txWallet(dispatch);
    const transaction = contract.methods
      .withdraw(rawAmount.toString(10))
      .send({ from: address, ...gasPrices });

    bindTransactionEvents(
      dispatch,
      transaction,
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
    const web3 = await walletApi.getConnectedWeb3Instance();
    const contract = new web3.eth.Contract(viemToWeb3Abi(MinterAbi), minterAddress);
    const chain = selectChainById(state, chainId);
    const gasPrices = await getGasPriceOptions(chain);
    const amountInWei = toWei(amount, payToken.decimals);
    const amountInWeiString = amountInWei.toString(10);
    const isNative = isTokenNative(payToken);

    const buildCall = async () => {
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
          return {
            method: isNative
              ? contract.methods.depositNative('', true)
              : contract.methods.deposit(amountInWeiString, '', true),
            options: isNative ? { value: amountInWeiString } : {},
          };
        }

        // swap after max slippage is better
        return {
          method: isNative
            ? contract.methods.depositNative(swapData.tx.data, false)
            : contract.methods.deposit(amountInWeiString, swapData.tx.data, false),
          options: isNative ? { value: amountInWeiString } : {},
        };
      }

      // non-zap
      if (isNative) {
        return {
          method: contract.methods.depositNative(),
          options: { value: amountInWeiString },
        };
      }

      if (max) {
        return {
          method: contract.methods.depositAll(),
          options: {},
        };
      }

      return {
        method: contract.methods.deposit(amountInWeiString),
        options: {},
      };
    };
    const call = await buildCall();
    txWallet(dispatch);
    const transaction = call.method.send({ from: address, ...gasPrices, ...call.options });

    bindTransactionEvents(
      dispatch,
      transaction,
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
    const web3 = await walletApi.getConnectedWeb3Instance();
    const contract = new web3.eth.Contract(viemToWeb3Abi(MinterAbi), contractAddr);
    const chain = selectChainById(state, chainId);
    const gasPrices = await getGasPriceOptions(chain);

    txWallet(dispatch);
    const transaction = (() => {
      const rawAmount = convertAmountToRawNumber(amount, burnedToken.decimals);
      return contract.methods.withdraw(rawAmount).send({ from: address, ...gasPrices });
    })();

    bindTransactionEvents(
      dispatch,
      transaction,
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
    const web3 = await walletApi.getConnectedWeb3Instance();
    const contract = new web3.eth.Contract(
      viemToWeb3Abi(BeefyCommonBridgeAbi),
      viaBeefyBridgeAddress
    );
    const gasPrices = await getGasPriceOptions(fromChain);

    txWallet(dispatch);
    const transaction = contract.methods
      .bridge(toChain.networkChainId, inputWei, receiverAddress)
      .send({
        ...gasPrices,
        from: fromAddress,
        value: feeWei,
      });

    bindTransactionEvents(
      dispatch,
      transaction,
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

    const steps: ZapStep[] = params.steps;
    if (!steps.length) {
      throw new Error('No steps provided');
    }

    const walletApi = await getWalletConnectionApi();
    const web3 = await walletApi.getConnectedWeb3Instance();
    const gasPrices = await getGasPriceOptions(chain);
    const nativeInput = order.inputs.find(input => input.token === ZERO_ADDRESS);

    const contract = new web3.eth.Contract(viemToWeb3Abi(BeefyZapRouterAbi), zap.router);
    const options = {
      ...gasPrices,
      value: nativeInput ? nativeInput.amount : '0',
      from: order.user,
    };
    console.debug('executeOrder', { order, steps, options });
    txWallet(dispatch);
    const transaction = contract.methods.executeOrder(order, steps).send(options);

    bindTransactionEvents(
      dispatch,
      transaction,
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
    const web3 = await walletApi.getConnectedWeb3Instance();
    const contract = new web3.eth.Contract(
      viemToWeb3Abi(AngleMerklDistributorAbi),
      distributorAddress
    );
    const gasPrices = await getGasPriceOptions(chain);

    txWallet(dispatch);
    const transaction = contract.methods
      .claim(users, tokens, amounts, proofs)
      .send({ from: address, ...gasPrices });

    bindTransactionEvents(
      dispatch,
      transaction,
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
    const web3 = await walletApi.getConnectedWeb3Instance();
    const abi = viemToWeb3Abi(stellaswapRewarderAbi);
    const gasPrices = await getGasPriceOptions(chain);

    const makeTransaction = () => {
      if (claimsByContract.length === 1) {
        const { to, claims } = claimsByContract[0];
        console.log(claims);
        const contract = new web3.eth.Contract(abi, to);
        return contract.methods.claim(claims).send({ from: address, ...gasPrices });
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

function bindTransactionEvents(
  dispatch: ThunkDispatch<BeefyState, unknown, Action<unknown>>,
  transaction: PromiEvent<unknown>,
  additionalData: TxAdditionalData,
  refreshOnSuccess?: TxRefreshOnSuccess
) {
  const context: TxContext = { additionalData, refreshOnSuccess };

  transaction
    .on('transactionHash', function (hash: TrxHash) {
      txSubmitted(dispatch, context, hash);
    })
    .on('receipt', function (receipt: TrxReceipt) {
      txMined(dispatch, context, receipt);
    })
    .on('error', function (error: TrxError) {
      txError(dispatch, context, error);
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
