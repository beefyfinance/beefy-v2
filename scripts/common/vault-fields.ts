import type { VaultConfig } from '../../src/features/data/apis/config-types.ts';
import { sortKeys } from './utils.ts';

const compareVaultKeys = makeKeyComparer([
  'id',
  'name',
  'type',
  'version',
  'token',
  'tokenAddress',
  'tokenDecimals',
  'tokenProviderId',
  'depositTokenAddresses',
  'earnContractAddress',
  'earnedToken',
  'earnedTokenAddress',
  'earnedTokenDecimals',
  'earnedTokens',
  'earnedTokenAddresses',
  'earnedOracleIds',
  'oracle',
  'oracleId',
  'status',
  'createdAt',
  'updatedAt',
  'retireReason',
  'retiredAt',
  'pauseReason',
  'pausedAt',
  'platformId',
  'feeTier',
  'curatorId',
  'assets',
  'migrationIds',
  'risks',
  'strategyTypeId',
  'isGovVault',
  'excluded',
  'depositFee',
  'buyTokenUrl',
  'addLiquidityUrl',
  'removeLiquidityUrl',
  'underlyingPlatformUrl',
  'refund',
  'refundContractAddress',
  'showWarning',
  'warning',
  'earningPoints',
  'pointStructureIds',
  'network',
  'zaps',
]);

const compareRisksKeys = makeKeyComparer([
  'updatedAt',
  'complex',
  'curated',
  'notAudited',
  'notBattleTested',
  'notCorrelated',
  'notTimelocked',
  'notVerified',
  'synthStable',
]);

function makeKeyComparer(fields: string[]) {
  const fieldOrder = fields.reduce(
    (acc, field, i) => {
      acc[field] = i + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  return (a: string, b: string) => {
    const aOrder = fieldOrder[a] || Number.MAX_SAFE_INTEGER;
    const bOrder = fieldOrder[b] || Number.MAX_SAFE_INTEGER;
    return aOrder - bOrder;
  };
}

export function sortVaultKeys(vault: VaultConfig): VaultConfig {
  return sortKeys(
    {
      ...vault,
      risks: sortKeys(vault.risks, compareRisksKeys),
    },
    compareVaultKeys
  );
}
