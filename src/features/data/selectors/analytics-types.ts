import type { BigNumber } from 'bignumber.js';
import type { UserLpBreakdownBalanceAsset } from './balance-types';
import type { TokenEntity } from '../entities/token';

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
  underlyingToken: TokenEntity;
  sharesAtDeposit: BigNumber;
  underlyingAtDeposit: BigNumber;
  underlyingAtDepositInUsd: BigNumber;
  token0AtDepositPrice: BigNumber;
  token1AtDepositPrice: BigNumber;
  token0AtDeposit: BigNumber;
  token1AtDeposit: BigNumber;
  token0AtDepositInUsd: BigNumber;
  token1AtDepositInUsd: BigNumber;
  sharesNow: BigNumber;
  underlyingNow: BigNumber;
  underlyingNowPrice: BigNumber;
  underlyingNowInUsd: BigNumber;
  token0Now: BigNumber;
  token1Now: BigNumber;
  token0: UserLpBreakdownBalanceAsset;
  token1: UserLpBreakdownBalanceAsset;
  token0Diff: BigNumber;
  token1Diff: BigNumber;
  pnl: BigNumber;
  pnlPercentage: BigNumber;
  hold: BigNumber;
  holdDiff: BigNumber;
  total0Compounded: BigNumber;
  total1Compounded: BigNumber;
  total0CompoundedUsd: BigNumber;
  total1CompoundedUsd: BigNumber;
  totalCompoundedUsd: BigNumber;
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
