import {
  addressBookToAppId,
  type AppChainId,
  appToAddressBookId,
  getAmmsForChain,
  getChain,
  getChainRpc,
  getVaultsForChain,
} from '../common/config.ts';
import type {
  AmmConfigBalancer,
  ChainConfig,
  VaultConfig,
} from '../../src/features/data/apis/config-types.ts';
import type { NonEmptyArray } from '../common/utils.ts';
import { isNonEmptyArray } from '../common/utils.ts';
import type { OptionalRecord } from '../../src/features/data/utils/types-utils.ts';
import type { Address, Hex } from 'viem';
import { createPublicClient, getAddress, http, parseAbi } from 'viem';
import PQueue from 'p-queue';
import { join as pathJoin } from 'node:path';
import { loadJson, saveJson, withFileCache } from '../common/files.ts';
import { createCachedFactory, createFactory } from '../../src/features/data/utils/factory-utils.ts';
import type { Token } from 'blockchain-addressbook';
import { addressBook } from 'blockchain-addressbook';
import { sortBy } from 'lodash-es';
import platforms from '../../src/config/platforms.json';
import type {
  BalancerStrategyConfig,
  OptionalStrategySwapConfig,
} from '../../src/features/data/apis/transact/strategies/strategy-configs.ts';
import { sortVaultKeys } from '../common/vault-fields.ts';
import { type RunArgs } from '../addBeraSwapZap.ts';

const cacheBasePath = pathJoin(__dirname, '..', '.cache', 'scripts', 'beraswap');
const cacheApiPath = pathJoin(cacheBasePath, 'api');
const cacheRpcPath = pathJoin(cacheBasePath, 'rpc');
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const ZERO_BYTES32 = `0x${'0'.repeat(32 * 2)}` as const;

type BeraSwapPoolType = 'ComposableStable' | 'Weighted';

type BeraSwapPoolToken<TAddress = Address> = {
  index: number;
  address: TAddress;
  symbol: string;
  decimals: number;
};

type BeraSwapApiPool<TType = BeraSwapPoolType, TAddress = Address> = {
  id: Hex;
  address: TAddress;
  name: string;
  symbol: string;
  poolType: TType;
  poolTypeVersion: number;
  tokens: Array<BeraSwapPoolToken<TAddress>>;
  factory: TAddress;
  owner: TAddress;
};

type RpcPool = {
  poolId: Hex;
  vaultAddress: Address;
  chainId: AppChainId;
  tokenRates?: readonly [bigint, bigint];
  normalizedWeights?: readonly bigint[];
  scalingFactors?: readonly bigint[];
  actualSupply?: bigint;
  totalSupply: bigint;
};

type RpcToken = {
  tokenAddress: Address;
  chainId: AppChainId;
  metaDepositTypeHash?: Hex;
  metaWithdrawTypeHash?: Hex;
  assetAddress?: Address;
};

type Pool = RpcPool & BeraSwapApiPool;

export const supportedChainIds = new Set<AppChainId>(['berachain']);

const supportedPoolTypes: Record<string, { min: number; max: number }> = {
  ComposableStable: { min: 6, max: 6 },
  Weighted: { min: 4, max: 4 },
} satisfies OptionalRecord<BeraSwapPoolType, { min: number; max: number }>;

const beraSwapPoolQuery = `
query Pool($id: ID!){
  pool(id: $id) {
    id
    address
    name
    symbol
    poolType
    poolTypeVersion
    factory
    owner
    tokens {
      index
      address
      symbol
      decimals
    }
  }
}`;

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

type ZapSwaps = {
  [chainId: string]: {
    [tokenAddress: string]: {
      [providerId: string]: boolean;
    };
  };
};

const getZapSwaps = createFactory(async () => {
  const response = await fetch(`https://api.beefy.finance/zap/swaps?_=${Date.now()}`);
  return (await response.json()) as ZapSwaps;
});

type TokenPrices = {
  [oracleId: string]: number;
};

const getTokenPrices = createFactory(async () => {
  const prices = await Promise.all(
    ['prices', 'lps'].map(async type => {
      const response = await fetch(`https://api.beefy.finance/${type}?_=${Date.now()}`);
      return (await response.json()) as TokenPrices;
    })
  );
  return Object.assign({}, ...prices) as TokenPrices;
});

function createViemClient(chainId: AppChainId, chain: ChainConfig) {
  return createPublicClient({
    batch: {
      multicall: {
        batchSize: 128,
        wait: 100,
      },
    },
    chain: {
      id: chain.chainId,
      name: chain.name,
      nativeCurrency: {
        decimals: 18,
        name: chain.native.symbol,
        symbol: chain.native.symbol,
      },
      rpcUrls: {
        public: { http: [getChainRpc(chainId)] },
        default: { http: [getChainRpc(chainId)] },
      },
      blockExplorers: {
        default: { name: `${chain.name} Explorer`, url: chain.explorerUrl },
      },
      contracts: {
        multicall3: {
          address: chain.multicall3Address,
        },
      },
    },
    transport: http(),
  });
}

const getViemClient = createCachedFactory(
  (chainId: AppChainId) => createViemClient(chainId, getChain(chainId)),
  (chainId: AppChainId) => chainId
);

function fulfilledOr<TResult, TDefault>(
  result: PromiseSettledResult<TResult>,
  defaultValue: TDefault
): TResult | TDefault {
  return result.status === 'fulfilled' ? result.value : defaultValue;
}

const fetchPoolRpcData = withFileCache(
  async (poolAddress: Address, chainId: AppChainId): Promise<RpcPool> => {
    const client = getViemClient(chainId);
    const [
      poolIdRes,
      vaultAddressRes,
      tokenRatesRes,
      normalizedWeightsRes,
      scalingFactorsRes,
      actualSupplyRes,
      totalSupplyRes,
    ] = await Promise.allSettled([
      client.readContract({
        address: poolAddress,
        abi: parseAbi(['function getPoolId() public view returns (bytes32)']),
        functionName: 'getPoolId',
      }),
      client.readContract({
        address: poolAddress,
        abi: parseAbi(['function getVault() public view returns (address)']),
        functionName: 'getVault',
      }),
      client.readContract({
        address: poolAddress,
        abi: parseAbi(['function getTokenRates() public view returns (uint256,uint256)']),
        functionName: 'getTokenRates',
      }),
      client.readContract({
        address: poolAddress,
        abi: parseAbi(['function getNormalizedWeights() public view returns (uint256[])']),
        functionName: 'getNormalizedWeights',
      }),
      client.readContract({
        address: poolAddress,
        abi: parseAbi(['function getScalingFactors() public view returns (uint256[])']),
        functionName: 'getScalingFactors',
      }),
      client.readContract({
        address: poolAddress,
        abi: parseAbi(['function getActualSupply() public view returns (uint256)']),
        functionName: 'getActualSupply',
      }),
      client.readContract({
        address: poolAddress,
        abi: parseAbi(['function totalSupply() public view returns (uint256)']),
        functionName: 'totalSupply',
      }),
    ]);

    const vaultAddress = fulfilledOr(vaultAddressRes, undefined);
    const poolId = fulfilledOr(poolIdRes, undefined);
    const tokenRates = fulfilledOr(tokenRatesRes, undefined);
    const normalizedWeights = fulfilledOr(normalizedWeightsRes, undefined);
    const scalingFactors = fulfilledOr(scalingFactorsRes, undefined);
    const actualSupply = fulfilledOr(actualSupplyRes, undefined);
    const totalSupply = fulfilledOr(totalSupplyRes, undefined);

    if (!vaultAddress || vaultAddress === ZERO_ADDRESS) {
      throw new Error(`No vault address found via vault.want().getVault()`);
    }
    if (!poolId || poolId === ZERO_BYTES32) {
      throw new Error(`No pool id found via vault.want().getPoolId()`);
    }
    if (!totalSupply) {
      throw new Error(`No total supply found via vault.want().totalSupply()`);
    }

    return {
      poolId,
      vaultAddress,
      chainId,
      tokenRates,
      normalizedWeights,
      scalingFactors,
      totalSupply,
      actualSupply,
    };
  },
  (poolAddress: Address, chainId: AppChainId) =>
    pathJoin(cacheRpcPath, chainId, `pool-${poolAddress}.json`)
);

const fetchTokenRpcData = withFileCache(
  async (tokenAddress: Address, chainId: AppChainId): Promise<RpcToken> => {
    const client = getViemClient(chainId);
    const [metaDepositTypeHashRes, metaWithdrawTypeHashRes, assetRes] = await Promise.allSettled([
      client.readContract({
        address: tokenAddress,
        abi: parseAbi(['function METADEPOSIT_TYPEHASH() public view returns (bytes32)']),
        functionName: 'METADEPOSIT_TYPEHASH',
      }),
      client.readContract({
        address: tokenAddress,
        abi: parseAbi(['function METAWITHDRAWAL_TYPEHASH() public view returns (bytes32)']),
        functionName: 'METAWITHDRAWAL_TYPEHASH',
      }),
      client.readContract({
        address: tokenAddress,
        abi: parseAbi(['function asset() public view returns (address)']),
        functionName: 'asset',
      }),
    ]);

    const metaDepositTypeHash = fulfilledOr(metaDepositTypeHashRes, undefined);
    const metaWithdrawTypeHash = fulfilledOr(metaWithdrawTypeHashRes, undefined);
    const assetAddress = fulfilledOr(assetRes, undefined);

    return { tokenAddress, chainId, metaDepositTypeHash, metaWithdrawTypeHash, assetAddress };
  },
  (tokenAddress: Address, chainId: AppChainId) =>
    pathJoin(cacheRpcPath, chainId, `token-${tokenAddress}.json`)
);

const beraSwapApiQueue = new PQueue({
  concurrency: 1,
  interval: 1000,
  intervalCap: 1,
  autoStart: true,
  carryoverConcurrencyCount: true,
  throwOnTimeout: true,
});

beraSwapApiQueue.on('next', () => {
  console.log(
    `[BeraSwapApi] Pending: ${beraSwapApiQueue.pending + 1} Size: ${beraSwapApiQueue.size}`
  );
});

class BeraSwapApiPoolValidateError extends Error {
  constructor(
    public readonly pool: BeraSwapApiPool<string, string>,
    message: string
  ) {
    super(message);
    this.name = 'BeraSwapApiPoolValidateError';
  }

  toString() {
    return `${this.name}: ${this.message}\n${JSON.stringify(this.pool, null, 2)}`;
  }
}

function validateBeraSwapApiPool(pool: BeraSwapApiPool<string, string>): BeraSwapApiPool {
  const poolTypeSupport = supportedPoolTypes[pool.poolType];
  if (!poolTypeSupport) {
    throw new BeraSwapApiPoolValidateError(pool, `Unsupported pool type ${pool.poolType}`);
  }

  if (pool.poolTypeVersion < poolTypeSupport.min || pool.poolTypeVersion > poolTypeSupport.max) {
    throw new BeraSwapApiPoolValidateError(
      pool,
      `Unsupported pool type version ${pool.poolType} version ${pool.poolTypeVersion} [supported: ${poolTypeSupport.min} -> ${poolTypeSupport.max}]`
    );
  }

  return {
    ...pool,
    address: getAddress(pool.address),
    owner: getAddress(pool.owner),
    factory: getAddress(pool.factory),
    poolType: pool.poolType as BeraSwapPoolType,
    tokens: sortBy(
      pool.tokens.map(t => ({
        ...t,
        address: getAddress(t.address),
      })),
      p => p.index
    ),
  };
}

const fetchPoolApiData = withFileCache(
  async (poolId: Hex): Promise<BeraSwapApiPool<string, string>> => {
    const response = await beraSwapApiQueue.add(
      () =>
        fetch(
          'https://api.goldsky.com/api/public/project_clq1h5ct0g4a201x18tfte5iv/subgraphs/bex-subgraph/mainnet-v1.0.1/gn',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              query: beraSwapPoolQuery,
              variables: { id: poolId },
            }),
          }
        ),
      {
        throwOnTimeout: true,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch pool data from BeraSwap api: ${response.status} ${response.statusText}`
      );
    }

    const result = (await response.json()) as {
      data?: { pool?: BeraSwapApiPool<string, string> };
    };

    const pool = result?.data?.pool;
    if (pool && pool.id === poolId) {
      return pool;
    }

    throw new Error('No pool result from BeraSwap api');
  },
  (poolId: Hex) => pathJoin(cacheApiPath, `${poolId}.json`)
);

const getPoolApiData = createCachedFactory(
  async (forceUpdate: boolean, poolId: Hex) =>
    validateBeraSwapApiPool(await fetchPoolApiData(forceUpdate, poolId)),
  (_, poolId: Hex) => poolId
);

const getPoolRpcData = createCachedFactory(
  fetchPoolRpcData,
  (_, poolAddress: Address) => poolAddress
);

type PoolToken = BeraSwapPoolToken & {
  abToken?: Token;
  price?: number;
  swapProviders: string[];
  rpcToken: RpcToken;
  isBPT: boolean;
};

async function getPoolTokens(
  pool: Pool,
  prices: TokenPrices,
  swaps: ZapSwaps,
  forceUpdate: boolean = false
) {
  const { tokenAddressMap } = addressBook[appToAddressBookId(pool.chainId)];

  const tokensWithBpt = await Promise.all(
    pool.tokens.map(async poolToken => {
      const isBPT = poolToken.address === pool.address;
      const abToken = tokenAddressMap[poolToken.address];
      if (abToken && abToken.decimals !== poolToken.decimals) {
        throw new Error(
          `Address book token decimals mismatch ${poolToken.symbol} (${poolToken.address}) ${poolToken.decimals} vs ${abToken.decimals}`
        );
      }
      const rpcToken = await fetchTokenRpcData(forceUpdate, poolToken.address, pool.chainId);
      const price = abToken ? prices[abToken.oracleId] : undefined;
      const swapProviders = Object.entries(swaps[pool.chainId]?.[poolToken.address] || {})
        .filter(([, v]) => v)
        .map(([k]) => k);
      return {
        ...poolToken,
        isBPT,
        abToken,
        price,
        swapProviders,
        rpcToken,
      } satisfies PoolToken;
    })
  );

  return { tokensWithBpt, tokens: tokensWithBpt.filter(t => !t.isBPT) };
}

function logTokens(tokens: PoolToken[]) {
  console.table(
    tokens.map(t => ({
      symbol: t.symbol,
      address: t.address,
      addressBook: !!t.abToken,
      price: t.price,
      swapProviders: t.swapProviders.length ? t.swapProviders : false,
    }))
  );
}

function checkWeightedPool(pool: Pool, tokens: PoolToken[], tokensWithBpt: PoolToken[]): boolean {
  if (tokensWithBpt.length !== tokens.length) {
    throw new Error(`${pool.poolType}: Did not expect BPT token in pool`);
  }

  if (tokens.every(t => !t.abToken || !t.price)) {
    logTokens(tokens);
    throw new Error(
      `${pool.poolType}: At least one token must be in the address book and have a price`
    );
  }

  if (tokens.every(t => !t.abToken || !t.price || !t.swapProviders.length)) {
    console.warn(
      `${pool.poolType}: No tokens are in the address book, have a price, and have a zap swap provider - only pool tokens will be available for deposit`
    );
  }

  if (!pool.normalizedWeights) {
    throw new Error(`${pool.poolType}: Tokens must have normalized weights`);
  }

  if (pool.normalizedWeights.length !== pool.tokens.length) {
    throw new Error(
      `${pool.poolType}: Normalized weights length ${pool.normalizedWeights.length} does not match tokens length ${pool.tokens.length}`
    );
  }

  return true;
}

function checkComposableStablePool(
  pool: Pool,
  tokens: PoolToken[],
  tokensWithBpt: PoolToken[]
): boolean {
  if (tokens.length !== tokensWithBpt.length - 1) {
    throw new Error(
      `${pool.poolType}: Expected 1 BPT token [${tokensWithBpt.length - tokens.length} found]`
    );
  }

  if (tokens.every(t => !t.abToken || !t.price)) {
    logTokens(tokens);
    throw new Error(
      `${pool.poolType}: At least one token must be in the address book and have a price`
    );
  }

  if (tokens.every(t => !t.abToken || !t.price || !t.swapProviders.length)) {
    console.warn(
      `${pool.poolType}: No tokens are in the address book, have a price, and have a zap swap provider - only pool tokens will be available for deposit`
    );
  }

  if (!pool.actualSupply) {
    throw new Error(`${pool.poolType}: Must have getActualSupply()`);
  }

  return true;
}

const poolTypeToChecker: Record<
  BeraSwapPoolType,
  (pool: Pool, tokens: PoolToken[], tokensWithBpt: PoolToken[]) => boolean
> = {
  Weighted: checkWeightedPool,
  ComposableStable: checkComposableStablePool,
};

async function findAmmForPool(pool: Pool, tokenProviderId: string): Promise<AmmConfigBalancer> {
  const platform = platforms.find(p => p.id === tokenProviderId);
  if (!platform) {
    throw new Error(`No platform found for token provider id ${tokenProviderId}`);
  }

  const amms = await getAmmsForChain(pool.chainId);
  if (!amms.length) {
    throw new Error(`No AMMs found for chain ${pool.chainId}`);
  }

  const amm = amms.find(
    (a): a is AmmConfigBalancer => a.type === 'balancer' && a.vaultAddress === pool.vaultAddress
  );
  if (!amm) {
    console.log(
      JSON.stringify({
        id: `${pool.chainId}-${tokenProviderId}`,
        type: 'balancer',
        name: platform.name,
        vaultAddress: pool.vaultAddress,
      })
    );
    throw new Error(
      `No BeraSwap AMM with vaultAddress ${pool.vaultAddress} found on chain ${pool.chainId}`
    );
  }

  return amm;
}

function isAaveToken(token: PoolToken) {
  return (
    token.rpcToken.assetAddress &&
    token.rpcToken.metaDepositTypeHash ===
      '0x2a83c73b9e01ec0a1b95ff05940d809179668cc004230412d7047ffac3846ce7' &&
    token.rpcToken.metaWithdrawTypeHash ===
      '0x406ef09971b1bfa50a48ce277d3302602d78c94d58a376e8953b590702de7b31'
  );
}

export async function discoverBeraSwapZap(args: RunArgs) {
  const chainId = addressBookToAppId(args.chain || 'berachain');
  if (!supportedChainIds.has(chainId)) {
    throw new Error(`Unsupported chain ${chainId}`);
  }

  const chain = getChain(chainId);
  const vault = await getVault(chainId, args.vault);
  if (!vault.tokenAddress) {
    throw new Error(`No vault address found for vault ${vault.id}`);
  }
  if (!vault.tokenProviderId) {
    throw new Error(`No token provider id found for vault ${vault.id}`);
  }
  const poolAddress = getAddress(vault.tokenAddress);

  if (!args.quiet) {
    console.log('=== Vault ===');
    console.log('Id:', vault.id);
    console.log('Chain:', chain.name);
    console.log('Assets:', vault.assets?.length ? vault.assets.join(', ') : 'not set');
    console.log('Want:', poolAddress);
  }

  const rpcPool = await getPoolRpcData(!!args.update, poolAddress, chainId);
  if (!args.quiet) {
    console.log('=== Pool ===');
    console.log('Id:', rpcPool.poolId);
    console.log('Vault:', rpcPool.vaultAddress);
  }

  const apiPool = await getPoolApiData(!!args.update, rpcPool.poolId);
  const pool: Pool = {
    ...rpcPool,
    ...apiPool,
  };

  if (!args.quiet) {
    console.log('Name:', apiPool.name);
    console.log('Symbol:', apiPool.symbol);
    console.log('Type:', `${apiPool.poolType} v${apiPool.poolTypeVersion}`);
    console.log('Tokens:');
    console.log(
      apiPool.tokens
        .map(
          t =>
            `  ${t.index} ${t.symbol} (${t.address})${
              t.address === apiPool.address ? ' [self]' : ''
            }`
        )
        .join('\n')
    );
  }

  const [swaps, prices] = await Promise.all([getZapSwaps(), getTokenPrices()]);
  const { tokens, tokensWithBpt } = await getPoolTokens(pool, prices, swaps);
  const checker = poolTypeToChecker[pool.poolType];
  if (!checker) {
    throw new Error(`No checker found for pool type ${pool.poolType}`);
  }
  if (!checker(pool, tokens, tokensWithBpt)) {
    throw new Error(`Checker failed for pool type ${pool.poolType}`);
  }

  const amm = await findAmmForPool(pool, vault.tokenProviderId);
  if (!args.quiet) {
    console.log('=== AMM ===');
    console.log('Id:', amm.id);
    console.log('Name:', amm.name);
    console.log('Vault:', amm.vaultAddress);
  }

  const swapConfig: OptionalStrategySwapConfig =
    tokens.some(isAaveToken) ?
      {
        swap: {
          blockProviders: ['kyber', 'one-inch'],
        },
      }
    : {};

  const type = pool.poolType;
  switch (type) {
    case 'ComposableStable': {
      return {
        strategyId: 'balancer',
        ammId: amm.id,
        poolId: apiPool.id,
        poolType: transformPoolType(type),
        tokens: tokens.map(t => t.address),
        bptIndex: tokensWithBpt.findIndex(t => t.isBPT),
        hasNestedPool: false, // tokens.some(t => t.hasNestedPool), TODO api does not return this
        ...swapConfig,
      } satisfies BalancerStrategyConfig;
    }
    case 'Weighted': {
      return {
        strategyId: 'balancer',
        ammId: amm.id,
        poolId: apiPool.id,
        poolType: transformPoolType(type),
        tokens: apiPool.tokens.map(t => t.address),
        ...swapConfig,
      } satisfies BalancerStrategyConfig;
    }
    default: {
      throw new Error(`Unsupported pool type ${pool.poolType}`);
    }
  }
}

type Hyphenate<T extends string> =
  T extends `${infer Head}${infer Tail}` ?
    `${Head extends Capitalize<Head> ? '-' : ''}${Lowercase<Head>}${Hyphenate<Tail>}`
  : Lowercase<T>;

type TransformPoolType<T extends string> =
  T extends `${infer First}${infer Rest}` ? Hyphenate<`${Lowercase<First>}${Rest}`> : Hyphenate<T>;

function transformPoolType<T extends BeraSwapPoolType>(input: T): TransformPoolType<T> {
  return input
    .replace(/([A-Z][a-z]+)/g, '-$1')
    .toLowerCase()
    .replace(/^-+/, '') as TransformPoolType<T>;
}

export async function saveBeraSwapZap(
  chainId: string,
  vaultId: string,
  zap: BalancerStrategyConfig
) {
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
