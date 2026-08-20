import type BigNumber from 'bignumber.js';
import type { ConcLiquidityHoldingConfig, TokenHoldingConfig, ValidatorHoldingConfig, VaultHoldingConfig } from '../apis/config-types';
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
export type TreasuryHoldingEntity = TokenHoldingEntity | ValidatorHoldingEntity | ConcLiquidityHoldingEntity | VaultHoldingEntity;
export declare function isVaultHoldingEntity(token: TreasuryHoldingEntity): token is VaultHoldingEntity;
export declare function isTokenHoldingEntity(token: TreasuryHoldingEntity): token is Exclude<TreasuryHoldingEntity, VaultHoldingEntity>;
export declare function isValidatorHoldingEntity(token: TreasuryHoldingEntity): token is ValidatorHoldingEntity;
export declare function getTreasuryHoldingCategory(token: TreasuryHoldingEntity): 'liquid' | 'staked' | 'locked' | undefined;
/** hide/skip treasury holdings under this usd value */
export declare const TREASURY_MIN_DISPLAY_USD = 10;
export {};
