import {
  createDependencyFactory,
  createDependencyFactoryWithCacheByChain,
  createDependencyInitializerFactory,
} from '../utils/factory-utils';
import type { WalletConnectionOptions } from './wallet/wallet-connection-types';
import type { ISwapProvider } from './transact/swap/ISwapProvider';
import {
  featureFlag_disableKyber,
  featureFlag_disableOdos,
  featureFlag_disableOneInch,
  featureFlag_getContractDataApiChunkSize,
} from '../utils/feature-flags';
import { createPublicClient, type PublicClient } from 'viem';
import { buildViemChain } from './viem/chains';
import { makeCustomFallbackTransport } from './viem/transports';
import type { ChainEntity, ChainId } from '../entities/chain';

export const getBeefyApi = createDependencyFactory(
  async ({ BeefyAPI }) => new BeefyAPI(),
  () => import('./beefy/beefy-api')
);

export const getConfigApi = createDependencyFactory(
  async ({ ConfigAPI }) => new ConfigAPI(),
  () => import('./config')
);

export const getDatabarnApi = createDependencyFactory(
  async ({ DatabarnApi }) => new DatabarnApi(),
  () => import('./databarn/databarn-api')
);

export const getClmApi = createDependencyFactory(
  async ({ ClmApi }) => new ClmApi(),
  () => import('./clm/clm-api')
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

export const getOnRampApi = createDependencyFactory(
  async ({ OnRampApi }) => new OnRampApi(),
  () => import('./on-ramp/on-ramp')
);

export const getTransactApi = createDependencyFactory(
  async ({ TransactApi }) => new TransactApi(),
  () => import('./transact/transact')
);

export const getMerklRewardsApi = createDependencyFactory(
  async ({ MerklRewardsApi }) => new MerklRewardsApi(),
  () => import('./rewards/merkl/merkl-api')
);

export const getStellaSwapRewardsApi = createDependencyFactory(
  async ({ StellaSwapRewardsApi }) => new StellaSwapRewardsApi(),
  () => import('./rewards/stellaswap/stellaswap-api')
);

export const getSwapAggregator = createDependencyFactory(
  async ({
    SwapAggregator,
    WNativeSwapProvider,
    OneInchSwapProvider,
    KyberSwapProvider,
    OdosSwapProvider,
  }) => {
    const providers: ISwapProvider[] = [new WNativeSwapProvider()];

    if (!featureFlag_disableOneInch()) {
      providers.push(new OneInchSwapProvider());
    }

    if (!featureFlag_disableKyber()) {
      providers.push(new KyberSwapProvider());
    }

    if (!featureFlag_disableOdos()) {
      providers.push(new OdosSwapProvider());
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
  async (chain, { ContractDataAPI }) => new ContractDataAPI(chain),
  () => import('./contract-data')
);

export const getBalanceApi = createDependencyFactoryWithCacheByChain(
  async (chain, { BalanceAPI }) => new BalanceAPI(chain),
  () => import('./balance')
);

export const getAllowanceApi = createDependencyFactoryWithCacheByChain(
  async (chain, { AllowanceAPI }) => new AllowanceAPI(chain),
  () => import('./allowance')
);

export const getMintersApi = createDependencyFactoryWithCacheByChain(
  async (chain, { MinterApi }) => new MinterApi(chain),
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

export const getOdosApi = createDependencyFactoryWithCacheByChain(
  async (chain, { OdosApi }) => new OdosApi(chain),
  () => import('./odos')
);

export const getNameServicesApi = createDependencyInitializerFactory(
  async (chainIdToEntity: Record<ChainId, ChainEntity>, { NameServicesApi }) =>
    new NameServicesApi(chainIdToEntity),
  () => import('./name-services/name-services-api')
);
