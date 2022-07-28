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
import { getWalletConnectionApiInstance } from '../apis/instances';
import { BoostEntity } from '../entities/boost';
import { ChainEntity } from '../entities/chain';
import { isTokenNative, TokenEntity, TokenErc20 } from '../entities/token';
import { isStandardVault, VaultEntity, VaultGov } from '../entities/vault';
import {
  createWalletActionErrorAction,
  createWalletActionPendingAction,
  createWalletActionSuccessAction,
  TrxError,
  TrxHash,
  TrxReceipt,
} from '../reducers/wallet/wallet-action';
import {
  selectBoostUserBalanceInToken,
  selectBoostUserRewardsInToken,
  selectGovVaultPendingRewardsInToken,
  selectGovVaultRewardsTokenEntity,
  selectGovVaultUserStackedBalanceInDepositToken,
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
import { getZapAddress } from '../utils/zap-utils';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from './tokens';
import { getGasPriceOptions } from '../utils/gas-utils';
import { AbiItem } from 'web3-utils';
import { convertAmountToRawNumber } from '../../../helpers/format';
import { FriendlyError } from '../utils/error-utils';
import { MinterEntity } from '../entities/minter';
import { reloadReserves } from './minters';
import { selectChainById } from '../selectors/chains';
import { BIG_ZERO } from '../../../helpers/big-number';
import { ZapDepositEstimate, ZapOptions } from '../apis/zap/zap-types';

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
    const gasPrices = await getGasPriceOptions(web3);
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
    const rawAmount = amount.shiftedBy(depositToken.decimals).decimalPlaces(0);
    const gasPrices = await getGasPriceOptions(web3);

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
  tokenAmount: BigNumber,
  zapOptions: ZapOptions,
  zapEstimate: ZapDepositEstimate,
  slippageTolerance: number
) => {
  return captureWalletErrors(async (dispatch, getState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }
    const earnedToken = selectErc20TokenByAddress(state, vault.chainId, vault.earnedTokenAddress);
    const vaultAddress = earnedToken.address;
    const { tokenIn, tokenOut } = zapEstimate;

    const walletApi = await getWalletConnectionApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();

    const contract = new web3.eth.Contract(zapAbi as any, zapOptions.address);

    const rawSwapAmountOutMin = zapEstimate.amountOut
      .times(1 - slippageTolerance)
      .shiftedBy(zapEstimate.tokenOut.decimals)
      .decimalPlaces(0);
    const rawAmount = tokenAmount.shiftedBy(tokenIn.decimals).decimalPlaces(0);
    const gasPrices = await getGasPriceOptions(web3);

    const transaction = (() => {
      if (isTokenNative(tokenIn)) {
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
            tokenIn.address,
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
      { spender: zapOptions.address, amount: tokenAmount, token: tokenIn },
      {
        chainId: vault.chainId,
        spenderAddress: zapOptions.address,
        tokens: uniqBy(getVaultTokensToRefresh(state, vault).concat([tokenIn, tokenOut]), 'id'),
      }
    );
  });
};

const beefOut = (vault: VaultEntity, oracleAmount: BigNumber, zapOptions: ZapOptions) => {
  return captureWalletErrors(async (dispatch, getState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    if (!isStandardVault(vault)) {
      return;
    }

    const walletApi = await getWalletConnectionApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();

    const contract = new web3.eth.Contract(zapAbi as any, zapOptions.address);
    const vaultAssets = vault.assetIds.map(tokenId =>
      selectTokenById(state, vault.chainId, tokenId)
    );

    const mooToken = selectErc20TokenByAddress(state, vault.chainId, vault.earnedTokenAddress);
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const ppfs = selectVaultPricePerFullShare(state, vault.id);

    const mooAmount = oracleAmountToMooAmount(mooToken, depositToken, ppfs, oracleAmount);
    const rawAmount = mooAmount.shiftedBy(mooToken.decimals).decimalPlaces(0);
    const gasPrices = await getGasPriceOptions(web3);

    const transaction = (() => {
      return contract.methods.beefOut(vault.earnContractAddress, rawAmount.toString(10)).send({
        from: address,
        ...gasPrices,
      });
    })();

    bindTransactionEvents(
      dispatch,
      transaction,
      {
        spender: zapOptions.address,
        // TODO: this should contain 2 assets and 2 amounts
        amount: oracleAmount,
        token: vaultAssets[0],
      },
      {
        chainId: vault.chainId,
        spenderAddress: zapOptions.address,
        tokens: getVaultTokensToRefresh(state, vault),
      }
    );
  });
};

const beefOutAndSwap = (
  vault: VaultEntity,
  depositTokenAmount: BigNumber,
  zapOptions: ZapOptions,
  zapEstimate: ZapDepositEstimate,
  slippageTolerance: number
) => {
  return captureWalletErrors(async (dispatch, getState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const earnedToken = selectErc20TokenByAddress(state, vault.chainId, vault.earnedTokenAddress);
    const wnative = selectChainWrappedNativeToken(state, vault.chainId);
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const vaultAddress = earnedToken.address;
    const { tokenIn, tokenOut } = zapEstimate;

    const tokenOutEntity = selectTokenByAddress(state, vault.chainId, tokenOut.address);
    const tokenOutAddress = getZapAddress(tokenOutEntity, wnative);

    const walletApi = await getWalletConnectionApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();

    const contract = new web3.eth.Contract(zapAbi as any, zapOptions.address);

    const ppfs = selectVaultPricePerFullShare(state, vault.id);
    const earnedTokenAmount = oracleAmountToMooAmount(
      earnedToken,
      depositToken,
      ppfs,
      depositTokenAmount
    );
    const rawSwapAmountOutMin = zapEstimate.amountOut
      .times(1 - slippageTolerance)
      .shiftedBy(zapEstimate.tokenOut.decimals)
      .decimalPlaces(0);
    const rawAmount = earnedTokenAmount.shiftedBy(earnedToken.decimals).decimalPlaces(0);
    const gasPrices = await getGasPriceOptions(web3);

    const transaction = (() => {
      return contract.methods
        .beefOutAndSwap(
          vaultAddress,
          rawAmount.toString(10),
          tokenOutAddress,
          rawSwapAmountOutMin.toString(10)
        )
        .send({
          from: address,
          ...gasPrices,
        });
    })();

    bindTransactionEvents(
      dispatch,
      transaction,
      { spender: zapOptions.address, amount: earnedTokenAmount, token: depositToken },
      {
        chainId: vault.chainId,
        spenderAddress: zapOptions.address,
        tokens: uniqBy(
          getVaultTokensToRefresh(state, vault).concat([tokenIn, tokenOut, tokenOutEntity]),
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
    const rawAmount = mooAmount.shiftedBy(mooToken.decimals).decimalPlaces(0);
    const gasPrices = await getGasPriceOptions(web3);

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
    const rawAmount = amount.shiftedBy(inputToken.decimals).decimalPlaces(0);
    const gasPrices = await getGasPriceOptions(web3);
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

    const rawAmount = mooAmount.shiftedBy(mooToken.decimals).decimalPlaces(0);

    const contractAddr = vault.earnContractAddress;
    const contract = new web3.eth.Contract(boostAbi as any, contractAddr);
    const gasPrices = await getGasPriceOptions(web3);
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
    const gasPrices = await getGasPriceOptions(web3);
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

    const balanceAmount = selectGovVaultUserStackedBalanceInDepositToken(state, vault.id);
    const rewardAmount = selectGovVaultPendingRewardsInToken(state, vault.id);
    const token = selectGovVaultRewardsTokenEntity(state, vault.id);

    const walletApi = await getWalletConnectionApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();
    const contractAddr = vault.earnContractAddress;

    const contract = new web3.eth.Contract(boostAbi as any, contractAddr);

    /**
     * withdraw() and by extension exit() will fail if already withdrawn (Cannot withdraw 0),
     * so if there is only rewards left getReward() should be called instead of exit()
     */
    const gasPrices = await getGasPriceOptions(web3);
    const transaction = balanceAmount.gt(0)
      ? contract.methods.exit().send({ from: address, ...gasPrices })
      : contract.methods.getReward().send({ from: address, ...gasPrices });

    bindTransactionEvents(
      dispatch,
      transaction,
      { spender: contractAddr, amount: rewardAmount, token },
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
    const gasPrices = await getGasPriceOptions(web3);
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
    const rewardAmount = selectBoostUserRewardsInToken(state, boost.id);
    const token = selectTokenByAddress(state, boost.chainId, boost.earnedTokenAddress);
    const vault = selectVaultById(state, boost.vaultId);

    const walletApi = await getWalletConnectionApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();
    const contractAddr = boost.earnContractAddress;

    const contract = new web3.eth.Contract(boostAbi as any, contractAddr);

    /**
     * withdraw() and by extension exit() will fail if already withdrawn (Cannot withdraw 0),
     * so if there is only rewards left getReward() should be called instead of exit()
     */
    const gasPrices = await getGasPriceOptions(web3);
    const transaction = boostAmount.gt(0)
      ? contract.methods.exit().send({ from: address, ...gasPrices })
      : contract.methods.getReward().send({ from: address, ...gasPrices });

    bindTransactionEvents(
      dispatch,
      transaction,
      { spender: contractAddr, amount: rewardAmount, token },
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
    const rawAmount = amount.shiftedBy(inputToken.decimals).decimalPlaces(0);
    const gasPrices = await getGasPriceOptions(web3);
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

//const unstakeBoost = (boost: BoostEntity, amount: BigNumber) => {
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
    const rawAmount = amount.shiftedBy(inputToken.decimals).decimalPlaces(0);
    const gasPrices = await getGasPriceOptions(web3);
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
  chainId: ChainEntity['id'],
  contractAddr: string,
  payToken: TokenEntity,
  mintedToken: TokenEntity,
  amount: BigNumber,
  max: boolean,
  minterId?: MinterEntity['id']
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
    const gasPrices = await getGasPriceOptions(web3);

    const transaction = (() => {
      const rawAmount = convertAmountToRawNumber(amount, payToken.decimals);

      if (isTokenNative(payToken)) {
        return contract.methods
          .depositNative()
          .send({ from: address, value: rawAmount, ...gasPrices });
      } else {
        if (max) {
          return contract.methods.depositAll().send({ from: address, ...gasPrices });
        } else {
          return contract.methods.deposit(rawAmount).send({ from: address, ...gasPrices });
        }
      }
    })();

    bindTransactionEvents(
      dispatch,
      transaction,
      {
        amount: amount,
        token: mintedToken,
      },
      {
        chainId: chainId,
        spenderAddress: contractAddr,
        tokens: uniqBy([gasToken, payToken, mintedToken], 'id'),
        minterId,
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
    const gasPrices = await getGasPriceOptions(web3);

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

    const bridgeTokenData = state.ui.bridgeModal.bridgeDataByChainId[chainId];

    const destChain = selectChainById(state, destChainId);
    const destChainData: any = Object.values(
      bridgeTokenData.destChains[destChain.networkChainId]
    )[0];

    const bridgeToken = selectTokenByAddress(state, chainId, bridgeTokenData.address);
    const destToken = selectTokenByAddress(state, destChainId, destChainData.address);

    const gasToken = selectChainNativeToken(state, chainId);
    const walletApi = await getWalletConnectionApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();
    const gasPrices = await getGasPriceOptions(web3);

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
      }
    );
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
          ? { message: String(error.getInnerError()), friendlyMessage: error.message }
          : { message: String(error) };

      dispatch(
        createWalletActionErrorAction(txError, {
          amount: BIG_ZERO,
          token: null,
        })
      );
    }
  };
}

function bindTransactionEvents<T extends { amount: BigNumber; token: TokenEntity }>(
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
  }
) {
  transaction
    .on('transactionHash', function (hash: TrxHash) {
      dispatch(createWalletActionPendingAction(hash, additionalData));
    })
    .on('receipt', function (receipt: TrxReceipt) {
      dispatch(createWalletActionSuccessAction(receipt, additionalData));

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
    })
    .catch(error => {
      dispatch(createWalletActionErrorAction({ message: String(error) }, additionalData));
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
