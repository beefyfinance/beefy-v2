import BigNumber from 'bignumber.js';

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
  totalStaked: BigNumber;
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
  totalStaked: BigNumber;
  rewardRate: BigNumber;
  periodFinish: number;
}

export interface FetchAllResult {
  boosts: BoostContractData[];
  standardVaults: StandardVaultContractData[];
  govVaults: GovVaultContractData[];
}

export type AllValuesAsString<T> = {
  [key in keyof T]: string;
};
