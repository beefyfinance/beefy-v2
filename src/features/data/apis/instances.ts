import { sample } from 'lodash-es';
import {
  createDependencyFactory,
  createDependencyFactoryWithCacheByChain,
  createDependencyInitializerFactory,
} from '../utils/factory-utils';
import type { WalletConnectionOptions } from './wallet/wallet-connection-types';
import type { ISwapProvider } from './transact/swap/ISwapProvider';
import {
  featureFlag_disableKyber,
  featureFlag_disableOneInch,
  featureFlag_getContractDataApiChunkSize,
} from '../utils/feature-flags';
import { createPublicClient, type PublicClient } from 'viem';
import { buildViemChain } from './viem/chains';
import { makeCustomFallbackTransport } from './viem/transports';

export const getBeefyApi = createDependencyFactory(
  async ({ BeefyAPI }) => new BeefyAPI(),
  () => import('./beefy/beefy-api')
);

export const getConfigApi = createDependencyFactory(
  async ({ ConfigAPI }) => new ConfigAPI(),
  () => import('./config')
);

export const getAnalyticsApi = createDependencyFactory(
  async ({ AnalyticsApi }) => new AnalyticsApi(),
  () => import('./analytics/analytics')
);

export const getBeefyDataApi = createDependencyFactory(
  async ({ BeefyDataApi }) => new BeefyDataApi(),
  () => import('./beefy/beefy-data-api')
);

export const getMigrationApi = createDependencyFactory(
  async ({ MigrationApi }) => new MigrationApi(),
  () => import('./migration')
);

export const getBridgeApi = createDependencyFactory(
  async ({ BridgeApi }) => new BridgeApi(),
  () => import('./bridge/bridge-api')
);

export const getAxelarApi = createDependencyFactory(
  async ({ AxelarApi }) => new AxelarApi(),
  () => import('./axelar/axelar')
);

export const getOnRampApi = createDependencyFactory(
  async ({ OnRampApi }) => new OnRampApi(),
  () => import('./on-ramp/on-ramp')
);

export const getTransactApi = createDependencyFactory(
  async ({ TransactApi }) => new TransactApi(),
  () => import('./transact/transact')
);

export const getSwapAggregator = createDependencyFactory(
  async ({ SwapAggregator, WNativeSwapProvider, OneInchSwapProvider, KyberSwapProvider }) => {
    const providers: ISwapProvider[] = [new WNativeSwapProvider()];

    if (!featureFlag_disableOneInch()) {
      providers.push(new OneInchSwapProvider());
    }

    if (!featureFlag_disableKyber()) {
      providers.push(new KyberSwapProvider());
    }

    return new SwapAggregator(providers);
  },
  () => import('./transact/swap')
);

export const getWalletConnectionApi = createDependencyInitializerFactory(
  async (options: WalletConnectionOptions, { WalletConnectionApi }) =>
    new WalletConnectionApi(options),
  () => import('./wallet/wallet-connection')
);

export const getWeb3Instance = createDependencyFactoryWithCacheByChain(
  async (chain, { rateLimitWeb3Instance, createWeb3Instance, PQueue }) => {
    // pick one RPC endpoint at random
    const rpc = sample(chain.rpc);
    if (!rpc) throw new Error(`No RPC endpoint found for chain ${chain.id}`);

    const requestsPerSecond = 10; // may need to be configurable per rpc [ankr allows ~30 rps]
    const queue = new PQueue({
      concurrency: requestsPerSecond,
      intervalCap: requestsPerSecond,
      interval: 1000,
      carryoverConcurrencyCount: true,
      autoStart: true,
    });

    console.debug(`Instantiating rate-limited Web3 for chain ${chain.id} via ${rpc}`);
    return rateLimitWeb3Instance(createWeb3Instance(rpc), queue);
  },
  async () => {
    const [web3, PQueue] = await Promise.all([import('../../../helpers/web3'), import('p-queue')]);
    return { ...web3, PQueue: PQueue.default };
  }
);

export const getPublicClient = createDependencyFactoryWithCacheByChain(
  async (chain): Promise<PublicClient> => {
    return createPublicClient({
      batch: {
        multicall: {
          batchSize: featureFlag_getContractDataApiChunkSize(chain.id),
          wait: 100,
        },
      },
      chain: buildViemChain(chain),
      transport: makeCustomFallbackTransport(chain.rpc),
    });
  },
  async () => undefined
);

export const getGasPricer = createDependencyFactoryWithCacheByChain(
  async (chain, { createGasPricer }) => createGasPricer(chain),
  () => import('./gas-prices')
);

export const getContractDataApi = createDependencyFactoryWithCacheByChain(
  async (chain, { ContractDataAPI }) => new ContractDataAPI(await getWeb3Instance(chain), chain),
  () => import('./contract-data')
);

export const getBalanceApi = createDependencyFactoryWithCacheByChain(
  async (chain, { BalanceAPI }) => new BalanceAPI(await getWeb3Instance(chain), chain),
  () => import('./balance')
);

export const getAllowanceApi = createDependencyFactoryWithCacheByChain(
  async (chain, { AllowanceAPI }) => new AllowanceAPI(await getWeb3Instance(chain), chain),
  () => import('./allowance')
);

export const getMintersApi = createDependencyFactoryWithCacheByChain(
  async (chain, { MinterApi }) => new MinterApi(await getWeb3Instance(chain), chain),
  () => import('./minter/minter')
);

export const getOneInchApi = createDependencyFactoryWithCacheByChain(
  async (chain, { OneInchApi }) => new OneInchApi(chain),
  () => import('./one-inch')
);

export const getKyberSwapApi = createDependencyFactoryWithCacheByChain(
  async (chain, { KyberSwapApi }) => new KyberSwapApi(chain),
  () => import('./kyber')
);
