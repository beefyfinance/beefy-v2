import BigNumber from 'bignumber.js';
import { BoostEntity } from '../../entities/boost';
import { TokenEntity } from '../../entities/token';
import { VaultEntity, VaultGov } from '../../entities/vault';

export interface IBalanceApi {
  fetchAllBalances(
    tokens: TokenEntity[],
    govVaults: VaultGov[],
    boosts: BoostEntity[],
    walletAddress: string
  ): Promise<FetchAllBalancesResult>;
}

export interface TokenBalance {
  tokenId: TokenEntity['id'];
  amount: BigNumber;
}

export interface GovVaultPoolBalance {
  vaultId: VaultEntity['id'];
  balance: BigNumber;
  rewards: BigNumber;
}

export interface BoostBalance {
  boostId: BoostEntity['id'];
  balance: BigNumber;
  rewards: BigNumber;
}

export interface FetchAllBalancesResult {
  tokens: TokenBalance[];
  govVaults: GovVaultPoolBalance[];
  boosts: BoostBalance[];
}

export type AllValuesAsString<T> = {
  [key in keyof T]: string;
};
