import {
  createDependencyFactory,
  createDependencyFactoryWithCacheByChain,
  createDependencyInitializerFactory,
} from '../utils/factory-utils.ts';
import type { WalletConnectionOptions } from './wallet/wallet-connection-types.ts';
import type { ISwapProvider } from './transact/swap/ISwapProvider.ts';
import {
  featureFlag_disableKyber,
  featureFlag_disableLiquidSwap,
  featureFlag_disableOdos,
  featureFlag_disableOneInch,
} from '../utils/feature-flags.ts';

export const getBeefyApi = createDependencyFactory(
  async ({ BeefyAPI }) => new BeefyAPI(),
  () => import('./beefy/beefy-api.ts')
);

export const getConfigApi = createDependencyFactory(
  async ({ ConfigAPI }) => new ConfigAPI(),
  () => import('./config.ts')
);

export const getDatabarnApi = createDependencyFactory(
  async ({ DatabarnApi }) => new DatabarnApi(),
  () => import('./databarn/databarn-api.ts')
);

export const getClmApi = createDependencyFactory(
  async ({ ClmApi }) => new ClmApi(),
  () => import('./clm/clm-api.ts')
);

export const getBeefyDataApi = createDependencyFactory(
  async ({ BeefyDataApi }) => new BeefyDataApi(),
  () => import('./beefy/beefy-data-api.ts')
);

export const getMigrationApi = createDependencyFactory(
  async ({ MigrationApi }) => new MigrationApi(),
  () => import('./migration/migration.ts')
);

export const getBridgeApi = createDependencyFactory(
  async ({ BridgeApi }) => new BridgeApi(),
  () => import('./bridge/bridge-api.ts')
);

export const getOnRampApi = createDependencyFactory(
  async ({ OnRampApi }) => new OnRampApi(),
  () => import('./on-ramp/on-ramp.ts')
);

export const getTransactApi = createDependencyFactory(
  async ({ TransactApi }) => new TransactApi(),
  () => import('./transact/transact.ts')
);

export const getMerklRewardsApi = createDependencyFactory(
  async ({ MerklRewardsApi }) => new MerklRewardsApi(),
  () => import('./rewards/merkl/merkl-api.ts')
);

export const getStellaSwapRewardsApi = createDependencyFactory(
  async ({ StellaSwapRewardsApi }) => new StellaSwapRewardsApi(),
  () => import('./rewards/stellaswap/stellaswap-api.ts')
);

export const getSwapAggregator = createDependencyFactory(
  async ({
    SwapAggregator,
    WNativeSwapProvider,
    OneInchSwapProvider,
    KyberSwapProvider,
    OdosSwapProvider,
    LiquidSwapSwapProvider,
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

    if (!featureFlag_disableLiquidSwap()) {
      providers.push(new LiquidSwapSwapProvider());
    }

    return new SwapAggregator(providers);
  },
  () => import('./transact/swap/swap.ts')
);

export const getWalletConnectionApi = createDependencyInitializerFactory(
  async (options: WalletConnectionOptions, { WalletConnectionApi }) =>
    new WalletConnectionApi(options),
  () => import('./wallet/wallet-connection.ts')
);

export const getGasPricer = createDependencyFactoryWithCacheByChain(
  async (chain, { createGasPricer }) => createGasPricer(chain),
  () => import('./gas-prices/gas-prices.ts')
);

export const getContractDataApi = createDependencyFactoryWithCacheByChain(
  async (chain, { ContractDataAPI }) => new ContractDataAPI(chain),
  () => import('./contract-data/contract-data.ts')
);

export const getBalanceApi = createDependencyFactoryWithCacheByChain(
  async (chain, { BalanceAPI }) => new BalanceAPI(chain),
  () => import('./balance/balance.ts')
);

export const getAllowanceApi = createDependencyFactoryWithCacheByChain(
  async (chain, { AllowanceAPI }) => new AllowanceAPI(chain),
  () => import('./allowance/allowance.ts')
);

export const getMintersApi = createDependencyFactoryWithCacheByChain(
  async (chain, { MinterApi }) => new MinterApi(chain),
  () => import('./minter/minter.ts')
);

export const getOneInchApi = createDependencyFactoryWithCacheByChain(
  async (chain, { OneInchApi }) => new OneInchApi(chain),
  () => import('./one-inch/one-inch.ts')
);

export const getKyberSwapApi = createDependencyFactoryWithCacheByChain(
  async (chain, { KyberSwapApi }) => new KyberSwapApi(chain),
  () => import('./kyber/kyber.ts')
);

export const getOdosApi = createDependencyFactoryWithCacheByChain(
  async (chain, { OdosApi }) => new OdosApi(chain),
  () => import('./odos/odos.ts')
);

export const getLiquidSwapApi = createDependencyFactoryWithCacheByChain(
  async (chain, { LiquidSwapApi }) => new LiquidSwapApi(chain),
  () => import('./liquid-swap/liquid-swap.ts')
);

export const getNameServicesApi = createDependencyFactory(
  async ({ NameServicesApi }) => new NameServicesApi(),
  () => import('./name-services/name-services-api.ts')
);

export const getDivviApi = createDependencyFactory(
  async ({ DivviApi }) => new DivviApi(),
  () => import('./divvi/api.ts')
);
