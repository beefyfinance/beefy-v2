import type BigNumber from 'bignumber.js';
import type { BeefyState } from '../../../../redux-types';
import type { BoostEntity } from '../../entities/boost';
import type {
  VaultCowcentrated,
  VaultGov,
  VaultGovMulti,
  VaultStandard,
} from '../../entities/vault';
import type { TokenEntity } from '../../entities/token';

export interface IContractDataApi {
  fetchAllContractData(
    state: BeefyState,
    standardVaults: VaultStandard[],
    govVaults: VaultGov[],
    govVaultsMulti: VaultGovMulti[],
    cowVaults: VaultCowcentrated[],
    boosts: BoostEntity[]
  ): Promise<FetchAllContractDataResult>;
}

export interface GovVaultContractData {
  id: string;
  totalSupply: BigNumber;
}

export interface RewardContractData {
  token: Pick<TokenEntity, 'address' | 'symbol' | 'decimals' | 'oracleId' | 'chainId'>;
  rewardRate: BigNumber;
  periodFinish: Date;
  index: number;
}

export interface GovVaultMultiContractDataResponse {
  id: string;
  totalSupply: BigNumber;
  rewards: string[][]; // [tokenAddress, rewardRate, periodFinish]
}

export interface GovVaultMultiContractData {
  id: string;
  totalSupply: BigNumber;
  rewards: RewardContractData[];
}
export interface StandardVaultContractData {
  id: string;

  balance: BigNumber;

  /**
   * pricePerFullShare is how you find out how much your mooTokens (shares)
   * represent in term of the underlying asset
   * So if you deposit 1 BNB you will get, for example 0.95 mooBNB,
   * with a ppfs of X. if you multiply your mooBNB * ppfs you get your amount in BNB
   */
  pricePerFullShare: BigNumber;

  /**
   * The strategy address
   */
  strategy: string;

  paused: boolean;
}

export interface CowVaultContractData {
  id: string;
  balances: BigNumber[];
  strategy: string;
  paused: boolean;
}

export interface BoostContractDataResponse {
  id: string;
  totalSupply: string;
  rewardRate: string;
  periodFinish: string | undefined; // undefined means boost is in prestake
  isPreStake: boolean;
}

export interface BoostContractData {
  id: string;
  totalSupply: BigNumber;
  rewardRate: BigNumber;
  periodFinish: Date | undefined; // undefined means boost is in prestake
  isPreStake: boolean;
}

export interface FetchAllContractDataResult {
  boosts: BoostContractData[];
  standardVaults: StandardVaultContractData[];
  govVaults: GovVaultContractData[];
  govVaultsMulti: GovVaultMultiContractData[];
  cowVaults: CowVaultContractData[];
}
