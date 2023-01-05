import BigNumber from 'bignumber.js';
import { VaultEntity } from './vault';

interface TokenHolding {
  name: string;
  address: string;
  decimals: number;
  oracleId: string;
  oracleType: 'lps' | 'token';
  assetType: 'token' | 'native' | 'validator';
  price: number;
  usdValue: string;
  balance: string;
}

interface VaultHolding {
  name: string;
  address: string;
  decimals: number;
  oracleId: string;
  oracleType: 'lps';
  assetType: 'vault';
  price: number;
  usdValue: string;
  balance: string;
  vaultId: VaultEntity['id'];
  pricePerFullShare: string;
}

export function isTreasuryHoldingVault(token: TreasuryHoldingsInterface): token is VaultHolding {
  return token.assetType === 'vault';
}

export function isTreasuryHoldingToken(token: TreasuryHoldingsInterface): token is TokenHolding {
  return token.assetType !== 'vault';
}

export type TreasuryHoldingsInterface = TokenHolding | VaultHolding;

export type TreasuryHoldingsEntity = Omit<TreasuryHoldingsInterface, 'usdValue' | 'balance'> & {
  usdValue: BigNumber;
  balance: BigNumber;
};
