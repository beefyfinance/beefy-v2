import BigNumber from 'bignumber.js';
import { uniqBy } from 'lodash-es';
import type { Action } from 'redux';
import boostAbi from '../../../config/abi/boost.json';
import erc20Abi from '../../../config/abi/erc20.json';
import vaultAbi from '../../../config/abi/vault.json';
import minterAbi from '../../../config/abi/minter.json';
import type { BeefyState, BeefyThunk } from '../../../redux-types';
import { getOneInchApi, getWalletConnectionApi } from '../apis/instances';
import type { BoostEntity } from '../entities/boost';
import type { ChainEntity } from '../entities/chain';
import type { TokenEntity, TokenErc20 } from '../entities/token';
import { isTokenEqual, isTokenNative } from '../entities/token';
import type { VaultEntity, VaultGov, VaultStandard } from '../entities/vault';
import { isStandardVault } from '../entities/vault';
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
  selectBoostUserRewardsInToken,
  selectGovVaultPendingRewardsInToken,
  selectGovVaultRewardsTokenEntity,
  selectGovVaultUserStakedBalanceInDepositToken,
} from '../selectors/balance';
import {
  selectChainNativeToken,
  selectChainWrappedNativeToken,
  selectErc20TokenByAddress,
  selectIsTokenLoaded,
  selectTokenByAddress,
  selectTokenByAddressOrNull,
  selectTokenById,
} from '../selectors/tokens';
import { selectVaultById, selectVaultPricePerFullShare } from '../selectors/vaults';
import { selectWalletAddress } from '../selectors/wallet';
import { oracleAmountToMooAmount } from '../utils/ppfs';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from './tokens';
import { getGasPriceOptions } from '../utils/gas-utils';
import type { AbiItem } from 'web3-utils';
import { convertAmountToRawNumber, errorToString } from '../../../helpers/format';
import { FriendlyError } from '../utils/error-utils';
import type { MinterEntity } from '../entities/minter';
import { reloadReserves } from './minters';
import { selectChainById } from '../selectors/chains';
import { BIG_ZERO, toWei, toWeiString } from '../../../helpers/big-number';
import { updateSteps } from './stepper';
import { StepContent, stepperActions } from '../reducers/wallet/stepper';
import { BeefyCommonBridgeAbi, BeefyZapRouterAbi } from '../../../config/abi';
import type { PromiEvent } from 'web3-core';
import type { ThunkDispatch } from 'redux-thunk';
import { selectOneInchSwapAggregatorForChain, selectZapByChainId } from '../selectors/zap';
import type { UserlessZapRequest, ZapOrder } from '../apis/transact/zap/types';
import { ZERO_ADDRESS } from '../../../helpers/addresses';
import { MultiCall } from 'eth-multicall';
import { getVaultWithdrawnFromContract } from '../apis/transact/helpers/vault';
import { migratorUpdate } from './migrator';
import type { MigrationConfig } from '../reducers/wallet/migration';
import type { IBridgeQuote } from '../apis/bridge/providers/provider-types';
import type { BeefyAnyBridgeConfig } from '../apis/config-types';
import { transactActions } from '../reducers/wallet/transact';

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

    if (migrationId) {
      dispatch(migratorUpdate({ vaultId, migrationId, walletAddress }));
    }

    if (clearInput) {
      dispatch(transactActions.clearInput());
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

const approval = (token: TokenErc20, spenderAddress: string) => {
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

    const contract = new web3.eth.Contract(erc20Abi as AbiItem[], token.address);
    const maxAmount = web3.utils.toWei('8000000000', 'ether');
    const chain = selectChainById(state, token.chainId);
    const gasPrices = await getGasPriceOptions(chain);

    txWallet(dispatch);
    const transaction = contract.methods
      .approve(spenderAddress, maxAmount)
      .send({ from: address, ...gasPrices });

    const bigMaxAmount = new BigNumber(maxAmount).shiftedBy(-native.decimals);
    bindTransactionEvents(
      dispatch,
      transaction,
      { spender: spenderAddress, amount: bigMaxAmount, token: token },
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
      { spender: vault.earnContractAddress, amount, token: depositToken },
      {
        walletAddress: address,
        chainId: vault.chainId,
        spenderAddress: vault.earnContractAddress,
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
    const mooToken = selectErc20TokenByAddress(state, vault.chainId, vault.earnedTokenAddress);

    const native = selectChainNativeToken(state, vault.chainId);
    const isNativeToken = depositToken.id === native.id;
    const contractAddr = mooToken.address;
    const contract = new web3.eth.Contract(vaultAbi as AbiItem[], contractAddr);
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
    const multicall = new MultiCall(web3, chain.multicallAddress);
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);

    const { sharesToWithdrawWei } = await getVaultWithdrawnFromContract(
      {
        token: depositToken,
        amount: oracleAmount,
        max,
      },
      vault,
      state,
      address,
      web3,
      multicall
    );

    const native = selectChainNativeToken(state, vault.chainId);
    const isNativeToken = depositToken.id === native.id;
    const contract = new web3.eth.Contract(vaultAbi as AbiItem[], vault.earnContractAddress);
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
      { spender: vault.earnContractAddress, amount: oracleAmount, token: depositToken },
      {
        chainId: vault.chainId,
        spenderAddress: vault.earnContractAddress,
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

    const contractAddr = vault.earnContractAddress;
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
    const mooToken = selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddress);
    const ppfs = selectVaultPricePerFullShare(state, vault.chainId);

    // amount is in oracle token, we need it in moo token
    const mooAmount = oracleAmountToMooAmount(mooToken, depositToken, ppfs, amount);

    const rawAmount = mooAmount
      .shiftedBy(mooToken.decimals)
      .decimalPlaces(0, BigNumber.ROUND_FLOOR);

    const contractAddr = vault.earnContractAddress;
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
      return;
    }

    const amount = selectGovVaultPendingRewardsInToken(state, vault.id);
    const token = selectGovVaultRewardsTokenEntity(state, vault.id);

    const walletApi = await getWalletConnectionApi();
    const web3 = await walletApi.getConnectedWeb3Instance();
    const contractAddr = vault.earnContractAddress;

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
    const contractAddr = vault.earnContractAddress;

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

const claimBoost = (boost: BoostEntity) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }
    const amount = selectBoostUserRewardsInToken(state, boost.id);
    const token = selectTokenByAddress(state, boost.chainId, boost.earnedTokenAddress);
    const vault = selectVaultById(state, boost.vaultId);

    const walletApi = await getWalletConnectionApi();
    const web3 = await walletApi.getConnectedWeb3Instance();
    const contractAddr = boost.earnContractAddress;

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
        boostId: boost.id,
      }
    );
  });
};

const exitBoost = (boost: BoostEntity) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const boostAmount = selectBoostUserBalanceInToken(state, boost.id);
    const vault = selectVaultById(state, boost.vaultId);
    const token = selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddress);

    const walletApi = await getWalletConnectionApi();
    const web3 = await walletApi.getConnectedWeb3Instance();
    const contractAddr = boost.earnContractAddress;

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
      { spender: contractAddr, amount: boostAmount, token },
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

const stakeBoost = (boost: BoostEntity, amount: BigNumber) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const walletApi = await getWalletConnectionApi();
    const web3 = await walletApi.getConnectedWeb3Instance();

    const vault = selectVaultById(state, boost.vaultId);
    const inputToken = selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddress);

    const contractAddr = boost.earnContractAddress;
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
        boostId: boost.id,
      }
    );
  });
};

const unstakeBoost = (boost: BoostEntity, amount: BigNumber) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const walletApi = await getWalletConnectionApi();
    const web3 = await walletApi.getConnectedWeb3Instance();

    const vault = selectVaultById(state, boost.vaultId);
    const inputToken = selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddress);

    const contractAddr = boost.earnContractAddress;
    const contract = new web3.eth.Contract(boostAbi as AbiItem[], contractAddr);
    const rawAmount = amount.shiftedBy(inputToken.decimals).decimalPlaces(0, BigNumber.ROUND_FLOOR);
    const chain = selectChainById(state, vault.chainId);
    const gasPrices = await getGasPriceOptions(chain);

    txWallet(dispatch);
    const transaction = contract.methods
      .withdraw(rawAmount.toString(10))
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
    const contract = new web3.eth.Contract(minterAbi as AbiItem[], minterAddress);
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
        const amountOutWei = new BigNumber(swapData.toAmount);
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
    const contract = new web3.eth.Contract(minterAbi as AbiItem[], contractAddr);
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
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const { input, output, fee, config } = quote;
    const viaBeefyBridgeAddress = config.chains[input.token.chainId].bridge;
    const fromChainId = input.token.chainId;
    const toChainId = output.token.chainId;
    const fromChain = selectChainById(state, fromChainId);
    const toChain = selectChainById(state, toChainId);
    const gasToken = selectChainNativeToken(state, fromChainId);
    const inputWei = toWeiString(input.amount, input.token.decimals);
    const feeWei = toWeiString(fee.amount, fee.token.decimals);

    if (!isTokenEqual(gasToken, fee.token)) {
      console.debug(gasToken, fee.token);
      throw new Error(`Only native fee token is supported`);
    }

    const walletApi = await getWalletConnectionApi();
    const web3 = await walletApi.getConnectedWeb3Instance();
    const contract = new web3.eth.Contract(BeefyCommonBridgeAbi, viaBeefyBridgeAddress);
    const gasPrices = await getGasPriceOptions(fromChain);

    txWallet(dispatch);
    const transaction = contract.methods.bridge(toChain.networkChainId, inputWei, address).send({
      ...gasPrices,
      from: address,
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
        walletAddress: address,
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
      return;
    }

    const vault = selectVaultById(state, vaultId);
    const chain = selectChainById(state, vault.chainId);
    const zap = selectZapByChainId(state, vault.chainId);
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);

    const order = {
      ...params.order,
      user: address,
      recipient: address,
    };
    const steps = params.steps;

    const walletApi = await getWalletConnectionApi();
    const web3 = await walletApi.getConnectedWeb3Instance();
    const gasPrices = await getGasPriceOptions(chain);
    const nativeInput = order.inputs.find(input => input.token === ZERO_ADDRESS);

    const contract = new web3.eth.Contract(BeefyZapRouterAbi, zap.router);
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
  withdraw,
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
};

export function captureWalletErrors<ReturnType>(
  func: BeefyThunk<Promise<ReturnType>>
): BeefyThunk<Promise<ReturnType>> {
  return async (dispatch, getState, extraArgument) => {
    try {
      return await func(dispatch, getState, extraArgument);
    } catch (error) {
      const txError =
        error instanceof FriendlyError
          ? { message: errorToString(error.getInnerError()), friendlyMessage: error.message }
          : { message: errorToString(error) };

      dispatch(
        createWalletActionErrorAction(txError, {
          amount: BIG_ZERO,
          token: null,
        })
      );
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

  // refresh vault tokens
  if (isStandardVault(vault)) {
    for (const assetId of vault.assetIds) {
      // selectTokenById throws if token does not exist;
      // tokens in assetIds[] might not exist if vault does not have ZAP
      if (selectIsTokenLoaded(state, vault.chainId, assetId)) {
        tokens.push(selectTokenById(state, vault.chainId, assetId));
      }
    }
  }
  tokens.push(selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress));
  tokens.push(selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddress));

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
    const token = selectTokenByAddressOrNull(state, vault.chainId, tokenAddress);
    if (token) {
      tokens.push(token);
    }
  }

  for (const { token: tokenAddress } of order.outputs) {
    const token = selectTokenByAddressOrNull(state, vault.chainId, tokenAddress);
    if (token) {
      tokens.push(token);
    }
  }

  return uniqBy(tokens, 'id');
}
