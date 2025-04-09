import type BigNumber from 'bignumber.js';
import type {
  MarketMakerHoldingConfig,
  TokenHoldingConfig,
  VaultHoldingConfig,
} from '../apis/config-types.ts';

type TreasuryHoldingConfigToEntity<T> = Omit<T, 'usdValue' | 'balance' | 'pricePerFullShare'> & {
  usdValue: BigNumber;
  balance: BigNumber;
  pricePerFullShare: BigNumber;
};

export type TokenHoldingEntity = TreasuryHoldingConfigToEntity<TokenHoldingConfig>;
export type VaultHoldingEntity = TreasuryHoldingConfigToEntity<VaultHoldingConfig>;
export type TreasuryHoldingEntity = TokenHoldingEntity | VaultHoldingEntity;

export type MarketMakerHoldingEntity = Omit<
  MarketMakerHoldingConfig,
  'usdValue' | 'balance' | 'pricePerFullShare' | 'address'
> & {
  usdValue: BigNumber;
  balance: BigNumber;
};

export function isVaultHoldingEntity(token: TreasuryHoldingEntity): token is VaultHoldingEntity {
  return token.assetType === 'vault';
}

export function isTokenHoldingEntity(token: TreasuryHoldingEntity): token is TokenHoldingEntity {
  return token.assetType !== 'vault';
}
