import type BigNumber from 'bignumber.js';
import type { PlatformEntity } from '../entities/platform.ts';

export type TvlBreakdownBase = {
  vaultTvl: BigNumber;
};

export type TvlBreakdownVault = TvlBreakdownBase & {
  vaultTvl: BigNumber;
  vaultShare: number;
  underlyingTvl: BigNumber;
  underlyingPlatformId: PlatformEntity['id'] | undefined;
};

export type TvlBreakdownVaultTotal = TvlBreakdownVault & {
  vaultType: string;
  totalTvl: BigNumber;
  totalShare: number;
  totalType: string;
};

export type TvlBreakdownUnderlying = TvlBreakdownVault | TvlBreakdownVaultTotal;
export type TvlBreakdown = TvlBreakdownBase | TvlBreakdownUnderlying;
