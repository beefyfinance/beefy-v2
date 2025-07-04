import type BigNumber from 'bignumber.js';
import type { TokenEntity } from '../entities/token.ts';

export type UserStandardPnl = {
  type: 'standard';
  totalYield: BigNumber;
  totalYieldUsd: BigNumber;
  totalPnlUsd: BigNumber;
  deposit: BigNumber;
  depositUsd: BigNumber;
  usdBalanceAtDeposit: BigNumber;
  balanceAtDeposit: BigNumber;
  yieldPercentage: BigNumber;
  pnlPercentage: BigNumber;
  tokenDecimals: number;
  oraclePrice: BigNumber;
  oraclePriceAtDeposit: BigNumber;
  depositLive: BigNumber;
  depositLiveUsd: BigNumber;
  pendingIndex: boolean;
};

export type UserGovPnl = {
  type: 'gov';
} & Omit<UserStandardPnl, 'type'>;

export type UserErc4626Pnl = {
  type: 'erc4626';
} & Omit<UserStandardPnl, 'type'>;

export type AmountUsd = {
  amount: BigNumber;
  usd: BigNumber;
};

export type AmountPriceUsd = AmountUsd & {
  price: BigNumber;
};

export type TokenEntryNow = {
  token: TokenEntity;
  now: AmountPriceUsd;
  entry: AmountPriceUsd;
  live: AmountPriceUsd;
};

export type TokenEntryNowDiff = TokenEntryNow & {
  diff: AmountUsd;
};

export type HoldCompare = {
  usd: BigNumber;
  diff: {
    compounded: BigNumber;
    withClaimed: BigNumber;
    withClaimedPending: BigNumber;
  };
};

export type UsdChange = {
  usd: BigNumber;
  percentage: BigNumber;
};

export type PnlYieldSource = {
  token: Pick<TokenEntity, 'decimals' | 'symbol' | 'address' | 'chainId'>;
  amount: BigNumber;
  usd: BigNumber;
  source: 'vault' | 'clm' | 'pool' | 'merkl' | 'stellaswap';
};

export type PnlYieldTotal = {
  usd: BigNumber;
  tokens: {
    [address: string]: {
      token: Pick<TokenEntity, 'decimals' | 'symbol' | 'address' | 'chainId'>;
      amount: BigNumber;
      usd: BigNumber;
    };
  };
  sources: Array<PnlYieldSource>;
};

export type PnlYields = {
  usd: BigNumber;
  compounded: PnlYieldTotal;
  claimed: PnlYieldTotal;
  pending: PnlYieldTotal;
};

export type PnlBreakdown = {
  base: UsdChange;
  withClaimed: UsdChange;
  withClaimedPending: UsdChange;
};

export type UserClmPnl = {
  type: 'cowcentrated';
  shares: TokenEntryNowDiff;
  underlying: TokenEntryNowDiff;
  tokens: [TokenEntryNowDiff, TokenEntryNowDiff];
  hold: HoldCompare;
  yields: PnlYields;
  pnl: PnlBreakdown;
  /** deposit or withdraw not indexed yet */
  pendingIndex: boolean;
};

export type UserVaultPnl = UserStandardPnl | UserGovPnl | UserClmPnl | UserErc4626Pnl;

export function isUserStandardPnl(pnl: UserVaultPnl): pnl is UserStandardPnl {
  return pnl.type === 'standard';
}

export function isUserGovPnl(pnl: UserVaultPnl): pnl is UserGovPnl {
  return pnl.type === 'gov';
}

export function isUserClmPnl(pnl: UserVaultPnl): pnl is UserClmPnl {
  return pnl.type === 'cowcentrated';
}
