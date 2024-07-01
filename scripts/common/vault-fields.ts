import type { VaultConfig } from '../../src/features/data/apis/config-types';
import { sortKeys } from './utils';

const FIELD_ORDER = [
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
  'earnedTokenAddresses',
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
  'refund',
  'refundContractAddress',
  'showWarning',
  'warning',
  'earningPoints',
  'network',
  'zaps',
].reduce((fields: {}, field, i) => {
  fields[field] = i + 1;
  return fields;
}, {});

function compareFieldKey(a: string, b: string) {
  const aOrder = FIELD_ORDER[a] || Number.MAX_SAFE_INTEGER;
  const bOrder = FIELD_ORDER[b] || Number.MAX_SAFE_INTEGER;
  return aOrder - bOrder;
}

export function sortVaultKeys(vault: VaultConfig): VaultConfig {
  return sortKeys(vault, compareFieldKey);
}
