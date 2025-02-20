import { BeefyV2AppMulticallAbi } from '../../../../config/abi/BeefyV2AppMulticallAbi';
import type Web3 from 'web3';
import {
  isGovVaultSingle,
  type VaultGov,
  type VaultGovCowcentrated,
  type VaultGovMulti,
  type VaultGovSingle,
} from '../../entities/vault';
import type { ChainEntity } from '../../entities/chain';
import { BigNumber } from 'bignumber.js';
import type { BoostPromoEntity } from '../../entities/promo';
import { chunk, partition, pick } from 'lodash-es';

import type {
  BoostBalance,
  BoostBalanceContractData,
  FetchAllBalancesResult,
  GovVaultBalance,
  GovVaultMultiBalanceContractData,
  GovVaultSingleBalanceContractData,
  IBalanceApi,
  TokenBalance,
} from './balance-types';
import type { TokenEntity, TokenErc20, TokenNative } from '../../entities/token';
import { isTokenErc20, isTokenNative } from '../../entities/token';
import { featureFlag_getBalanceApiChunkSize } from '../../utils/feature-flags';
import type { BeefyState } from '../../../../redux-types';
import {
  selectBoostBalanceTokenEntity,
  selectGovVaultBalanceTokenEntity,
  selectGovVaultRewardsTokenEntity,
} from '../../selectors/balance';
import {
  makeBatchRequest,
  viemToWeb3Abi,
  type Web3Call,
  type Web3CallMethod,
} from '../../../../helpers/web3';
import { selectTokenByAddress } from '../../selectors/tokens';
import { BIG_ZERO, fromWeiString, isFiniteBigNumber } from '../../../../helpers/big-number';
import { isDefined } from '../../utils/array-utils';

export class BalanceAPI<T extends ChainEntity> implements IBalanceApi {
  constructor(protected web3: Web3, protected chain: T) {}

  public async fetchAllBalances(
    state: BeefyState,
    tokens: TokenEntity[],
    govVaults: VaultGov[],
    boosts: BoostPromoEntity[],
    walletAddress: string
  ): Promise<FetchAllBalancesResult> {
    const mc = new this.web3.eth.Contract(
      viemToWeb3Abi(BeefyV2AppMulticallAbi),
      this.chain.appMulticallContractAddress
    );

    // if we send too much in a single call, we get "execution reversed"
    const CHUNK_SIZE = featureFlag_getBalanceApiChunkSize();

    const nativeTokens: TokenNative[] = [];
    const erc20Tokens: TokenErc20[] = [];
    for (const token of tokens) {
      if (isTokenErc20(token)) {
        erc20Tokens.push(token);
      } else if (isTokenNative(token)) {
        nativeTokens.push(token);
      } else {
        throw new Error(`Token type unsupported`);
      }
    }

    const [govVaultsV1, govVaultsV2] = partition(govVaults, isGovVaultSingle);
    const [boostsV1, boostsV2] = partition(boosts, b => b.version === 1);
    const erc20TokensBatches = chunk(erc20Tokens, CHUNK_SIZE);
    const boostAndGovVaultV1Batches = chunk([...boostsV1, ...govVaultsV1], CHUNK_SIZE);
    const boostAndGovVaultsV2Batches = chunk([...boostsV2, ...govVaultsV2], CHUNK_SIZE);

    const requestsForBatch: Web3Call[] = [];

    boostAndGovVaultV1Batches.forEach(boostAndGovVaultBatch => {
      requestsForBatch.push({
        method: mc.methods.getBoostOrGovBalance(
          boostAndGovVaultBatch.map(boostOrGovVault => boostOrGovVault.contractAddress),
          walletAddress
        ).call,
        params: { from: '0x0000000000000000000000000000000000000000' },
      });
    });

    boostAndGovVaultsV2Batches.forEach(govVaultsV2Batch => {
      requestsForBatch.push({
        method: mc.methods.getGovVaultMultiBalance(
          govVaultsV2Batch.map(gov => gov.contractAddress),
          walletAddress
        ).call,
        params: { from: '0x0000000000000000000000000000000000000000' },
      });
    });

    erc20TokensBatches.forEach(erc20TokenBatch => {
      requestsForBatch.push({
        method: mc.methods.getTokenBalances(
          erc20TokenBatch.map(token => token.address),
          walletAddress
        ).call,
        params: { from: '0x0000000000000000000000000000000000000000' },
      });
    });

    requestsForBatch.push({
      method: this.web3.eth.getBalance as unknown as Web3CallMethod,
      params: walletAddress,
    });

    const results = await makeBatchRequest(this.web3, requestsForBatch);

    // now reasign results

    const res: FetchAllBalancesResult = {
      tokens: [],
      govVaults: [],
      boosts: [],
    };

    let resultsIdx = 0;

    {
      let boostIndex = 0;
      for (let j = 0; j < boostAndGovVaultV1Batches.length; j++) {
        const batchResults = results[resultsIdx] as unknown[];
        for (let i = 0; i < batchResults.length; i++) {
          const boostOrGovVaultRes = batchResults[i];
          if (boostIndex < boostsV1.length) {
            res.boosts.push(
              this.boostFormatter(
                state,
                boostOrGovVaultRes as BoostBalanceContractData,
                boostsV1[boostIndex]
              )
            );
          } else {
            res.govVaults.push(
              this.govVaultFormatter(
                state,
                boostOrGovVaultRes as GovVaultSingleBalanceContractData,
                govVaultsV1[boostIndex - boostsV1.length]
              )
            );
          }
          boostIndex++;
        }
        resultsIdx++;
      }
    }

    {
      let boostIndex = 0;
      for (let j = 0; j < boostAndGovVaultsV2Batches.length; j++) {
        const batchResults = results[resultsIdx] as GovVaultMultiBalanceContractData[];
        for (let i = 0; i < batchResults.length; i++) {
          const boostOrGovVaultRes = batchResults[i];
          if (boostIndex < boostsV2.length) {
            res.boosts.push(this.boostV2Formatter(state, boostOrGovVaultRes, boostsV2[boostIndex]));
          } else {
            res.govVaults.push(
              this.govVaultV2Formatter(
                state,
                boostOrGovVaultRes,
                govVaultsV2[boostIndex - boostsV2.length]
              )
            );
          }
          boostIndex++;
        }
        resultsIdx++;
      }
    }

    for (const erc20TokenBatch of erc20TokensBatches) {
      const batchRes = (results[resultsIdx] as string[]).map((vaultRes, elemidx) =>
        this.erc20TokenFormatter(vaultRes, erc20TokenBatch[elemidx])
      );
      res.tokens = res.tokens.concat(batchRes);
      resultsIdx++;
    }

    for (const nativeToken of nativeTokens) {
      const formatted = this.nativeTokenFormatter(results[resultsIdx] as string, nativeToken);
      res.tokens.push(formatted);
      resultsIdx++;
    }

    return res;
  }

  protected erc20TokenFormatter(result: string, token: TokenEntity): TokenBalance {
    const rawAmount = new BigNumber(result);
    return {
      tokenAddress: token.address,
      amount: rawAmount.shiftedBy(-token.decimals),
    };
  }

  protected nativeTokenFormatter(result: string, token: TokenNative): TokenBalance {
    const rawAmount = new BigNumber(result);
    return {
      tokenAddress: token.address,
      amount: rawAmount.shiftedBy(-token.decimals),
    };
  }

  protected govVaultFormatter(
    state: BeefyState,
    result: GovVaultSingleBalanceContractData,
    govVault: VaultGovSingle
  ): GovVaultBalance {
    const balanceToken = selectGovVaultBalanceTokenEntity(state, govVault.id);
    const rewardsToken = selectGovVaultRewardsTokenEntity(state, govVault.id);
    const balance = fromWeiString(result.balance, balanceToken.decimals);
    const rewards = fromWeiString(result.rewards, rewardsToken.decimals);
    return {
      vaultId: govVault.id,
      balance: balance,
      rewards: [
        {
          token: pick(rewardsToken, ['address', 'symbol', 'decimals', 'oracleId', 'chainId']),
          amount: rewards,
          index: 0,
        },
      ],
    };
  }

  protected boostFormatter(
    state: BeefyState,
    result: BoostBalanceContractData,
    boost: BoostPromoEntity
  ): BoostBalance {
    const firstReward = boost.rewards[0]; // v1 only has one reward
    if (!firstReward) {
      throw new Error(`Boost ${boost.id} has no rewards`);
    }

    const balanceToken = selectBoostBalanceTokenEntity(state, boost.id);
    const earnedToken = selectTokenByAddress(state, firstReward.chainId, firstReward.address);
    const balance = fromWeiString(result.balance, balanceToken.decimals);
    const reward = {
      token: pick(earnedToken, ['address', 'symbol', 'decimals', 'oracleId', 'chainId']),
      amount: fromWeiString(result.rewards, earnedToken.decimals),
      index: 0,
    };

    return {
      boostId: boost.id,
      balance,
      rewards: [reward],
    };
  }

  protected govVaultV2Formatter(
    state: BeefyState,
    result: GovVaultMultiBalanceContractData,
    govVault: VaultGovMulti | VaultGovCowcentrated
  ): GovVaultBalance {
    if (result.rewards.length !== result.rewardTokens.length) {
      throw new Error(`Invalid rewards and rewardTokens length`);
    }

    const balanceToken = selectGovVaultBalanceTokenEntity(state, govVault.id);

    const rewards = result.rewardTokens
      .map((rewardTokenAddress, index) => {
        const rewardToken = selectTokenByAddress(state, govVault.chainId, rewardTokenAddress);
        if (!rewardToken) {
          console.warn(
            `${govVault.id} Reward token ${rewardTokenAddress} not found in address book`
          );
          return undefined;
        }

        const amount = fromWeiString(result.rewards[index] || '0', rewardToken.decimals);

        return {
          token: pick(rewardToken, ['address', 'symbol', 'decimals', 'oracleId', 'chainId']),
          amount: isFiniteBigNumber(amount) ? amount : BIG_ZERO,
          index,
        };
      })
      .filter(isDefined);

    return {
      vaultId: govVault.id,
      balance: fromWeiString(result.balance, balanceToken.decimals),
      rewards,
    };
  }

  protected boostV2Formatter(
    state: BeefyState,
    result: GovVaultMultiBalanceContractData,
    boost: BoostPromoEntity
  ): BoostBalance {
    if (result.rewards.length !== result.rewardTokens.length) {
      throw new Error(`Invalid rewards and rewardTokens length`);
    }

    const balanceToken = selectBoostBalanceTokenEntity(state, boost.id);
    const rewards = result.rewardTokens
      .map((rewardTokenAddress, index) => {
        const rewardToken = selectTokenByAddress(state, boost.chainId, rewardTokenAddress);
        if (!rewardToken) {
          console.warn(`${boost.id} Reward token ${rewardTokenAddress} not found in address book`);
          return undefined;
        }

        const amount = fromWeiString(result.rewards[index] || '0', rewardToken.decimals);

        return {
          token: pick(rewardToken, ['address', 'symbol', 'decimals', 'oracleId', 'chainId']),
          amount: isFiniteBigNumber(amount) ? amount : BIG_ZERO,
          index,
        };
      })
      .filter(isDefined);

    // Make sure config rewards[] tokens are included in the results
    const missing = boost.rewards.filter(
      reward =>
        !rewards.some(r => r.token.address === reward.address && r.token.chainId === reward.chainId)
    );
    if (missing.length > 0) {
      for (const reward of missing) {
        const earnedToken = selectTokenByAddress(state, reward.chainId, reward.address);
        rewards.push({
          token: pick(earnedToken, ['address', 'symbol', 'decimals', 'oracleId', 'chainId']),
          amount: BIG_ZERO,
          index: -1,
        });
      }
    }

    return {
      boostId: boost.id,
      balance: fromWeiString(result.balance, balanceToken.decimals),
      rewards,
    };
  }
}
