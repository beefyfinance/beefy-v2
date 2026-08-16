import type BigNumber from 'bignumber.js';
import { BIG_ZERO } from '../../../helpers/big-number.ts';
import type { TokenEntity } from '../entities/token.ts';
import type { VaultEntity } from '../entities/vault.ts';
import type { BeefyState } from '../store/types.ts';
import {
  selectUserVaultBalanceInDepositToken,
  selectUserVaultBalanceInDepositTokenIncludingDisplaced,
  selectUserVaultBalanceInUsdIncludingDisplaced,
  selectUserVaultBalanceNotInActiveBoostInDepositToken,
} from './balance.ts';
import { selectIsBalanceAvailableForChainUser } from './data-loader/balance.ts';
import { selectIsContractDataLoadedOnChain } from './data-loader/contract-data.ts';
import { selectIsPricesAvailable } from './data-loader/prices.ts';
import { selectTokenByAddress } from './tokens.ts';
import type { TvlBreakdown } from './tvl-types.ts';
import { selectTvlBreakdownByVaultId } from './tvl.ts';
import { selectVaultById } from './vaults.ts';
import { selectIsBalanceHidden, selectWalletAddress } from './wallet.ts';

export type VaultTvlStatData = { loading: true } | { loading: false; breakdown: TvlBreakdown };

export function selectVaultTvlStatData(
  state: BeefyState,
  vaultId: VaultEntity['id']
): VaultTvlStatData {
  const vault = selectVaultById(state, vaultId);
  const isLoaded =
    selectIsPricesAvailable(state) && selectIsContractDataLoadedOnChain(state, vault.chainId);
  if (!isLoaded) {
    return { loading: true };
  }
  return { loading: false, breakdown: selectTvlBreakdownByVaultId(state, vaultId) };
}

export type VaultDepositStatData =
  | {
      loading: true;
      hideBalance: boolean;
    }
  | {
      loading: false;
      totalDeposit: BigNumber;
      hideBalance: boolean;
    }
  | {
      loading: false;
      totalDeposit: BigNumber;
      hideBalance: boolean;
      depositToken: TokenEntity;
      totalDepositUsd: BigNumber;
      vaultDeposit: BigNumber;
      notEarning: BigNumber;
    };

export function selectVaultDepositStatData(
  state: BeefyState,
  vaultId: VaultEntity['id'],
  maybeWalletAddress?: string
): VaultDepositStatData {
  const vault = selectVaultById(state, vaultId);

  const walletAddress = maybeWalletAddress || selectWalletAddress(state);
  const hideBalance = selectIsBalanceHidden(state);
  if (!walletAddress) {
    return { loading: false, totalDeposit: BIG_ZERO, hideBalance };
  }

  const isLoaded =
    selectIsPricesAvailable(state) &&
    selectIsBalanceAvailableForChainUser(state, vault.chainId, walletAddress);
  if (!isLoaded) {
    return { loading: true, hideBalance };
  }

  const totalDeposit = selectUserVaultBalanceInDepositTokenIncludingDisplaced(
    state,
    vault.id,
    walletAddress
  );
  if (!totalDeposit.gt(0)) {
    return { loading: false, totalDeposit: BIG_ZERO, hideBalance };
  }

  const notEarning = selectUserVaultBalanceNotInActiveBoostInDepositToken(
    state,
    vault.id,
    walletAddress
  );
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const totalDepositUsd = selectUserVaultBalanceInUsdIncludingDisplaced(
    state,
    vaultId,
    walletAddress
  );
  const vaultDeposit = selectUserVaultBalanceInDepositToken(state, vault.id, walletAddress);

  return {
    loading: false,
    hideBalance,
    depositToken,
    totalDeposit,
    totalDepositUsd,
    vaultDeposit,
    notEarning,
  };
}
