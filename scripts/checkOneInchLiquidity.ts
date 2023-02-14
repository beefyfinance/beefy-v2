import { BigNumber } from 'bignumber.js';
import { config } from '../src/config/config';
import { addressBook } from 'blockchain-addressbook';
import { appToAddressBookId } from './config';
import { VaultConfig } from '../src/features/data/apis/config-types';
import { keyBy, mapValues, partition, sortBy, uniqBy } from 'lodash';
import { ChainEntity } from '../src/features/data/entities/chain';
import { OneInchApi } from '../src/features/data/apis/one-inch';
import PQueue from 'p-queue';
import { zaps as oneInchZaps } from '../src/config/zap/one-inch';
import { createWriteStream } from 'fs';
import { createFactoryWithCacheByChain } from '../src/features/data/utils/factory-utils';
import { BeefyAPITokenPricesResponse } from '../src/features/data/apis/beefy';
import {
  BIG_ONE,
  BIG_ZERO,
  fromWei,
  fromWeiString,
  toWei,
  toWeiString,
} from '../src/helpers/big-number';
import { saveCsv, saveJson } from './utils';
import fetch from 'node-fetch';
import { PriceRequest, PriceResponse } from '../src/features/data/apis/one-inch/one-inch-types';
import { createContract } from '../src/helpers/web3';
import { OneInchPriceOracleAbi } from '../src/config/abi';

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
  chainId: AppChainId;
  symbol: string;
  oracleId: string;
  address: string;
  decimals: number;
};

const chainsById: Record<AppChainId, ChainEntity> = Object.entries(config).reduce(
  (acc, [chainId, chainConfig]) => {
    acc[chainId] = {
      ...chainConfig,
      id: chainId,
      networkChainId: chainConfig.chainId,
    };
    return acc;
  },
  {}
);

const chainHasOneInchZap: Map<string, boolean> = new Map(
  oneInchZaps.map(zap => [zap.chainId, true])
);
const oneInchChainIds = Object.keys(config).filter(chain => chainHasOneInchZap.has(chain));
const oneInchZapsByChainId = keyBy(oneInchZaps, 'chainId');

const vaultsByChainId = {};

async function getVaultsForChain(appChainId: AppChainId): Promise<VaultConfig[]> {
  if (!(appChainId in vaultsByChainId)) {
    vaultsByChainId[appChainId] = (await import(`../src/config/vault/${appChainId}.json`)).default;
  }

  return vaultsByChainId[appChainId];
}

function getAddressBookTokensForChainById(appChainId: AppChainId): Tokens {
  return addressBook[appToAddressBookId(appChainId)].tokens;
}

function getTokenFromAddressBook(appChainId: AppChainId, id: string): SimpleToken {
  const token = addressBook[appToAddressBookId(appChainId)].tokens[id];
  if (!token) {
    throw new Error(`Token ${id} not found in address book for ${appChainId}`);
  }

  return {
    id,
    chainId: appChainId,
    symbol: token.symbol,
    address: token.address,
    oracleId: token.oracleId || id,
    decimals: token.decimals,
  };
}

function getAddressBookTokensForChainByAddress(appChainId: AppChainId): Tokens {
  return addressBook[appToAddressBookId(appChainId)].tokenAddressMap;
}

async function getTokensForChain(
  appChainId: AppChainId,
  includeUnknown: boolean = false
): Promise<SimpleToken[]> {
  const vaults = await getVaultsForChain(appChainId);
  const abTokensById = getAddressBookTokensForChainById(appChainId);
  const wnative = abTokensById['WNATIVE'];
  const chain = config[appChainId];

  // excludes native and wnative
  const tidyTokens = (tokens: SimpleToken[]) =>
    uniqBy(
      tokens.filter(
        t =>
          !!t &&
          t.address.toLowerCase() !== wnative.address.toLowerCase() &&
          t.address !== 'native' &&
          t.symbol !== chain.walletSettings.nativeCurrency.symbol
      ),
      token => token.id
    );

  const vaultTokens = tidyTokens(
    vaults.flatMap(vault => {
      const tokens: SimpleToken[] = [];

      // only non-lp tokens (skip native)
      if (vault.assets.length === 1 && vault.tokenAddress) {
        tokens.push({
          id: vault.token,
          chainId: appChainId,
          symbol: vault.token,
          address: vault.tokenAddress,
          oracleId: vault.oracleId || vault.token,
          decimals: vault.tokenDecimals,
        });
      }

      if (vault.earnedTokenAddress.toLowerCase() !== vault.earnContractAddress.toLowerCase()) {
        tokens.push({
          id: vault.earnedToken,
          chainId: appChainId,
          symbol: vault.earnedToken,
          address: vault.earnedTokenAddress,
          oracleId: vault.earnedToken,
          decimals: vault.earnedTokenDecimals,
        });
      }
      return tokens;
    })
  );

  const assetTokens = tidyTokens(
    vaults.flatMap(vault => {
      return vault.assets
        .map(id => {
          if (id in abTokensById) {
            return {
              id,
              chainId: appChainId,
              symbol: abTokensById[id].symbol,
              address: abTokensById[id].address,
              oracleId: abTokensById[id].oracleId || id,
              decimals: abTokensById[id].decimals,
            };
          }

          console.debug(`Token ${id} not found in ${appChainId}`);

          if (includeUnknown) {
            return {
              id,
              chainId: appChainId,
              symbol: id,
              address: 'unknown',
              oracleId: id,
              decimals: 0,
            };
          }

          return null;
        })
        .filter(token => !!token);
    })
  );

  // Vault tokens need to come before any loaded from address book
  return sortBy(
    uniqBy([...vaultTokens, ...assetTokens], token => token.id),
    'id'
  );
}

function makeIteratee<T extends Record<PropertyKey, any>, K extends keyof T>(
  key: K
): (item: T) => PropertyKey {
  return (item: T) => item[key];
}

function isNumber(value: any): value is number {
  return typeof value === 'number';
}

function isFiniteNumber(value: any): value is number {
  return value !== null && isNumber(value) && !isNaN(value) && isFinite(value);
}

function isBigNumber(value: any): value is BigNumber {
  return BigNumber.isBigNumber(value);
}

function isFiniteBigNumber(value: any): value is BigNumber {
  return value !== null && isBigNumber(value) && !value.isNaN() && value.isFinite();
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

class RateLimitedOneInchApi extends OneInchApi {
  constructor(chain: ChainEntity, protected readonly queue: PQueue) {
    super(chain);
  }

  protected async get<ResponseType extends {}, RequestType extends {}>(
    url: string,
    request: RequestType
  ): Promise<ResponseType> {
    return this.queue.add(() => super.get(url, request));
  }

  async getPriceInNative2(request: PriceRequest): Promise<PriceResponse> {
    if (!this.chain.oneInchPriceOracleAddress) {
      throw new Error(`No 1inch price oracle address for ${this.chain.id}`);
    }

    const multicall = await this.getMulticall();
    const contract = createContract(OneInchPriceOracleAbi, this.chain.oneInchPriceOracleAddress);
    const calls = request.tokenAddresses.map(address => ({
      address,
      price: contract.methods.getRateToEth(address, true),
    }));
    const [results] = (await multicall.all([calls])) as [{ address: string; price: string }[]];

    return results.reduce((acc, result) => {
      acc[result.address] =
        typeof result.price === 'string' && result.price !== ''
          ? new BigNumber(result.price)
          : null;
      return acc;
    }, {} as PriceResponse);
  }
}

let oneInchQueue: PQueue | undefined;

function getOneInchQueue() {
  if (!oneInchQueue) {
    oneInchQueue = new PQueue({
      concurrency: 20, // 10 requests at a time
      intervalCap: 40, // up to 20 requests every 1000ms
      interval: 1000,
      carryoverConcurrencyCount: true,
      autoStart: true,
      timeout: 60 * 1000,
      throwOnTimeout: true,
    });
    oneInchQueue.on('next', () =>
      console.log(`Size: ${oneInchQueue.size}  Pending: ${oneInchQueue.pending}`)
    );
  }
  return oneInchQueue;
}

const getOneInchApi = createFactoryWithCacheByChain(async chain => {
  return new RateLimitedOneInchApi(chain, getOneInchQueue());
});

async function fetchPricesByType(type: 'prices' | 'lps'): Promise<BeefyAPITokenPricesResponse> {
  const response = await fetch(
    `${process.env.REACT_APP_API_URL || 'https://api.beefy.finance'}/${type}?_=${Date.now()}`
  );

  return response.json();
}

async function fetchBeefyPrices(): Promise<BeefyAPITokenPricesResponse> {
  const [singles, lps] = await Promise.all([fetchPricesByType('prices'), fetchPricesByType('lps')]);

  return { ...singles, ...lps };
}

type SimpleTokenWithLiquidity = SimpleToken & {
  beefyTokenUsdPrice?: BigNumber;
  oneInchTokenNativePrice?: BigNumber;
  equivOneInchTokenUsdPrice?: BigNumber;
  firstNativeIn?: BigNumber;
  firstTokenOut?: BigNumber;
  firstOneInchPriceImpact?: number;
  firstBeefyPriceImpact?: number;
  reverseNativeOut?: BigNumber;
  reverseOneInchPriceImpact?: number;
  reverseBeefyPriceImpact?: number;
  ratioReturned?: number;
  ratioReturnedPriceImpact?: number;
  ratioReturnedPriceImpact2?: number;
  error?: string;
};

async function checkLiquidityForToken(
  token: SimpleToken,
  wnative: SimpleToken,
  firstNativeIn: BigNumber,
  api: RateLimitedOneInchApi,
  beefyNativeUsdPrice: BigNumber,
  knownBeefyUsdPricesByAddress: Record<string, BigNumber>,
  knownOneInchNativePricesByAddress: Record<string, BigNumber>
): Promise<SimpleTokenWithLiquidity> {
  const beefyTokenUsdPrice = knownBeefyUsdPricesByAddress[token.address.toLowerCase()];
  const hasBeefyTokenUsdPrice = isFiniteBigNumber(beefyTokenUsdPrice);
  const oneInchTokenNativePrice = knownOneInchNativePricesByAddress[token.address.toLowerCase()];
  const hasOneInchTokenNativePrice = isFiniteBigNumber(oneInchTokenNativePrice);
  const equivOneInchTokenUsdPrice =
    oneInchTokenNativePrice !== undefined
      ? oneInchTokenNativePrice.multipliedBy(beefyNativeUsdPrice).decimalPlaces(wnative.decimals)
      : undefined;

  const liquidity: SimpleTokenWithLiquidity = {
    ...token,
    beefyTokenUsdPrice,
    oneInchTokenNativePrice,
    equivOneInchTokenUsdPrice,
    firstNativeIn,
  };

  try {
    const nativeToTokenSwap = await api.getQuote({
      amount: toWeiString(firstNativeIn, wnative.decimals),
      fromTokenAddress: wnative.address,
      toTokenAddress: token.address,
    });

    const firstTokenOut = fromWeiString(
      nativeToTokenSwap.toTokenAmount,
      nativeToTokenSwap.toToken.decimals
    );
    liquidity.firstTokenOut = firstTokenOut;

    if (hasBeefyTokenUsdPrice) {
      const inValue = firstNativeIn.multipliedBy(beefyNativeUsdPrice);
      const outValue = firstTokenOut.multipliedBy(beefyTokenUsdPrice);
      liquidity.firstBeefyPriceImpact = BIG_ONE.minus(outValue.dividedBy(inValue)).toNumber();
    }

    if (hasOneInchTokenNativePrice) {
      const inValue = firstNativeIn;
      const outValue = firstTokenOut.multipliedBy(oneInchTokenNativePrice);
      liquidity.firstOneInchPriceImpact = BIG_ONE.minus(outValue.dividedBy(inValue)).toNumber();
    }

    try {
      const tokenToNativeSwap = await api.getQuote({
        amount: nativeToTokenSwap.toTokenAmount,
        fromTokenAddress: nativeToTokenSwap.toToken.address,
        toTokenAddress: nativeToTokenSwap.fromToken.address,
      });

      const reverseNativeOut = fromWeiString(
        tokenToNativeSwap.toTokenAmount,
        tokenToNativeSwap.toToken.decimals
      );
      liquidity.reverseNativeOut = reverseNativeOut;

      if (hasBeefyTokenUsdPrice) {
        const inValue = firstTokenOut.multipliedBy(beefyTokenUsdPrice);
        const outValue = reverseNativeOut.multipliedBy(beefyNativeUsdPrice);
        liquidity.reverseBeefyPriceImpact = BIG_ONE.minus(outValue.dividedBy(inValue)).toNumber();
      }

      if (hasOneInchTokenNativePrice) {
        const inValue = firstTokenOut.multipliedBy(oneInchTokenNativePrice);
        const outValue = reverseNativeOut;
        liquidity.reverseOneInchPriceImpact = BIG_ONE.minus(outValue.dividedBy(inValue)).toNumber();
      }

      const ratioReturned = reverseNativeOut.dividedBy(firstNativeIn).toNumber();
      liquidity.ratioReturned = ratioReturned;
      liquidity.ratioReturnedPriceImpact = calcRatioReturnedPriceImpact(ratioReturned);
      liquidity.ratioReturnedPriceImpact2 = calcRatioReturnedPriceImpact2(ratioReturned);
      return liquidity;
    } catch (e) {
      console.error(
        `Error checking token->native liquidity for ${token.id} on ${token.chainId}`,
        e
      );
      return { ...liquidity, error: e.message };
    }
  } catch (e) {
    console.error(`Error checking native->token liquidity for ${token.id} on ${token.chainId}`, e);
    return { ...liquidity, error: e.message };
  }
}

function calcRatioReturnedPriceImpact(ratioReturned: number): number {
  // 0.993 + -1.94x + 1.54x^2 + -0.596x^3
  const x = ratioReturned;
  const x2 = x * x;
  const x3 = x2 * x;
  const a = 0.993;
  const b = -1.94;
  const c = 1.54;
  const d = -0.596;

  return a + b * x + c * x2 + d * x3;
}

function calcRatioReturnedPriceImpact2(ratioReturned: number): number {
  // 1 + -2x + 1.5x^2 + -0.5x^3
  const x = ratioReturned;
  const x2 = x * x;
  const x3 = x2 * x;
  const a = 1;
  const b = -2;
  const c = 1.5;
  const d = -0.5;

  return a + b * x + c * x2 + d * x3;
}

async function getOneInchNativePricesForTokens(
  tokens: SimpleToken[],
  wnative: SimpleToken,
  api: RateLimitedOneInchApi
) {
  const tokensByAddress = keyBy(tokens, t => t.address.toLowerCase());
  const prices = await api.getPriceInNative2({
    tokenAddresses: tokens.map(t => t.address.toLowerCase()),
  });

  return Object.entries(prices).reduce((acc, [address, price]) => {
    // 0 = no price
    if (isFiniteBigNumber(price) && !price.isZero()) {
      const token = tokensByAddress[address];
      acc[address.toLowerCase()] = fromWei(price, wnative.decimals)
        .shiftedBy(token.decimals)
        .decimalPlaces(0, BigNumber.ROUND_FLOOR)
        .shiftedBy(-wnative.decimals);
    }

    return acc;
  }, {} as { [tokenAddress: string]: BigNumber });
}

function getChainNative(
  appChainId: AppChainId,
  prices: BeefyAPITokenPricesResponse
): { token: SimpleToken; beefyPriceUsd: BigNumber } {
  const wnative = getTokenFromAddressBook(appChainId, 'WNATIVE');
  const token = getTokenFromAddressBook(appChainId, wnative.symbol);
  const beefyPriceUsd =
    token.oracleId in prices && isFiniteNumber(prices[token.oracleId])
      ? new BigNumber(prices[token.oracleId])
      : null;

  return {
    token,
    beefyPriceUsd,
  };
}

function getBeefyUsdPricesForTokens(
  tokens: SimpleToken[],
  prices: BeefyAPITokenPricesResponse
): { [tokenAddress: string]: BigNumber } {
  return tokens.reduce((acc, token) => {
    if (token.oracleId in prices && isFiniteNumber(prices[token.oracleId])) {
      acc[token.address.toLowerCase()] = new BigNumber(prices[token.oracleId]);
    }

    return acc;
  }, {} as { [tokenAddress: string]: BigNumber });
}

async function checkLiquidityForChain(
  appChainId: AppChainId,
  prices: BeefyAPITokenPricesResponse
): Promise<SimpleTokenWithLiquidity[]> {
  const api = await getOneInchApi(chainsById[appChainId]);
  const { token: wnative, beefyPriceUsd: beefyNativeUsdPrice } = getChainNative(appChainId, prices);

  if (!wnative) {
    throw new Error(`No wnative for ${appChainId}`);
  }

  if (!beefyNativeUsdPrice) {
    throw new Error(`No beefy price for ${wnative.symbol} on ${appChainId}`);
  }

  const nativeSwapIn = new BigNumber(2000)
    .dividedBy(beefyNativeUsdPrice)
    .decimalPlaces(wnative.decimals);
  const nativeSwapWei = toWeiString(nativeSwapIn, wnative.decimals);

  const allTokens = await getTokensForChain(appChainId, true);
  const knownTokens = allTokens.filter(t => t.address !== 'unknown');
  const uniqueKnownTokens = uniqBy(knownTokens, t => t.address.toLowerCase());

  const knownBeefyUsdPricesByAddress = getBeefyUsdPricesForTokens(uniqueKnownTokens, prices);
  const knownOneInchNativePricesByAddress = await getOneInchNativePricesForTokens(
    uniqueKnownTokens,
    wnative,
    api
  );

  const knownLiquidity = await Promise.all(
    uniqueKnownTokens.map(t =>
      checkLiquidityForToken(
        t,
        wnative,
        nativeSwapIn,
        api,
        beefyNativeUsdPrice,
        knownBeefyUsdPricesByAddress,
        knownOneInchNativePricesByAddress
      )
    )
  );
  const knownLiquidityByAddress = keyBy(knownLiquidity, t => t.address.toLowerCase());

  return allTokens.map(t => {
    if (t.address === 'unknown') {
      return t;
    } else {
      const liquidity = knownLiquidityByAddress[t.address.toLowerCase()];
      return liquidity || t;
    }
  });
}

type TokenPrice = {
  id: SimpleToken['id'];
  chainId: SimpleToken['chainId'];
  symbol: SimpleToken['symbol'];
  address: SimpleToken['address'];
  oracleId: SimpleToken['oracleId'];
  beefyPriceUsd?: BigNumber;
  oneInchPriceNative?: BigNumber;
  equivOneInchPriceUsd?: BigNumber;
};

async function checkPricesForChain(
  appChainId: AppChainId,
  prices: BeefyAPITokenPricesResponse
): Promise<TokenPrice[]> {
  const api = await getOneInchApi(chainsById[appChainId]);
  const { token: wnative, beefyPriceUsd: beefyNativePriceUsd } = getChainNative(appChainId, prices);

  if (!wnative) {
    throw new Error(`No wnative for ${appChainId}`);
  }

  if (!beefyNativePriceUsd) {
    throw new Error(`No beefy price for ${wnative.symbol} on ${appChainId}`);
  }

  const allTokens = await getTokensForChain(appChainId, true);
  const [unknownTokens, knownTokens] = partition(allTokens, t => t.address === 'unknown');
  const uniqueKnownTokens = uniqBy(knownTokens, t => t.address.toLowerCase());

  const knownBeefyUsdPricesByAddress = getBeefyUsdPricesForTokens(uniqueKnownTokens, prices);
  const knownOneInchNativePricesByAddress = await getOneInchNativePricesForTokens(
    uniqueKnownTokens,
    wnative,
    api
  );

  const results: TokenPrice[] = [
    {
      id: wnative.id,
      chainId: wnative.chainId,
      symbol: wnative.symbol,
      address: wnative.address,
      oracleId: wnative.oracleId,
      beefyPriceUsd: beefyNativePriceUsd,
      oneInchPriceNative: new BigNumber(1),
      equivOneInchPriceUsd: beefyNativePriceUsd,
    },
  ];

  return allTokens.reduce((acc, t) => {
    const addressLower = t.address.toLowerCase();
    const beefyPriceUsd = knownBeefyUsdPricesByAddress[addressLower];
    const oneInchPriceNative = knownOneInchNativePricesByAddress[addressLower];
    const equivOneInchPriceUsd =
      oneInchPriceNative !== undefined
        ? oneInchPriceNative.multipliedBy(beefyNativePriceUsd).decimalPlaces(wnative.decimals)
        : undefined;

    acc.push({
      id: t.id,
      chainId: t.chainId,
      symbol: t.symbol,
      address: t.address,
      oracleId: t.oracleId,
      beefyPriceUsd,
      oneInchPriceNative,
      equivOneInchPriceUsd,
    });

    return acc;
  }, results);
}

async function exportReferencedTokens(oneInchChainsOnly: boolean, includeUnknown: boolean) {
  const tokens = (
    await Promise.all(
      (oneInchChainsOnly ? oneInchChainIds : Object.keys(config)).map(chainId =>
        getTokensForChain(chainId, includeUnknown)
      )
    )
  ).flat();
  const stream = createWriteStream('tokens.csv');
  stream.write('id,chainId,symbol,address\n');
  for (const token of tokens) {
    stream.write(`${token.id},${token.chainId},${token.symbol},${token.address}\n`);
  }
  stream.end();
}

async function exportLiquidity() {
  const prices = await fetchBeefyPrices();
  const results = (
    await Promise.all(oneInchChainIds.map(chainId => checkLiquidityForChain(chainId, prices)))
  ).flat();

  await saveJson('liquidity.json', results);

  const stream = createWriteStream('liquidity.csv');
  stream.write(
    'id,chainId,symbol,oracleId,address,beefyTokenUsdPrice,oneInchTokenNativePrice,equivOneInchTokenUsdPrice,firstNativeIn,firstTokenOut,firstOneInchPriceImpact,firstBeefyPriceImpact,reverseNativeOut,reverseOneInchPriceImpact,reverseBeefyPriceImpact,ratioReturned,ratioReturnedPriceImpact,ratioReturnedPriceImpact2,error\n'
  );
  for (const r of results) {
    stream.write(
      `${r.id},${r.chainId},${r.symbol},${r.oracleId},${r.address}` +
        `,${fn(r.beefyTokenUsdPrice)}` +
        `,${fn(r.oneInchTokenNativePrice)}` +
        `,${fn(r.equivOneInchTokenUsdPrice)}` +
        `,${fn(r.firstNativeIn)}` +
        `,${fn(r.firstTokenOut)}` +
        `,${fn(r.firstOneInchPriceImpact)}` +
        `,${fn(r.firstBeefyPriceImpact)}` +
        `,${fn(r.reverseNativeOut)}` +
        `,${fn(r.reverseOneInchPriceImpact)}` +
        `,${fn(r.reverseBeefyPriceImpact)}` +
        `,${fn(r.ratioReturned)}` +
        `,${fn(r.ratioReturnedPriceImpact)}` +
        `,${fn(r.ratioReturnedPriceImpact2)}` +
        `,${r.error || ''}` +
        '\n'
    );
  }
  stream.end();
}

function fn(value: number | BigNumber | undefined, zeroIsUnknown: boolean = false): string {
  if (value === undefined) {
    return 'unknown';
  }

  if (typeof value === 'number') {
    return zeroIsUnknown && value === 0 ? 'unknown' : value.toString();
  }

  return zeroIsUnknown && value.isZero() ? 'unknown' : value.toString(10);
}

function formatBigNumber(value?: BigNumber): string {
  return value ? value.toString(10) : 'unknown';
}

async function exportPrices() {
  const prices = await fetchBeefyPrices();
  const tokens = (
    await Promise.all(oneInchChainIds.map(chainId => checkPricesForChain(chainId, prices)))
  ).flat();
  const stream = createWriteStream('prices.csv');
  stream.write(
    'id,chainId,symbol,oracleId,address,beefyTokenPriceInUsd,oneTokenPriceInNative,equivOneInchPriceUsd\n'
  );
  for (const token of tokens) {
    stream.write(
      `${token.id},${token.chainId},${token.symbol},${token.oracleId},${token.address}` +
        `,${formatBigNumber(token.beefyPriceUsd)}` +
        `,${formatBigNumber(token.oneInchPriceNative)}` +
        `,${formatBigNumber(token.equivOneInchPriceUsd)}` +
        '\n'
    );
  }
  stream.end();
}

async function exportTokenStatus() {
  const prices = await fetchBeefyPrices();
  const liquidity = (
    await Promise.all(oneInchChainIds.map(chainId => checkLiquidityForChain(chainId, prices)))
  ).flat();

  const results = liquidity
    .map(liq => {
      const base = {
        chainId: liq.chainId,
        id: liq.id,
        oracleId: liq.oracleId,
        isBlocked: false,
        blockedReason: '',
        shouldBlockInConfig: false,
        configBlockReason: '',
      };

      const isInAddressBook = liq.address && liq.address !== 'unknown';
      const has1inchLiquidity = isFiniteBigNumber(liq.firstTokenOut) && !liq.error;
      const hasBeefyTokenUsdPrice =
        isFiniteBigNumber(liq.beefyTokenUsdPrice) && liq.beefyTokenUsdPrice.gt(BIG_ZERO);
      const has1inchPrice =
        isFiniteBigNumber(liq.oneInchTokenNativePrice) && liq.oneInchTokenNativePrice.gt(BIG_ZERO);
      const pricesAreClose =
        hasBeefyTokenUsdPrice &&
        has1inchPrice &&
        liq.equivOneInchTokenUsdPrice
          .minus(liq.beefyTokenUsdPrice)
          .dividedBy(liq.beefyTokenUsdPrice)
          .absoluteValue()
          .isLessThan(0.1);

      if (!isInAddressBook) {
        return {
          ...base,
          isBlocked: true,
          blockedReason: 'token not in address book/vault config',
          shouldBlockInConfig: false,
          configBlockReason: 'detected at runtime',
        };
      }

      if (!has1inchLiquidity) {
        return {
          ...base,
          isBlocked: true,
          blockedReason: `no 1inch liquidity: ${liq.error}`,
          shouldBlockInConfig: true,
          configBlockReason: 'better ux',
        };
      }

      if (!has1inchPrice) {
        return {
          ...base,
          isBlocked: true,
          blockedReason: 'no 1inch price',
          shouldBlockInConfig: true,
          configBlockReason: 'better ux',
        };
      }

      if (!hasBeefyTokenUsdPrice) {
        return {
          ...base,
          isBlocked: true,
          blockedReason: 'no beefy api token price',
          shouldBlockInConfig: false,
          configBlockReason: 'detected at runtime',
        };
      }

      if (!pricesAreClose) {
        console.log(
          'prices are not close',
          liq.id,
          liq.chainId,
          liq.oracleId,
          liq.beefyTokenUsdPrice.toString(10),
          liq.equivOneInchTokenUsdPrice.toString(10)
        );
        return {
          ...base,
          isBlocked: true,
          blockedReason: 'beefy and 1inch prices are more than 10% different',
          shouldBlockInConfig: true,
          configBlockReason: 'better ux',
        };
      }

      return base;
    })
    .map(r => {
      if (
        r.shouldBlockInConfig &&
        oneInchZapsByChainId[r.chainId].blockedTokens.indexOf(r.id) !== -1
      ) {
        return {
          ...r,
          shouldBlockInConfig: false,
          configBlockReason: 'already blocked in config',
        };
      }
      return r;
    });

  await saveJson('token-status.json', results);
  await saveCsv('token-status.csv', results);
}

async function start() {
  if (
    !process.env.REACT_APP_ONE_INCH_API ||
    process.env.REACT_APP_ONE_INCH_API === 'https://api.1inch.io'
  ) {
    throw new Error('This script will fail due to rate limiting using the default 1inch API.');
  }

  // await exportReferencedTokens(false, true);
  // await exportPrices();
  // await exportLiquidity();
  await exportTokenStatus();
}

start().catch(e => console.error(e));
