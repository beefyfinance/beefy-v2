import Web3 from 'web3';

import erc20Abi from '../../../config/abi/erc20.json';
import vaultAbi from '../../../config/abi/vault.json';
import boostAbi from '../../../config/abi/boost.json';
import zapAbi from '../../../config/abi/zap.json';
import { selectWalletAddress } from '../selectors/wallet';
import { getWalletConnectApiInstance } from '../apis/instances';
import BigNumber from 'bignumber.js';
import { isTokenNative, TokenEntity, TokenErc20 } from '../entities/token';
import { ZapEstimate, ZapOptions } from '../apis/zap';
import { isStandardVault, VaultEntity, VaultGov } from '../entities/vault';
import { selectChainNativeToken, selectErc20TokenById, selectTokenById } from '../selectors/tokens';
import { BeefyState } from '../../../redux-types';
import { Dispatch } from 'redux';
import { reloadBalanceAndAllowanceAndGovRewards } from './tokens';
import { oracleAmountToMooAmount } from '../utils/ppfs';
import { selectVaultPricePerFullShare } from '../selectors/vaults';
import { ChainEntity } from '../entities/chain';
import { uniqBy } from 'lodash';
import {
  selectGovVaultPendingRewardsInToken,
  selectGovVaultRewardsTokenEntity,
} from '../selectors/balance';

export const WALLET_ACTION = 'WALLET_ACTION';
export const WALLET_ACTION_RESET = 'WALLET_ACTION_RESET';

type TrxHash = string; // not sure about this one
type TrxReceipt = { transactionHash: string };
type TrxError = { message: string };

const approval = (token: TokenErc20, spenderAddress: string) => {
  return async (dispatch: Dispatch<any>, getState: () => BeefyState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const walletApi = await getWalletConnectApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();
    const native = selectChainNativeToken(state, token.chainId);

    const contract = new web3.eth.Contract(erc20Abi as any, token.contractAddress);
    const maxAmount = Web3.utils.toWei('8000000000', 'ether');

    const transaction = contract.methods.approve(spenderAddress, maxAmount).send({ from: address });

    bindTransactionEvents(
      dispatch,
      transaction,
      { spender: spenderAddress, maxAmount: maxAmount, token: token },
      {
        chainId: token.chainId,
        spenderAddress,
        tokens: uniqBy([token, native], 'id'),
      }
    );
  };
};

const deposit = (vault: VaultEntity, amount: BigNumber, max: boolean) => {
  return async (dispatch: Dispatch<any>, getState: () => BeefyState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const walletApi = await getWalletConnectApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();

    const oracleToken = selectTokenById(state, vault.chainId, vault.oracleId);
    const mooToken = selectErc20TokenById(state, vault.chainId, vault.earnedTokenId);

    const native = selectChainNativeToken(state, vault.chainId);
    const isNativeToken = oracleToken.id === native.id;
    const contractAddr = mooToken.contractAddress;
    const contract = new web3.eth.Contract(vaultAbi as any, contractAddr);
    const rawAmount = amount.shiftedBy(oracleToken.decimals).decimalPlaces(0);

    const transaction = (() => {
      if (isNativeToken) {
        if (max) {
          return contract.methods
            .depositAllBNB()
            .send({ from: address, value: rawAmount.toString() });
        } else {
          return contract.methods.depositBNB().send({ from: address, value: rawAmount.toString() });
        }
      } else {
        if (max) {
          return contract.methods.depositAll().send({ from: address });
        } else {
          return contract.methods.deposit(rawAmount.toString()).send({ from: address });
        }
      }
    })();

    bindTransactionEvents(
      dispatch,
      transaction,
      { spender: contractAddr, amount: amount, token: oracleToken },
      {
        chainId: vault.chainId,
        spenderAddress: contractAddr,
        tokens: getVaultTokensToRefresh(state, vault),
      }
    );
  };
};

const beefIn = (
  vault: VaultEntity,
  tokenAmount: BigNumber,
  zapOptions: ZapOptions,
  zapEstimate: ZapEstimate,
  slippageTolerance: number
) => {
  return async (dispatch: Dispatch<any>, getState: () => BeefyState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }
    const earnedToken = selectErc20TokenById(state, vault.chainId, vault.earnedTokenId);
    const vaultAddress = earnedToken.contractAddress;
    const { tokenIn, tokenOut } = zapEstimate;

    const walletApi = await getWalletConnectApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();

    const contract = new web3.eth.Contract(zapAbi as any, zapOptions.address);

    const rawSwapAmountOutMin = zapEstimate.amountOut
      .times(1 - slippageTolerance)
      .shiftedBy(zapEstimate.tokenOut.decimals)
      .decimalPlaces(0);
    const rawAmount = tokenAmount.shiftedBy(tokenIn.decimals).decimalPlaces(0);

    const transaction = (() => {
      if (isTokenNative(tokenIn)) {
        return contract.methods.beefInETH(vaultAddress, rawSwapAmountOutMin).send({
          from: address,
          value: rawAmount.toString(),
        });
      } else {
        return contract.methods
          .beefIn(
            vaultAddress,
            rawSwapAmountOutMin.toString(),
            tokenIn.contractAddress,
            rawAmount.toString()
          )
          .send({
            from: address,
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
  };
};

const beefOut = (vault: VaultEntity, amount: BigNumber, zapOptions: ZapOptions) => {
  return async (dispatch: Dispatch<any>, getState: () => BeefyState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    if (!isStandardVault(vault)) {
      return;
    }

    const walletApi = await getWalletConnectApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();

    const contract = new web3.eth.Contract(zapAbi as any, zapOptions.address);
    const vaultAssets = vault.assetIds.map(tokenId =>
      selectTokenById(state, vault.chainId, tokenId)
    );

    const mooToken = selectErc20TokenById(state, vault.chainId, vault.earnedTokenId);
    const rawAmount = amount.shiftedBy(mooToken.decimals).decimalPlaces(0);

    const transaction = (() => {
      return contract.methods.beefOut(vault.contractAddress, rawAmount.toString()).send({
        from: address,
      });
    })();

    bindTransactionEvents(
      dispatch,
      transaction,
      {
        spender: zapOptions.address,
        // TODO: this should contain 2 assets and 2 amounts
        amount: amount,
        token: vaultAssets[0],
      },
      {
        chainId: vault.chainId,
        spenderAddress: zapOptions.address,
        tokens: getVaultTokensToRefresh(state, vault),
      }
    );
  };
};

const beefOutAndSwap = (
  vault: VaultEntity,
  tokenAmount: BigNumber,
  zapOptions: ZapOptions,
  zapEstimate: ZapEstimate,
  slippageTolerance: number
) => {
  return async (dispatch: Dispatch<any>, getState: () => BeefyState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const earnedToken = selectErc20TokenById(state, vault.chainId, vault.earnedTokenId);
    const vaultAddress = earnedToken.contractAddress;
    const { tokenIn, tokenOut } = zapEstimate;

    const tokenOurErc20 = selectErc20TokenById(state, vault.chainId, tokenOut.id, true);

    const walletApi = await getWalletConnectApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();

    const contract = new web3.eth.Contract(zapAbi as any, zapOptions.address);

    const rawSwapAmountOutMin = zapEstimate.amountOut
      .times(1 - slippageTolerance)
      .shiftedBy(zapEstimate.tokenOut.decimals)
      .decimalPlaces(0);
    const rawAmount = tokenAmount.shiftedBy(earnedToken.decimals).decimalPlaces(0);

    const transaction = (() => {
      return contract.methods
        .beefOutAndSwap(
          vaultAddress,
          rawAmount.toString(),
          tokenOurErc20.contractAddress,
          rawSwapAmountOutMin.toString()
        )
        .send({
          from: address,
        });
    })();

    bindTransactionEvents(
      dispatch,
      transaction,
      { spender: zapOptions.address, amount: tokenAmount, token: tokenOut },
      {
        chainId: vault.chainId,
        spenderAddress: zapOptions.address,
        tokens: uniqBy(getVaultTokensToRefresh(state, vault).concat([tokenIn, tokenOut]), 'id'),
      }
    );
  };
};

const withdraw = (vault: VaultEntity, oracleAmount: BigNumber, max: boolean) => {
  return async (dispatch: Dispatch<any>, getState: () => BeefyState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const walletApi = await getWalletConnectApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();

    const oracleToken = selectTokenById(state, vault.chainId, vault.oracleId);
    const mooToken = selectErc20TokenById(state, vault.chainId, vault.earnedTokenId);

    const ppfs = selectVaultPricePerFullShare(state, vault.id);
    const native = selectChainNativeToken(state, vault.chainId);
    const isNativeToken = oracleToken.id === native.id;
    const contractAddr = mooToken.contractAddress;
    const contract = new web3.eth.Contract(vaultAbi as any, contractAddr);

    const mooAmount = oracleAmountToMooAmount(mooToken, oracleToken, ppfs, oracleAmount);
    const rawAmount = mooAmount.shiftedBy(mooToken.decimals).decimalPlaces(0);

    const transaction = (() => {
      if (isNativeToken) {
        if (max) {
          return contract.methods.withdrawAllBNB().send({ from: address });
        } else {
          return contract.methods.withdrawBNB(rawAmount.toString()).send({ from: address });
        }
      } else {
        if (max) {
          return contract.methods.withdrawAll().send({ from: address });
        } else {
          return contract.methods.withdraw(rawAmount.toString()).send({ from: address });
        }
      }
    })();

    bindTransactionEvents(
      dispatch,
      transaction,
      { spender: contractAddr, amount: oracleAmount, token: oracleToken },
      {
        chainId: vault.chainId,
        spenderAddress: contractAddr,
        tokens: getVaultTokensToRefresh(state, vault),
      }
    );
  };
};

const stake = (vault: VaultGov, amount: BigNumber) => {
  return async (dispatch: Dispatch<any>, getState: () => BeefyState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const walletApi = await getWalletConnectApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();
    const inputToken = selectTokenById(state, vault.chainId, vault.oracleId);

    const contractAddr = vault.earnContractAddress;
    const contract = new web3.eth.Contract(boostAbi as any, contractAddr);
    const rawAmount = amount.shiftedBy(inputToken.decimals).decimalPlaces(0);

    const transaction = contract.methods.stake(rawAmount.toString()).send({ from: address });

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
  };
};

const unstake = (vault: VaultGov, amount: BigNumber) => {
  return async (dispatch: Dispatch<any>, getState: () => BeefyState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const walletApi = await getWalletConnectApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();
    const oracleToken = selectTokenById(state, vault.chainId, vault.oracleId);
    const mooToken = selectTokenById(state, vault.chainId, vault.earnedTokenId);
    const ppfs = selectVaultPricePerFullShare(state, vault.chainId);

    // amount is in oracle token, we need it in moo token
    const mooAmount = oracleAmountToMooAmount(mooToken, oracleToken, ppfs, amount);

    const rawAmount = mooAmount.shiftedBy(mooToken.decimals).decimalPlaces(0);

    const contractAddr = vault.earnContractAddress;
    const contract = new web3.eth.Contract(boostAbi as any, contractAddr);

    const transaction = contract.methods.withdraw(rawAmount.toString()).send({ from: address });

    bindTransactionEvents(
      dispatch,
      transaction,
      { spender: contractAddr, amount, token: oracleToken },
      {
        chainId: vault.chainId,
        spenderAddress: contractAddr,
        tokens: getVaultTokensToRefresh(state, vault),
        govVaultId: vault.id,
      }
    );
  };
};

const claim = (vault: VaultGov) => {
  return async (dispatch: Dispatch<any>, getState: () => BeefyState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const amount = selectGovVaultPendingRewardsInToken(state, vault.id);
    const token = selectGovVaultRewardsTokenEntity(state, vault.id);

    const walletApi = await getWalletConnectApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();
    const contractAddr = vault.earnContractAddress;

    const contract = new web3.eth.Contract(boostAbi as any, contractAddr);

    const transaction = contract.methods.getReward().send({ from: address });

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
  };
};

const exit = (vault: VaultGov) => {
  return async (dispatch: Dispatch<any>, getState: () => BeefyState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const amount = selectGovVaultPendingRewardsInToken(state, vault.id);
    const token = selectGovVaultRewardsTokenEntity(state, vault.id);

    const walletApi = await getWalletConnectApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();
    const contractAddr = vault.earnContractAddress;

    const contract = new web3.eth.Contract(boostAbi as any, contractAddr);

    const transaction = contract.methods.exit().send({ from: address });

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
  };
};

export const walletActions = {
  approval,
  deposit,
  beefIn,
  beefOut,
  beefOutAndSwap,
  withdraw,
  stake,
  unstake,
  claim,
  exit,
};

function bindTransactionEvents<T>(
  dispatch: Dispatch<any>,
  transaction: any /* todo: find out what it is */,
  additionalData: T,
  refreshOnSuccess?: {
    chainId: ChainEntity['id'];
    spenderAddress: string;
    tokens: TokenEntity[];
    govVaultId?: VaultEntity['id'];
  }
) {
  transaction
    .on('transactionHash', function (hash: TrxHash) {
      dispatch({
        type: WALLET_ACTION,
        payload: {
          result: 'success_pending',
          data: {
            hash: hash,
            ...additionalData,
          },
        },
      });
    })
    .on('receipt', function (receipt: TrxReceipt) {
      dispatch({
        type: WALLET_ACTION,
        payload: {
          result: 'success',
          data: {
            receipt: receipt,
            ...additionalData,
          },
        },
      });

      // fetch new balance and allowance of native token (gas spent) and allowance token
      if (refreshOnSuccess) {
        dispatch(
          reloadBalanceAndAllowanceAndGovRewards({
            chainId: refreshOnSuccess.chainId,
            govVaultId: refreshOnSuccess.govVaultId,
            spenderAddress: refreshOnSuccess.spenderAddress,
            tokens: refreshOnSuccess.tokens,
          })
        );
      }
    })
    .on('error', function (error: TrxError) {
      dispatch({
        type: WALLET_ACTION,
        payload: {
          result: 'error',
          data: {
            error: error.message,
            ...additionalData,
          },
        },
      });
    })
    .catch(error => {
      console.log(error);
    });
}

function getVaultTokensToRefresh(state: BeefyState, vault: VaultEntity) {
  const tokens: TokenEntity[] = [];

  // refresh vault tokens
  if (isStandardVault(vault)) {
    for (const assetId of vault.assetIds) {
      tokens.push(selectTokenById(state, vault.chainId, assetId));
    }
  }
  tokens.push(selectTokenById(state, vault.chainId, vault.oracleId));
  tokens.push(selectTokenById(state, vault.chainId, vault.earnedTokenId));

  // and native token because we spent gas
  tokens.push(selectChainNativeToken(state, vault.chainId));

  return uniqBy(tokens, 'id');
}
