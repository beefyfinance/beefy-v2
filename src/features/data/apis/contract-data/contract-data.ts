import { BeefyV2AppMulticallAbi } from '../../../../config/abi/BeefyV2AppMulticallAbi';
import type {
  VaultCowcentrated,
  VaultGov,
  VaultGovMulti,
  VaultStandard,
} from '../../entities/vault';
import type { ChainEntity } from '../../entities/chain';
import BigNumber from 'bignumber.js';
import type { AsWeb3Result } from '../../utils/types-utils';
import type { BoostEntity } from '../../entities/boost';
import { chunk, partition, pick } from 'lodash-es';
import type {
  BoostContractData,
  BoostContractDataResponse,
  CowVaultContractData,
  FetchAllContractDataResult,
  GovVaultContractData,
  GovVaultMultiContractData,
  GovVaultMultiContractDataResponse,
  IContractDataApi,
  RewardContractData,
  StandardVaultContractData,
} from './contract-data-types';
import { featureFlag_getContractDataApiChunkSize } from '../../utils/feature-flags';
import type { BeefyState } from '../../../../redux-types';
import { selectVaultById } from '../../selectors/vaults';
import { selectTokenByAddress, selectTokenByAddressOrUndefined } from '../../selectors/tokens';
import { makeBatchRequest, viemToWeb3Abi, type Web3Call } from '../../../../helpers/web3';
import { isFiniteNumber } from '../../../../helpers/number';
import type Web3 from 'web3';
import { BIG_ONE, BIG_ZERO } from '../../../../helpers/big-number';
import { ZERO_ADDRESS } from '../../../../helpers/addresses';

export class ContractDataAPI<T extends ChainEntity> implements IContractDataApi {
  constructor(protected web3: Web3, protected chain: T) {}

  public async fetchAllContractData(
    state: BeefyState,
    allStandardVaults: VaultStandard[],
    govVaults: VaultGov[],
    govVaultsMulti: VaultGovMulti[],
    cowVaults: VaultCowcentrated[],
    boosts: BoostEntity[],
    boostsMulti: BoostEntity[]
  ): Promise<FetchAllContractDataResult> {
    const mc = new this.web3.eth.Contract(
      viemToWeb3Abi(BeefyV2AppMulticallAbi),
      this.chain.appMulticallContractAddress
    );

    // if we send too much in a single call, we get "execution reversed"
    const CHUNK_SIZE = featureFlag_getContractDataApiChunkSize(this.chain.id);

    const [standardVaults, tmpExcludedVaults] = partition(
      allStandardVaults,
      vault => vault.platformId !== 'aave'
    );

    const boostBatches = chunk(boosts, CHUNK_SIZE);
    const boostMultiBatches = chunk(boostsMulti, CHUNK_SIZE);
    const govVaultBatches = chunk(govVaults, CHUNK_SIZE);
    const govVaultMultiBatches = chunk(govVaultsMulti, CHUNK_SIZE);
    const vaultBatches = chunk(standardVaults, CHUNK_SIZE);
    const cowVaultBatches = chunk(cowVaults, CHUNK_SIZE);

    const requestsForBatch: Web3Call[] = [];

    boostBatches.forEach(boostBatch => {
      requestsForBatch.push({
        method: mc.methods.getBoostInfo(boostBatch.map(boost => boost.contractAddress)).call,
        params: { from: '0x0000000000000000000000000000000000000000' },
      });
    });
    boostMultiBatches.forEach(boostBatch => {
      requestsForBatch.push({
        method: mc.methods.getGovVaultMultiInfo(boostBatch.map(vault => vault.contractAddress))
          .call,
        params: { from: '0x0000000000000000000000000000000000000000' },
      });
    });
    vaultBatches.forEach(vaultBatch => {
      requestsForBatch.push({
        method: mc.methods.getVaultInfo(vaultBatch.map(vault => vault.contractAddress)).call,
        params: { from: '0x0000000000000000000000000000000000000000' },
      });
    });
    govVaultBatches.forEach(govVaultBatch => {
      requestsForBatch.push({
        method: mc.methods.getGovVaultInfo(govVaultBatch.map(vault => vault.contractAddress)).call,
        params: { from: '0x0000000000000000000000000000000000000000' },
      });
    });
    govVaultMultiBatches.forEach(govVaultBatch => {
      requestsForBatch.push({
        method: mc.methods.getGovVaultMultiInfo(govVaultBatch.map(vault => vault.contractAddress))
          .call,
        params: { from: '0x0000000000000000000000000000000000000000' },
      });
    });
    cowVaultBatches.forEach(cowVaultBatch => {
      requestsForBatch.push({
        method: mc.methods.getCowVaultInfo(cowVaultBatch.map(vault => vault.contractAddress)).call,
        params: { from: '0x0000000000000000000000000000000000000000' },
      });
    });

    const results: unknown[] = await makeBatchRequest(this.web3, requestsForBatch);

    // now reasign results

    const res: FetchAllContractDataResult = {
      boosts: [],
      govVaults: [],
      govVaultsMulti: [],
      standardVaults: [],
      cowVaults: [],
    };

    let resultsIdx = 0;
    for (const boostBatch of boostBatches) {
      const batchRes = (results[resultsIdx] as BoostContractDataResponse[]).map(
        (boostRes, elemidx) => this.boostFormatter(state, boostRes, boostBatch[elemidx])
      );
      res.boosts = res.boosts.concat(batchRes);
      resultsIdx++;
    }
    for (const boostBatch of boostMultiBatches) {
      const batchRes = (
        results[resultsIdx] as AsWeb3Result<GovVaultMultiContractDataResponse>[]
      ).map((boostRes, elemidx) => this.boostFormatterMulti(state, boostRes, boostBatch[elemidx]));
      res.boosts = res.boosts.concat(batchRes);
      resultsIdx++;
    }
    for (const vaultBatch of vaultBatches) {
      const batchRes = (results[resultsIdx] as AsWeb3Result<StandardVaultContractData>[]).map(
        (vaultRes, elemidx) => this.standardVaultFormatter(state, vaultRes, vaultBatch[elemidx])
      );
      res.standardVaults = res.standardVaults.concat(batchRes);
      resultsIdx++;
    }
    for (const vaultBatch of govVaultBatches) {
      const batchRes = (results[resultsIdx] as AsWeb3Result<GovVaultContractData>[]).map(
        (vaultRes, elemidx) => this.govVaultFormatter(state, vaultRes, vaultBatch[elemidx])
      );
      res.govVaults = res.govVaults.concat(batchRes);
      resultsIdx++;
    }
    for (const vaultBatch of govVaultMultiBatches) {
      const batchRes = (
        results[resultsIdx] as AsWeb3Result<GovVaultMultiContractDataResponse>[]
      ).map((vaultRes, elemidx) =>
        this.govVaultMultiFormatter(state, vaultRes, vaultBatch[elemidx])
      );
      res.govVaultsMulti = res.govVaultsMulti.concat(batchRes);
      resultsIdx++;
    }
    for (const cowBatch of cowVaultBatches) {
      const batchRes = (results[resultsIdx] as AsWeb3Result<CowVaultContractData>[]).map(
        (vaultRes, elemidx) => this.cowVaultFormatter(state, vaultRes, cowBatch[elemidx])
      );
      res.cowVaults = res.cowVaults.concat(batchRes);
      resultsIdx++;
    }

    tmpExcludedVaults.forEach(vault => {
      res.standardVaults.push({
        id: vault.id,
        balance: BIG_ZERO,
        pricePerFullShare: BIG_ONE,
        strategy: ZERO_ADDRESS,
        paused: false,
      });
    });

    return res;
  }

  protected standardVaultFormatter(
    state: BeefyState,
    result: AsWeb3Result<StandardVaultContractData>,
    standardVault: VaultStandard
  ) {
    const vault = selectVaultById(state, standardVault.id);
    const mooToken = selectTokenByAddress(state, vault.chainId, vault.contractAddress);
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    return {
      id: standardVault.id,
      balance: new BigNumber(result.balance).shiftedBy(-depositToken.decimals),
      /** always 18 decimals for PPFS */
      pricePerFullShare: new BigNumber(result.pricePerFullShare).shiftedBy(-mooToken.decimals),
      strategy: result.strategy,
      paused: result.paused,
    } satisfies StandardVaultContractData;
  }

  protected govVaultFormatter(
    state: BeefyState,
    result: AsWeb3Result<GovVaultContractData>,
    govVault: VaultGov
  ) {
    const vault = selectVaultById(state, govVault.id);
    const token = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    return {
      id: govVault.id,
      totalSupply: new BigNumber(result.totalSupply).shiftedBy(-token.decimals),
    } satisfies GovVaultContractData;
  }

  protected govVaultMultiFormatter(
    state: BeefyState,
    result: AsWeb3Result<GovVaultMultiContractDataResponse>,
    govVault: VaultGovMulti
  ): GovVaultMultiContractData {
    const token = selectTokenByAddress(state, govVault.chainId, govVault.receiptTokenAddress);

    const rewards: RewardContractData[] = [];
    let index = -1;
    for (const reward of result.rewards) {
      ++index;

      if (!reward || reward.length !== 3) {
        console.error(`Invalid reward data for rewardpool ${govVault.id}`);
        continue;
      }

      const [rewardAddress, rewardRate, periodFinish] = reward;
      if (!rewardAddress || !rewardRate || !periodFinish) {
        console.error(`Invalid reward data for rewardpool ${govVault.id}`);
        continue;
      }

      const rewardToken = selectTokenByAddressOrUndefined(state, govVault.chainId, rewardAddress);
      if (!rewardToken) {
        console.error(`Unknown reward token (${rewardToken}) for rewardpool ${govVault.id}`);
        continue;
      }

      rewards.push({
        token: pick(rewardToken, ['address', 'symbol', 'decimals', 'oracleId', 'chainId']),
        rewardRate: new BigNumber(rewardRate).shiftedBy(-rewardToken.decimals),
        periodFinish: this.periodFinishToDate(periodFinish)!,
        index,
      });
    }

    return {
      id: govVault.id,
      totalSupply: new BigNumber(result.totalSupply).shiftedBy(-token.decimals),
      rewards,
    };
  }

  protected cowVaultFormatter(
    state: BeefyState,
    result: AsWeb3Result<CowVaultContractData>,
    cowVault: VaultCowcentrated
  ) {
    const tokens = cowVault.depositTokenAddresses.map(tokenAddress =>
      selectTokenByAddress(state, cowVault.chainId, tokenAddress)
    );
    return {
      id: cowVault.id,
      balances: [
        new BigNumber(result[0]).shiftedBy(-tokens[0].decimals),
        new BigNumber(result[1]).shiftedBy(-tokens[1].decimals),
      ],
      strategy: result.strategy,
      paused: result.paused,
    } satisfies CowVaultContractData;
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
      periodFinish: this.periodFinishToDate(result.periodFinish),
      isPreStake: result.isPreStake,
    } satisfies BoostContractData;
  }

  protected boostFormatterMulti(
    state: BeefyState,
    result: AsWeb3Result<GovVaultMultiContractDataResponse>,
    boost: BoostEntity
  ) {
    const rewards: RewardContractData[] = [];
    let index = -1;
    for (const reward of result.rewards) {
      ++index;

      if (!reward || reward.length !== 3) {
        console.error(`Invalid reward data for boost ${boost.id}`);
        continue;
      }

      const [rewardAddress, rewardRate, periodFinish] = reward;
      if (!rewardAddress || !rewardRate || !periodFinish) {
        console.error(`Invalid reward data for boost ${boost.id}`);
        continue;
      }

      const rewardToken = selectTokenByAddressOrUndefined(state, boost.chainId, rewardAddress);
      if (!rewardToken) {
        console.error(`Unknown reward token (${rewardToken}) for boost ${boost.id}`);
        continue;
      }

      rewards.push({
        token: pick(rewardToken, ['address', 'symbol', 'decimals', 'oracleId', 'chainId']),
        rewardRate: new BigNumber(rewardRate).shiftedBy(-rewardToken.decimals),
        periodFinish: this.periodFinishToDate(periodFinish)!,
        index,
      });
    }

    if (rewards.length === 0) {
      const earnedToken = selectTokenByAddress(state, boost.chainId, boost.earnedTokenAddress);
      rewards.push({
        token: pick(earnedToken, ['address', 'symbol', 'decimals', 'oracleId', 'chainId']),
        rewardRate: BIG_ZERO,
        periodFinish: this.periodFinishToDate('0')!,
        index: 0,
      });
    }

    const vault = selectVaultById(state, boost.vaultId);
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);

    // TODO support multiple rewards
    const reward = rewards.find(r => r.token.address === boost.earnedTokenAddress);
    return {
      id: boost.id,
      totalSupply: new BigNumber(result.totalSupply).shiftedBy(-depositToken.decimals),
      rewardRate: reward?.rewardRate || BIG_ZERO,
      periodFinish: reward?.periodFinish || new Date(0),
      isPreStake: false,
    } satisfies BoostContractData;
  }

  protected periodFinishToDate(periodFinish: string | null | undefined): Date | undefined {
    if (!periodFinish || periodFinish === '0') {
      return undefined;
    }

    const epochSeconds = parseInt(periodFinish);
    if (isFiniteNumber(epochSeconds)) {
      return new Date(epochSeconds * 1000);
    }

    return undefined;
  }
}
