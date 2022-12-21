import { BigNumber } from 'bignumber.js';
import { config } from '../src/config/config';
import { addressBook } from 'blockchain-addressbook';
import { appToAddressBookId } from './config';
import { VaultConfig } from '../src/features/data/apis/config-types';
import { uniqBy } from 'lodash';
import { getOneInchApi } from '../src/features/data/apis/instances';
import { ChainEntity } from '../src/features/data/entities/chain';
import { OneInchApi } from '../src/features/data/apis/one-inch';
import PQueue from 'p-queue';
import { zaps as oneInchZaps } from '../src/config/zap/one-inch';

/**
 * Lists tokens which are in vaults json but do not have liquidity on 1inch
 * Asks 1inch for a quote from WNATIVE to each token, and only outputs tokens which fail
 * Only checks if a swap is possible, does not check price impact: you may want to block additional tokens
 * Used to update blockedTokens in src/config/zap/one-inch.ts
 *
 * tsconfig.json and package.json both need to be setup for commonjs for this script to work
 * package.json needs to have "type": "commonjs"
 * tsconfig.json needs to have "module": "commonjs"
 */

type AppChainId = keyof typeof config;
type Tokens = typeof addressBook['avax']['tokens'];
type Token = Tokens[keyof Tokens];
type SimpleToken = {
  id: string;
  symbol: string;
  address: string;
};

const vaultsByChainId = {};
const oneInchChains: Map<string, boolean> = new Map(oneInchZaps.map(zap => [zap.chainId, true]));

async function getVaultsForChain(appChainId: AppChainId): Promise<VaultConfig[]> {
  if (!(appChainId in vaultsByChainId)) {
    vaultsByChainId[appChainId] = (await import(`../src/config/vault/${appChainId}.json`)).default;
  }

  return vaultsByChainId[appChainId];
}

function getTokensForChainById(appChainId: AppChainId): Tokens {
  return addressBook[appToAddressBookId(appChainId)].tokens;
}

function getTokensForChainByAddress(appChainId: AppChainId): Tokens {
  return addressBook[appToAddressBookId(appChainId)].tokenAddressMap;
}

async function getTokensForChain(appChainId: AppChainId): Promise<SimpleToken[]> {
  const vaults = await getVaultsForChain(appChainId);
  const tokensById = getTokensForChainById(appChainId);
  const wnative = tokensById['WNATIVE'];
  const chain = config[appChainId];

  const tidyTokens = (tokens: SimpleToken[]) =>
    uniqBy(
      tokens.filter(
        t =>
          !!t &&
          t.address.toLowerCase() !== wnative.address.toLowerCase() &&
          t.address !== 'native' &&
          t.symbol !== chain.walletSettings.nativeCurrency.symbol
      ),
      token => token.address.toLowerCase()
    );

  const vaultTokens = tidyTokens(
    vaults.flatMap(vault => {
      const tokens = [];

      // only non-lp tokens (skip native)
      if (vault.assets.length === 1 && vault.tokenAddress) {
        tokens.push({
          id: vault.token,
          symbol: vault.token,
          address: vault.tokenAddress,
        });
      }

      if (vault.earnedTokenAddress.toLowerCase() !== vault.earnContractAddress.toLowerCase()) {
        tokens.push({
          id: vault.earnedToken,
          symbol: vault.earnedToken,
          address: vault.earnedTokenAddress,
        });
      }
      return tokens;
    })
  );

  const assetTokens = tidyTokens(
    vaults.flatMap(vault => {
      return vault.assets
        .map(id => {
          if (id in tokensById) {
            return {
              id,
              symbol: tokensById[id].symbol,
              address: tokensById[id].address,
            };
          }

          console.log(`Token ${id} not found in ${appChainId}`);
          return null;
        })
        .filter(token => !!token);
    })
  );

  // Vault tokens need to come before any loaded from address book
  return uniqBy([...vaultTokens, ...assetTokens], token => token.address.toLowerCase());
}

type CheckTokenParams = {
  token: SimpleToken;
  oneInchApi: OneInchApi;
  fromNative: { amount: string; address: string };
  appChainId: AppChainId;
};

async function checkToken({ token, oneInchApi, fromNative, appChainId }: CheckTokenParams) {
  try {
    await oneInchApi.getQuote({
      fromTokenAddress: fromNative.address,
      amount: fromNative.amount,
      toTokenAddress: token.address,
    });

    return { token, appChainId, success: true };
  } catch (e) {
    const errorMessage = e.toString();
    const isNotEnoughLiquidity = errorMessage.includes('insufficient liquidity');

    if (!isNotEnoughLiquidity) {
      console.error(`Error getting quote for ${token.symbol}:${token.address}`, e);
    }

    return { token, appChainId, success: false };
  }
}

async function getTokenCallsForChain(appChainId: AppChainId): Promise<CheckTokenParams[]> {
  const tokens = await getTokensForChain(appChainId);
  const chain: ChainEntity = {
    ...config[appChainId],
    id: appChainId,
    networkChainId: config[appChainId].chainId,
  };
  const wrappedNative: Token = getTokensForChainById(appChainId).WNATIVE;
  const oneInchApi = await getOneInchApi(chain);
  const fromNative = {
    address: wrappedNative.address,
    amount: new BigNumber(1).shiftedBy(wrappedNative.decimals).toString(10),
  };

  return tokens.map(token => ({ token, oneInchApi, fromNative, appChainId }));
}

function makeIteratee<T extends Record<PropertyKey, any>, K extends keyof T>(
  key: K
): (item: T) => PropertyKey {
  return (item: T) => item[key];
}

function groupByMap<T extends Record<PropertyKey, any>, K extends keyof T, R>(
  array: T[],
  iteratee: ((item: T) => PropertyKey) | string,
  map: (item: T) => R
): Record<T[K], R[]> {
  const fn = typeof iteratee === 'function' ? iteratee : makeIteratee(iteratee);
  const output: Record<PropertyKey, R[]> = {};
  for (const item of array) {
    const key = fn(item);
    if (!(key in output)) {
      output[key] = [];
    }
    output[key].push(map(item));
  }
  return output;
}

async function start() {
  const concurrency = 2;
  const perTokenParams = (
    await Promise.all(
      Object.keys(config)
        .filter(chain => oneInchChains.has(chain))
        .map(getTokenCallsForChain)
    )
  ).flat();

  console.log(
    `Checking liquidity for all tokens... ${perTokenParams.length} total calls, ${concurrency} per second`
  );

  const queue = new PQueue({
    concurrency: concurrency * 2,
    interval: 1000,
    intervalCap: concurrency,
    autoStart: false,
  });
  queue.on('next', () => console.log(`Size: ${queue.size}  Pending: ${queue.pending}`));
  const resultPromise = queue.addAll(perTokenParams.map(params => () => checkToken(params)));
  queue.start();
  await queue.onEmpty();
  const results = await resultPromise;
  const failed = results.filter(result => !result.success);
  const failedByChain = groupByMap(failed, 'appChainId', result => result.token.id);

  console.log('.');
  console.log('.');
  console.log('.');
  console.dir(failedByChain, { depth: null });
}

start().catch(e => console.error(e));
