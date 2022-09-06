import BigNumber from 'bignumber.js';
import { BeefyState } from '../../../../redux-types';
import { BoostEntity } from '../../entities/boost';
import { VaultGov, VaultStandard } from '../../entities/vault';

export interface IContractDataApi {
  fetchAllContractData(
    state: BeefyState,
    standardVaults: VaultStandard[],
    govVaults: VaultGov[],
    boosts: BoostEntity[]
  ): Promise<FetchAllContractDataResult>;
}

export interface GovVaultContractData {
  id: string;
  totalSupply: BigNumber;
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

export interface BoostContractDataResponse {
  id: string;
  totalSupply: string;
  rewardRate: string;
  periodFinish: string | null; // null means boost is in prestake
  isPreStake: boolean;
}

export interface BoostContractData {
  id: string;
  totalSupply: BigNumber;
  rewardRate: BigNumber;
  periodFinish: Date | null; // null means boost is in prestake
  isPreStake: boolean;
}

export interface FetchAllContractDataResult {
  boosts: BoostContractData[];
  standardVaults: StandardVaultContractData[];
  govVaults: GovVaultContractData[];
}
