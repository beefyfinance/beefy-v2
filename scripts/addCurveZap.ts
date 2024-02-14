import { ArgumentConfig, parse } from 'ts-command-line-args';
import {
  addressBookToAppId,
  appToAddressBookId,
  chainRpcs,
  getChain,
  getVaultsForChain,
} from './common/config';
import { sortVaultKeys } from './common/vault-fields';
import { fileReadable, loadJson, saveJson } from './common/files';
import type { VaultConfig } from '../src/features/data/apis/config-types';
import Web3 from 'web3';
import { addressBook } from 'blockchain-addressbook';
import { MultiCall, ShapeWithLabel } from 'eth-multicall';
import { mkdir } from 'node:fs/promises';
import * as path from 'node:path';
import { isNonEmptyArray, NonEmptyArray, sleep } from './common/utils';
import { getAddress } from '@ethersproject/address';
import type { CurveStrategyOptions } from '../src/features/data/apis/transact/strategies/IStrategy';
import type { CurveMethodTypes } from '../src/features/data/apis/transact/strategies/curve/types';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const EEEE_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

type RunArgs = {
  help?: boolean;
  chain: string;
  vault: string;
  update?: boolean;
  quiet?: boolean;
};

const runArgsConfig: ArgumentConfig<RunArgs> = {
  help: {
    type: Boolean,
    alias: 'h',
    description: 'Display this usage guide.',
    optional: true,
  },
  chain: {
    type: String,
    alias: 'c',
    description: 'Which chain json file to process',
  },
  vault: {
    type: String,
    alias: 'v',
    description: 'Which vault id to process',
  },
  update: {
    type: Boolean,
    alias: 'u',
    description: 'Update the cache',
    optional: true,
  },
  quiet: {
    type: Boolean,
    alias: 'q',
    description: 'Only output warnings, errors and the zap json',
    optional: true,
  },
};

function getRunArgs() {
  return parse<RunArgs>(runArgsConfig, {
    helpArg: 'help',
    headerContentSections: [
      {
        header: 'yarn addCurveZap',
        content: 'Create zap config for a curve vault.',
      },
    ],
  });
}

type CurveApiCoin = {
  address: string;
  decimals: number;
  symbol: string;
  isBasePoolLpToken?: boolean;
};

type CurveApiPoolMetadata = {
  endpoint: string;
  timestamp: Date;
  chainId: string;
  fixedMetaPool?: boolean;
};

type CurveApiPool = {
  id: string;
  name: string;
  address: string;
  lpTokenAddress: string;
  coins: CurveApiCoin[];
  isMetaPool: boolean;
  zapAddress?: string;
  underlyingCoins?: CurveApiCoin[];
  implementation?: string;
  basePoolAddress?: string;
  assetTypeName?: string;
  poolUrls: {
    swap: string[];
    deposit: string[];
    withdraw: string[];
  };
  [key: string]: unknown;
};

export type CurveApiPoolWithMetadata = CurveApiPool & {
  metadata: CurveApiPoolMetadata;
};

type ChainPoolCoins = {
  coins: string[];
  underlyingCoins: string[];
};

type ChainPoolCoinsResponse = {
  coin0: string | undefined;
  coin1: string | undefined;
  coin2: string | undefined;
  coin3: string | undefined;
  coin4: string | undefined;
  coin5: string | undefined;
  coin6: string | undefined;
  coin7: string | undefined;
  underlyingCoin0: string | undefined;
  underlyingCoin1: string | undefined;
  underlyingCoin2: string | undefined;
  underlyingCoin3: string | undefined;
  underlyingCoin4: string | undefined;
  underlyingCoin5: string | undefined;
  underlyingCoin6: string | undefined;
  underlyingCoin7: string | undefined;
};

type CurveApiPoolWithChain = CurveApiPoolWithMetadata & {
  onChain: {
    poolCoins: ChainPoolCoins;
    zapCoins?: ChainPoolCoins;
  };
};

const cacheBasePath = path.join(__dirname, '.cache');
const cacheCurvePath = path.join(cacheBasePath, 'curve');
const cacheCurveApiPath = path.join(cacheCurvePath, 'api');
const cryptoPoolsIgnoreZap = new Set([
  '0x960ea3e3C7FB317332d990873d354E18d7645590', // disabled as may be exploitable, and zap only handles eth
  '0xD51a44d3FaE010294C616388b506AcdA1bfAAE46', // zap only handles eth
]);

const chainIdToCurveChainId = {
  arbitrum: 'arbitrum',
  aurora: 'aurora',
  avax: 'avalanche',
  bsc: 'bsc',
  base: 'base',
  celo: 'celo',
  ethereum: 'ethereum',
  fantom: 'fantom',
  gnosis: 'xdai',
  kava: 'kava',
  moonbeam: 'moonbeam',
  optimism: 'optimism',
  polygon: 'polygon',
};

const curveEndpoints = [
  'factory',
  'factory-tricrypto',
  'factory-stable-ng',
  'crypto',
  'factory-crvusd',
  'factory-eywa',
  'factory-crypto',
  'main',
];

async function getVaults(chainId: string): Promise<NonEmptyArray<VaultConfig>> {
  const vaults = await getVaultsForChain(chainId);
  if (!isNonEmptyArray(vaults)) {
    throw new Error(`No vaults found for chain ${chainId}`);
  }
  return vaults;
}

async function getVault(chainId: string, vaultId: string) {
  const vaults = await getVaults(chainId);
  const vault = vaults.find(v => v.id === vaultId);
  if (!vault) {
    throw new Error(`Vault ${vaultId} not found for chain ${chainId}`);
  }
  if (!vault.tokenAddress) {
    throw new Error(`Vault ${vaultId} has no token address`);
  }

  return vault;
}

function fixAddress(address: string, chainId: string): string {
  const checksummed = getAddress(address);
  if (checksummed === EEEE_ADDRESS) {
    // const wnative = addressBook[chainId].tokens['WNATIVE'];
    // if (!wnative) {
    //   throw new Error(`No WNative token found for chain ${chainId}`);
    // }
    return 'native';
  }

  return checksummed;
}

/** fix address checksums */
function fixAddresses(pool: CurveApiPool, chainId: string): CurveApiPool {
  if (pool.coins?.length) {
    pool.coins = pool.coins
      .filter(coin => coin.address !== ZERO_ADDRESS)
      .map(coin => ({
        ...coin,
        address: fixAddress(coin.address, chainId),
      }));
  }

  if (pool.underlyingCoins?.length) {
    pool.underlyingCoins = pool.underlyingCoins
      .filter(coin => coin.address !== ZERO_ADDRESS)
      .map(coin => ({
        ...coin,
        address: fixAddress(coin.address, chainId),
      }));
  }

  pool.address = fixAddress(pool.address, chainId);
  pool.lpTokenAddress = fixAddress(pool.lpTokenAddress, chainId);

  if (pool.basePoolAddress) {
    pool.basePoolAddress = fixAddress(pool.basePoolAddress, chainId);
  }

  return pool;
}

/** fix incorrect flagging of meta pools */
function fixMetaPool(
  pool: CurveApiPoolWithMetadata,
  allPools: CurveApiPoolWithMetadata[]
): CurveApiPoolWithMetadata {
  const basePools = pool.coins.map((coin, i) => ({
    i,
    basePool: allPools.find(pool => pool.lpTokenAddress === coin.address),
    ...coin,
  }));
  const withBasePools = basePools.filter(coin => !!coin.basePool);

  if (withBasePools.length && !pool.isMetaPool) {
    if (withBasePools.length === 1) {
      if (!pool.zapAddress) {
        console.warn(`Normalizing ${pool.id} with 1 base pool and no zap address`);
      }
      const basePool = fixMetaPool(withBasePools[0]!.basePool!, allPools);

      pool.isMetaPool = true;
      pool.coins = pool.coins.map(coin => ({
        ...coin,
        isBasePoolLpToken: basePool.lpTokenAddress === coin.address,
      }));
      pool.basePoolAddress = basePool.address;
      pool.metadata.fixedMetaPool = true;
    } else {
      console.warn(`Can't normalize pool ${pool.id} with ${withBasePools.length} base pools`);
    }
  }

  return pool;
}

function expandMetaCoins(
  pool: CurveApiPoolWithMetadata,
  allPools: CurveApiPoolWithMetadata[]
): CurveApiCoin[] {
  return pool.coins.flatMap(coin => {
    if (!coin.isBasePoolLpToken) {
      return [coin];
    }

    const basePool = allPools.find(pool => pool.lpTokenAddress === coin.address);
    if (!basePool) {
      throw new Error(`Can't find base pool for ${pool.id} with lp token address ${coin.address}`);
    }

    return expandMetaCoins(basePool, allPools);
  });
}

function fixUnderlyingCoins(
  pool: CurveApiPoolWithMetadata,
  allPools: CurveApiPoolWithMetadata[]
): CurveApiPoolWithMetadata {
  if (pool.isMetaPool) {
    if (!pool.underlyingCoins || pool.underlyingCoins.length === 0) {
      pool.underlyingCoins = expandMetaCoins(pool, allPools);
    }
  }

  return pool;
}

async function fetchCurvePools(
  chainId: string,
  endpoint: string,
  quiet: boolean = false
): Promise<CurveApiPoolWithMetadata[]> {
  const curveChainId = chainIdToCurveChainId[chainId];
  if (!curveChainId) {
    throw new Error(`No curve chain id found for chain ${chainId}`);
  }

  const url = `https://api.curve.fi/api/getPools/${curveChainId}/${endpoint}`;
  if (!quiet) {
    console.log(`Fetching ${url}...`);
  }
  const response = await fetch(url);
  const body = (await response.json()) as { success: boolean; data: { poolData: CurveApiPool[] } };
  await sleep(1000); // avoid rate limit

  if (!body.success) {
    console.error(`Failed to fetch ${url}`);
    return [];
  }

  const timestamp = new Date();
  return body.data.poolData
    .map(pool => fixAddresses(pool, chainId))
    .map(pool => ({
      ...pool,
      metadata: {
        endpoint,
        timestamp,
        chainId,
      },
    }));
}

async function loadCurvePool(cachePath: string): Promise<CurveApiPoolWithMetadata[] | undefined> {
  const exists = await fileReadable(cachePath);
  if (!exists) {
    return undefined;
  }

  return await loadJson<CurveApiPoolWithMetadata[]>(cachePath);
}

const apiPoolsCache = new Map<string, CurveApiPoolWithMetadata[]>();

async function getCurvePools(
  chainId: string,
  updateCache: boolean,
  quiet: boolean = false
): Promise<CurveApiPoolWithMetadata[]> {
  if (!updateCache && apiPoolsCache.has(chainId)) {
    return apiPoolsCache.get(chainId)!;
  }

  const curveChainId = chainIdToCurveChainId[chainId];
  if (!curveChainId) {
    throw new Error(`No curve chain id found for chain ${chainId}`);
  }

  const cachePath = path.join(cacheCurveApiPath, chainId);
  await mkdir(cachePath, { recursive: true });

  const allPools: CurveApiPoolWithMetadata[] = [];
  for (const endpoint of curveEndpoints) {
    const cacheFile = path.join(cachePath, `${endpoint}.json`);
    let pools = updateCache
      ? await fetchCurvePools(chainId, endpoint, quiet)
      : await loadCurvePool(cacheFile);
    let writeCache: boolean = updateCache;
    // fetch if cache is empty and not already fetched
    if (!pools && !updateCache) {
      pools = await fetchCurvePools(chainId, endpoint);
      writeCache = true;
    }
    if (!pools) {
      throw new Error(`Failed to fetch curve pools for ${endpoint} on chain ${chainId}`);
    }

    // save to cache
    if (writeCache) {
      await saveJson(cacheFile, pools, true);
    }

    allPools.push(...pools);
  }

  apiPoolsCache.set(chainId, allPools);

  return allPools;
}

/** Get pool data from curve api */
export async function getApiPool(
  chainId: string,
  lpTokenAddress: string,
  updateCache: boolean
): Promise<CurveApiPoolWithMetadata> {
  const pools = await getCurvePools(chainId, updateCache);
  const pool = pools.find(p => p.lpTokenAddress.toLowerCase() === lpTokenAddress.toLowerCase());
  if (!pool) {
    throw new Error(`No pool found for ${lpTokenAddress} on chain ${chainId}`);
  }
  return fixUnderlyingCoins(fixMetaPool(pool, pools), pools);
}

async function fetchCoins(poolOrZapAddress: string, chainId: string): Promise<ChainPoolCoins> {
  const web3 = new Web3(chainRpcs[chainId]);
  const multicall = new MultiCall(web3, addressBook[chainId].platforms.beefyfinance.multicall);

  const poolContract = new web3.eth.Contract(
    [
      {
        stateMutability: 'view',
        type: 'function',
        name: 'coins',
        inputs: [
          {
            name: 'arg0',
            type: 'uint256',
          },
        ],
        outputs: [
          {
            name: '',
            type: 'address',
          },
        ],
      },
      {
        stateMutability: 'view',
        type: 'function',
        name: 'underlying_coins',
        inputs: [
          {
            name: 'arg0',
            type: 'uint256',
          },
        ],
        outputs: [
          {
            name: '',
            type: 'address',
          },
        ],
      },
    ],
    poolOrZapAddress
  );

  const poolCalls: ShapeWithLabel[] = [
    {
      coin0: poolContract.methods.coins(0),
      coin1: poolContract.methods.coins(1),
      coin2: poolContract.methods.coins(2),
      coin3: poolContract.methods.coins(3),
      coin4: poolContract.methods.coins(4),
      coin5: poolContract.methods.coins(5),
      coin6: poolContract.methods.coins(6),
      coin7: poolContract.methods.coins(7),
      underlyingCoin0: poolContract.methods.underlying_coins(0),
      underlyingCoin1: poolContract.methods.underlying_coins(1),
      underlyingCoin2: poolContract.methods.underlying_coins(2),
      underlyingCoin3: poolContract.methods.underlying_coins(3),
      underlyingCoin4: poolContract.methods.underlying_coins(4),
      underlyingCoin5: poolContract.methods.underlying_coins(5),
      underlyingCoin6: poolContract.methods.underlying_coins(6),
      underlyingCoin7: poolContract.methods.underlying_coins(7),
    },
  ];

  const [
    [
      {
        coin0,
        coin1,
        coin2,
        coin3,
        coin4,
        coin5,
        coin6,
        coin7,
        underlyingCoin0,
        underlyingCoin1,
        underlyingCoin2,
        underlyingCoin3,
        underlyingCoin4,
        underlyingCoin5,
        underlyingCoin6,
        underlyingCoin7,
      },
    ],
  ] = (await multicall.all([poolCalls])) as [[ChainPoolCoinsResponse]];
  await sleep(1000); // avoid rate limit

  return {
    coins: [coin0, coin1, coin2, coin3, coin4, coin5, coin6, coin7].filter(
      (coin): coin is string =>
        !!coin && coin !== '0x' && coin !== '0x0000000000000000000000000000000000000000'
    ),
    underlyingCoins: [
      underlyingCoin0,
      underlyingCoin1,
      underlyingCoin2,
      underlyingCoin3,
      underlyingCoin4,
      underlyingCoin5,
      underlyingCoin6,
      underlyingCoin7,
    ].filter(
      (coin): coin is string =>
        !!coin && coin !== '0x' && coin !== '0x0000000000000000000000000000000000000000'
    ),
  };
}

/** Get pool data from on-chain */
async function getChainPool(pool: CurveApiPoolWithMetadata): Promise<CurveApiPoolWithChain> {
  const poolCoins = await fetchCoins(pool.address, pool.metadata.chainId);
  if (pool.zapAddress) {
    const zapCoins = await fetchCoins(pool.zapAddress, pool.metadata.chainId);
    return {
      ...pool,
      onChain: {
        poolCoins,
        zapCoins,
      },
    };
  }

  return {
    ...pool,
    onChain: {
      poolCoins,
    },
  };
}

type MakeCurveMethod<T extends CurveMethodTypes> = {
  type: T;
  target: string;
  coins: string[];
};

type CurveFixed = MakeCurveMethod<'fixed'>;
type CurveFixedDepositInt128 = MakeCurveMethod<'fixed-deposit-int128'>;
type CurveFixedDepositUint256 = MakeCurveMethod<'fixed-deposit-uint256'>;
type CurveFixedDepositUnderlying = MakeCurveMethod<'fixed-deposit-underlying'>;
type CurveDynamicDeposit = MakeCurveMethod<'dynamic-deposit'>;
type CurvePoolFixed = MakeCurveMethod<'pool-fixed'>;
type CurvePoolFixedDeposit = MakeCurveMethod<'pool-fixed-deposit'>;

type CurveMethods =
  | CurveFixed
  | CurveFixedDepositInt128
  | CurveFixedDepositUint256
  | CurveFixedDepositUnderlying
  | CurveDynamicDeposit
  | CurvePoolFixed
  | CurvePoolFixedDeposit;

function makeMethod<T extends CurveMethodTypes>(
  type: T,
  target: string,
  coins: string[]
): MakeCurveMethod<T> {
  return {
    type,
    target,
    coins,
  };
}

const makeFixed = (target: string, coins: string[]): CurveFixed =>
  makeMethod('fixed', target, coins);
const makeFixedDepositInt128 = (target: string, coins: string[]): CurveFixedDepositInt128 =>
  makeMethod('fixed-deposit-int128', target, coins);
const makeFixedDepositUint256 = (target: string, coins: string[]): CurveFixedDepositUint256 =>
  makeMethod('fixed-deposit-uint256', target, coins);
const makeFixedDepositUnderlying = (target: string, coins: string[]): CurveFixedDepositUnderlying =>
  makeMethod('fixed-deposit-underlying', target, coins);
const makeDynamicDeposit = (target: string, coins: string[]): CurveDynamicDeposit =>
  makeMethod('dynamic-deposit', target, coins);
const makePoolFixed = (target: string, coins: string[]): CurvePoolFixed =>
  makeMethod('pool-fixed', target, coins);
const makePoolFixedDeposit = (target: string, coins: string[]): CurvePoolFixedDeposit =>
  makeMethod('pool-fixed-deposit', target, coins);

function makeFixedDeposit(
  target: string,
  coins: string[],
  indexType: 'int128' | 'uint256'
): CurveFixedDepositInt128 | CurveFixedDepositUint256 {
  return indexType === 'uint256'
    ? makeFixedDepositUint256(target, coins)
    : makeFixedDepositInt128(target, coins);
}

function makeAmounts(amount: string, index: number, numCoins: number): string[] {
  const amounts = Array<string>(numCoins).fill('0');
  amounts[index] = amount;
  return amounts;
}

async function isDepositFlagNeededFixed(
  pool: string,
  coins: number,
  chainId: string
): Promise<boolean> {
  const web3 = new Web3(chainRpcs[chainId]);
  const multicall = new MultiCall(web3, addressBook[chainId].platforms.beefyfinance.multicall);
  const poolContract = new web3.eth.Contract(
    [
      {
        stateMutability: 'view',
        type: 'function',
        name: 'calc_token_amount',
        inputs: [
          {
            name: 'amounts',
            type: `uint256[${coins}]`,
          },
        ],
        outputs: [
          {
            name: '',
            type: 'uint256',
          },
        ],
      },
      {
        stateMutability: 'view',
        type: 'function',
        name: 'calc_token_amount',
        inputs: [
          {
            name: 'amounts',
            type: `uint256[${coins}]`,
          },
          {
            name: 'is_deposit',
            type: 'bool',
          },
        ],
        outputs: [
          {
            name: '',
            type: 'uint256',
          },
        ],
      },
    ],
    pool
  );
  const amounts = makeAmounts('10000000', 0, coins);
  const calls: ShapeWithLabel[] = [
    {
      no: poolContract.methods.calc_token_amount(amounts),
      yes: poolContract.methods.calc_token_amount(amounts, true),
    },
  ];

  const [[{ no, yes }]] = (await multicall.all([calls])) as [
    [{ no: string | undefined; yes: string | undefined }]
  ];
  await sleep(1000); // avoid rate limit

  if (no === undefined && yes == undefined) {
    throw new Error(`Neither calc_token_amount nor calc_token_amount(bool) found on ${pool}`);
  }

  if (no !== undefined && yes !== undefined) {
    throw new Error(`Both calc_token_amount and calc_token_amount(bool) found on ${pool}`);
  }

  return yes !== undefined;
}

function poolEndpointToIndexType(
  endpoint: CurveApiPoolWithChain['metadata']['endpoint']
): 'int128' | 'uint256' {
  switch (endpoint) {
    case 'factory':
    case 'factory-stable-ng':
    case 'factory-crvusd':
    case 'main':
      return 'int128';
    case 'factory-crypto':
    case 'factory-tricrypto':
    case 'crypto':
      return 'uint256';
    default:
      throw new Error(`Unknown endpoint ${endpoint}`);
  }
}

async function factoryPoolToZap(pool: CurveApiPoolWithChain): Promise<CurveMethods[]> {
  // newer contracts don't need is_deposit flag
  const depositQuoteNeedsIsDepositFlag = await isDepositFlagNeededFixed(
    pool.address,
    pool.coins.length,
    pool.metadata.chainId
  );

  const methods: CurveMethods[] = [
    depositQuoteNeedsIsDepositFlag
      ? makeFixedDeposit(
          pool.address,
          pool.coins.map(coin => coin.address),
          poolEndpointToIndexType(pool.metadata.endpoint)
        )
      : makeFixed(
          pool.address,
          pool.coins.map(coin => coin.address)
        ),
  ];
  const hasUnderlying = !!pool.underlyingCoins?.length;
  const hasZap = !!pool.zapAddress;

  if (hasUnderlying && !hasZap) {
    throw new Error('Factory pool has underlying coins but no zap address');
  }

  if (hasZap) {
    if (!hasUnderlying) {
      throw new Error('Factory pool has zap address but no underlying coins');
    }

    let underlyingCoins: string[] = pool.underlyingCoins!.map(coin => coin.address);

    // Check for zaps that use the base pool's underlying coins (e.g. for pools paired with aave or giest 3pools)
    if (pool.isMetaPool) {
      const baseToken = pool.coins.find(coin => coin.isBasePoolLpToken);
      if (!baseToken) {
        throw new Error(`Factory pool is meta pool but no coin is marked isBasePoolLpToken`);
      }
      const basePool = await getPool(pool.metadata.chainId, baseToken.address);
      if (!basePool) {
        throw new Error(
          `Factory pool is meta pool but no base pool found for lp token ${baseToken.address}`
        );
      }

      if (basePool.onChain.poolCoins.underlyingCoins?.length) {
        underlyingCoins = pool.coins.flatMap(coin =>
          coin.isBasePoolLpToken ? basePool.onChain.poolCoins.underlyingCoins : [coin.address]
        );
      } else if (basePool.underlyingCoins) {
        underlyingCoins = pool.coins.flatMap(coin =>
          coin.isBasePoolLpToken
            ? basePool.underlyingCoins!.map(coin => coin.address)
            : [coin.address]
        );
      } else {
        underlyingCoins = pool.coins.flatMap(coin =>
          coin.isBasePoolLpToken ? basePool.coins.map(coin => coin.address) : [coin.address]
        );
      }
    }

    if (depositQuoteNeedsIsDepositFlag) {
      methods.push(makePoolFixedDeposit(pool.zapAddress!, underlyingCoins));
    } else {
      methods.push(makePoolFixed(pool.zapAddress!, underlyingCoins));
    }
  }

  return methods;
}

async function factoryStablePoolToZap(pool: CurveApiPoolWithChain): Promise<CurveMethods[]> {
  const methods: CurveMethods[] = [
    makeDynamicDeposit(
      pool.address,
      pool.coins.map(coin => coin.address)
    ),
  ];
  const hasUnderlying = !!pool.underlyingCoins?.length;
  const hasZap = !!pool.zapAddress;

  if (hasUnderlying) {
    throw new Error('Underlying not implemented for factory stable pools');
  }

  if (hasZap) {
    throw new Error('Zap not implemented for factory stable pools');
  }

  if (pool.isMetaPool) {
    throw new Error('Meta pools not implemented for factory stable pools');
  }

  return methods;
}

async function mainToZap(pool: CurveApiPoolWithChain): Promise<CurveMethods[]> {
  const methods: CurveMethods[] = [
    makeFixedDeposit(
      pool.address,
      pool.coins.map(coin => coin.address),
      poolEndpointToIndexType(pool.metadata.endpoint)
    ),
  ];
  const hasUnderlying = !!pool.underlyingCoins?.length;
  const hasZap = !!pool.zapAddress;

  if (pool.isMetaPool) {
    if (!hasZap) {
      throw new Error('Main pool is meta pool but has no zap address');
    }
    if (!hasUnderlying) {
      throw new Error('Main pool is meta pool but has no underlying coins');
    }
    methods.push(
      makePoolFixedDeposit(
        pool.zapAddress!,
        pool.underlyingCoins!.map(coin => coin.address)
      )
    );
  } else {
    if (hasZap) {
      throw new Error('Main pool is not meta pool but has zap address');
    }
    if (hasUnderlying) {
      throw new Error('Main pool is not meta pool but has underlying coins');
    }

    // aave or giest where we can pass use_underlying flag
    if (!hasZap && pool.onChain.poolCoins.underlyingCoins.length === pool.coins.length) {
      methods.push(
        makeFixedDepositUnderlying(pool.address, pool.onChain.poolCoins.underlyingCoins)
      );
    }
  }

  return methods;
}

async function cryptoToZap(pool: CurveApiPoolWithChain): Promise<CurveMethods[]> {
  const depositQuoteNeedsIsDepositFlag = await isDepositFlagNeededFixed(
    pool.address,
    pool.coins.length,
    pool.metadata.chainId
  );

  const methods: CurveMethods[] = [
    depositQuoteNeedsIsDepositFlag
      ? makeFixedDeposit(
          pool.address,
          pool.coins.map(coin => coin.address),
          poolEndpointToIndexType(pool.metadata.endpoint)
        )
      : makeFixed(
          pool.address,
          pool.coins.map(coin => coin.address)
        ),
  ];
  const hasUnderlying = !!pool.underlyingCoins?.length;
  const hasZap = !!pool.zapAddress;

  if (hasZap) {
    let underlyingCoins: string[] = [];

    if (pool.isMetaPool) {
      // Handle zaps that use the base pool's underlying coins (e.g. for pools paired with aave or giest 3pools)
      const baseToken = pool.coins.find(coin => coin.isBasePoolLpToken);
      if (!baseToken) {
        throw new Error(`Crypto pool is meta pool but no coin is marked isBasePoolLpToken`);
      }
      const basePool = await getPool(pool.metadata.chainId, baseToken.address);
      if (!basePool) {
        throw new Error(
          `Crypto pool is meta pool but no base pool found for lp token ${baseToken.address}`
        );
      }

      if (pool.onChain.zapCoins?.underlyingCoins?.length) {
        underlyingCoins = pool.onChain.zapCoins?.underlyingCoins!;
      } else if (basePool.onChain.poolCoins.underlyingCoins?.length) {
        underlyingCoins = pool.coins.flatMap(coin =>
          coin.isBasePoolLpToken ? basePool.onChain.poolCoins.underlyingCoins : [coin.address]
        );
      } else if (basePool.underlyingCoins) {
        underlyingCoins = pool.coins.flatMap(coin =>
          coin.isBasePoolLpToken
            ? basePool.underlyingCoins!.map(coin => coin.address)
            : [coin.address]
        );
      } else {
        underlyingCoins = pool.coins.flatMap(coin =>
          coin.isBasePoolLpToken ? basePool.coins.map(coin => coin.address) : [coin.address]
        );
      }

      if (!underlyingCoins.length) {
        throw new Error('Crypto pool (meta) has zap address but no underlying coins');
      }

      if (depositQuoteNeedsIsDepositFlag) {
        methods.push(
          makeFixedDeposit(
            pool.zapAddress!,
            underlyingCoins,
            poolEndpointToIndexType(pool.metadata.endpoint)
          )
        );
      } else {
        methods.push(makeFixed(pool.zapAddress!, underlyingCoins));
      }
    } else {
      // Normal zap
      if (hasUnderlying) {
        underlyingCoins = pool.underlyingCoins!.map(coin => coin.address);
      } else if (pool.onChain.zapCoins?.underlyingCoins?.length) {
        underlyingCoins = pool.onChain.zapCoins.underlyingCoins;
      } else if (pool.onChain.zapCoins?.coins?.length) {
        underlyingCoins = pool.onChain.zapCoins.coins;
      }

      const coinsAreSame =
        pool.coins.length === underlyingCoins.length &&
        pool.coins.every(
          (coin, i) => coin.address.toLowerCase() === underlyingCoins[i].toLowerCase()
        );

      if (!coinsAreSame) {
        if (!depositQuoteNeedsIsDepositFlag) {
          throw new Error('TODO: Handle no is_deposit flag for zap');
        }
        methods.push(makePoolFixedDeposit(pool.zapAddress!, underlyingCoins));
      } else {
        console.warn(
          `[WARN][${pool.metadata.chainId}][${pool.address}] Ignoring zap as pool coins and zap coins are the same`
        );
      }
    }
  } else if (pool.isMetaPool) {
    throw new Error(`Crypto pool is meta pool but has no zap address`);
  } else if (hasUnderlying) {
    throw new Error(`Crypto pool has underlying coins but has no zap address`);
  }

  return methods;
}

async function poolToMethods(pool: CurveApiPoolWithChain): Promise<CurveMethods[]> {
  const endpoint = pool.metadata.endpoint;

  if (
    endpoint === 'factory' ||
    endpoint === 'factory-tricrypto' ||
    endpoint === 'factory-crypto' ||
    endpoint === 'factory-crvusd'
  ) {
    return factoryPoolToZap(pool);
  } else if (endpoint === 'factory-stable-ng') {
    return factoryStablePoolToZap(pool);
  } else if (endpoint === 'crypto') {
    return cryptoToZap(pool);
  } else if (endpoint === 'main') {
    return mainToZap(pool);
  } else {
    throw new Error(`Pool endpoint ${endpoint} not supported yet`);
  }
}

async function getPool(
  chainId: string,
  tokenAddress: string,
  updateCache: boolean = false
): Promise<CurveApiPoolWithChain> {
  const apiPool = await getApiPool(chainId, tokenAddress, updateCache);
  const pool = await getChainPool(apiPool);
  return pool;
}

export async function discoverCurveZap(args: RunArgs) {
  const chainId = appToAddressBookId(args.chain);
  const chain = getChain(chainId);
  const vault = await getVault(chainId, args.vault);
  if (!args.quiet) {
    console.log('Chain:', chain.name);
    console.log('Vault id:', vault.id);
    console.log('Vault assets:', vault.assets?.length ? vault.assets.join(', ') : 'not set');
  }

  const pool = await getPool(chainId, vault.tokenAddress!, args.update ?? false);
  if (!args.quiet) {
    console.log('Pool id:', pool.id);
    console.log('Pool name:', pool.name);
    console.log('Pool endpoint:', pool.metadata.endpoint);
    if (pool.implementation) {
      console.log('Pool implementation:', pool.implementation);
    }
    if (pool.assetTypeName) {
      console.log('Pool asset type:', pool.assetTypeName);
    }
    console.log('Pool url:', pool.poolUrls.deposit[0] || 'not set');
    console.log('Pool contract:', `${chain.explorerUrl}/address/${pool.address}#code`);
    console.log('Pool coins:', pool.coins.map(coin => coin.symbol).join(', '));
    if (pool.underlyingCoins) {
      console.log(
        'Pool underlying coins:',
        pool.underlyingCoins.map(coin => coin.symbol).join(', ')
      );
    }
    if (pool.zapAddress) {
      console.log('Pool zap contract:', `${chain.explorerUrl}/address/${pool.zapAddress}#code`);
      if (pool.onChain.zapCoins?.coins?.length) {
        console.log('Chain zap coins:', pool.onChain.zapCoins.coins.join(', '));
      }
      if (pool.onChain.zapCoins?.underlyingCoins?.length) {
        console.log(
          'Chain zap underlying coins:',
          pool.onChain.zapCoins.underlyingCoins.join(', ')
        );
      }
    }
  }

  const methods = await poolToMethods(pool);
  if (methods.length) {
    const zap: CurveStrategyOptions = {
      strategyId: 'curve',
      poolAddress: pool.address,
      methods,
    };

    return zap;
  } else {
    throw new Error(`No zap methods found for pool`);
  }
}

async function saveZap(chainId: string, vaultId: string, zap: CurveStrategyOptions) {
  const path = `./src/config/vault/${addressBookToAppId(chainId)}.json`;
  const vaults = await loadJson<VaultConfig[]>(path);
  let found = false;
  const modified = vaults.map(vault => {
    if (vault.id === vaultId) {
      found = true;
      return sortVaultKeys({
        ...vault,
        zaps: [zap],
      });
    }
    return vault;
  });
  if (!found) {
    throw new Error(`Vault ${vaultId} not found`);
  }

  await saveJson(path, modified, 'prettier');
}

async function start() {
  const args = getRunArgs();
  if (args.help) {
    return;
  }

  const zap = await discoverCurveZap(args);
  if (!args.quiet) {
    console.log('Zap:', JSON.stringify(zap, null, 2));
  }
  await saveZap(args.chain, args.vault, zap);
}

if (require.main === module) {
  start().catch(e => {
    console.error(e);
    process.exit(1);
  });
}
