import _BeefyV2AppMulticallAbi from '../../../../config/abi/BeefyV2AppMulticall.json';
import { AbiItem } from 'web3-utils';
import Web3 from 'web3';
import { VaultGov, VaultStandard } from '../../entities/vault';
import { ChainEntity } from '../../entities/chain';
import BigNumber from 'bignumber.js';
import { AllValuesAsString } from '../../utils/types-utils';
import { BoostEntity } from '../../entities/boost';
import { chunk } from 'lodash';
import {
  BoostContractData,
  FetchAllContractDataResult,
  GovVaultContractData,
  IContractDataApi,
  StandardVaultContractData,
} from './contract-data-types';
import { featureFlag_getContractDataApiChunkSize } from '../../utils/feature-flags';
import { BeefyState } from '../../../../redux-types';

// fix ts types
const BeefyV2AppMulticallAbi = _BeefyV2AppMulticallAbi as AbiItem | AbiItem[];

export class ContractDataMcV2API<T extends ChainEntity & { fetchContractDataAddress: string }>
  implements IContractDataApi
{
  constructor(protected web3: Web3, protected chain: T) {}

  public async fetchAllContractData(
    state: BeefyState,
    standardVaults: VaultStandard[],
    govVaults: VaultGov[],
    boosts: BoostEntity[]
  ): Promise<FetchAllContractDataResult> {
    const mc = new this.web3.eth.Contract(
      BeefyV2AppMulticallAbi,
      this.chain.fetchContractDataAddress
    );

    // if we send too much in a single call, we get "execution reversed"
    const CHUNK_SIZE = featureFlag_getContractDataApiChunkSize();

    const boostBatches = chunk(boosts, CHUNK_SIZE);
    const govVaultBatches = chunk(govVaults, CHUNK_SIZE);
    const vaultBatches = chunk(standardVaults, CHUNK_SIZE);

    const boostPromises = boostBatches.map(boostBatch =>
      mc.methods.getBoostInfo(boostBatch.map(boost => boost.earnContractAddress)).call()
    );
    const vaultPromises = vaultBatches.map(vaultBatch =>
      mc.methods.getVaultInfo(vaultBatch.map(vault => vault.contractAddress)).call()
    );
    const govVaultPromises = govVaultBatches.map(govVaultBatch => {
      return mc.methods
        .getGovVaultInfo(govVaultBatch.map(vault => vault.earnContractAddress))
        .call();
    });

    const results = await Promise.all([...boostPromises, ...vaultPromises, ...govVaultPromises]);

    // now reasign results

    const res: FetchAllContractDataResult = {
      boosts: [],
      govVaults: [],
      standardVaults: [],
    };

    let resultsIdx = 0;
    for (const boostBatch of boostBatches) {
      const batchRes = results[resultsIdx].map((boostRes, elemidx) =>
        this.boostFormatter(boostRes, boostBatch[elemidx])
      );
      res.boosts = res.boosts.concat(batchRes);
      resultsIdx++;
    }
    for (const vaultBatch of vaultBatches) {
      const batchRes = results[resultsIdx].map((vaultRes, elemidx) =>
        this.standardVaultFormatter(vaultRes, vaultBatch[elemidx])
      );
      res.standardVaults = res.standardVaults.concat(batchRes);
      resultsIdx++;
    }
    for (const vaultBatch of govVaultBatches) {
      const batchRes = results[resultsIdx].map((vaultRes, elemidx) =>
        this.govVaultFormatter(vaultRes, vaultBatch[elemidx])
      );
      res.govVaults = res.govVaults.concat(batchRes);
      resultsIdx++;
    }

    return res;
  }

  protected standardVaultFormatter(
    result: AllValuesAsString<StandardVaultContractData>,
    standardVault: VaultStandard
  ) {
    return {
      id: standardVault.id,
      balance: new BigNumber(result.balance),
      pricePerFullShare: new BigNumber(result.pricePerFullShare),
      strategy: result.strategy,
    } as StandardVaultContractData;
  }

  protected govVaultFormatter(result: AllValuesAsString<GovVaultContractData>, govVault: VaultGov) {
    return {
      id: govVault.id,
      totalSupply: new BigNumber(result.totalSupply),
    } as GovVaultContractData;
  }

  protected boostFormatter(result: AllValuesAsString<BoostContractData>, boost: BoostEntity) {
    return {
      id: boost.id,
      totalSupply: new BigNumber(result.totalSupply),
      rewardRate: new BigNumber(result.rewardRate),
      periodFinish: parseInt(result.periodFinish),
    } as BoostContractData;
  }
}
