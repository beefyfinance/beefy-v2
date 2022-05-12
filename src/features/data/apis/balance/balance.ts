import _BeefyV2AppMulticallUserAbi from '../../../../config/abi/BeefyV2AppUserMulticall.json';
import { AbiItem } from 'web3-utils';
import Web3 from 'web3';
import { VaultGov } from '../../entities/vault';
import { ChainEntity } from '../../entities/chain';
import BigNumber from 'bignumber.js';
import { AllValuesAsString } from '../../utils/types-utils';
import { BoostEntity } from '../../entities/boost';
import { chunk } from 'lodash';
import {
  BoostBalance,
  FetchAllBalancesResult,
  GovVaultPoolBalance,
  IBalanceApi,
  TokenBalance,
} from './balance-types';
import {
  isTokenErc20,
  isTokenNative,
  TokenEntity,
  TokenErc20,
  TokenNative,
} from '../../entities/token';
import { featureFlag_getBalanceApiChunkSize } from '../../utils/feature-flags';
import { BeefyState } from '../../../../redux-types';
import {
  selectBoostBalanceTokenEntity,
  selectBoostRewardsTokenEntity,
  selectGovVaultBalanceTokenEntity,
  selectGovVaultRewardsTokenEntity,
} from '../../selectors/balance';

// fix ts types
const BeefyV2AppMulticallUserAbi = _BeefyV2AppMulticallUserAbi as AbiItem | AbiItem[];

export class BalanceAPI<T extends ChainEntity & { fetchBalancesAddress: string }>
  implements IBalanceApi
{
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
      this.chain.fetchBalancesAddress
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
    const erc20TokensBatches = chunk(erc20Tokens, CHUNK_SIZE);
    const govVaultBatches = chunk(govVaults, CHUNK_SIZE);
    const boostBatches = chunk(boosts, CHUNK_SIZE);

    const boostPromises = boostBatches.map(boostBatch =>
      mc.methods
        .getBoostOrGovBalance(
          boostBatch.map(boost => boost.earnContractAddress),
          walletAddress
        )
        .call()
    );
    const govVaultPromises = govVaultBatches.map(govVaultBatch => {
      return mc.methods
        .getBoostOrGovBalance(
          govVaultBatch.map(vault => vault.earnContractAddress),
          walletAddress
        )
        .call();
    });
    const erc20TokensPromises = erc20TokensBatches.map(erc20TokenBatch =>
      mc.methods
        .getTokenBalances(
          erc20TokenBatch.map(token => token.address),
          walletAddress
        )
        .call()
    );
    const nativeTokenPromises = nativeTokens.map(_ => this.web3.eth.getBalance(walletAddress));

    const results = await Promise.all([
      ...boostPromises,
      ...govVaultPromises,
      ...erc20TokensPromises,
      ...nativeTokenPromises,
    ]);

    // now reasign results

    const res: FetchAllBalancesResult = {
      tokens: [],
      govVaults: [],
      boosts: [],
    };

    let resultsIdx = 0;
    for (const boostBatch of boostBatches) {
      const batchRes = results[resultsIdx].map((boostRes, elemidx) =>
        this.boostFormatter(state, boostRes, boostBatch[elemidx])
      );
      res.boosts = res.boosts.concat(batchRes);
      resultsIdx++;
    }
    for (const govVaultBatch of govVaultBatches) {
      const batchRes = results[resultsIdx].map((vaultRes, elemidx) =>
        this.govVaultFormatter(state, vaultRes, govVaultBatch[elemidx])
      );
      res.govVaults = res.govVaults.concat(batchRes);
      resultsIdx++;
    }
    for (const erc20TokenBatch of erc20TokensBatches) {
      const batchRes = results[resultsIdx].map((vaultRes, elemidx) =>
        this.erc20TokenFormatter(vaultRes, erc20TokenBatch[elemidx])
      );
      res.tokens = res.tokens.concat(batchRes);
      resultsIdx++;
    }

    for (const nativeToken of nativeTokens) {
      const formatted = this.nativeTokenFormatter(results[resultsIdx], nativeToken);
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
    result: AllValuesAsString<GovVaultPoolBalance>,
    govVault: VaultGov
  ): GovVaultPoolBalance | null {
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
}
