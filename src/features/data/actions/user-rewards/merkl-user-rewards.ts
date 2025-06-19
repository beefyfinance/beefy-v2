import { type Address, getAddress } from 'viem';
import { BIG_ZERO, fromWei } from '../../../../helpers/big-number.ts';
import { pushOrSet } from '../../../../helpers/object.ts';
import { getMerklRewardsApi } from '../../apis/instances.ts';
import type { ChainEntity } from '../../entities/chain.ts';
import {
  getCowcentratedPool,
  isCowcentratedLikeVault,
  isCowcentratedVault,
  type VaultEntity,
} from '../../entities/vault.ts';
import type {
  MerklTokenReward,
  MerklVaultReward,
} from '../../reducers/wallet/user-rewards-types.ts';
import { selectChainById, selectChainByNetworkChainId } from '../../selectors/chains.ts';
import { selectMerklRewardsForUserShouldLoad } from '../../selectors/user-rewards.ts';
import { selectVaultByAddressOrUndefined } from '../../selectors/vaults.ts';
import { isDefined } from '../../utils/array-utils.ts';
import { createAppAsyncThunk } from '../../utils/store-utils.ts';
import type {
  FetchUserMerklRewardsActionParams,
  FetchUserMerklRewardsFulfilledPayload,
} from './merkl-user-rewards-types.ts';

// ChainId -> Merkl Distributor contract address
// https://app.merkl.xyz/status
export const MERKL_SUPPORTED_CHAINS = new Map<ChainEntity['id'], Address>([
  ['ethereum', '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae'],
  ['polygon', '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae'],
  ['optimism', '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae'],
  ['arbitrum', '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae'],
  ['base', '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae'],
  ['gnosis', '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae'],
  ['zkevm', '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae'],
  ['mantle', '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae'],
  ['mode', '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae'],
  ['linea', '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae'],
  ['bsc', '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae'],
  ['zksync', '0xe117ed7Ef16d3c28fCBA7eC49AFAD77f451a6a21'],
  ['fuse', '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae'],
  ['moonbeam', '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae'],
  ['manta', '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae'],
  ['fraxtal', '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae'],
  ['celo', '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae'],
  ['sei', '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae'],
  ['rootstock', '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae'],
  ['sonic', '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae'],
  ['saga', '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae'],
  ['lisk', '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae'],
  ['hyperevm', '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae'],
]);

function parseReasonId(reasonId: string):
  | {
      type: VaultEntity['type'];
      address: string;
    }
  | undefined {
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
    case 'ERC20':
      return { type: 'standard', address: getAddress(address) };
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

export const fetchUserMerklRewardsAction = createAppAsyncThunk<
  FetchUserMerklRewardsFulfilledPayload,
  FetchUserMerklRewardsActionParams
>(
  'rewards/fetchUserMerklRewardsAction',
  async ({ walletAddress, reloadChainId }, { getState }) => {
    const state = getState();
    const api = await getMerklRewardsApi();
    const supportedChainIds = Array.from(MERKL_SUPPORTED_CHAINS.keys());
    const response = await api.fetchRewards({
      user: walletAddress,
      chainId: supportedChainIds.map(chainId => selectChainById(state, chainId).networkChainId),
      test: false,
      claimableOnly: true,
      breakdownPage: 0, // TODO if any breakdown has >= 1000 entries, we need to handle pagination
      reloadChainId:
        reloadChainId ? selectChainById(state, reloadChainId).networkChainId : undefined,
    });
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

    for (const chainData of response) {
      // Skip chains that are not supported by Beefy app (should not be returned by the API)
      const computeChain = selectChainByNetworkChainId(state, chainData.chain.id);
      if (!computeChain) {
        continue;
      }

      for (const rewardData of chainData.rewards) {
        // Skip test token
        if (rewardData.token.symbol === 'aglaMerkl') {
          continue;
        }

        // Skip tokens on chain that is not supported by Beefy (@see MERKL_SUPPORTED_CHAINS)
        const tokenChain = selectChainByNetworkChainId(state, rewardData.token.chainId);
        if (!tokenChain) {
          continue;
        }

        // Skip if nothing to claim for this token
        const rewardAmount = fromWei(rewardData.amount, rewardData.token.decimals);
        const rewardClaimed = fromWei(rewardData.claimed, rewardData.token.decimals);
        const rewardUnclaimed = rewardAmount.minus(rewardClaimed);
        if (rewardUnclaimed.lte(BIG_ZERO)) {
          continue;
        }

        const token = {
          decimals: rewardData.token.decimals,
          symbol: rewardData.token.symbol,
          address: getAddress(rewardData.token.address),
          chainId: tokenChain.id,
        };

        // Record all claimable rewards for the token by chain id
        pushOrSet(byChainId, tokenChain.id, {
          token,
          accumulated: rewardAmount,
          unclaimed: rewardUnclaimed,
          proof: rewardData.proofs,
        });

        // Record all claimable rewards for the token by vault id
        for (const breakdown of rewardData.breakdowns) {
          // Skip if nothing to claim from this campaign
          const breakdownAmount = fromWei(breakdown.amount, rewardData.token.decimals);
          const breakdownClaimed = fromWei(breakdown.claimed, rewardData.token.decimals);
          const breakdownUnclaimed = breakdownAmount.minus(breakdownClaimed);
          if (breakdownUnclaimed.lte(BIG_ZERO)) {
            continue;
          }

          // Skip rewards for other platforms
          const reason = parseReasonId(breakdown.reason);
          if (!reason) {
            continue;
          }

          const vaults = supportedChainIds
            .map(chainId => selectVaultByAddressOrUndefined(state, chainId, reason.address))
            .filter(isDefined)
            .filter(v => v.type === reason.type);

          if (vaults.length === 0) {
            if (reason.type !== 'standard') {
              // reason can be standard for ERC20 campaigns that just don't belong to Beefy
              console.warn(
                `Vault ${reason.address} with type ${reason.type} not found on any chain.`
              );
            }
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
            campaignIds: [breakdown.campaignId],
            token,
            accumulated: breakdownAmount,
            unclaimed: breakdownUnclaimed,
          };

          // Add reward to the vault
          addRewardToVault(vault.id, reward);

          // For rewards on CLM, merge them into the CLM Pool since the CLM page is inaccessible
          if (isCowcentratedLikeVault(vault)) {
            const poolId = getCowcentratedPool(vault);
            if (isCowcentratedVault(vault) && poolId) {
              addRewardToVault(poolId, reward);
            }
          }
        }
      }
    }

    return {
      walletAddress,
      byChainId,
      byVaultId,
    };
  },
  {
    condition({ walletAddress, reloadChainId }, { getState }) {
      if (reloadChainId) {
        return true;
      }
      return selectMerklRewardsForUserShouldLoad(getState(), walletAddress);
    },
  }
);
