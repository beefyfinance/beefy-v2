import { type BigNumber } from 'bignumber.js';
import type { BeefyState } from '../../../../redux-types';
import type { BoostEntity } from '../../entities/boost';
import type { TokenEntity } from '../../entities/token';
import type { VaultEntity, VaultGov } from '../../entities/vault';
import type { Address } from 'abitype';

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

export interface GovVaultSingleBalanceContractData {
  balance: bigint;
  rewards: bigint;
}

export interface GovVaultMultiBalanceContractData {
  balance: bigint;
  rewardTokens: readonly Address[];
  rewards: readonly bigint[];
}

export interface GovVaultReward {
  token: Pick<TokenEntity, 'address' | 'symbol' | 'decimals' | 'oracleId' | 'chainId'>;
  amount: BigNumber;
  index: number;
}

export interface GovVaultBalance {
  vaultId: VaultEntity['id'];
  balance: BigNumber;
  rewards: GovVaultReward[];
}

export interface BoostBalanceContractData {
  balance: bigint;
  rewards: bigint;
}

export interface BoostReward {
  token: Pick<TokenEntity, 'address' | 'symbol' | 'decimals' | 'oracleId' | 'chainId'>;
  amount: BigNumber;
  index: number;
}

export interface BoostBalance {
  boostId: BoostEntity['id'];
  balance: BigNumber;
  rewards: BoostReward[];
}

export interface FetchAllBalancesResult {
  tokens: TokenBalance[];
  govVaults: GovVaultBalance[];
  boosts: BoostBalance[];
}
