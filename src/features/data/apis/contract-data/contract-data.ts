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
  BoostContractDataResponse,
  FetchAllContractDataResult,
  GovVaultContractData,
  IContractDataApi,
  StandardVaultContractData,
} from './contract-data-types';
import { featureFlag_getContractDataApiChunkSize } from '../../utils/feature-flags';
import { BeefyState } from '../../../../redux-types';
import { selectVaultById } from '../../selectors/vaults';
import { selectTokenByAddress } from '../../selectors/tokens';
import { makeBatchRequest, Web3Call } from '../../../../helpers/web3';

// fix ts types
const BeefyV2AppMulticallAbi = _BeefyV2AppMulticallAbi as AbiItem | AbiItem[];

export class ContractDataAPI<T extends ChainEntity> implements IContractDataApi {
  constructor(protected web3: Web3, protected chain: T) {}

  public async fetchAllContractData(
    state: BeefyState,
    standardVaults: VaultStandard[],
    govVaults: VaultGov[],
    boosts: BoostEntity[]
  ): Promise<FetchAllContractDataResult> {
    const mc = new this.web3.eth.Contract(
      BeefyV2AppMulticallAbi,
      this.chain.appMulticallContractAddress
    );

    // if we send too much in a single call, we get "execution reversed"
    const CHUNK_SIZE = featureFlag_getContractDataApiChunkSize();

    const boostBatches = chunk(boosts, CHUNK_SIZE);
    const govVaultBatches = chunk(govVaults, CHUNK_SIZE);
    const vaultBatches = chunk(standardVaults, CHUNK_SIZE);

    const requestsForBatch: Web3Call[] = [];

    boostBatches.forEach(boostBatch => {
      requestsForBatch.push({
        method: mc.methods.getBoostInfo(boostBatch.map(boost => boost.earnContractAddress)).call,
        params: { from: '0x0000000000000000000000000000000000000000' },
      });
    });
    vaultBatches.forEach(vaultBatch => {
      requestsForBatch.push({
        method: mc.methods.getVaultInfo(vaultBatch.map(vault => vault.earnContractAddress)).call,
        params: { from: '0x0000000000000000000000000000000000000000' },
      });
    });
    govVaultBatches.forEach(govVaultBatch => {
      requestsForBatch.push({
        method: mc.methods.getGovVaultInfo(govVaultBatch.map(vault => vault.earnContractAddress))
          .call,
        params: { from: '0x0000000000000000000000000000000000000000' },
      });
    });

    const results: any[] = await makeBatchRequest(this.web3, requestsForBatch);

    // now reasign results

    const res: FetchAllContractDataResult = {
      boosts: [],
      govVaults: [],
      standardVaults: [],
    };

    let resultsIdx = 0;
    for (const boostBatch of boostBatches) {
      const batchRes = results[resultsIdx].map((boostRes, elemidx) =>
        this.boostFormatter(state, boostRes, boostBatch[elemidx])
      );
      res.boosts = res.boosts.concat(batchRes);
      resultsIdx++;
    }
    for (const vaultBatch of vaultBatches) {
      const batchRes = results[resultsIdx].map((vaultRes, elemidx) =>
        this.standardVaultFormatter(state, vaultRes, vaultBatch[elemidx])
      );
      res.standardVaults = res.standardVaults.concat(batchRes);
      resultsIdx++;
    }
    for (const vaultBatch of govVaultBatches) {
      const batchRes = results[resultsIdx].map((vaultRes, elemidx) =>
        this.govVaultFormatter(state, vaultRes, vaultBatch[elemidx])
      );
      res.govVaults = res.govVaults.concat(batchRes);
      resultsIdx++;
    }

    return res;
  }

  /* legacy non-batched method
  public async fetchAllContractData(
    state: BeefyState,
    standardVaults: VaultStandard[],
    govVaults: VaultGov[],
    boosts: BoostEntity[]
  ): Promise<FetchAllContractDataResult> {
    const mc = new this.web3.eth.Contract(
      BeefyV2AppMulticallAbi,
      this.chain.appMulticallContractAddress
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
      mc.methods.getVaultInfo(vaultBatch.map(vault => vault.earnContractAddress)).call()
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
        this.boostFormatter(state, boostRes, boostBatch[elemidx])
      );
      res.boosts = res.boosts.concat(batchRes);
      resultsIdx++;
    }
    for (const vaultBatch of vaultBatches) {
      const batchRes = results[resultsIdx].map((vaultRes, elemidx) =>
        this.standardVaultFormatter(state, vaultRes, vaultBatch[elemidx])
      );
      res.standardVaults = res.standardVaults.concat(batchRes);
      resultsIdx++;
    }
    for (const vaultBatch of govVaultBatches) {
      const batchRes = results[resultsIdx].map((vaultRes, elemidx) =>
        this.govVaultFormatter(state, vaultRes, vaultBatch[elemidx])
      );
      res.govVaults = res.govVaults.concat(batchRes);
      resultsIdx++;
    }

    return res;
  } */

  protected standardVaultFormatter(
    state: BeefyState,
    result: AllValuesAsString<StandardVaultContractData>,
    standardVault: VaultStandard
  ) {
    const vault = selectVaultById(state, standardVault.id);
    const mooToken = selectTokenByAddress(state, vault.chainId, vault.earnContractAddress);
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    return {
      id: standardVault.id,
      balance: new BigNumber(result.balance).shiftedBy(-depositToken.decimals),
      /** always 18 decimals for PPFS */
      pricePerFullShare: new BigNumber(result.pricePerFullShare).shiftedBy(-mooToken.decimals),
      strategy: result.strategy,
    } as StandardVaultContractData;
  }

  protected govVaultFormatter(
    state: BeefyState,
    result: AllValuesAsString<GovVaultContractData>,
    govVault: VaultGov
  ) {
    const vault = selectVaultById(state, govVault.id);
    const token = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    return {
      id: govVault.id,
      totalSupply: new BigNumber(result.totalSupply).shiftedBy(-token.decimals),
    } as GovVaultContractData;
  }

  protected boostFormatter(
    state: BeefyState,

    result: BoostContractDataResponse,
    boost: BoostEntity
  ) {
    const earnedToken = selectTokenByAddress(state, boost.chainId, boost.earnedTokenAddress);
    const vault = selectVaultById(state, boost.vaultId);
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    return {
      id: boost.id,
      totalSupply: new BigNumber(result.totalSupply).shiftedBy(-depositToken.decimals),
      rewardRate: new BigNumber(result.rewardRate).shiftedBy(-earnedToken.decimals),
      /* assuming period finish is a UTC timestamp in seconds */
      periodFinish:
        result.periodFinish === '0' ? null : new Date(parseInt(result.periodFinish) * 1000),
      isPreStake: result.isPreStake,
    } as BoostContractData;
  }
}
