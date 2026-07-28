import type BigNumber from 'bignumber.js';
import type {
  ConcLiquidityHoldingConfig,
  TokenHoldingConfig,
  ValidatorHoldingConfig,
  VaultHoldingConfig,
} from '../apis/config-types.ts';

type TreasuryHoldingConfigToEntity<T> = Omit<T, 'usdValue' | 'balance' | 'pricePerFullShare'> & {
  usdValue: BigNumber;
  balance: BigNumber;
};

export type TokenHoldingEntity = TreasuryHoldingConfigToEntity<TokenHoldingConfig>;
export type ValidatorHoldingEntity = TreasuryHoldingConfigToEntity<ValidatorHoldingConfig>;
export type ConcLiquidityHoldingEntity = TreasuryHoldingConfigToEntity<ConcLiquidityHoldingConfig>;
export type VaultHoldingEntity = TreasuryHoldingConfigToEntity<VaultHoldingConfig> & {
  pricePerFullShare: BigNumber;
};
export type TreasuryHoldingEntity =
  | TokenHoldingEntity
  | ValidatorHoldingEntity
  | ConcLiquidityHoldingEntity
  | VaultHoldingEntity;

export function isVaultHoldingEntity(token: TreasuryHoldingEntity): token is VaultHoldingEntity {
  return token.assetType === 'vault' || token.assetType === 'gov';
}

export function isTokenHoldingEntity(
  token: TreasuryHoldingEntity
): token is Exclude<TreasuryHoldingEntity, VaultHoldingEntity> {
  return !isVaultHoldingEntity(token);
}

export function isValidatorHoldingEntity(
  token: TreasuryHoldingEntity
): token is ValidatorHoldingEntity {
  return token.assetType === 'validator';
}

export function getTreasuryHoldingCategory(
  token: TreasuryHoldingEntity
): 'liquid' | 'staked' | 'locked' | undefined {
  if ((token.assetType === 'token' || token.assetType === 'native') && !token.staked) {
    return 'liquid';
  }
  if (token.staked) {
    return 'staked';
  }
  if (token.assetType === 'validator') {
    return 'locked';
  }
  return undefined;
}

/** hide/skip treasury holdings under this usd value */
export const TREASURY_MIN_DISPLAY_USD = 10;
