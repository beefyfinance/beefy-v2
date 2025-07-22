import type { Address } from 'viem';
import type BigNumber from 'bignumber.js';
import type { BoostPromoEntity } from '../../entities/promo.ts';
import type { TokenEntity } from '../../entities/token.ts';
import type { VaultEntity, VaultErc4626, VaultGov } from '../../entities/vault.ts';
import type { BeefyState } from '../../store/types.ts';

export interface IBalanceApi {
  fetchAllBalances(
    state: BeefyState,
    entities: FetchAllBalancesEntities,
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
  boostId: BoostPromoEntity['id'];
  balance: BigNumber;
  rewards: BoostReward[];
}

export interface Erc4626PendingBalanceRequest {
  id: bigint;
  shares: BigNumber;
  assets: BigNumber;
  requestTimestamp: number;
  claimableTimestamp: number;
  emergency: boolean;
  withdrawalIds: bigint[];
  validatorIds: bigint[];
}

export interface Erc4626PendingBalance<T extends 'deposit' | 'withdraw' = 'deposit' | 'withdraw'> {
  vaultId: VaultErc4626['id'];
  type: T;
  shares: BigNumber;
  assets: BigNumber;
  requests: Erc4626PendingBalanceRequest[];
}

export interface FetchAllBalancesResult {
  tokens: TokenBalance[];
  govVaults: GovVaultBalance[];
  boosts: BoostBalance[];
  erc4626Pending: Erc4626PendingBalance[];
}

export interface FetchAllBalancesEntities {
  tokens?: TokenEntity[];
  govVaults?: VaultGov[];
  boosts?: BoostPromoEntity[];
  erc4626Vaults?: VaultErc4626[];
}
