import type { Address } from 'viem';
import { uniqBy } from 'lodash-es';
import { BaseError, type Chain, type Hash, type PublicClient, type TransactionReceipt } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { errorToString } from '../../../../helpers/format.ts';
import { refTxConfirmedCallback, refTxRevertedCallback } from '../../apis/divvi/callbacks.ts';
import type { GasPricing } from '../../apis/gas-prices/gas-prices.ts';
import type { ChainEntity } from '../../entities/chain.ts';
import type { MinterEntity } from '../../entities/minter.ts';
import type { BoostPromoEntity } from '../../entities/promo.ts';
import type { TokenEntity } from '../../entities/token.ts';
import {
  isCowcentratedLikeVault,
  isCowcentratedVault,
  isErc4626Vault,
  isGovVault,
  isStandardVault,
  isVaultWithReceipt,
  type VaultEntity,
} from '../../entities/vault.ts';
import type { MigrationConfig } from '../../reducers/wallet/migration-types.ts';
import { StepContent } from '../../reducers/wallet/stepper-types.ts';
import type { TrxError, TxAdditionalData } from '../../reducers/wallet/wallet-action-types.ts';
import {
  selectChainNativeToken,
  selectGovVaultEarnedTokens,
  selectTokenByAddress,
  selectTokenByIdOrUndefined,
} from '../../selectors/tokens.ts';
import type { BeefyDispatchFn, BeefyState, BeefyThunk } from '../../store/types.ts';
import { isDefined } from '../../utils/array-utils.ts';
import { FriendlyError } from '../../utils/error-utils.ts';
import { migratorUpdate } from '../migrator.ts';
import { reloadReserves } from '../minters.ts';
import { transactClearInput } from '../transact.ts';
import { stepperSetStepContent, stepperUpdate } from './stepper.ts';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from '../tokens.ts';
import { fetchUserMerklRewardsAction } from '../user-rewards/merkl-user-rewards.ts';
import {
  createWalletActionErrorAction,
  createWalletActionPendingAction,
  createWalletActionResetAction,
  createWalletActionSuccessAction,
} from './wallet-action.ts';

type TxRefreshOnSuccess = {
  walletAddress: string;
  chainId: ChainEntity['id'];
  spenderAddress: string;
  tokens: TokenEntity[];
  govVaultId?: VaultEntity['id'];
  boostId?: BoostPromoEntity['id'];
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
export type TxWriteProps = {
  account: Address;
  chain: Chain | undefined;
} & GasPricing;

/**
 * Called before building a transaction
 */
export function txStart(dispatch: BeefyDispatchFn) {
  dispatch(createWalletActionResetAction());
  // should already be set by Stepper
  // dispatch(stepperSetStepContent({ stepContent: StepContent.StartTx }));
}

/**
 * Must call just before calling .send() on a transaction
 */
export function txWallet(dispatch: BeefyDispatchFn) {
  dispatch(stepperSetStepContent({ stepContent: StepContent.WalletTx }));
}

/**
 * Called when .send() succeeds / tx is submitted to RPC
 */
function txSubmitted(dispatch: BeefyDispatchFn, context: TxContext, hash: Hash) {
  const { additionalData } = context;
  dispatch(createWalletActionPendingAction(hash, additionalData));
  dispatch(stepperSetStepContent({ stepContent: StepContent.WaitingTx }));
}

/**
 * Called when tx is successfully mined
 */
function txMined(dispatch: BeefyDispatchFn, context: TxContext, receipt: TransactionReceipt) {
  const { additionalData, refreshOnSuccess } = context;

  dispatch(createWalletActionSuccessAction(receipt, additionalData));
  dispatch(stepperUpdate());

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

    if (walletAddress) {
      dispatch(
        reloadBalanceAndAllowanceAndGovRewardsAndBoostData({
          walletAddress: walletAddress,
          chainId: chainId,
          govVaultId: govVaultId,
          boostId: boostId,
          spenderAddress: spenderAddress,
          tokens: tokens,
          vaultId: vaultId,
        })
      );
    }

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
      dispatch(transactClearInput());
    }

    if (rewards && walletAddress && chainId) {
      // Wait 60s before checking rewards after tx success
      setTimeout(() => {
        dispatch(
          fetchUserMerklRewardsAction({
            walletAddress,
            reloadChainId: chainId,
          })
        );
      }, 60 * 1000);
    }
  }

  if (receipt.transactionHash) {
    refTxConfirmedCallback(receipt.transactionHash);
  }
}

/**
 * Called when tx fails
 */
function txError(
  dispatch: BeefyDispatchFn,
  context: TxContext,
  error: unknown,
  txHash?: Hash,
  from?: string
) {
  const { additionalData } = context;
  const txError = getWalletErrorMessage(error);
  if (from) {
    console.error(from, txError, error);
  }
  dispatch(createWalletActionErrorAction(txError, additionalData));
  dispatch(stepperSetStepContent({ stepContent: StepContent.ErrorTx }));
  if (txHash) {
    refTxRevertedCallback(txHash);
  }
}

export const resetWallet = () => {
  return captureWalletErrors(async dispatch => {
    dispatch(createWalletActionResetAction());
  });
};

function getWalletErrorMessage(error: unknown): TrxError {
  if (error instanceof Error) {
    if (error instanceof FriendlyError) {
      return {
        message: getWalletErrorMessage(error.getInnerError()).message,
        friendlyMessage: error.message,
      };
    } else if (error instanceof BaseError && error.shortMessage) {
      return { message: errorToString(error), friendlyMessage: error.shortMessage };
    }
  }

  return { message: errorToString(error) };
}

export function captureWalletErrors<T extends BeefyThunk>(func: T): BeefyThunk {
  return async (dispatch, getState, extraArgument) => {
    try {
      return await func(dispatch, getState, extraArgument);
    } catch (error) {
      txError(dispatch, {}, error, undefined, 'captureWalletErrors');
    }
  };
}

export function bindTransactionEvents(
  dispatch: BeefyDispatchFn,
  transactionHashPromise: Promise<Hash>,
  client: PublicClient,
  additionalData: TxAdditionalData,
  refreshOnSuccess?: TxRefreshOnSuccess
) {
  const context: TxContext = { additionalData, refreshOnSuccess };

  transactionHashPromise
    .then(hash => {
      txSubmitted(dispatch, context, hash);
      waitForTransactionReceipt(client, { hash })
        .then(receipt => {
          const success = receipt.status === 'success';
          if (success) {
            txMined(dispatch, context, receipt);
          } else {
            txError(
              dispatch,
              context,
              'Transaction failed.',
              hash,
              'bindTransactionEvents::reverted'
            );
          }
        })
        .catch(error => {
          // error mining transaction
          txError(dispatch, context, error, hash, 'bindTransactionEvents::receipt');
        });
    })
    .catch(error => {
      // error submitting transaction
      txError(dispatch, context, error, undefined, 'bindTransactionEvents::submit');
    });
}

export function sendTransaction(
  dispatch: BeefyDispatchFn,
  builder: () => Promise<Hash>,
  client: PublicClient,
  additionalData: TxAdditionalData,
  refreshOnSuccess?: TxRefreshOnSuccess
) {
  txWallet(dispatch);
  bindTransactionEvents(dispatch, builder(), client, additionalData, refreshOnSuccess);
}

export function selectVaultTokensToRefresh(state: BeefyState, vault: VaultEntity) {
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
  if (isVaultWithReceipt(vault)) {
    tokens.push(selectTokenByAddress(state, vault.chainId, vault.receiptTokenAddress));
  }

  // related tokens
  if (isStandardVault(vault) || isErc4626Vault(vault)) {
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
