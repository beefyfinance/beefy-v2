import BigNumber from 'bignumber.js';
import { uniqBy } from 'lodash';
import { Dispatch } from 'redux';
import boostAbi from '../../../config/abi/boost.json';
import erc20Abi from '../../../config/abi/erc20.json';
import vaultAbi from '../../../config/abi/vault.json';
import minterAbi from '../../../config/abi/minter.json';
import zapAbi from '../../../config/abi/zap.json';
import bridgeAbi from '../../../config/abi/BridgeAbi.json';
import { BeefyState, BeefyThunk } from '../../../redux-types';
import { getOneInchApi, getWalletConnectionApiInstance } from '../apis/instances';
import { BoostEntity } from '../entities/boost';
import { ChainEntity } from '../entities/chain';
import { isTokenNative, TokenEntity, TokenErc20 } from '../entities/token';
import { isStandardVault, VaultEntity, VaultGov, VaultStandard } from '../entities/vault';
import {
  createWalletActionErrorAction,
  createWalletActionPendingAction,
  createWalletActionSuccessAction,
  MandatoryAdditionalData,
  TrxError,
  TrxHash,
  TrxReceipt,
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
  selectTokenById,
} from '../selectors/tokens';
import { selectVaultById, selectVaultPricePerFullShare } from '../selectors/vaults';
import { selectWalletAddress } from '../selectors/wallet';
import { oracleAmountToMooAmount } from '../utils/ppfs';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from './tokens';
import { getGasPriceOptions } from '../utils/gas-utils';
import { AbiItem } from 'web3-utils';
import { convertAmountToRawNumber, errorToString } from '../../../helpers/format';
import { FriendlyError } from '../utils/error-utils';
import { MinterEntity } from '../entities/minter';
import { reloadReserves } from './minters';
import { selectChainById } from '../selectors/chains';
import { BIG_ZERO, fromWeiString, toWei, toWeiString } from '../../../helpers/big-number';
import { updateSteps } from './stepper';
import { StepContent, stepperActions } from '../reducers/wallet/stepper';
import { InputTokenAmount, TokenAmount, ZapQuoteStepSwap } from '../apis/transact/transact-types';
import { ZapEntityBeefy, ZapEntityOneInch } from '../entities/zap';
import { BeefyZapOneInchAbi, ZapAbi } from '../../../config/abi';
import { OneInchZapProvider } from '../apis/transact/providers/one-inch/one-inch';
import { MultiCall } from 'eth-multicall';
import { getPool } from '../apis/amm';
import { AmmEntity } from '../entities/amm';
import { WANT_TYPE } from '../apis/amm/types';
import { getVaultWithdrawnFromContract } from '../apis/transact/helpers/vault';

export const WALLET_ACTION = 'WALLET_ACTION';
export const WALLET_ACTION_RESET = 'WALLET_ACTION_RESET';

const approval = (token: TokenErc20, spenderAddress: string) => {
  return captureWalletErrors(async (dispatch, getState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const walletApi = await getWalletConnectionApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();
    const native = selectChainNativeToken(state, token.chainId);

    const contract = new web3.eth.Contract(erc20Abi as any, token.address);
    const maxAmount = web3.utils.toWei('8000000000', 'ether');
    const chain = selectChainById(state, token.chainId);
    const gasPrices = await getGasPriceOptions(chain);
    const transaction = contract.methods
      .approve(spenderAddress, maxAmount)
      .send({ from: address, ...gasPrices });

    const bigMaxAmount = new BigNumber(maxAmount).shiftedBy(-native.decimals);
    bindTransactionEvents(
      dispatch,
      transaction,
      { spender: spenderAddress, amount: bigMaxAmount, token: token },
      {
        chainId: token.chainId,
        spenderAddress,
        tokens: uniqBy([token, native], 'id'),
      }
    );
  });
};

const deposit = (vault: VaultEntity, amount: BigNumber, max: boolean) => {
  return captureWalletErrors(async (dispatch, getState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const walletApi = await getWalletConnectionApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();

    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const mooToken = selectErc20TokenByAddress(state, vault.chainId, vault.earnedTokenAddress);

    const native = selectChainNativeToken(state, vault.chainId);
    const isNativeToken = depositToken.id === native.id;
    const contractAddr = mooToken.address;
    const contract = new web3.eth.Contract(vaultAbi as any, contractAddr);
    const rawAmount = amount
      .shiftedBy(depositToken.decimals)
      .decimalPlaces(0, BigNumber.ROUND_FLOOR);
    const chain = selectChainById(state, vault.chainId);
    const gasPrices = await getGasPriceOptions(chain);

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
        chainId: vault.chainId,
        spenderAddress: contractAddr,
        tokens: getVaultTokensToRefresh(state, vault),
      }
    );
  });
};

const beefIn = (
  vault: VaultEntity,
  fullAmount: BigNumber,
  isNativeInput: boolean,
  swap: ZapQuoteStepSwap,
  zap: ZapEntityBeefy,
  slippageTolerance: number = 0.01
) => {
  return captureWalletErrors(async (dispatch, getState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const vaultAddress = vault.earnedTokenAddress;
    const walletApi = await getWalletConnectionApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();
    const contract = new web3.eth.Contract(zapAbi as any, zap.zapAddress);
    const rawSwapAmountOutMin = toWei(
      swap.toAmount.times(1 - slippageTolerance),
      swap.toToken.decimals
    );
    const rawAmount = toWei(fullAmount, swap.fromToken.decimals);
    const chain = selectChainById(state, vault.chainId);
    const gasPrices = await getGasPriceOptions(chain);

    const transaction = (() => {
      if (isNativeInput) {
        return contract.methods.beefInETH(vaultAddress, rawSwapAmountOutMin.toString(10)).send({
          from: address,
          value: rawAmount.toString(10),
          ...gasPrices,
        });
      } else {
        return contract.methods
          .beefIn(
            vaultAddress,
            rawSwapAmountOutMin.toString(10),
            swap.fromToken.address,
            rawAmount.toString(10)
          )
          .send({
            from: address,
            ...gasPrices,
          });
      }
    })();

    bindTransactionEvents(
      dispatch,
      transaction,
      { spender: zap.zapAddress, amount: fullAmount, token: swap.fromToken },
      {
        chainId: vault.chainId,
        spenderAddress: zap.zapAddress,
        tokens: uniqBy(
          getVaultTokensToRefresh(state, vault).concat([swap.fromToken, swap.toToken]),
          'id'
        ),
      }
    );
  });
};

const beefOut = (vault: VaultStandard, input: InputTokenAmount, zap: ZapEntityBeefy) => {
  return captureWalletErrors(async (dispatch, getState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const walletApi = await getWalletConnectionApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();
    const chain = selectChainById(state, vault.chainId);
    const multicall = new MultiCall(web3, chain.multicallAddress);
    const { sharesToWithdrawWei } = await getVaultWithdrawnFromContract(
      input,
      vault,
      state,
      address,
      web3,
      multicall
    );

    const contract = new web3.eth.Contract(ZapAbi, zap.zapAddress);
    const gasPrices = await getGasPriceOptions(chain);
    const sharesToWithdrawWeiString = sharesToWithdrawWei.toString(10);

    const transaction = (() => {
      return contract.methods.beefOut(vault.earnContractAddress, sharesToWithdrawWeiString).send({
        from: address,
        ...gasPrices,
      });
    })();

    bindTransactionEvents(
      dispatch,
      transaction,
      {
        spender: zap.zapAddress,
        amount: input.amount,
        token: input.token,
      },
      {
        chainId: vault.chainId,
        spenderAddress: zap.zapAddress,
        tokens: getVaultTokensToRefresh(state, vault),
      }
    );
  });
};

class ErrorOneInchQuoteChanged extends Error {
  private _originalAmount: BigNumber;
  private _newAmount: BigNumber;
  private _token: TokenEntity;

  constructor(originalAmount: BigNumber, newAmount: BigNumber, token: TokenEntity) {
    const originalAmountStr = originalAmount.toString(10);
    const newAmountStr = newAmount.toString(10);
    super(
      `Swap amount out changed from ${originalAmountStr} ${token.symbol} to ${newAmountStr} ${token.symbol}. Please check and try again.`
    );

    this._originalAmount = originalAmount;
    this._newAmount = newAmount;
    this._token = token;
  }

  public get newAmount(): BigNumber {
    return this._newAmount;
  }

  public get originalAmount(): BigNumber {
    return this._originalAmount;
  }

  public get token(): TokenEntity {
    return this._token;
  }
}

const oneInchBeefInSingle = (
  vault: VaultEntity,
  inputToken: TokenEntity,
  swap: ZapQuoteStepSwap,
  zap: ZapEntityOneInch,
  slippageTolerance: number = 0.01
) => {
  return captureWalletErrors(async (dispatch, getState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const vaultAddress = vault.earnedTokenAddress;
    const chain = selectChainById(state, vault.chainId);
    const oneInchApi = await getOneInchApi(chain);
    const swapTokenInAddress = swap.fromToken.address;
    const swapTokenOutAddress = swap.toToken.address;
    const swapAmountInWei = toWeiString(swap.fromAmount, swap.fromToken.decimals);
    const swapData = await oneInchApi.getSwap({
      disableEstimate: true, // otherwise will fail due to no allowance
      fromAddress: zap.zapAddress,
      amount: swapAmountInWei,
      fromTokenAddress: swapTokenInAddress,
      toTokenAddress: swapTokenOutAddress,
      slippage: slippageTolerance * 100,
    });
    const swapAmountOut = fromWeiString(swapData.toTokenAmount, swapData.toToken.decimals);

    // Double check output amount is within range (NOTE using slippage tolerance here: could allow 2x slippage)
    if (swapAmountOut.lt(swap.toAmount.multipliedBy(1 - slippageTolerance))) {
      throw new ErrorOneInchQuoteChanged(swap.toAmount, swapAmountOut, swap.toToken);
    }

    const walletApi = await getWalletConnectionApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();
    const contract = new web3.eth.Contract(BeefyZapOneInchAbi, zap.zapAddress);
    const gasPrices = await getGasPriceOptions(chain);
    const tx0 = swapData.tx.data;
    const tx1 = '0x0';

    const transaction = (() => {
      if (isTokenNative(inputToken)) {
        return contract.methods.beefInETH(vaultAddress, tx0, tx1, WANT_TYPE.SINGLE).send({
          from: address,
          value: swapAmountInWei,
          ...gasPrices,
        });
      } else {
        return contract.methods
          .beefIn(vaultAddress, swap.fromToken.address, swapAmountInWei, tx0, tx1, WANT_TYPE.SINGLE)
          .send({
            from: address,
            ...gasPrices,
          });
      }
    })();

    bindTransactionEvents(
      dispatch,
      transaction,
      {
        spender: zap.zapAddress,
        amount: swap.fromAmount,
        token: swap.fromToken,
        vaultId: vault.id,
      },
      {
        chainId: vault.chainId,
        spenderAddress: zap.zapAddress,
        tokens: uniqBy(
          getVaultTokensToRefresh(state, vault).concat([swap.fromToken, swap.toToken]),
          'id'
        ),
      }
    );
  });
};

const oneInchBeefInLP = (
  vault: VaultEntity,
  input: TokenAmount,
  swaps: ZapQuoteStepSwap[],
  zap: ZapEntityOneInch,
  lpTokens: TokenErc20[],
  wantType: Omit<WANT_TYPE, WANT_TYPE.SINGLE>,
  slippageTolerance: number = 0.01
) => {
  return captureWalletErrors(async (dispatch, getState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const vaultAddress = vault.earnedTokenAddress;
    const chain = selectChainById(state, vault.chainId);
    const oneInchApi = await getOneInchApi(chain);
    const swapData = await Promise.all(
      swaps.map(async swap => {
        const swapTokenInAddress = swap.fromToken.address;
        const swapTokenOutAddress = swap.toToken.address;
        const swapAmountInWei = toWeiString(swap.fromAmount, swap.fromToken.decimals);
        const swapData = await oneInchApi.getSwap({
          disableEstimate: true, // otherwise will fail due to no allowance
          fromAddress: zap.zapAddress,
          amount: swapAmountInWei,
          fromTokenAddress: swapTokenInAddress,
          toTokenAddress: swapTokenOutAddress,
          slippage: slippageTolerance * 100,
        });
        const swapAmountOut = fromWeiString(swapData.toTokenAmount, swapData.toToken.decimals);

        // Double check output amount is within range (NOTE using slippage tolerance here: could allow 2x slippage)
        if (swapAmountOut.lt(swap.toAmount.multipliedBy(1 - slippageTolerance))) {
          throw new ErrorOneInchQuoteChanged(swap.toAmount, swapAmountOut, swap.toToken);
        }

        return swapData;
      })
    );

    const walletApi = await getWalletConnectionApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();
    const contract = new web3.eth.Contract(BeefyZapOneInchAbi, zap.zapAddress);
    const gasPrices = await getGasPriceOptions(chain);
    const swap0 = swapData.find(
      data => data.toToken.address.toLowerCase() === lpTokens[0].address.toLowerCase()
    );
    const swap1 = swapData.find(
      data => data.toToken.address.toLowerCase() === lpTokens[1].address.toLowerCase()
    );

    if (!swap0 && !swap1) {
      throw new Error(`Mismatched swap`);
    }

    const tx0 = swap0 ? swap0.tx.data : '0x0';
    const tx1 = swap1 ? swap1.tx.data : '0x0';
    const inputAmountWei = toWeiString(input.amount, input.token.decimals);

    const transaction = (() => {
      if (isTokenNative(input.token)) {
        return contract.methods.beefInETH(vaultAddress, tx0, tx1, wantType).send({
          from: address,
          value: inputAmountWei,
          ...gasPrices,
        });
      } else {
        return contract.methods
          .beefIn(vaultAddress, input.token.address, inputAmountWei, tx0, tx1, wantType)
          .send({
            from: address,
            ...gasPrices,
          });
      }
    })();

    bindTransactionEvents(
      dispatch,
      transaction,
      { spender: zap.zapAddress, amount: input.amount, token: input.token, vaultId: vault.id },
      {
        chainId: vault.chainId,
        spenderAddress: zap.zapAddress,
        tokens: uniqBy(
          getVaultTokensToRefresh(state, vault).concat(
            swaps.map(swap => [swap.fromToken, swap.toToken]).flat()
          ),
          'id'
        ),
      }
    );
  });
};

const oneInchBeefOutSingle = (
  vault: VaultStandard,
  input: InputTokenAmount,
  swap: ZapQuoteStepSwap,
  zap: ZapEntityOneInch,
  slippageTolerance: number = 0.01
) => {
  return captureWalletErrors(async (dispatch, getState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      throw new Error(`Wallet not connected`);
    }

    const walletApi = await getWalletConnectionApiInstance();
    const chain = selectChainById(state, vault.chainId);
    const web3 = await walletApi.getConnectedWeb3Instance();
    const multicall = new MultiCall(web3, chain.multicallAddress);

    const { withdrawnAmountAfterFeeWei, sharesToWithdrawWei } = await getVaultWithdrawnFromContract(
      input,
      vault,
      state,
      address,
      web3,
      multicall
    );

    const mooTokensToWithdrawWei = sharesToWithdrawWei.toString(10);
    const oneInchApi = await getOneInchApi(chain);
    const swapTokenInAddress = swap.fromToken.address;
    const swapTokenOutAddress = swap.toToken.address;
    const swapAmountInWei = withdrawnAmountAfterFeeWei.toString(10);
    const swapData = await oneInchApi.getSwap({
      disableEstimate: true, // otherwise will fail due to no allowance
      fromAddress: zap.zapAddress,
      amount: swapAmountInWei,
      fromTokenAddress: swapTokenInAddress,
      toTokenAddress: swapTokenOutAddress,
      slippage: slippageTolerance * 100,
    });
    const swapAmountOutDec = fromWeiString(swapData.toTokenAmount, swapData.toToken.decimals);
    const vaultAddress = vault.earnedTokenAddress;

    // Double check output amount is within range (NOTE using slippage tolerance here: could allow 2x slippage)
    if (swapAmountOutDec.lt(swap.toAmount.multipliedBy(1 - slippageTolerance))) {
      throw new ErrorOneInchQuoteChanged(swap.toAmount, swapAmountOutDec, swap.toToken);
    }

    const contract = new web3.eth.Contract(BeefyZapOneInchAbi, zap.zapAddress);
    const gasPrices = await getGasPriceOptions(chain);
    const tx0 = swapData.tx.data;
    const tx1 = '0x0';

    const transaction = (() => {
      return contract.methods
        .beefOutAndSwap(
          vaultAddress,
          mooTokensToWithdrawWei,
          swapTokenOutAddress,
          tx0,
          tx1,
          WANT_TYPE.SINGLE
        )
        .send({
          from: address,
          ...gasPrices,
        });
    })();

    bindTransactionEvents(
      dispatch,
      transaction,
      {
        spender: zap.zapAddress,
        amount: input.amount,
        token: input.token,
        vaultId: vault.id,
      },
      {
        chainId: vault.chainId,
        spenderAddress: zap.zapAddress,
        tokens: uniqBy(
          getVaultTokensToRefresh(state, vault).concat([swap.fromToken, swap.toToken]),
          'id'
        ),
      }
    );
  });
};

const oneInchBeefOutLP = (
  vault: VaultStandard,
  input: InputTokenAmount,
  swaps: ZapQuoteStepSwap[],
  zap: ZapEntityOneInch,
  lpTokens: TokenErc20[],
  amm: AmmEntity,
  slippageTolerance: number = 0.01
) => {
  return captureWalletErrors(async (dispatch, getState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      throw new Error(`Wallet not connected`);
    }

    const depositToken = selectErc20TokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const chain = selectChainById(state, vault.chainId);
    const walletApi = await getWalletConnectionApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();
    const multicall = new MultiCall(web3, chain.multicallAddress);
    const contract = new web3.eth.Contract(BeefyZapOneInchAbi, zap.zapAddress);
    const lp = getPool(depositToken.address, amm, chain);
    await lp.updateAllData();

    const { withdrawnAmountAfterFeeWei, sharesToWithdrawWei } = await getVaultWithdrawnFromContract(
      input,
      vault,
      state,
      address,
      web3,
      multicall
    );

    const mooTokensToWithdrawWei = sharesToWithdrawWei.toString(10);
    const vaultAddress = vault.earnedTokenAddress;
    const swapAmountsInWei = OneInchZapProvider.quoteRemoveLiquidity(
      lp,
      withdrawnAmountAfterFeeWei
    );

    const oneInchApi = await getOneInchApi(chain);
    const swapData = await Promise.all(
      swaps.map(async swap => {
        const tokenN = lpTokens.findIndex(
          t => t.address.toLowerCase() === swap.fromToken.address.toLowerCase()
        );
        const swapTokenInAddress = swap.fromToken.address;
        const swapTokenOutAddress = swap.toToken.address;
        const swapAmountInWei = swapAmountsInWei[tokenN].toString(10);
        const swapData = await oneInchApi.getSwap({
          disableEstimate: true, // otherwise will fail due to no allowance
          fromAddress: zap.zapAddress,
          amount: swapAmountInWei,
          fromTokenAddress: swapTokenInAddress,
          toTokenAddress: swapTokenOutAddress,
          slippage: slippageTolerance * 100,
        });
        const swapAmountOutDec = fromWeiString(swapData.toTokenAmount, swapData.toToken.decimals);

        // Double check output amount is within range (NOTE using slippage tolerance here: could allow 2x slippage)
        if (swapAmountOutDec.lt(swap.toAmount.multipliedBy(1 - slippageTolerance))) {
          throw new ErrorOneInchQuoteChanged(swap.toAmount, swapAmountOutDec, swap.toToken);
        }

        return swapData;
      })
    );

    const swap0 = swapData.find(
      data => data.fromToken.address.toLowerCase() === lpTokens[0].address.toLowerCase()
    );
    const swap1 = swapData.find(
      data => data.fromToken.address.toLowerCase() === lpTokens[1].address.toLowerCase()
    );

    if (!swap0 && !swap1) {
      throw new Error(`Mismatched swap`);
    }

    const swapTokenOutAddress = swaps[0].toToken.address;
    const tx0 = swap0 ? swap0.tx.data : '0x0';
    const tx1 = swap1 ? swap1.tx.data : '0x0';

    const gasPrices = await getGasPriceOptions(chain);
    const transaction = (() => {
      return contract.methods
        .beefOutAndSwap(
          vaultAddress,
          mooTokensToWithdrawWei,
          swapTokenOutAddress,
          tx0,
          tx1,
          lp.getWantType()
        )
        .send({
          from: address,
          ...gasPrices,
        });
    })();

    bindTransactionEvents(
      dispatch,
      transaction,
      {
        spender: zap.zapAddress,
        amount: input.amount,
        token: input.token,
        vaultId: vault.id,
      },
      {
        chainId: vault.chainId,
        spenderAddress: zap.zapAddress,
        tokens: uniqBy(
          getVaultTokensToRefresh(state, vault).concat(
            swaps.map(swap => [swap.fromToken, swap.toToken]).flat()
          ),
          'id'
        ),
      }
    );
  });
};

const beefOutAndSwap = (
  vault: VaultStandard,
  input: InputTokenAmount,
  swap: ZapQuoteStepSwap,
  zap: ZapEntityBeefy,
  slippageTolerance: number = 0.01
) => {
  return captureWalletErrors(async (dispatch, getState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const walletApi = await getWalletConnectionApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();
    const chain = selectChainById(state, vault.chainId);
    const multicall = new MultiCall(web3, chain.multicallAddress);
    const { sharesToWithdrawWei } = await getVaultWithdrawnFromContract(
      input,
      vault,
      state,
      address,
      web3,
      multicall
    );
    const swapAmountOutMinWei = toWei(
      swap.toAmount.times(1 - slippageTolerance),
      swap.toToken.decimals
    );
    const contract = new web3.eth.Contract(ZapAbi, zap.zapAddress);
    const gasPrices = await getGasPriceOptions(chain);
    const sharesToWithdrawWeiString = sharesToWithdrawWei.toString(10);
    const swapAmountOutMinWeiString = swapAmountOutMinWei.toString(10);
    const swapTokenOutAddress = swap.toToken.address;

    const transaction = (() => {
      return contract.methods
        .beefOutAndSwap(
          vault.earnContractAddress,
          sharesToWithdrawWeiString,
          swapTokenOutAddress,
          swapAmountOutMinWeiString
        )
        .send({
          from: address,
          ...gasPrices,
        });
    })();

    bindTransactionEvents(
      dispatch,
      transaction,
      { spender: zap.zapAddress, amount: input.amount, token: input.token },
      {
        chainId: vault.chainId,
        spenderAddress: zap.zapAddress,
        tokens: uniqBy(
          getVaultTokensToRefresh(state, vault).concat([swap.fromToken, swap.toToken, input.token]),
          'id'
        ),
      }
    );
  });
};

const withdraw = (vault: VaultEntity, oracleAmount: BigNumber, max: boolean) => {
  return captureWalletErrors(async (dispatch, getState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const walletApi = await getWalletConnectionApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();

    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const mooToken = selectErc20TokenByAddress(state, vault.chainId, vault.earnedTokenAddress);

    const ppfs = selectVaultPricePerFullShare(state, vault.id);
    const native = selectChainNativeToken(state, vault.chainId);
    const isNativeToken = depositToken.id === native.id;
    const contractAddr = mooToken.address;
    const contract = new web3.eth.Contract(vaultAbi as any, contractAddr);

    const mooAmount = oracleAmountToMooAmount(mooToken, depositToken, ppfs, oracleAmount);
    const rawAmount = mooAmount
      .shiftedBy(mooToken.decimals)
      .decimalPlaces(0, BigNumber.ROUND_FLOOR);
    const chain = selectChainById(state, vault.chainId);
    const gasPrices = await getGasPriceOptions(chain);

    const transaction = (() => {
      if (isNativeToken) {
        if (max) {
          return contract.methods.withdrawAllBNB().send({ from: address, ...gasPrices });
        } else {
          return contract.methods
            .withdrawBNB(rawAmount.toString(10))
            .send({ from: address, ...gasPrices });
        }
      } else {
        if (max) {
          return contract.methods.withdrawAll().send({ from: address, ...gasPrices });
        } else {
          return contract.methods
            .withdraw(rawAmount.toString(10))
            .send({ from: address, ...gasPrices });
        }
      }
    })();

    bindTransactionEvents(
      dispatch,
      transaction,
      { spender: contractAddr, amount: oracleAmount, token: depositToken },
      {
        chainId: vault.chainId,
        spenderAddress: contractAddr,
        tokens: getVaultTokensToRefresh(state, vault),
      }
    );
  });
};

const stakeGovVault = (vault: VaultGov, amount: BigNumber) => {
  return captureWalletErrors(async (dispatch, getState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const walletApi = await getWalletConnectionApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();
    const inputToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);

    const contractAddr = vault.earnContractAddress;
    const contract = new web3.eth.Contract(boostAbi as any, contractAddr);
    const rawAmount = amount.shiftedBy(inputToken.decimals).decimalPlaces(0, BigNumber.ROUND_FLOOR);
    const chain = selectChainById(state, vault.chainId);
    const gasPrices = await getGasPriceOptions(chain);
    const transaction = contract.methods
      .stake(rawAmount.toString(10))
      .send({ from: address, ...gasPrices });

    bindTransactionEvents(
      dispatch,
      transaction,
      { spender: contractAddr, amount, token: inputToken },
      {
        chainId: vault.chainId,
        spenderAddress: contractAddr,
        tokens: getVaultTokensToRefresh(state, vault),
        govVaultId: vault.id,
      }
    );
  });
};

const unstakeGovVault = (vault: VaultGov, amount: BigNumber) => {
  return captureWalletErrors(async (dispatch, getState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const walletApi = await getWalletConnectionApiInstance();
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
    const contract = new web3.eth.Contract(boostAbi as any, contractAddr);
    const chain = selectChainById(state, vault.chainId);
    const gasPrices = await getGasPriceOptions(chain);
    const transaction = contract.methods
      .withdraw(rawAmount.toString(10))
      .send({ from: address, ...gasPrices });

    bindTransactionEvents(
      dispatch,
      transaction,
      { spender: contractAddr, amount, token: depositToken },
      {
        chainId: vault.chainId,
        spenderAddress: contractAddr,
        tokens: getVaultTokensToRefresh(state, vault),
        govVaultId: vault.id,
      }
    );
  });
};

const claimGovVault = (vault: VaultGov) => {
  return captureWalletErrors(async (dispatch, getState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const amount = selectGovVaultPendingRewardsInToken(state, vault.id);
    const token = selectGovVaultRewardsTokenEntity(state, vault.id);

    const walletApi = await getWalletConnectionApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();
    const contractAddr = vault.earnContractAddress;

    const contract = new web3.eth.Contract(boostAbi as any, contractAddr);
    const chain = selectChainById(state, vault.chainId);
    const gasPrices = await getGasPriceOptions(chain);
    const transaction = contract.methods.getReward().send({ from: address, ...gasPrices });

    bindTransactionEvents(
      dispatch,
      transaction,
      { spender: contractAddr, amount, token },
      {
        chainId: vault.chainId,
        spenderAddress: contractAddr,
        tokens: getVaultTokensToRefresh(state, vault),
        govVaultId: vault.id,
      }
    );
  });
};

const exitGovVault = (vault: VaultGov) => {
  return captureWalletErrors(async (dispatch, getState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const balanceAmount = selectGovVaultUserStakedBalanceInDepositToken(state, vault.id);
    const token = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);

    const walletApi = await getWalletConnectionApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();
    const contractAddr = vault.earnContractAddress;

    const contract = new web3.eth.Contract(boostAbi as any, contractAddr);

    /**
     * withdraw() and by extension exit() will fail if already withdrawn (Cannot withdraw 0),
     * so if there is only rewards left getReward() should be called instead of exit()
     */
    const chain = selectChainById(state, vault.chainId);
    const gasPrices = await getGasPriceOptions(chain);
    const transaction = balanceAmount.gt(0)
      ? contract.methods.exit().send({ from: address, ...gasPrices })
      : contract.methods.getReward().send({ from: address, ...gasPrices });

    bindTransactionEvents(
      dispatch,
      transaction,
      { spender: contractAddr, amount: balanceAmount, token },
      {
        chainId: vault.chainId,
        spenderAddress: contractAddr,
        tokens: getVaultTokensToRefresh(state, vault),
        govVaultId: vault.id,
      }
    );
  });
};

const claimBoost = (boost: BoostEntity) => {
  return captureWalletErrors(async (dispatch, getState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }
    const amount = selectBoostUserRewardsInToken(state, boost.id);
    const token = selectTokenByAddress(state, boost.chainId, boost.earnedTokenAddress);
    const vault = selectVaultById(state, boost.vaultId);

    const walletApi = await getWalletConnectionApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();
    const contractAddr = boost.earnContractAddress;

    const contract = new web3.eth.Contract(boostAbi as any, contractAddr);
    const chain = selectChainById(state, vault.chainId);
    const gasPrices = await getGasPriceOptions(chain);
    const transaction = contract.methods.getReward().send({ from: address, ...gasPrices });

    bindTransactionEvents(
      dispatch,
      transaction,
      { spender: contractAddr, amount, token },
      {
        chainId: vault.chainId,
        spenderAddress: contractAddr,
        tokens: getVaultTokensToRefresh(state, vault),
        boostId: boost.id,
      }
    );
  });
};

const exitBoost = (boost: BoostEntity) => {
  return captureWalletErrors(async (dispatch, getState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const boostAmount = selectBoostUserBalanceInToken(state, boost.id);
    const vault = selectVaultById(state, boost.vaultId);
    const token = selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddress);

    const walletApi = await getWalletConnectionApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();
    const contractAddr = boost.earnContractAddress;

    const contract = new web3.eth.Contract(boostAbi as any, contractAddr);

    /**
     * withdraw() and by extension exit() will fail if already withdrawn (Cannot withdraw 0),
     * so if there is only rewards left getReward() should be called instead of exit()
     */
    const chain = selectChainById(state, vault.chainId);
    const gasPrices = await getGasPriceOptions(chain);
    const transaction = boostAmount.gt(0)
      ? contract.methods.exit().send({ from: address, ...gasPrices })
      : contract.methods.getReward().send({ from: address, ...gasPrices });

    bindTransactionEvents(
      dispatch,
      transaction,
      { spender: contractAddr, amount: boostAmount, token },
      {
        chainId: boost.chainId,
        spenderAddress: contractAddr,
        tokens: getVaultTokensToRefresh(state, vault),
        boostId: boost.id,
      }
    );
  });
};

const stakeBoost = (boost: BoostEntity, amount: BigNumber) => {
  return captureWalletErrors(async (dispatch, getState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const walletApi = await getWalletConnectionApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();

    const vault = selectVaultById(state, boost.vaultId);
    const inputToken = selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddress);

    const contractAddr = boost.earnContractAddress;
    const contract = new web3.eth.Contract(boostAbi as any, contractAddr);
    const rawAmount = amount.shiftedBy(inputToken.decimals).decimalPlaces(0, BigNumber.ROUND_FLOOR);
    const chain = selectChainById(state, vault.chainId);
    const gasPrices = await getGasPriceOptions(chain);
    const transaction = contract.methods
      .stake(rawAmount.toString(10))
      .send({ from: address, ...gasPrices });

    bindTransactionEvents(
      dispatch,
      transaction,
      { spender: contractAddr, amount, token: inputToken },
      {
        chainId: vault.chainId,
        spenderAddress: contractAddr,
        tokens: getVaultTokensToRefresh(state, vault),
        boostId: boost.id,
      }
    );
  });
};

const unstakeBoost = (boost: BoostEntity, amount: BigNumber) => {
  return captureWalletErrors(async (dispatch, getState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const walletApi = await getWalletConnectionApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();

    const vault = selectVaultById(state, boost.vaultId);
    const inputToken = selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddress);

    const contractAddr = boost.earnContractAddress;
    const contract = new web3.eth.Contract(boostAbi as any, contractAddr);
    const rawAmount = amount.shiftedBy(inputToken.decimals).decimalPlaces(0, BigNumber.ROUND_FLOOR);
    const chain = selectChainById(state, vault.chainId);
    const gasPrices = await getGasPriceOptions(chain);
    const transaction = contract.methods
      .withdraw(rawAmount.toString(10))
      .send({ from: address, ...gasPrices });

    bindTransactionEvents(
      dispatch,
      transaction,
      { spender: contractAddr, amount, token: inputToken },
      {
        chainId: vault.chainId,
        spenderAddress: contractAddr,
        tokens: getVaultTokensToRefresh(state, vault),
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
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const { contractAddress, chainId, canZapInWithOneInch } = minter;
    const gasToken = selectChainNativeToken(state, chainId);
    const walletApi = await getWalletConnectionApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();
    const contract = new web3.eth.Contract(minterAbi as AbiItem[], contractAddress);
    const chain = selectChainById(state, chainId);
    const gasPrices = await getGasPriceOptions(chain);
    const amountInWei = toWei(amount, payToken.decimals);
    const amountInWeiString = amountInWei.toString(10);
    const isNative = isTokenNative(payToken);

    const buildCall = async () => {
      if (canZapInWithOneInch) {
        const swapInToken = isNative ? selectChainWrappedNativeToken(state, chainId) : payToken;
        const oneInchApi = await getOneInchApi(chain);
        const swapData = await oneInchApi.getSwap({
          disableEstimate: true, // otherwise will fail due to no allowance
          fromAddress: contractAddress,
          amount: amountInWeiString,
          fromTokenAddress: swapInToken.address,
          toTokenAddress: mintedToken.address,
          slippage: slippageTolerance * 100,
        });
        const amountOutWei = new BigNumber(swapData.toTokenAmount);
        const amountOutWeiAfterSlippage = amountOutWei.multipliedBy(1 - slippageTolerance);
        const shouldMint = amountOutWeiAfterSlippage.isLessThan(amountInWei);

        // mint is better
        if (shouldMint) {
          return {
            method: contract.methods.depositNative('', true),
            options: isNative ? { value: amountInWeiString } : {},
          };
        }

        // swap after max slippage is better
        return {
          method: contract.methods.depositNative(swapData.tx.data, false),
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
    const transaction = call.method.send({ from: address, ...gasPrices, ...call.options });

    bindTransactionEvents(
      dispatch,
      transaction,
      {
        amount: amount,
        token: mintedToken,
      },
      {
        chainId: chainId,
        spenderAddress: contractAddress,
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
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const gasToken = selectChainNativeToken(state, chainId);
    const walletApi = await getWalletConnectionApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();
    const contract = new web3.eth.Contract(minterAbi as AbiItem[], contractAddr);
    const chain = selectChainById(state, chainId);
    const gasPrices = await getGasPriceOptions(chain);

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
        chainId: chainId,
        spenderAddress: contractAddr,
        tokens: uniqBy([gasToken, withdrawnToken, burnedToken], 'id'),
        minterId,
      }
    );
  });
};

const bridge = (
  chainId: ChainEntity['id'],
  destChainId: ChainEntity['id'],
  routerAddr: string,
  amount: BigNumber,
  isRouter: boolean
) => {
  return captureWalletErrors(async (dispatch, getState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const bridgeTokenData = state.ui.bridge.bridgeDataByChainId[chainId];

    const destChain = selectChainById(state, destChainId);
    const destChainData: any = Object.values(
      bridgeTokenData.destChains[destChain.networkChainId]
    )[0];

    const bridgeToken = selectTokenByAddress(state, chainId, bridgeTokenData.address);
    const destToken = selectTokenByAddress(state, destChainId, destChainData.address);

    const gasToken = selectChainNativeToken(state, chainId);
    const walletApi = await getWalletConnectionApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();
    const chain = selectChainById(state, chainId);
    const gasPrices = await getGasPriceOptions(chain);

    const transaction = (() => {
      const rawAmount = convertAmountToRawNumber(amount, bridgeTokenData.decimals);
      if (isRouter) {
        //ROUTER CONTRACT
        const contract = new web3.eth.Contract(bridgeAbi as AbiItem[], routerAddr);

        return bridgeTokenData.underlying
          ? contract.methods
              .anySwapOutUnderlying(
                bridgeTokenData.underlying.address,
                address,
                rawAmount,
                destChain.networkChainId
              )
              .send({ from: address, ...gasPrices })
          : contract.methods
              .anySwapOut(bridgeTokenData.address, address, rawAmount, destChain.networkChainId)
              .send({ from: address, ...gasPrices });
      } else {
        //BIFI TOKEN CONTRACT
        const contract = new web3.eth.Contract(bridgeAbi as AbiItem[], bridgeTokenData.address);
        return destChainData.type === 'swapout'
          ? contract.methods.Swapout(rawAmount, address).send({ from: address, ...gasPrices })
          : contract.methods.transfer(routerAddr, rawAmount).send({ from: address, ...gasPrices });
      }
    })();

    bindTransactionEvents(
      dispatch,
      transaction,
      {
        amount: amount,
        token: bridgeToken,
      },
      {
        chainId: chainId,
        spenderAddress: routerAddr,
        tokens: uniqBy([gasToken, bridgeToken, destToken], 'id'),
      },
      'bridge'
    );
  });
};

const resetWallet = () => {
  return captureWalletErrors(async dispatch => {
    dispatch({ type: WALLET_ACTION_RESET });
  });
};

export const walletActions = {
  approval,
  deposit,
  beefIn,
  beefOut,
  beefOutAndSwap,
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
  bridge,
  resetWallet,
  oneInchBeefInSingle,
  oneInchBeefInLP,
  oneInchBeefOutSingle,
  oneInchBeefOutLP,
};

function captureWalletErrors<ReturnType>(
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

function bindTransactionEvents<T extends MandatoryAdditionalData>(
  dispatch: Dispatch<any>,
  transaction: any /* todo: find out what it is */,
  additionalData: T,
  refreshOnSuccess?: {
    chainId: ChainEntity['id'];
    spenderAddress: string;
    tokens: TokenEntity[];
    govVaultId?: VaultEntity['id'];
    boostId?: BoostEntity['id'];
    minterId?: MinterEntity['id'];
  },
  step?: string
) {
  transaction
    .on('transactionHash', function (hash: TrxHash) {
      dispatch(createWalletActionPendingAction(hash, additionalData));
      if (step === 'bridge') {
        dispatch(stepperActions.setStepContent({ stepContent: StepContent.BridgeTx }));
      } else {
        dispatch(stepperActions.setStepContent({ stepContent: StepContent.WaitingTx }));
      }
    })
    .on('receipt', function (receipt: TrxReceipt) {
      dispatch(createWalletActionSuccessAction(receipt, additionalData));
      dispatch(updateSteps());

      // fetch new balance and allowance of native token (gas spent) and allowance token
      if (refreshOnSuccess) {
        dispatch(
          reloadBalanceAndAllowanceAndGovRewardsAndBoostData({
            chainId: refreshOnSuccess.chainId,
            govVaultId: refreshOnSuccess.govVaultId,
            boostId: refreshOnSuccess.boostId,
            spenderAddress: refreshOnSuccess.spenderAddress,
            tokens: refreshOnSuccess.tokens,
          })
        );
        if (refreshOnSuccess.minterId) {
          dispatch(
            reloadReserves({
              chainId: refreshOnSuccess.chainId,
              minterId: refreshOnSuccess.minterId,
            })
          );
        }
      }
    })
    .on('error', function (error: TrxError) {
      dispatch(createWalletActionErrorAction(error, additionalData));
      dispatch(stepperActions.setStepContent({ stepContent: StepContent.ErrorTx }));
    })
    .catch(error => {
      dispatch(createWalletActionErrorAction({ message: String(error) }, additionalData));
      dispatch(stepperActions.setStepContent({ stepContent: StepContent.ErrorTx }));
    });
}

function getVaultTokensToRefresh(state: BeefyState, vault: VaultEntity) {
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
