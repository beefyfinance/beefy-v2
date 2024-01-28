import type { VaultConfig } from '../../src/features/data/apis/config-types';
import { sortKeys } from './utils';

const FIELD_ORDER = [
  'id',
  'name',
  'type',
  'token',
  'tokenAddress',
  'tokenDecimals',
  'tokenProviderId',
  'zap',
  'earnedToken',
  'earnedTokenAddress',
  'earnedTokenDecimals',
  'earnContractAddress',
  'oracle',
  'oracleId',
  'status',
  'createdAt',
  'retireReason',
  'retiredAt',
  'pauseReason',
  'pausedAt',
  'platformId',
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
  'network',
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
