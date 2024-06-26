import { BeefyV2AppMulticallAbi } from '../../../../config/abi/BeefyV2AppMulticallAbi';
import type Web3 from 'web3';
import {
  isGovVaultSingle,
  type VaultGov,
  type VaultGovMulti,
  type VaultGovSingle,
} from '../../entities/vault';
import type { ChainEntity } from '../../entities/chain';
import BigNumber from 'bignumber.js';
import type { AsWeb3Result } from '../../utils/types-utils';
import type { BoostEntity } from '../../entities/boost';
import { chunk, partition } from 'lodash-es';

import type {
  BoostBalance,
  FetchAllBalancesResult,
  GovVaultBalance,
  GovVaultV2Balance,
  IBalanceApi,
  TokenBalance,
} from './balance-types';
import type { TokenEntity, TokenErc20, TokenNative } from '../../entities/token';
import { isTokenErc20, isTokenNative } from '../../entities/token';
import { featureFlag_getBalanceApiChunkSize } from '../../utils/feature-flags';
import type { BeefyState } from '../../../../redux-types';
import {
  selectBoostBalanceTokenEntity,
  selectBoostRewardsTokenEntity,
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
import { fromWeiString } from '../../../../helpers/big-number';

export class BalanceAPI<T extends ChainEntity> implements IBalanceApi {
  constructor(protected web3: Web3, protected chain: T) {}

  public async fetchAllBalances(
    state: BeefyState,
    tokens: TokenEntity[],
    govVaults: VaultGov[],
    boosts: BoostEntity[],
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
    const erc20TokensBatches = chunk(erc20Tokens, CHUNK_SIZE);
    const boostAndGovVaultBatches = chunk([...boosts, ...govVaultsV1], CHUNK_SIZE);
    const govVaultsV2Batches = chunk(govVaultsV2, CHUNK_SIZE);

    const requestsForBatch: Web3Call[] = [];

    boostAndGovVaultBatches.forEach(boostAndGovVaultBatch => {
      requestsForBatch.push({
        method: mc.methods.getBoostOrGovBalance(
          boostAndGovVaultBatch.map(boostOrGovVaultt => boostOrGovVaultt.contractAddress),
          walletAddress
        ).call,
        params: { from: '0x0000000000000000000000000000000000000000' },
      });
    });

    govVaultsV2Batches.forEach(govVaultsV2Batch => {
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

    let boostIndex = 0;
    for (let j = 0; j < boostAndGovVaultBatches.length; j++) {
      const batchResults = results[resultsIdx] as unknown[];
      for (let i = 0; i < batchResults.length; i++) {
        const boostOrGovVaultRes = batchResults[i];
        if (boostIndex < boosts.length) {
          res.boosts.push(
            this.boostFormatter(
              state,
              boostOrGovVaultRes as AsWeb3Result<BoostBalance>,
              boosts[boostIndex]
            )
          );
        } else {
          res.govVaults.push(
            this.govVaultFormatter(
              state,
              boostOrGovVaultRes as AsWeb3Result<GovVaultBalance>,
              govVaultsV1[boostIndex - boosts.length]
            )
          );
        }
        boostIndex++;
      }
      resultsIdx++;
    }

    for (const govVaultsV2Batch of govVaultsV2Batches) {
      const batchRes = (results[resultsIdx] as AsWeb3Result<GovVaultV2Balance>[]).map(
        (vaultRes, elemidx) => this.govVaultV2Formatter(state, vaultRes, govVaultsV2Batch[elemidx])
      );
      res.govVaults = res.govVaults.concat(batchRes);
      resultsIdx++;
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
    result: AsWeb3Result<GovVaultBalance>,
    govVault: VaultGovSingle
  ): GovVaultV2Balance {
    const balanceToken = selectGovVaultBalanceTokenEntity(state, govVault.id);
    const rewardsToken = selectGovVaultRewardsTokenEntity(state, govVault.id);
    const rawBalance = new BigNumber(result.balance);
    const rawRewards = new BigNumber(result.rewards);
    return {
      vaultId: govVault.id,
      balance: rawBalance.shiftedBy(-balanceToken.decimals),
      rewards: [rawRewards.shiftedBy(-rewardsToken.decimals)],
      rewardTokens: govVault.earnedTokenAddresses,
    };
  }

  protected boostFormatter(
    state: BeefyState,
    result: AsWeb3Result<BoostBalance>,
    boost: BoostEntity
  ): BoostBalance {
    const balanceToken = selectBoostBalanceTokenEntity(state, boost.id);
    const rewardsToken = selectBoostRewardsTokenEntity(state, boost.id);
    const rawBalance = new BigNumber(result.balance);
    const rawRewards = new BigNumber(result.rewards);
    return {
      boostId: boost.id,
      balance: rawBalance.shiftedBy(-balanceToken.decimals),
      rewards: rawRewards.shiftedBy(-rewardsToken.decimals),
    };
  }

  /**
   * For now this converts the result of new v2 gov vaults (multiple reward tokens) to the old 1 token format
   */
  protected govVaultV2Formatter(
    state: BeefyState,
    result: AsWeb3Result<GovVaultV2Balance>,
    govVault: VaultGovMulti
  ): GovVaultV2Balance {
    if (result.rewards.length !== result.rewardTokens.length || result.rewards.length === 0) {
      throw new Error(`Invalid rewards and rewardTokens length`);
    }

    const balanceToken = selectGovVaultBalanceTokenEntity(state, govVault.id);

    const rewards: BigNumber[] = govVault.earnedTokenAddresses.map(rewardTokenAddress => {
      const rewardTokenEntity = selectTokenByAddress(state, govVault.chainId, rewardTokenAddress);
      const index = result.rewardTokens.findIndex(
        token => token.toLowerCase() === rewardTokenAddress.toLowerCase()
      );
      if (index === -1) {
        throw new Error(`Config reward token ${rewardTokenAddress} not found in result`);
      }
      return fromWeiString(result.rewards[index], rewardTokenEntity.decimals);
    });

    return {
      vaultId: govVault.id,
      balance: fromWeiString(result.balance, balanceToken.decimals),
      rewards,
      rewardTokens: govVault.earnedTokenAddresses,
    };
  }
}
