import { type BigNumber } from 'bignumber.js';
import type { BeefyState } from '../../../../redux-types';
import type { BoostPromoEntity } from '../../entities/promo';
import type { TokenEntity } from '../../entities/token';
import type { VaultEntity, VaultGov } from '../../entities/vault';

export interface IBalanceApi {
  fetchAllBalances(
    state: BeefyState,
    tokens: TokenEntity[],
    govVaults: VaultGov[],
    boosts: BoostPromoEntity[],
    walletAddress: string
  ): Promise<FetchAllBalancesResult>;
}

export interface TokenBalance {
  tokenAddress: TokenEntity['address'];
  amount: BigNumber;
}

export interface GovVaultSingleBalanceContractData {
  balance: string;
  rewards: string;
}

export interface GovVaultMultiBalanceContractData {
  balance: string;
  rewardTokens: string[];
  rewards: string[];
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
  balance: string;
  rewards: string;
}

export interface BoostReward {
  token: Pick<TokenEntity, 'address' | 'symbol' | 'decimals' | 'oracleId' | 'chainId'>;
  amount: BigNumber;
  index: number;
}

export interface BoostBalance {
  boostId: BoostPromoEntity['id'];
  balance: BigNumber;
  rewards: BoostReward[];
}

export interface FetchAllBalancesResult {
  tokens: TokenBalance[];
  govVaults: GovVaultBalance[];
  boosts: BoostBalance[];
}
