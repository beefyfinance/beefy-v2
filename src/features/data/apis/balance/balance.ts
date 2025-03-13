import { BeefyV2AppMulticallAbi } from '../../../../config/abi/BeefyV2AppMulticallAbi.ts';
import {
  isGovVaultSingle,
  type VaultGov,
  type VaultGovCowcentrated,
  type VaultGovMulti,
  type VaultGovSingle,
} from '../../entities/vault.ts';
import type { ChainEntity } from '../../entities/chain.ts';
import { BigNumber } from 'bignumber.js';
import type { BoostPromoEntity } from '../../entities/promo.ts';
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
} from './balance-types.ts';
import type { TokenEntity, TokenErc20, TokenNative } from '../../entities/token.ts';
import { isTokenErc20, isTokenNative } from '../../entities/token.ts';
import { featureFlag_getBalanceApiChunkSize } from '../../utils/feature-flags.ts';
import type { BeefyState } from '../../../../redux-types.ts';
import {
  selectBoostBalanceTokenEntity,
  selectGovVaultBalanceTokenEntity,
  selectGovVaultRewardsTokenEntity,
} from '../../selectors/balance.ts';
import { selectTokenByAddress } from '../../selectors/tokens.ts';
import { BIG_ZERO, fromWeiString, isFiniteBigNumber } from '../../../../helpers/big-number.ts';
import { isDefined } from '../../utils/array-utils.ts';
import { rpcClientManager } from '../rpc-contract/rpc-manager.ts';
import { fetchContract } from '../rpc-contract/viem-contract.ts';
import type { Address } from 'abitype';

export class BalanceAPI<T extends ChainEntity> implements IBalanceApi {
  constructor(protected chain: T) {}

  public async fetchAllBalances(
    state: BeefyState,
    tokens: TokenEntity[],
    govVaults: VaultGov[],
    boosts: BoostPromoEntity[],
    walletAddress: string
  ): Promise<FetchAllBalancesResult> {
    const client = rpcClientManager.getBatchClient(this.chain.id);
    const appMulticallContract = fetchContract(
      this.chain.appMulticallContractAddress,
      BeefyV2AppMulticallAbi,
      this.chain.id
    );

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

    const boostAndGovVaultV1Requests = boostAndGovVaultV1Batches.map(batch =>
      appMulticallContract.read.getBoostOrGovBalance([
        batch.map(boostOrGovVault => boostOrGovVault.contractAddress as Address),
        walletAddress as Address,
      ])
    );

    const boostAndGovVaultV2Requests = boostAndGovVaultsV2Batches.map(batch =>
      appMulticallContract.read.getGovVaultMultiBalance([
        batch.map(gov => gov.contractAddress as Address),
        walletAddress as Address,
      ])
    );

    const erc20TokensRequests = erc20TokensBatches.map(batch =>
      appMulticallContract.read.getTokenBalances([
        batch.map(token => token.address as Address),
        walletAddress as Address,
      ])
    );

    const nativeTokenRequest = client.getBalance({ address: walletAddress as Address });

    const [govV1Results, govV2Results, erc20Results, nativeResults] = await Promise.all([
      Promise.all(boostAndGovVaultV1Requests),
      Promise.all(boostAndGovVaultV2Requests),
      Promise.all(erc20TokensRequests),
      nativeTokenRequest,
    ]);

    const res: FetchAllBalancesResult = {
      tokens: [],
      govVaults: [],
      boosts: [],
    };

    let boostOrGovV1ArrayIndex = 0; // We need to track if we are on a boost or a gov vault
    boostAndGovVaultV1Batches.forEach((batch, batchIndex) => {
      batch.forEach((_, index) => {
        // Boosts and gov vaults are part of the same array
        if (boostOrGovV1ArrayIndex < boostsV1.length) {
          res.boosts.push(
            this.boostFormatter(
              state,
              govV1Results[batchIndex][index],
              boostsV1[boostOrGovV1ArrayIndex]
            )
          );
        } else {
          res.govVaults.push(
            this.govVaultFormatter(
              state,
              govV1Results[batchIndex][index],
              govVaultsV1[boostOrGovV1ArrayIndex - boostsV1.length]
            )
          );
        }
        boostOrGovV1ArrayIndex++;
      });
    });

    let boostOrGovV2ArrayIndex = 0;
    boostAndGovVaultsV2Batches.forEach((batch, batchIndex) => {
      batch.forEach((_, index) => {
        if (boostOrGovV2ArrayIndex < boostsV2.length) {
          res.boosts.push(
            this.boostV2Formatter(
              state,
              govV2Results[batchIndex][index],
              boostsV2[boostOrGovV2ArrayIndex]
            )
          );
        } else {
          res.govVaults.push(
            this.govVaultV2Formatter(
              state,
              govV2Results[batchIndex][index],
              govVaultsV2[boostOrGovV2ArrayIndex - boostsV2.length]
            )
          );
        }
        boostOrGovV2ArrayIndex++;
      });
    });

    erc20TokensBatches.forEach((batch, batchIndex) => {
      batch.forEach((token, index) => {
        res.tokens.push(this.erc20TokenFormatter(erc20Results[batchIndex][index], token));
      });
    });

    if (nativeTokens.length > 0) {
      res.tokens.push(this.nativeTokenFormatter(nativeResults, nativeTokens[0]));
    }

    return res;
  }

  protected erc20TokenFormatter(result: bigint, token: TokenEntity): TokenBalance {
    const rawAmount = new BigNumber(result.toString(10));
    return {
      tokenAddress: token.address,
      amount: rawAmount.shiftedBy(-token.decimals),
    };
  }

  protected nativeTokenFormatter(result: bigint, token: TokenNative): TokenBalance {
    const rawAmount = new BigNumber(result.toString(10));
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
    const balance = fromWeiString(result.balance.toString(10), balanceToken.decimals);
    const rewards = fromWeiString(result.rewards.toString(10), rewardsToken.decimals);
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
    const balance = fromWeiString(result.balance.toString(10), balanceToken.decimals);
    const reward = {
      token: pick(earnedToken, ['address', 'symbol', 'decimals', 'oracleId', 'chainId']),
      amount: fromWeiString(result.rewards.toString(10), earnedToken.decimals),
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

        const amount = fromWeiString(
          result.rewards[index]?.toString(10) || '0',
          rewardToken.decimals
        );

        return {
          token: pick(rewardToken, ['address', 'symbol', 'decimals', 'oracleId', 'chainId']),
          amount: isFiniteBigNumber(amount) ? amount : BIG_ZERO,
          index,
        };
      })
      .filter(isDefined);

    return {
      vaultId: govVault.id,
      balance: fromWeiString(result.balance.toString(10), balanceToken.decimals),
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

        const amount = fromWeiString(
          result.rewards[index]?.toString(10) || '0',
          rewardToken.decimals
        );

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
      balance: fromWeiString(result.balance.toString(10), balanceToken.decimals),
      rewards,
    };
  }
}
