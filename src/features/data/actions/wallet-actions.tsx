import Web3 from 'web3';

import erc20Abi from '../../../config/abi/erc20.json';
import vaultAbi from '../../../config/abi/vault.json';
import boostAbi from '../../../config/abi/boost.json';
import zapAbi from '../../../config/abi/zap.json';
import avatarsAbi from '../../../config/abi/BeefyAvatarsAbi.json';
import { selectWalletAddress } from '../selectors/wallet';
import { getWalletConnectApiInstance } from '../apis/instances';
import BigNumber from 'bignumber.js';
import { isTokenNative, TokenEntity, TokenErc20 } from '../entities/token';
import { ZapEstimate, ZapOptions } from '../apis/zap';
import { isStandardVault, VaultEntity, VaultGov } from '../entities/vault';
import { selectChainNativeToken, selectErc20TokenById, selectTokenById } from '../selectors/tokens';
import { BeefyState } from '../../../redux-types';
import { Dispatch } from 'redux';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from './tokens';
import { oracleAmountToMooAmount } from '../utils/ppfs';
import { selectVaultById, selectVaultPricePerFullShare } from '../selectors/vaults';
import { ChainEntity } from '../entities/chain';
import { uniqBy } from 'lodash';
import {
  selectBoostUserRewardsInToken,
  selectGovVaultPendingRewardsInToken,
  selectGovVaultRewardsTokenEntity,
} from '../selectors/balance';
import { BoostEntity } from '../entities/boost';
import {
  createWalletActionErrorAction,
  createWalletActionPendingAction,
  createWalletActionSuccessAction,
  TrxError,
  TrxHash,
  TrxReceipt,
} from '../reducers/wallet/wallet-action';

export const WALLET_ACTION = 'WALLET_ACTION';
export const WALLET_ACTION_RESET = 'WALLET_ACTION_RESET';

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
            .send({ from: address, value: rawAmount.toString(10) });
        } else {
          return contract.methods
            .depositBNB()
            .send({ from: address, value: rawAmount.toString(10) });
        }
      } else {
        if (max) {
          return contract.methods.depositAll().send({ from: address });
        } else {
          return contract.methods.deposit(rawAmount.toString(10)).send({ from: address });
        }
      }
    })();

    bindTransactionEvents(
      dispatch,
      transaction,
      { spender: contractAddr, amount, token: oracleToken },
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
          value: rawAmount.toString(10),
        });
      } else {
        return contract.methods
          .beefIn(
            vaultAddress,
            rawSwapAmountOutMin.toString(10),
            tokenIn.contractAddress,
            rawAmount.toString(10)
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
      return contract.methods.beefOut(vault.contractAddress, rawAmount.toString(10)).send({
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
    const oracleToken = selectTokenById(state, vault.chainId, vault.oracleId);
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
          rawAmount.toString(10),
          tokenOurErc20.contractAddress,
          rawSwapAmountOutMin.toString(10)
        )
        .send({
          from: address,
        });
    })();

    bindTransactionEvents(
      dispatch,
      transaction,
      { spender: zapOptions.address, amount: tokenAmount, token: oracleToken },
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
          return contract.methods.withdrawBNB(rawAmount.toString(10)).send({ from: address });
        }
      } else {
        if (max) {
          return contract.methods.withdrawAll().send({ from: address });
        } else {
          return contract.methods.withdraw(rawAmount.toString(10)).send({ from: address });
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

const stakeGovVault = (vault: VaultGov, amount: BigNumber) => {
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

    const transaction = contract.methods.stake(rawAmount.toString(10)).send({ from: address });

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

const unstakeGovVault = (vault: VaultGov, amount: BigNumber) => {
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

    const transaction = contract.methods.withdraw(rawAmount.toString(10)).send({ from: address });

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

const claimGovVault = (vault: VaultGov) => {
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

const exitGovVault = (vault: VaultGov) => {
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

const claimBoost = (boost: BoostEntity) => {
  return async (dispatch: Dispatch<any>, getState: () => BeefyState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }
    const amount = selectBoostUserRewardsInToken(state, boost.id);
    const token = selectTokenById(state, boost.chainId, boost.earnedTokenId);
    const vault = selectVaultById(state, boost.vaultId);

    const walletApi = await getWalletConnectApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();
    const contractAddr = boost.earnContractAddress;

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
        boostId: boost.id,
      }
    );
  };
};

const exitBoost = (boost: BoostEntity) => {
  return async (dispatch: Dispatch<any>, getState: () => BeefyState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const amount = selectBoostUserRewardsInToken(state, boost.id);
    const token = selectTokenById(state, boost.chainId, boost.earnedTokenId);
    const vault = selectVaultById(state, boost.vaultId);

    const walletApi = await getWalletConnectApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();
    const contractAddr = boost.earnContractAddress;

    const contract = new web3.eth.Contract(boostAbi as any, contractAddr);

    const transaction = contract.methods.exit().send({ from: address });

    bindTransactionEvents(
      dispatch,
      transaction,
      { spender: contractAddr, amount, token },
      {
        chainId: boost.chainId,
        spenderAddress: contractAddr,
        tokens: getVaultTokensToRefresh(state, vault),
        boostId: boost.id,
      }
    );
  };
};

const stakeBoost = (boost: BoostEntity, amount: BigNumber) => {
  return async (dispatch: Dispatch<any>, getState: () => BeefyState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const walletApi = await getWalletConnectApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();

    const vault = selectVaultById(state, boost.vaultId);
    const inputToken = selectTokenById(state, vault.chainId, vault.earnedTokenId);

    const contractAddr = boost.earnContractAddress;
    const contract = new web3.eth.Contract(boostAbi as any, contractAddr);
    const rawAmount = amount.shiftedBy(inputToken.decimals).decimalPlaces(0);

    const transaction = contract.methods.stake(rawAmount.toString(10)).send({ from: address });

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
  };
};

//const unstakeBoost = (boost: BoostEntity, amount: BigNumber) => {
const unstakeBoost = (boost: BoostEntity, amount: BigNumber) => {
  return async (dispatch: Dispatch<any>, getState: () => BeefyState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const walletApi = await getWalletConnectApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();

    const vault = selectVaultById(state, boost.vaultId);
    const inputToken = selectTokenById(state, vault.chainId, vault.earnedTokenId);

    const contractAddr = boost.earnContractAddress;
    const contract = new web3.eth.Contract(boostAbi as any, contractAddr);
    const rawAmount = amount.shiftedBy(inputToken.decimals).decimalPlaces(0);

    const transaction = contract.methods.withdraw(rawAmount.toString(10)).send({ from: address });

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
  };
};

const mintNft = (avatarsAddress: string, mintPrice: number) => {
  return async (dispatch: Dispatch<any>, getState: () => BeefyState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }
    const walletApi = await getWalletConnectApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();
    const contract = new web3.eth.Contract(avatarsAbi as any, avatarsAddress);

    const transaction = contract.methods.generateCow().send({ from: address, value: mintPrice });

    bindTransactionEvents(dispatch, transaction);
  };
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
  mintNft,
};

function bindTransactionEvents<T extends { amount: BigNumber; token: TokenEntity }>(
  dispatch: Dispatch<any>,
  transaction: any /* todo: find out what it is */,
  additionalData?: T,
  refreshOnSuccess?: {
    chainId: ChainEntity['id'];
    spenderAddress: string;
    tokens: TokenEntity[];
    govVaultId?: VaultEntity['id'];
    boostId?: BoostEntity['id'];
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
      }
    })
    .on('error', function (error: TrxError) {
      dispatch(createWalletActionErrorAction(error, additionalData));
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
