import type {
  DataLoaderState,
  LoaderKeys,
  LoaderNotification,
  LoaderNotificationCategory,
  LoaderNotificationCategoryMap,
  LoaderNotificationKey,
  LoaderState,
} from './data-loader-types.ts';
import type { ChainId } from '../entities/chain.ts';
import { strictEntries } from '../../../helpers/object.ts';

const notificationCategories: LoaderNotificationCategoryMap = {
  rpc: {
    global: [
      // 'beGemsCampaign', // rpc error for S1, but no chain in action
      // 'boostForm', likely rpc error but there is no chain in action
      // 'minterForm', likely rpc error but there is no chain in action
    ],
    chain: ['contractData'],
    addressChain: ['balance', 'allowance'],
  },
  api: {
    global: [
      'analytics',
      'apy',
      'articles',
      'avgApy',
      'beGemsCampaign', // S2
      'currentCowcentratedRanges',
      'fees',
      'lastHarvests',
      'merklCampaigns',
      // 'merklRewards', 3rd-party api, not beefy
      'prices',
      'proposals',
      'revenue',
      // 'stellaSwapRewards', 3rd-party api, not beefy
      'treasury',
      'zapAggregatorTokenSupport',
    ],
    addressGlobal: [
      'timeline',
      // 'dashboard', rpc, no chain or 3rd party api, not beefy
      'clmHarvests',
      // 'merklRewards', 3rd-party api, not beefy
      // 'stellaSwapRewards', 3rd-party api, not beefy
    ],
    addressChain: ['clmHarvests'],
  },
  config: {
    global: [
      'addressBook',
      'bridgeConfig',
      'bridges',
      'chainConfig',
      'curators',
      'migrators',
      'minters',
      'platforms',
      'promos',
      'vaults',
      'zapAmms',
      'zapConfigs',
      'zapSwapAggregators',
    ],
    chain: ['addressBook'],
  },
};

const statusKeys: LoaderKeys = Object.values(notificationCategories).reduce(
  (allKeys, categoryKeys) => {
    for (const scope of ['global', 'chain', 'addressGlobal', 'addressChain'] as const) {
      const keys = categoryKeys[scope];
      if (keys && keys.length > 0) {
        const scopeKeys = allKeys[scope] || [];
        for (const key of keys) {
          if (!scopeKeys.includes(key)) {
            scopeKeys.push(key);
          }
        }
        allKeys[scope] = scopeKeys;
      }
    }
    return allKeys;
  },
  {} as Record<string, string[]>
);

function loaderLastRejected(loader: LoaderState | undefined) {
  if (!loader) {
    return false;
  }
  if (loader.status === 'rejected') {
    return true;
  }
  const { lastFulfilled, lastRejected } = loader;
  return !!lastRejected && (!lastFulfilled || lastRejected.timestamp > lastFulfilled.timestamp);
}

export type LoaderStatuses = { [K in LoaderState['status']]: boolean };

export function getStatus(
  globalState: DataLoaderState['global'],
  chainState: DataLoaderState['byChainId'],
  addressState?: DataLoaderState['byAddress'][string],
  excludeChainIds: ChainId[] = []
): LoaderStatuses {
  const ignoredChains = new Set(excludeChainIds);
  const statuses: LoaderStatuses = {
    idle: false,
    pending: false,
    rejected: false,
    fulfilled: false,
  };

  for (const key of statusKeys.global ?? []) {
    const loader = globalState[key];
    statuses[loader?.status || 'idle'] = true;
  }

  for (const key of statusKeys.chain ?? []) {
    for (const [chainId, chainLoaders] of strictEntries(chainState)) {
      if (!chainLoaders || ignoredChains.has(chainId)) {
        continue;
      }
      const loader = chainLoaders[key];
      statuses[loader?.status || 'idle'] = true;
    }
  }

  if (addressState) {
    for (const key of statusKeys.addressGlobal ?? []) {
      const loader = addressState.global[key];
      statuses[loader?.status || 'idle'] = true;
    }

    for (const key of statusKeys.addressChain ?? []) {
      for (const [chainId, chainLoaders] of strictEntries(addressState.byChainId)) {
        if (!chainLoaders || ignoredChains.has(chainId)) {
          continue;
        }
        const loader = chainLoaders[key];
        statuses[loader?.status || 'idle'] = true;
      }
    }
  }

  return statuses;
}

export function getNotifications(
  sliceState: DataLoaderState,
  walletAddress?: string
): { common: LoaderNotification[]; user?: LoaderNotification[] } {
  const ignoredChains = new Set(sliceState.statusIndicator.excludeChainIds);
  const addressState =
    walletAddress ? sliceState.byAddress[walletAddress.toLowerCase()] : undefined;
  const commonErrors = new Map<LoaderNotificationKey, LoaderNotification>();
  const userErrors = new Map<LoaderNotificationKey, LoaderNotification>();
  const addError = (
    map: Map<LoaderNotificationKey, LoaderNotification>,
    category: LoaderNotificationCategory,
    chainId?: ChainId
  ) => {
    const key: LoaderNotificationKey = chainId ? `${category}-${chainId}` : category;
    map.set(key, { key, category, chainId });
  };

  for (const [category, keys] of strictEntries(notificationCategories)) {
    const global = (keys.global ?? []).some(key => {
      const loader = sliceState.global[key];
      return loaderLastRejected(loader);
    });
    if (global) {
      addError(commonErrors, category);
    }

    (keys.chain ?? []).forEach(key => {
      for (const [chainId, loader] of strictEntries(sliceState.byChainId)) {
        if (!loader || ignoredChains.has(chainId)) {
          continue;
        }
        const chainLoader = loader[key];
        if (loaderLastRejected(chainLoader)) {
          addError(commonErrors, category, chainId);
        }
      }
    });

    if (addressState) {
      const addressGlobal = (keys.addressGlobal ?? []).some(key => {
        const addressLoader = addressState.global[key];
        return loaderLastRejected(addressLoader);
      });
      if (addressGlobal) {
        addError(userErrors, category);
      }

      (keys.addressChain ?? []).forEach(key => {
        for (const [chainId, loader] of strictEntries(addressState.byChainId)) {
          if (!loader || ignoredChains.has(chainId)) {
            continue;
          }
          const addressChainLoader = loader[key];
          if (loaderLastRejected(addressChainLoader)) {
            addError(userErrors, category, chainId);
          }
        }
      });
    }
  }

  return {
    common: Array.from(commonErrors.values()),
    user: walletAddress ? Array.from(userErrors.values()) : undefined,
  };
}
