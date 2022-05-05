import BigNumber from 'bignumber.js';
import { BeefyState } from '../../../../redux-types';
import { BoostEntity } from '../../entities/boost';
import { TokenEntity } from '../../entities/token';
import { VaultEntity, VaultGov } from '../../entities/vault';

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
