import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { isEmpty, isObject } from '../../../helpers/utils';
import { byDecimals } from '../../../helpers/format';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import BigNumber from 'bignumber.js';
import lodash from 'lodash';
import { featuredPools } from '../../../config/vault/featured';

const FILTER_STORAGE_KEY = 'homeSortConfig';
export const FILTER_DEFAULT = {
  version: 2, // Bump+1 to force end user reset (e.g. if keys change)
  key: 'default',
  direction: 'desc',
  keyword: '',
  retired: false,
  zero: false,
  deposited: false,
  boost: false,
  platform: 'all',
  vault: 'all',
  blockchain: ['all'],
  category: 'all',
};

const SORT_COMPARE_FUNCTIONS = {
  apy: compareNumber,
  safetyScore: compareNumberCoerced,
  tvl: compareBigNumber,
  name: compareStringCaseInsensitive,
};

function compareNumber(a, b) {
  return ((a > b) as any) - ((a < b) as any);
}

function compareNumberCoerced(a, b) {
  return compareNumber(parseFloat(a), parseFloat(b));
}

function compareStringCaseInsensitive(a, b) {
  const lowercaseA = a.toLowerCase();
  const lowercaseB = b.toLowerCase();
  return ((lowercaseA > lowercaseB) as any) - ((lowercaseA < lowercaseB) as any);
}

function compareBigNumber(a, b) {
  if (a.lt(b)) return -1;
  if (a.gt(b)) return 1;
  return 0;
}

function isStoredConfigValid(stored) {
  if (!isObject(stored)) {
    return false;
  }

  return !(!stored.version || stored.version < FILTER_DEFAULT.version);
}

function selectVaults(state) {
  return state.vaultReducer.pools;
}

function selectAddress(state) {
  return state.walletReducer.address;
}

function selectTokenBalances(state) {
  return state.balanceReducer.tokens;
}

function selectBoostVaults(state) {
  return state.vaultReducer.boosts;
}

function useBoostArray() {
  const boostsVaults = useSelector(selectBoostVaults);
  return useMemo(() => Object.values(boostsVaults), [boostsVaults]);
}

function selectSortValue(key, vault) {
  switch (key) {
    case 'apy': {
      if (vault.isGovVault) return vault.apy?.vaultApr ?? 0;
      return vault.apy?.totalApy ?? 0;
    }
    default: {
      return vault[key];
    }
  }
}

function sortVaults(vaults, key, direction) {
  if (key in SORT_COMPARE_FUNCTIONS) {
    return vaults.sort((a, b) => {
      const valueA = selectSortValue(key, a);
      const valueB = selectSortValue(key, b);
      return SORT_COMPARE_FUNCTIONS[key](valueA, valueB) * (direction === 'asc' ? 1 : -1);
    });
  }

  return vaults;
}

//If token = vault.token check if he had balance in the wallet
//If token = vault.earnedToken check if he had deposited in the vault
function hasWalletBalance(token, tokenBalances, network, isGovVault) {
  let symbol = isGovVault ? `${token}GovVault` : token;
  return tokenBalances[network][symbol] !== undefined &&
    tokenBalances[network][symbol].balance &&
    tokenBalances[network][symbol].balance > 0
    ? false
    : true;
}

const isBoosted = (item, boostVaults) => {
  var ts = Date.now() / 1000;
  const boostedVault = lodash.filter(boostVaults, function (vault) {
    return (
      vault.poolId === item.id && vault.status === 'active' && parseInt(vault.periodFinish) > ts
    );
  });

  if (boostedVault.length !== 0) {
    return true;
  } else {
    return false;
  }
};

function keepUserVaults(userVaults, vault) {
  if (userVaults[vault.id]) return false;
  return true;
}

function keepVault(vault, config, address, tokenBalances, userVaults, boostVaults) {
  if (config.retired) {
    // hide non-retired
    if (vault.status !== 'eol') {
      return false;
    }
  } else {
    // hide retired
    if (vault.status === 'eol') {
      return false;
    }
  }

  // hide when no wallet balance of deposit token
  if (
    config.zero &&
    address &&
    hasWalletBalance(vault.token, tokenBalances, vault.network, vault.isGovVault)
  ) {
    return false;
  }

  // hide when no wallet balance of deposit token
  // TODO show the vaults with mooToken
  if (config.deposited && address && userVaults && keepUserVaults(userVaults, vault)) {
    return false;
  }

  // hide when vault is not boosted
  if (config.boost && !isBoosted(vault, boostVaults)) {
    return false;
  }

  // hide when selected platform does not match
  if (
    config.platform !== 'all' &&
    (isEmpty(vault.platform) || config.platform.toLowerCase() !== vault.platform.toLowerCase())
  ) {
    return false;
  }

  // hide when vault type does not match
  if (config.vault !== 'all' && config.vault !== vault.vaultType) {
    return false;
  }

  // hide network does not match
  if (!config.blockchain.includes('all') && !config.blockchain.includes(vault.network)) {
    return false;
  }

  // hide when category/tag does not match
  if (
    config.category !== 'all' &&
    config.category !== 'featured' &&
    !vault.tags.includes(config.category)
  ) {
    return false;
  }

  if (config.category === 'featured' && !featuredPools[vault.id]) {
    return false;
  }

  // hide when neither name includes keyword nor keyword matches its tokens
  const S = config.keyword.toLowerCase();
  if (
    !(vault.name.toLowerCase().includes(S) || vault.assets.find(S_TKN => S_TKN.toLowerCase() === S))
  ) {
    return false;
  }

  //hide when wallet no connected and my vaults = true
  if (!address && config.deposited) {
    return false;
  }

  //hide when wallet no connected and zero = true
  if (!address && config.zero) {
    return false;
  }

  // default show
  return true;
}

function useSortedVaults(vaults, key, direction) {
  return useMemo(() => {
    return sortVaults(vaults, key, direction);
  }, [vaults, key, direction]);
}

function useFilteredVaults(vaults, config, address, tokenBalances, userVaults, boostVaults) {
  return useMemo(() => {
    return vaults.filter(vault =>
      keepVault(vault, config, address, tokenBalances, userVaults, boostVaults)
    );
  }, [vaults, config, address, tokenBalances, userVaults, boostVaults]);
}

function useVaultsArray() {
  const allVaults = useSelector(selectVaults);
  return useMemo(() => Object.values(allVaults), [allVaults]);
}

function useActiveVaults() {
  const allVaults = useSelector(selectVaults);
  return useMemo(
    () =>
      Object.keys(allVaults).filter(
        vault =>
          !(
            allVaults[vault].tags.includes('eol') ||
            allVaults[vault].tags.includes('deposits-paused')
          )
      ),
    [allVaults]
  );
}

function useUserVaults() {
  const balance = useSelector((state: any) => state.balanceReducer);
  const vaultReducer = useSelector((state: any) => state.vaultReducer);
  const userAddress = useSelector((state: any) => state.walletReducer.address);

  let newUserVaults = [];

  for (const poolKey in vaultReducer.pools) {
    let balanceSingle = new BigNumber(0);
    const pool = vaultReducer.pools[poolKey];
    let symbol = pool.isGovVault ? `${pool.token}GovVault` : pool.earnedToken;
    if (userAddress) {
      if (!isEmpty(balance.tokens[pool.network][symbol])) {
        if (pool.isGovVault) {
          const _balance = byDecimals(
            balance.tokens[pool.network][symbol].balance,
            pool.tokenDecimals
          );

          if (_balance.isGreaterThan(0)) {
            newUserVaults = {
              ...newUserVaults,
              [pool.id]: pool,
            };
          }
        }
        balanceSingle = byDecimals(
          balance.tokens[pool.network][symbol].balance,
          pool.tokenDecimals
        );
        if (balanceSingle.isGreaterThan(0)) {
          newUserVaults = {
            ...newUserVaults,
            [pool.id]: pool,
          };
        }
      }
      if (pool.boosts?.length > 0) {
        for (const boost of pool.boosts) {
          let symbol = `${boost.token}${boost.id}Boost`;
          if (!isEmpty(balance.tokens[pool.network][symbol])) {
            balanceSingle = byDecimals(
              balance.tokens[pool.network][symbol].balance,
              boost.decimals
            );
            if (balanceSingle.isGreaterThan(0)) {
              newUserVaults = {
                ...newUserVaults,
                [pool.id]: pool,
              };
              break;
            }
          }
        }
      }
    }
  }

  return newUserVaults;
}

export const useVaults = () => {
  const allVaults = useVaultsArray();
  const address = useSelector(selectAddress);
  const activeVaults = useActiveVaults();
  const tokenBalances = useSelector(selectTokenBalances);
  const boostVaults = useBoostArray();
  const userVaults = useUserVaults();
  const [filterConfig, setFilterConfig] = useLocalStorage(
    FILTER_STORAGE_KEY,
    FILTER_DEFAULT,
    isStoredConfigValid
  );

  const filteredVaults = useFilteredVaults(
    allVaults,
    filterConfig,
    address,
    tokenBalances,
    userVaults,
    boostVaults
  );
  const sortedVaults = useSortedVaults(filteredVaults, filterConfig.key, filterConfig.direction);

  return {
    sortedVaults,
    filterConfig,
    setFilterConfig,
    filteredVaultsCount: filteredVaults.length,
    allVaultsCount: allVaults.length,
    activeVaults: activeVaults.length,
    boostVaults,
    userVaults,
  };
};
