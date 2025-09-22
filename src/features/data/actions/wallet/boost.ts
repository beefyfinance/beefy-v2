import type { Address } from 'viem';
import BigNumber from 'bignumber.js';
import type { TFunction } from 'react-i18next';
import { BoostAbi } from '../../../../config/abi/BoostAbi.ts';
import { BIG_ZERO, bigNumberToBigInt } from '../../../../helpers/big-number.ts';
import { getWalletConnectionApi } from '../../apis/instances.ts';
import { rpcClientManager } from '../../apis/rpc-contract/rpc-manager.ts';
import { fetchWalletContract } from '../../apis/rpc-contract/viem-contract.ts';
import type { BoostPromoEntity } from '../../entities/promo.ts';
import type { Step } from '../../reducers/wallet/stepper-types.ts';
import { selectBoostUserBalanceInToken } from '../../selectors/balance.ts';
import { selectBoostById } from '../../selectors/boosts.ts';
import { selectChainById } from '../../selectors/chains.ts';
import { selectErc20TokenByAddress, selectTokenByAddress } from '../../selectors/tokens.ts';
import { selectVaultByIdWithReceipt } from '../../selectors/vaults.ts';
import { selectIsApprovalNeededForBoostStaking } from '../../selectors/wallet-actions.ts';
import { selectWalletAddress } from '../../selectors/wallet.ts';
import { getGasPriceOptions } from '../../utils/gas-utils.ts';
import { stepperStartWithSteps } from './stepper.ts';
import { approve } from './approval.ts';
import {
  bindTransactionEvents,
  captureWalletErrors,
  selectVaultTokensToRefresh,
  txStart,
  txWallet,
} from './common.ts';

export const claimBoost = (boostId: BoostPromoEntity['id']) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }
    const boost = selectBoostById(state, boostId);
    const vault = selectVaultByIdWithReceipt(state, boost.vaultId);
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
      chain: publicClient.chain,
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

export const exitBoost = (boostId: BoostPromoEntity['id']) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const boost = selectBoostById(state, boostId);
    const boostAmount = selectBoostUserBalanceInToken(state, boost.id);
    const vault = selectVaultByIdWithReceipt(state, boost.vaultId);
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
    const transaction =
      boostAmount.gt(0) ?
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
  boostId: BoostPromoEntity['id'],
  t: TFunction,
  amount: BigNumber
) => {
  return captureWalletErrors(async (dispatch, getState) => {
    const state = getState();
    const boost = selectBoostById(state, boostId);
    const vault = selectVaultByIdWithReceipt(state, boost.vaultId);
    const needsApproval = selectIsApprovalNeededForBoostStaking(state, boost, amount);
    const receiptToken = selectErc20TokenByAddress(state, vault.chainId, vault.receiptTokenAddress);
    const steps: Step[] = [];

    if (needsApproval) {
      steps.push({
        step: 'approve',
        message: t('Vault-ApproveMsg'),
        action: approve(receiptToken, boost.contractAddress, amount),
        pending: false,
      } satisfies Step);
    }

    steps.push({
      step: 'boost-stake',
      message: t('Vault-TxnConfirm', { type: t('Stake-noun') }),
      action: stakeBoost(boostId, amount),
      pending: false,
    });

    dispatch(stepperStartWithSteps(steps, boost.chainId));
  });
};

export const stakeBoost = (boostId: BoostPromoEntity['id'], amount: BigNumber) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const boost = selectBoostById(state, boostId);
    const vault = selectVaultByIdWithReceipt(state, boost.vaultId);
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
      chain: publicClient.chain,
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
  boostId: BoostPromoEntity['id'],
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
        action: exitBoost(boost.id),
        pending: false,
      });
    } else {
      steps.push({
        step: 'boost-unstake',
        message: t('Vault-TxnConfirm', { type: t('Unstake-noun') }),
        action: unstakeBoost(boost.id, amount),
        pending: false,
      });
    }

    dispatch(stepperStartWithSteps(steps, boost.chainId));
  });
};

export const unstakeBoost = (boostId: BoostPromoEntity['id'], amount: BigNumber) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }
    const boost = selectBoostById(state, boostId);
    const vault = selectVaultByIdWithReceipt(state, boost.vaultId);
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
      chain: publicClient.chain,
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
