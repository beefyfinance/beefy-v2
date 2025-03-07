import { BeefyV2AppMulticallAbi } from '../../../../config/abi/BeefyV2AppMulticallAbi.ts';
import type {
  VaultCowcentrated,
  VaultGov,
  VaultGovMulti,
  VaultStandard,
} from '../../entities/vault.ts';
import type { ChainEntity } from '../../entities/chain.ts';
import { BigNumber } from 'bignumber.js';
import type { BoostPromoEntity } from '../../entities/promo.ts';
import { chunk, pick, sortBy } from 'lodash-es';
import type {
  BoostContractData,
  BoostRawContractData,
  BoostRewardContractData,
  CowVaultContractData,
  CowVaultRawContractData,
  FetchAllContractDataResult,
  GovVaultContractData,
  GovVaultMultiContractData,
  GovVaultMultiRawContractData,
  GovVaultRawContractData,
  IContractDataApi,
  RewardContractData,
  StandardVaultContractData,
  StandardVaultRawContractData,
} from './contract-data-types.ts';
import {
  featureFlag_getContractDataApiChunkSize,
  featureFlag_simulateLiveBoost,
} from '../../utils/feature-flags.ts';
import type { BeefyState } from '../../../../redux-types.ts';
import { selectVaultById } from '../../selectors/vaults.ts';
import { selectTokenByAddress, selectTokenByAddressOrUndefined } from '../../selectors/tokens.ts';
import { isFiniteNumber } from '../../../../helpers/number.ts';
import { BIG_ZERO } from '../../../../helpers/big-number.ts';
import { addDays } from 'date-fns';
import { fetchContract } from '../rpc-contract/viem-contract.ts';
import type { Address } from 'abitype';

export class ContractDataAPI<T extends ChainEntity> implements IContractDataApi {
  constructor(protected chain: T) {}

  public async fetchAllContractData(
    state: BeefyState,
    standardVaults: VaultStandard[],
    govVaults: VaultGov[],
    govVaultsMulti: VaultGovMulti[],
    cowVaults: VaultCowcentrated[],
    boosts: BoostPromoEntity[],
    boostsMulti: BoostPromoEntity[]
  ): Promise<FetchAllContractDataResult> {
    const multicallContract = fetchContract(
      this.chain.appMulticallContractAddress,
      BeefyV2AppMulticallAbi,
      this.chain.id
    );

    const CHUNK_SIZE = featureFlag_getContractDataApiChunkSize(this.chain.id);

    const boostBatches = chunk(boosts, CHUNK_SIZE);
    const boostMultiBatches = chunk(boostsMulti, CHUNK_SIZE);
    const govVaultBatches = chunk(govVaults, CHUNK_SIZE);
    const govVaultMultiBatches = chunk(govVaultsMulti, CHUNK_SIZE);
    const vaultBatches = chunk(standardVaults, CHUNK_SIZE);
    const cowVaultBatches = chunk(cowVaults, CHUNK_SIZE);

    const boostRequests = boostBatches.map(batch =>
      multicallContract.read.getBoostInfo([batch.map(boost => boost.contractAddress as Address)])
    );
    const boostMultiRequests = boostMultiBatches.map(batch =>
      multicallContract.read.getGovVaultMultiInfo([
        batch.map(vault => vault.contractAddress as Address),
      ])
    );
    const vaultRequests = vaultBatches.map(batch =>
      multicallContract.read.getVaultInfo([batch.map(vault => vault.contractAddress as Address)])
    );
    const govVaultRequests = govVaultBatches.map(batch =>
      multicallContract.read.getGovVaultInfo([batch.map(vault => vault.contractAddress as Address)])
    );
    const govVaultMultiRequests = govVaultMultiBatches.map(batch =>
      multicallContract.read.getGovVaultMultiInfo([
        batch.map(vault => vault.contractAddress as Address),
      ])
    );
    const cowVaultRequests = cowVaultBatches.map(batch =>
      multicallContract.read.getCowVaultInfo([batch.map(vault => vault.contractAddress as Address)])
    );

    const [
      boostResults,
      boostMultiResults,
      vaultResults,
      govVaultResults,
      govVaultMultiResults,
      cowVaultResults,
    ] = await Promise.all([
      Promise.all(boostRequests),
      Promise.all(boostMultiRequests),
      Promise.all(vaultRequests),
      Promise.all(govVaultRequests),
      Promise.all(govVaultMultiRequests),
      Promise.all(cowVaultRequests),
    ]);

    const res: FetchAllContractDataResult = {
      boosts: [],
      govVaults: [],
      govVaultsMulti: [],
      standardVaults: [],
      cowVaults: [],
    };

    boostBatches.forEach((boostBatch, idx) => {
      boostBatch.forEach((boost, elemidx) => {
        res.boosts.push(this.boostFormatter(state, boostResults[idx][elemidx], boost));
      });
    });

    boostMultiBatches.forEach((boostBatch, idx) => {
      boostBatch.forEach((boost, elemidx) => {
        res.boosts.push(this.boostFormatterMulti(state, boostMultiResults[idx][elemidx], boost));
      });
    });

    vaultBatches.forEach((vaultBatch, idx) => {
      vaultBatch.forEach((vault, elemidx) => {
        res.standardVaults.push(
          this.standardVaultFormatter(state, vaultResults[idx][elemidx], vault)
        );
      });
    });

    govVaultBatches.forEach((govVaultBatch, idx) => {
      govVaultBatch.forEach((govVault, elemidx) => {
        res.govVaults.push(this.govVaultFormatter(state, govVaultResults[idx][elemidx], govVault));
      });
    });

    govVaultMultiBatches.forEach((govVaultBatch, idx) => {
      govVaultBatch.forEach((govVault, elemidx) => {
        res.govVaultsMulti.push(
          this.govVaultMultiFormatter(state, govVaultMultiResults[idx][elemidx], govVault)
        );
      });
    });

    cowVaultBatches.forEach((cowVaultBatch, idx) => {
      cowVaultBatch.forEach((cowVault, elemidx) => {
        res.cowVaults.push(this.cowVaultFormatter(state, cowVaultResults[idx][elemidx], cowVault));
      });
    });

    return res;
  }

  protected standardVaultFormatter(
    state: BeefyState,
    result: StandardVaultRawContractData,
    standardVault: VaultStandard
  ) {
    const vault = selectVaultById(state, standardVault.id);
    const mooToken = selectTokenByAddress(state, vault.chainId, vault.contractAddress);
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    return {
      id: standardVault.id,
      balance: new BigNumber(result.balance.toString(10)).shiftedBy(-depositToken.decimals),
      /** always 18 decimals for PPFS */
      pricePerFullShare: new BigNumber(result.pricePerFullShare.toString(10)).shiftedBy(
        -mooToken.decimals
      ),
      strategy: result.strategy,
      paused: result.paused,
    } satisfies StandardVaultContractData;
  }

  protected govVaultFormatter(
    state: BeefyState,
    result: GovVaultRawContractData,
    govVault: VaultGov
  ) {
    const vault = selectVaultById(state, govVault.id);
    const token = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    return {
      id: govVault.id,
      totalSupply: new BigNumber(result.totalSupply.toString(10)).shiftedBy(-token.decimals),
    } satisfies GovVaultContractData;
  }

  protected govVaultMultiFormatter(
    state: BeefyState,
    result: GovVaultMultiRawContractData,
    govVault: VaultGovMulti
  ): GovVaultMultiContractData {
    const token = selectTokenByAddress(state, govVault.chainId, govVault.receiptTokenAddress);

    const rewards: RewardContractData[] = [];
    let index = -1;
    for (const reward of result.rewards) {
      ++index;

      if (!reward) {
        console.error(`Invalid reward data for rewardpool ${govVault.id}`);
        continue;
      }

      const { rewardAddress, rate, periodFinish } = reward;

      const rewardToken = selectTokenByAddressOrUndefined(state, govVault.chainId, rewardAddress);
      if (!rewardToken) {
        console.error(`Unknown reward token (${rewardToken}) for rewardpool ${govVault.id}`);
        continue;
      }

      rewards.push({
        token: pick(rewardToken, ['address', 'symbol', 'decimals', 'oracleId', 'chainId']),
        rewardRate: new BigNumber(rate.toString(10)).shiftedBy(-rewardToken.decimals),
        periodFinish: this.periodFinishToDate(periodFinish?.toString(10))!,
        index,
      });
    }

    return {
      id: govVault.id,
      totalSupply: new BigNumber(result.totalSupply.toString(10)).shiftedBy(-token.decimals),
      rewards,
    };
  }

  protected cowVaultFormatter(
    state: BeefyState,
    result: CowVaultRawContractData,
    cowVault: VaultCowcentrated
  ) {
    const tokens = cowVault.depositTokenAddresses.map(tokenAddress =>
      selectTokenByAddress(state, cowVault.chainId, tokenAddress)
    );
    return {
      id: cowVault.id,
      balances: [
        new BigNumber(result.token0Balance.toString(10)).shiftedBy(-tokens[0].decimals),
        new BigNumber(result.token1Balance.toString(10)).shiftedBy(-tokens[1].decimals),
      ],
      strategy: result.strategy,
      paused: result.paused,
    } satisfies CowVaultContractData;
  }

  protected boostFormatter(
    state: BeefyState,
    result: BoostRawContractData,
    boost: BoostPromoEntity
  ) {
    const reward = boost.rewards[0];
    if (!reward) {
      throw new Error(`Boost ${boost.id} has no rewards`);
    }

    const earnedToken = selectTokenByAddress(state, reward.chainId, reward.address);
    const vault = selectVaultById(state, boost.vaultId);
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const periodFinish = this.periodFinishToDate(result.periodFinish?.toString(10));
    return {
      id: boost.id,
      periodFinish,
      isPreStake: result.isPreStake,
      totalSupply: new BigNumber(result.totalSupply.toString(10)).shiftedBy(-depositToken.decimals),
      rewards: [
        {
          token: pick(earnedToken, ['address', 'symbol', 'decimals', 'oracleId', 'chainId']),
          rewardRate: new BigNumber(result.rewardRate.toString(10)).shiftedBy(
            -earnedToken.decimals
          ),
          periodFinish,
          isPreStake: result.isPreStake,
          index: 0,
        },
      ],
    } satisfies BoostContractData;
  }

  protected boostFormatterMulti(
    state: BeefyState,
    result: GovVaultMultiRawContractData,
    boost: BoostPromoEntity
  ): BoostContractData {
    const rewards: BoostRewardContractData[] = [];
    const now = new Date();
    let index = -1;
    for (const reward of result.rewards) {
      ++index;

      if (!reward) {
        console.error(`Invalid reward data for boost ${boost.id}`);
        continue;
      }

      const { rewardAddress, rate, periodFinish } = reward;
      if (!rewardAddress || !rate || !periodFinish) {
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
        rewardRate: new BigNumber(rate.toString(10)).shiftedBy(-rewardToken.decimals),
        periodFinish: this.periodFinishToDate(periodFinish?.toString(10)),
        isPreStake: false,
        index,
      });
    }

    // Make sure config rewards[] tokens are included in the results
    const missing = boost.rewards.filter(
      reward =>
        !rewards.some(r => r.token.address === reward.address && r.token.chainId === reward.chainId)
    );
    if (missing.length > 0) {
      for (const reward of missing) {
        const earnedToken = selectTokenByAddress(state, reward.chainId, reward.address);
        if (featureFlag_simulateLiveBoost(boost.id)) {
          rewards.push({
            token: pick(earnedToken, ['address', 'symbol', 'decimals', 'oracleId', 'chainId']),
            rewardRate: new BigNumber('0.5'),
            periodFinish: addDays(new Date(), 7),
            isPreStake: false,
            index: -1,
          });
        } else {
          rewards.push({
            token: pick(earnedToken, ['address', 'symbol', 'decimals', 'oracleId', 'chainId']),
            rewardRate: BIG_ZERO,
            periodFinish: undefined,
            isPreStake: false,
            index: -1,
          });
        }
      }
    }

    const vault = selectVaultById(state, boost.vaultId);
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    // ending soonest, ending furthest, ended recently, ended furthest, never active
    const sortedRewards = sortBy(rewards, ({ periodFinish }) =>
      periodFinish
        ? periodFinish.getTime() > now.getTime()
          ? Number.MIN_SAFE_INTEGER + periodFinish.getTime()
          : -periodFinish.getTime()
        : Number.MAX_SAFE_INTEGER
    );

    return {
      id: boost.id,
      totalSupply: new BigNumber(result.totalSupply.toString(10)).shiftedBy(-depositToken.decimals),
      isPreStake: sortedRewards[0].isPreStake,
      periodFinish: sortedRewards[0].periodFinish,
      rewards: sortedRewards,
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
