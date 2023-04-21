import type BigNumber from 'bignumber.js';
import type { BeefyState } from '../../../../redux-types';
import type { BoostEntity } from '../../entities/boost';
import type { TokenEntity } from '../../entities/token';
import type { VaultEntity, VaultGov } from '../../entities/vault';

export interface IBalanceApi {
  fetchAllBalances(
    state: BeefyState,
    tokens: TokenEntity[],
    govVaults: VaultGov[],
    boosts: BoostEntity[],
    walletAddress: string
  ): Promise<FetchAllBalancesResult>;
}

export interface TokenBalance {
  tokenAddress: TokenEntity['address'];
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
