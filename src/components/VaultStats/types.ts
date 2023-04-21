import type BigNumber from 'bignumber.js';

export interface VaultPnLDataType {
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
}
