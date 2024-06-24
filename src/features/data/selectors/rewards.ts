import type { BeefyState } from '../../../redux-types';
import { selectWalletAddress } from './wallet';
import { selectVaultById } from './vaults';
import type { VaultEntity } from '../entities/vault';
import { selectTokenByAddressOrUndefined, selectTokenPriceByTokenOracleId } from './tokens';
import type { ChainEntity } from '../entities/chain';

export function selectUserMerklRewardsForVault(
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) {
  walletAddress = walletAddress || selectWalletAddress(state);
  if (!walletAddress) {
    return [];
  }

  const vault = selectVaultById(state, vaultId);
  const rewards =
    state.user.rewards.byUser[walletAddress.toLowerCase()]?.byProvider.merkl.byChain[vault.chainId]
      ?.byVaultAddress[vault.contractAddress.toLowerCase()];
  if (!rewards) {
    return [];
  }

  return rewards.map(reward => {
    const token = selectTokenByAddressOrUndefined(state, vault.chainId, reward.address);
    const price = token ? selectTokenPriceByTokenOracleId(state, token.oracleId) : undefined;

    return {
      ...reward,
      token,
      price,
    };
  });
}

export function selectUserMerklRewardsForChain(
  state: BeefyState,
  chainId: ChainEntity['id'],
  walletAddress?: string
) {
  walletAddress = walletAddress || selectWalletAddress(state);
  if (!walletAddress) {
    return [];
  }

  const chainRewards =
    state.user.rewards.byUser[walletAddress.toLowerCase()]?.byProvider.merkl.byChain[chainId];
  if (!chainRewards) {
    return [];
  }

  const rewards = Object.values(chainRewards.byTokenAddress);
  return rewards.map(reward => {
    const token = selectTokenByAddressOrUndefined(state, chainId, reward.address);
    const price = token ? selectTokenPriceByTokenOracleId(state, token.oracleId) : undefined;

    return {
      ...reward,
      token,
      price,
    };
  });
}

export function selectUserHasMerklRewardsForVault(
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) {
  const rewards = selectUserMerklRewardsForVault(state, vaultId, walletAddress);
  return rewards.length > 0;
}
