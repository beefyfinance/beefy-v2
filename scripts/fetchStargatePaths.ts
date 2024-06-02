import { type Address, createPublicClient, http, parseAbi, type PublicClient } from 'viem';
import { type ChainEntity } from '../src/features/data/entities/chain';
import { chainsByAppId } from './common/chains';
import { buildViemChain } from '../src/features/data/apis/viem/chains';
import { sample } from 'lodash';
import { createDependencyFactoryWithCacheByChain } from '../src/features/data/utils/factory-utils';
import { getTokenByAddress } from './common/tokens';
import { groupBy } from 'lodash';
import { saveJson } from './common/files';

type Factory = {
  address: Address;
  chainId: ChainEntity['id'];
};

const factories: Factory[] = [
  { chainId: 'ethereum', address: '0x06D538690AF257Da524f25D0CD52fD85b1c2173E' },
  { chainId: 'bsc', address: '0xe7Ec689f432f29383f217e36e680B5C855051f25' },
  { chainId: 'avax', address: '0x808d7c71ad2ba3FA531b068a2417C63106BC0949' },
  { chainId: 'polygon', address: '0x808d7c71ad2ba3FA531b068a2417C63106BC0949' },
  { chainId: 'arbitrum', address: '0x55bDb4164D28FBaF0898e0eF14a589ac09Ac9970' },
  { chainId: 'optimism', address: '0xE3B53AF74a4BF62Ae5511055290838050bf764Df' },
  { chainId: 'fantom', address: '0x9d1B1669c73b033DFe47ae5a0164Ab96df25B944' },
  { chainId: 'metis', address: '0xAF54BE5B6eEc24d6BFACf1cce4eaF680A8239398' },
  { chainId: 'base', address: '0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6' },
  { chainId: 'linea', address: '0xAF54BE5B6eEc24d6BFACf1cce4eaF680A8239398' },
  { chainId: 'kava', address: '0xAF54BE5B6eEc24d6BFACf1cce4eaF680A8239398' },
  { chainId: 'mantle', address: '0xAF54BE5B6eEc24d6BFACf1cce4eaF680A8239398' },
];

const getPublicClient = createDependencyFactoryWithCacheByChain(
  async (chain): Promise<PublicClient> => {
    return createPublicClient({
      batch: {
        multicall: {
          batchSize: 25,
          wait: 200,
        },
      },
      chain: buildViemChain(chain),
      transport: http(process.env[`${String(chain.id).toUpperCase()}_RPC`] || sample(chain.rpc)),
    });
  },
  async () => undefined
);

const factoryAbi = parseAbi([
  'function allPoolsLength() view returns (uint256)',
  'function allPools(uint256) view returns (address)',
  'function router() view returns (address)',
]);

const routerAbi = parseAbi(['function bridge() view returns (address)']);

const bridgeAbi = parseAbi(['function layerZeroEndpoint() view returns (address)']);

const endpointAbi = parseAbi(['function chainId() view returns (uint16)']);

const poolAbi = parseAbi([
  'function chainPaths(uint256) view returns (bool,uint16,uint256,uint256,uint256,uint256,uint256,uint256)',
  'function getChainPathsLength() view returns (uint256)',
  'function convertRate() view returns (uint256)',
  'function feeLibrary() view returns (address)',
  'function sharedDecimals() view returns (uint256)',
  'function symbol() view returns (string)',
  'function token() view returns (address)',
  'function poolId() view returns (uint256)',
  'function stopSwap() view returns (bool)',
]);

function bigRange(n: bigint): bigint[] {
  const result: bigint[] = [];
  for (let i = BigInt(0); i < n; ++i) {
    result.push(i);
  }
  return result;
}

async function fetchPools(factoryAddress: Address, chain: ChainEntity) {
  const client = await getPublicClient(chain);
  const [allPoolsLength, routerAddress] = await Promise.all([
    client.readContract({
      address: factoryAddress,
      abi: factoryAbi,
      functionName: 'allPoolsLength',
      args: [],
    }),
    client.readContract({
      address: factoryAddress,
      abi: factoryAbi,
      functionName: 'router',
      args: [],
    }),
  ]);
  const bridgeAddress = await client.readContract({
    address: routerAddress,
    abi: routerAbi,
    functionName: 'bridge',
    args: [],
  });
  const endpointAddress = await client.readContract({
    address: bridgeAddress,
    abi: bridgeAbi,
    functionName: 'layerZeroEndpoint',
    args: [],
  });
  const rawChainId = await client.readContract({
    address: endpointAddress,
    abi: endpointAbi,
    functionName: 'chainId',
    args: [],
  });
  const stargateChainId = rawChainId < 100 ? rawChainId + 100 : rawChainId;

  const poolAddresses = await Promise.all(
    bigRange(allPoolsLength).map(async i => {
      return client.readContract({
        address: factoryAddress,
        abi: factoryAbi,
        functionName: 'allPools',
        args: [i],
      });
    })
  );

  const pools = await Promise.all(
    poolAddresses.map(async poolAddress => {
      const [
        chainPathsLength,
        convertRate,
        feeLibrary,
        sharedDecimals,
        symbol,
        rawTokenAddress,
        poolId,
        stopSwap,
      ] = await Promise.all([
        client.readContract({
          address: poolAddress,
          abi: poolAbi,
          functionName: 'getChainPathsLength',
          args: [],
        }),
        client.readContract({
          address: poolAddress,
          abi: poolAbi,
          functionName: 'convertRate',
          args: [],
        }),
        client.readContract({
          address: poolAddress,
          abi: poolAbi,
          functionName: 'feeLibrary',
          args: [],
        }),
        client.readContract({
          address: poolAddress,
          abi: poolAbi,
          functionName: 'sharedDecimals',
          args: [],
        }),
        client.readContract({
          address: poolAddress,
          abi: poolAbi,
          functionName: 'symbol',
          args: [],
        }),
        client.readContract({
          address: poolAddress,
          abi: poolAbi,
          functionName: 'token',
          args: [],
        }),
        client.readContract({
          address: poolAddress,
          abi: poolAbi,
          functionName: 'poolId',
          args: [],
        }),
        client.readContract({
          address: poolAddress,
          abi: poolAbi,
          functionName: 'stopSwap',
          args: [],
        }),
      ]);

      const paths = (
        await Promise.all(
          bigRange(chainPathsLength).map(async i => {
            const [ready, dstChainId, dstPoolId, weight, balance, lkb, credits, idealBalance] =
              await client.readContract({
                address: poolAddress,
                abi: poolAbi,
                functionName: 'chainPaths',
                args: [i],
              });
            return {
              ready,
              dstChainId,
              dstPoolId,
              weight,
              balance,
              lkb,
              credits,
              idealBalance,
            };
          })
        )
      ).filter(path => path.ready && path.idealBalance > BigInt(0));
      const tokenAddress = symbol === 'S*SGETH' ? 'native' : rawTokenAddress;
      const token = await getTokenByAddress(tokenAddress, chain.id);

      return {
        id: `${stargateChainId}:${poolId}`,
        poolId,
        poolAddress,
        tokenAddress,
        stargateChainId,
        chainId: chain.id,
        symbol,
        token,
        convertRate,
        feeLibrary,
        sharedDecimals,
        stopSwap,
        paths,
      };
    })
  );

  return pools.filter(pool => {
    if (pool.stopSwap) {
      console.log(`[SKIP][${pool.chainId}] Pool ${pool.symbol}#${pool.poolId}: is disabled`);
      return false;
    }
    if (pool.token === undefined) {
      console.log(
        `[SKIP][${pool.chainId}] Pool ${pool.symbol}#${pool.poolId}: token ${pool.symbol.slice(
          2
        )} ${pool.tokenAddress} not in address book`
      );
      return false;
    }

    return true;
  });
}

async function start() {
  const poolsPerChain = await Promise.all(
    factories.map(async factory => fetchPools(factory.address, chainsByAppId[factory.chainId]))
  );
  const allPools = poolsPerChain.flat();
  allPools.forEach(pool => {
    pool.paths = pool.paths.filter(path =>
      allPools.some(p => p.poolId === path.dstPoolId && p.stargateChainId === path.dstChainId)
    );
  });
  const poolsWithPaths = allPools.filter(pool => pool.paths.length > 0);

  const pools = poolsWithPaths.map(pool => ({
    id: pool.id,
    chainId: pool.chainId,
    symbol: pool.token!.symbol,
    poolAddress: pool.poolAddress,
    tokenAddress: pool.tokenAddress,
    convertRate: pool.convertRate.toString(),
    poolId: pool.poolId.toString(),
    feeLibraryAddress: pool.feeLibrary,
  }));

  const paths = poolsWithPaths.flatMap(pool =>
    pool.paths.map(path => ({
      source: pool.id,
      dest: `${path.dstChainId}:${path.dstPoolId}`,
    }))
  );

  await saveJson(
    './src/features/data/apis/transact/strategies/stargate-crosschain-single/stargate-pools.json',
    pools,
    'prettier'
  );
  await saveJson(
    './src/features/data/apis/transact/strategies/stargate-crosschain-single/stargate-paths.json',
    paths,
    'prettier'
  );
}

start().catch(e => {
  console.error(e);
  process.exit(1);
});
