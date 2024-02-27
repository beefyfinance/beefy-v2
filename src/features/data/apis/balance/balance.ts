import _BeefyV2AppMulticallUserAbi from '../../../../config/abi/BeefyV2AppMulticall.json';
import type { AbiItem } from 'web3-utils';
import type Web3 from 'web3';
import type { VaultGov } from '../../entities/vault';
import type { ChainEntity } from '../../entities/chain';
import BigNumber from 'bignumber.js';
import type { AllValuesAsIncludeArrays, AllValuesAsString } from '../../utils/types-utils';
import type { BoostEntity } from '../../entities/boost';
import { chunk, groupBy } from 'lodash-es';

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
import type { Web3Call, Web3CallMethod } from '../../../../helpers/web3';
import { makeBatchRequest } from '../../../../helpers/web3';

// fix ts types
const BeefyV2AppMulticallUserAbi = _BeefyV2AppMulticallUserAbi as AbiItem | AbiItem[];

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
      BeefyV2AppMulticallUserAbi,
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

    const govVaultsByVersion = groupBy(govVaults, 'version');
    const govVaultsV1 = govVaultsByVersion['1'] || [];
    const govVaultsV2 = govVaultsByVersion['2'] || [];
    const erc20TokensBatches = chunk(erc20Tokens, CHUNK_SIZE);
    const boostAndGovVaultBatches = chunk([...boosts, ...govVaultsV1], CHUNK_SIZE);
    const govVaultsV2Batches = chunk(govVaultsV2, CHUNK_SIZE);

    const requestsForBatch: Web3Call[] = [];

    boostAndGovVaultBatches.forEach(boostAndGovVaultBatch => {
      requestsForBatch.push({
        method: mc.methods.getBoostOrGovBalance(
          boostAndGovVaultBatch.map(boostOrGovVaultt => boostOrGovVaultt.earnContractAddress),
          walletAddress
        ).call,
        params: { from: '0x0000000000000000000000000000000000000000' },
      });
    });

    govVaultsV2Batches.forEach(govVaultsV2Batch => {
      requestsForBatch.push({
        method: mc.methods.getGovVaultMultiBalance(
          govVaultsV2Batch.map(gov => gov.earnContractAddress),
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
      for (let i = 0; i < (results[resultsIdx] as unknown[]).length; i++) {
        const boostOrGovVaultRes = results[resultsIdx][i];
        if (boostIndex < boosts.length) {
          res.boosts.push(
            this.boostFormatter(
              state,
              boostOrGovVaultRes as AllValuesAsString<BoostBalance>,
              boosts[boostIndex]
            )
          );
        } else {
          res.govVaults.push(
            this.govVaultFormatter(
              state,
              boostOrGovVaultRes as AllValuesAsString<GovVaultBalance>,
              govVaultsV1[boostIndex - boosts.length]
            )
          );
        }
        boostIndex++;
      }
      resultsIdx++;
    }

    for (const govVaultsV2Batch of govVaultsV2Batches) {
      const batchRes = (
        results[resultsIdx] as AllValuesAsIncludeArrays<GovVaultV2Balance, string>[]
      ).map((vaultRes, elemidx) =>
        this.govVaultV2Formatter(state, vaultRes, govVaultsV2Batch[elemidx])
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

  protected erc20TokenFormatter(result: string, token: TokenEntity): null | TokenBalance {
    const rawAmount = new BigNumber(result);
    return {
      tokenAddress: token.address,
      amount: rawAmount.shiftedBy(-token.decimals),
    };
  }

  protected nativeTokenFormatter(result: string, token: TokenNative): TokenBalance | null {
    const rawAmount = new BigNumber(result);
    return {
      tokenAddress: token.address,
      amount: rawAmount.shiftedBy(-token.decimals),
    };
  }

  protected govVaultFormatter(
    state: BeefyState,
    result: AllValuesAsString<GovVaultBalance>,
    govVault: VaultGov
  ): GovVaultBalance | null {
    const balanceToken = selectGovVaultBalanceTokenEntity(state, govVault.id);
    const rewardsToken = selectGovVaultRewardsTokenEntity(state, govVault.id);
    const rawBalance = new BigNumber(result.balance);
    const rawRewards = new BigNumber(result.rewards);
    return {
      vaultId: govVault.id,
      balance: rawBalance.shiftedBy(-balanceToken.decimals),
      rewards: rawRewards.shiftedBy(-rewardsToken.decimals),
    };
  }

  protected boostFormatter(
    state: BeefyState,
    result: AllValuesAsString<BoostBalance>,
    boost: BoostEntity
  ): BoostBalance | null {
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
    result: AllValuesAsIncludeArrays<GovVaultV2Balance, string>,
    govVault: VaultGov
  ): GovVaultBalance | null {
    if (result.rewards.length !== result.rewardTokens.length || result.rewards.length === 0) {
      throw new Error(`Invalid rewards and rewardTokens length`);
    }

    const balanceToken = selectGovVaultBalanceTokenEntity(state, govVault.id);
    const rewardsToken = selectGovVaultRewardsTokenEntity(state, govVault.id);
    const rawBalance = new BigNumber(result.balance);
    const index = result.rewardTokens.findIndex(token => token === govVault.earnedTokenAddress);
    if (index === -1) {
      throw new Error(`Config reward token not found in result`);
    }
    const rawRewards = new BigNumber(result.rewards[index]);

    return {
      vaultId: govVault.id,
      balance: rawBalance.shiftedBy(-balanceToken.decimals),
      rewards: rawRewards.shiftedBy(-rewardsToken.decimals),
    };
  }
}
