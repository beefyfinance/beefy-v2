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

// fix ts types
const BeefyV2AppMulticallUserAbi = _BeefyV2AppMulticallUserAbi as AbiItem | AbiItem[];

export class BalanceMcV2API<T extends ChainEntity & { fetchBalancesAddress: string }>
  implements IBalanceApi
{
  constructor(protected web3: Web3, protected chain: T) {}

  public async fetchAllBalances(
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
        throw new Error(`Token type unsupported ${token.id}`);
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
          erc20TokenBatch.map(token => token.contractAddress),
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
      const batchRes = results[resultsIdx]
        .map((boostRes, elemidx) => this.boostFormatter(boostRes, boostBatch[elemidx]))
        .filter(item => item);
      res.boosts = res.boosts.concat(batchRes);
      resultsIdx++;
    }
    for (const govVaultBatch of govVaultBatches) {
      const batchRes = results[resultsIdx]
        .map((vaultRes, elemidx) => this.govVaultFormatter(vaultRes, govVaultBatch[elemidx]))
        .filter(item => item);
      res.govVaults = res.govVaults.concat(batchRes);
      resultsIdx++;
    }
    for (const erc20TokenBatch of erc20TokensBatches) {
      const batchRes = results[resultsIdx]
        .map((vaultRes, elemidx) => this.erc20TokenFormatter(vaultRes, erc20TokenBatch[elemidx]))
        .filter(item => item);
      res.tokens = res.tokens.concat(batchRes);
      resultsIdx++;
    }

    for (const nativeToken of nativeTokens) {
      res.tokens.push(this.nativeTokenFormatter(results[resultsIdx], nativeToken));
      resultsIdx++;
    }

    return res;
  }

  protected erc20TokenFormatter(result: string, token: TokenEntity): TokenBalance | null {
    if (result === '0') {
      return null;
    }
    return {
      tokenId: token.id,
      amount: new BigNumber(result),
    };
  }
  protected nativeTokenFormatter(result: string, token: TokenNative): TokenBalance | null {
    if (result === '0') {
      return null;
    }
    return {
      tokenId: token.id,
      amount: new BigNumber(result),
    };
  }

  protected govVaultFormatter(
    result: AllValuesAsString<GovVaultPoolBalance>,
    govVault: VaultGov
  ): GovVaultPoolBalance | null {
    if (result.balance === '0' && result.rewards === '0') {
      return null;
    }
    return {
      vaultId: govVault.id,
      balance: new BigNumber(result.balance),
      rewards: new BigNumber(result.rewards),
    };
  }

  protected boostFormatter(
    result: AllValuesAsString<BoostBalance>,
    boost: BoostEntity
  ): BoostBalance | null {
    if (result.balance === '0' && result.rewards === '0') {
      return null;
    }
    return {
      boostId: boost.id,
      balance: new BigNumber(result.balance),
      rewards: new BigNumber(result.rewards),
    };
  }
}
