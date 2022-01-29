import * as Comlink from 'comlink';

import { MultiCall, ShapeWithLabel } from 'eth-multicall';
import { getWeb3Instance } from './instances';
import Web3 from 'web3';
import {
  AllValuesAsString,
  BoostContractData,
  FetchAllContractDataWorkerParams,
  FetchAllContractDataWorkerResults,
  GovVaultContractData,
  MinimalEntity,
  StandardVaultContractData,
  WorkerChainEntity,
} from '../contract-data-types';
import { getBoostContractInstance, getVaultContractInstance } from './instances';

class ContractDataAPIV2WebWorker {
  constructor(protected web3: Web3, protected chain: WorkerChainEntity) {}

  public async fetchAllContractData(
    params: FetchAllContractDataWorkerParams
  ): Promise<FetchAllContractDataWorkerResults> {
    const mc = new MultiCall(this.web3, this.chain.multicallAddress);

    const standardVaultCalls = this._getStandardVaultCalls(params.standardVaults);
    const govVaultCalls = this._getGovVaultCalls(params.govVaults);
    const boostsCalls = this._getBoostCalls(params.boosts);

    const calls = [...standardVaultCalls, ...govVaultCalls, ...boostsCalls];

    type ResultType =
      | ({ type: 'boost' } & AllValuesAsString<BoostContractData>)
      | ({ type: 'vault-gov' } & AllValuesAsString<GovVaultContractData>)
      | ({ type: 'vault-standard' } & AllValuesAsString<StandardVaultContractData>);
    const [results] = (await mc.all([calls])) as ResultType[][];

    const res: FetchAllContractDataWorkerResults = {
      boosts: [],
      govVaults: [],
      standardVaults: [],
    };
    for (const result of results) {
      if (result.type === 'boost') {
        res.boosts.push(result);
      } else if (result.type === 'vault-gov') {
        res.govVaults.push(result);
      } else if (result.type === 'vault-standard') {
        res.standardVaults.push(result);
      } else {
        console.error(result);
        throw new Error(`Could not identify type`);
      }
    }
    // format strings as numbers
    return res;
  }

  protected _getStandardVaultCalls(vaults: MinimalEntity[]) {
    const calls: ShapeWithLabel[] = [];

    for (const vault of vaults) {
      const vaultContract = getVaultContractInstance(vault.contractAddress);
      calls.push({
        type: 'vault-standard',
        id: vault.id,
        balance: vaultContract.methods.balance(),
        pricePerFullShare: vaultContract.methods.getPricePerFullShare(),
        strategy: vaultContract.methods.strategy(),
      });
    }
    return calls;
  }

  protected _getGovVaultCalls(vaults: MinimalEntity[]) {
    const calls: ShapeWithLabel[] = [];

    for (const vault of vaults) {
      const vaultContract = getVaultContractInstance(vault.contractAddress);
      calls.push({
        type: 'vault-gov',
        id: vault.id,
        totalSupply: vaultContract.methods.totalSupply(),
      });
    }
    return calls;
  }

  protected _getBoostCalls(boosts: MinimalEntity[]) {
    const calls: ShapeWithLabel[] = [];

    for (const boost of boosts) {
      // set a new address
      const boostContract = getBoostContractInstance(boost.contractAddress);

      calls.push({
        type: 'boost',
        id: boost.id,
        totalSupply: boostContract.methods.totalSupply(),
        rewardRate: boostContract.methods.rewardRate(),
        periodFinish: boostContract.methods.periodFinish(),
      });
    }
    return calls;
  }
}

Comlink.expose({
  fetchAllContractData: async (parameters: FetchAllContractDataWorkerParams) => {
    const chain = parameters.chain;
    const web3 = getWeb3Instance(parameters.chain);
    console.debug(`Instanciating ContractDataWorkerApi for chain ${chain.id}`);
    const workerApi = new ContractDataAPIV2WebWorker(web3, chain);
    const res = workerApi.fetchAllContractData(parameters);
    return res;
  },
});
