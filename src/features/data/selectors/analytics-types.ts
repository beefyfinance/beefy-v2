import type { BigNumber } from 'bignumber.js';
import type { UserLpBreakdownBalanceAsset } from './balance-types';

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
};

export type UserGovPnl = {
  type: 'gov';
} & Omit<UserStandardPnl, 'type'>;

export type UserClmPnl = {
  type: 'cowcentrated';
  userSharesAtDeposit: BigNumber;
  token0EntryPrice: BigNumber;
  token1EntryPrice: BigNumber;
  token0SharesAtDeposit: BigNumber;
  token1SharesAtDeposit: BigNumber;
  token0SharesAtDepositToUsd: BigNumber;
  token1SharesAtDepositToUsd: BigNumber;
  sharesAtDepositToUsd: BigNumber;
  shares: BigNumber;
  sharesNowToUsd: BigNumber;
  token0: UserLpBreakdownBalanceAsset;
  token1: UserLpBreakdownBalanceAsset;
  token0Diff: BigNumber;
  token1Diff: BigNumber;
  pnl: BigNumber;
  pnlPercentage: BigNumber;
  hold: BigNumber;
};

export type UserVaultPnl = UserStandardPnl | UserGovPnl | UserClmPnl;

export function isUserStandardPnl(pnl: UserVaultPnl): pnl is UserStandardPnl {
  return pnl.type === 'standard';
}

export function isUserGovPnl(pnl: UserVaultPnl): pnl is UserGovPnl {
  return pnl.type === 'gov';
}

export function isUserClmPnl(pnl: UserVaultPnl): pnl is UserClmPnl {
  return pnl.type === 'cowcentrated';
}
