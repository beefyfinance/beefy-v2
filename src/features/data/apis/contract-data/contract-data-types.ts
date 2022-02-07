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

export interface MinimalEntity {
  id: string;
  contractAddress: string;
}

export interface WorkerChainEntity {
  id: string;
  multicallAddress: string;
  rpc: [];
}

export interface FetchAllContractDataWorkerParams {
  chain: WorkerChainEntity;
  boosts: MinimalEntity[];
  govVaults: MinimalEntity[];
  standardVaults: MinimalEntity[];
}

export type FetchAllContractDataWorkerResults = {
  boosts: AllValuesAsString<BoostContractData>[];
  govVaults: AllValuesAsString<GovVaultContractData>[];
  standardVaults: AllValuesAsString<StandardVaultContractData>[];
};

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
}

export interface BoostContractData {
  id: string;
  totalSupply: BigNumber;
  rewardRate: BigNumber;
  periodFinish: Date;
}

export interface FetchAllContractDataResult {
  boosts: BoostContractData[];
  standardVaults: StandardVaultContractData[];
  govVaults: GovVaultContractData[];
}

export type AllValuesAsString<T> = {
  [key in keyof T]: string;
};
