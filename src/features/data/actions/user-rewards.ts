import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import { getMerklRewardsApi } from '../apis/instances';
import type { ChainEntity } from '../entities/chain';
import { selectAllChainIds, selectChainByNetworkChainId } from '../selectors/chains';
import { selectVaultByAddressOrUndefined } from '../selectors/vaults';
import { selectMerklRewardsForUserShouldLoad } from '../selectors/data-loader';
import { type Address, getAddress } from 'viem';
import { isCowcentratedLikeVault, isCowcentratedVault, type VaultEntity } from '../entities/vault';
import { isDefined } from '../utils/array-utils';
import { fromWeiString } from '../../../helpers/big-number';
import { pushOrSet } from '../../../helpers/object';
import type { MerklTokenReward, MerklVaultReward } from '../reducers/wallet/user-rewards-types';
import type {
  FetchUserMerklRewardsActionParams,
  FetchUserMerklRewardsFulfilledPayload,
} from './user-rewards-types';

// ChainId -> Merkl Distributor contract address
// https://app.merkl.xyz/status
export const MERKL_SUPPORTED_CHAINS: Partial<Record<ChainEntity['id'], Address>> = {
  ethereum: '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae',
  polygon: '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae',
  optimism: '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae',
  arbitrum: '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae',
  base: '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae',
  gnosis: '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae',
  zkevm: '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae',
  mantle: '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae',
  mode: '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae',
  linea: '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae',
  bsc: '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae',
  zksync: '0xe117ed7Ef16d3c28fCBA7eC49AFAD77f451a6a21',
  fuse: '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae',
  moonbeam: '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae',
  manta: '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae',
  fraxtal: '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae',
  celo: '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae',
};

function parseReasonId(
  reasonId: string
): { type: VaultEntity['type']; address: string } | undefined {
  const parts = reasonId.trim().split('_');
  if (parts.length !== 2) {
    return undefined;
  }

  const [type, address] = parts;

  switch (type) {
    case 'Beefy':
      return { type: 'cowcentrated', address: getAddress(address) };
    case 'BeefyStaker':
      return { type: 'gov', address: getAddress(address) };
    default:
      return undefined;
  }
}

/**
 * @dev Modifies `existing` in place
 */
function addVaultRewardToExisting(existing: MerklVaultReward, next: MerklVaultReward) {
  if (
    existing.token.address !== next.token.address ||
    existing.token.chainId !== next.token.chainId
  ) {
    throw new Error('Cannot merge rewards for different tokens');
  }

  existing.campaignIds = Array.from(new Set([...existing.campaignIds, ...next.campaignIds]));
  existing.accumulated = existing.accumulated.plus(next.accumulated);
  existing.unclaimed = existing.unclaimed.plus(next.unclaimed);
}

export const fetchUserMerklRewardsAction = createAsyncThunk<
  FetchUserMerklRewardsFulfilledPayload,
  FetchUserMerklRewardsActionParams,
  { state: BeefyState }
>(
  'rewards/fetchUserMerklRewardsAction',
  async ({ walletAddress }, { getState }) => {
    const state = getState();
    const api = await getMerklRewardsApi();

    const rewards = await api.fetchRewards({
      user: walletAddress,
    });

    const allChainIds = selectAllChainIds(state);
    const byVaultId: Record<string, MerklVaultReward[]> = {};
    const byChainId: Record<string, MerklTokenReward[]> = {};
    const addRewardToVault = (vaultId: string, reward: MerklVaultReward) => {
      const existingReward = byVaultId[vaultId]?.find(
        r => r.token.address === reward.token.address && r.token.chainId === reward.token.chainId
      );
      if (existingReward) {
        addVaultRewardToExisting(existingReward, reward);
      } else {
        pushOrSet(byVaultId, vaultId, reward);
      }
    };

    for (const [networkChainId, chainData] of Object.entries(rewards)) {
      const claimChain = selectChainByNetworkChainId(state, parseInt(networkChainId));
      if (!claimChain) {
        continue;
      }

      const { tokenData, campaignData } = chainData;

      for (const [campaignId, reasons] of Object.entries(campaignData)) {
        for (const [reasonId, reasonData] of Object.entries(reasons)) {
          // Skip if nothing to claim or reward is the test token
          if (reasonData.unclaimed === '0' || reasonData.symbol === 'aglaMerkl') {
            continue;
          }

          const reason = parseReasonId(reasonId);
          // Skip rewards for other platforms
          if (!reason) {
            continue;
          }

          const vaults = allChainIds
            .map(chainId => selectVaultByAddressOrUndefined(state, chainId, reason.address))
            .filter(isDefined)
            .filter(isCowcentratedLikeVault)
            .filter(
              v =>
                v.type === reason.type &&
                reasonData.mainParameter.toLowerCase() === v.poolAddress.toLowerCase()
            );

          if (vaults.length === 0) {
            console.warn(
              `Vault ${reason.address} with type ${reason.type} not found on any chain.`
            );
            continue;
          } else if (vaults.length > 1) {
            console.warn(
              `Multiple vaults found for ${reason.address} with type ${reason.type}:`,
              vaults.map(v => v.id)
            );
          }

          // Only one vault should match
          const vault = vaults[0];

          const reward: MerklVaultReward = {
            campaignIds: [campaignId],
            token: {
              decimals: reasonData.decimals,
              symbol: reasonData.symbol,
              address: getAddress(reasonData.token),
              chainId: claimChain.id,
            },
            accumulated: fromWeiString(reasonData.accumulated, reasonData.decimals),
            unclaimed: fromWeiString(reasonData.unclaimed, reasonData.decimals),
          };

          // Add reward to the vault
          addRewardToVault(vault.id, reward);

          // For rewards on CLM, merge them into the CLM Pool and CLM Vault since the CLM page is inaccessible
          if (isCowcentratedVault(vault)) {
            [vault.cowcentratedGovId, vault.cowcentratedStandardId]
              .filter(isDefined)
              .forEach(otherVaultId => addRewardToVault(otherVaultId, reward));
          }
        }
      }

      for (const [tokenAddress, token] of Object.entries(tokenData)) {
        // Skip if nothing to claim or reward is the test token
        if (token.unclaimed === '0' || token.symbol === 'aglaMerkl') {
          continue;
        }

        pushOrSet(byChainId, claimChain.id, {
          token: {
            address: getAddress(tokenAddress),
            symbol: token.symbol,
            decimals: token.decimals,
            chainId: claimChain.id,
          },
          accumulated: fromWeiString(token.accumulated, token.decimals),
          unclaimed: fromWeiString(token.unclaimed, token.decimals),
          proof: token.proof,
        });
      }
    }

    return {
      walletAddress,
      byChainId,
      byVaultId,
    };
  },
  {
    condition({ walletAddress, force }, { getState }) {
      if (force) {
        return true;
      }
      return selectMerklRewardsForUserShouldLoad(getState(), walletAddress);
    },
  }
);
