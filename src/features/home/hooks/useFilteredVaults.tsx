import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { isEmpty, isObject } from '../../../helpers/utils';
import { formatDecimals } from '../../../helpers/format';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import BigNumber from 'bignumber.js';

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
  blockchain: 'all',
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
function hasWalletBalance(token, tokenBalances, network) {
  return tokenBalances[network][token].balance && tokenBalances[network][token].balance > 0
    ? false
    : true;
}

// Check if he is deposited in boosted pool
function hasBoostedBalance(userVault) {
  return userVault && userVault['balance'] > 0 ? false : true;
}

function keepVault(vault, config, address, tokenBalances, userVaults) {
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
  if (config.zero && address && hasWalletBalance(vault.token, tokenBalances, vault.network)) {
    return false;
  }

  // hide when no wallet balance of deposit token
  // TODO show the vaults with mooToken
  if (
    config.deposited &&
    address &&
    hasWalletBalance(vault.earnedToken, tokenBalances, vault.network) &&
    hasBoostedBalance(userVaults[vault.id])
  ) {
    return false;
  }

  // hide when vault is not boosted
  // TODO handle once boost implemented
  if (config.boost && !vault.boost) {
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
  if (config.blockchain !== 'all' && vault.network !== config.blockchain) {
    return false;
  }

  // hide when category/tag does not match
  if (config.category !== 'all' && !vault.tags.includes(config.category)) {
    return false;
  }

  // hide when name does not include keyword
  if (!vault.name.toLowerCase().includes(config.keyword.toLowerCase())) {
    return false;
  }

  //hide when wallet no connected and my vaults = true
  if (!address && config.deposited) {
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

function useFilteredVaults(vaults, config, address, tokenBalances, userVaults) {
  return useMemo(() => {
    return vaults.filter(vault => keepVault(vault, config, address, tokenBalances, userVaults));
  }, [vaults, config, address, tokenBalances]);
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useUserVaults() {
  const balanceReducer = useSelector((state: any) => state.balanceReducer);
  const vaultReducer = useSelector((state: any) => state.vaultReducer);
  const pricesReducer = useSelector((state: any) => state.pricesReducer);
  const userAddress = useSelector((state: any) => state.walletReducer.address);

  let newUserVaults = [];

  if (userAddress !== null) {
    for (const poolKey in vaultReducer.pools) {
      const pool = vaultReducer.pools[poolKey];
      const balance = balanceReducer.tokens[pool.network][pool.earnedToken].balance;
      const boostpoolBalance = formatDecimals(
        balanceReducer.tokens[pool.network][pool.earnedToken + 'Boost']?.balance
      );
      if (balance > 0 || (!isNaN(boostpoolBalance) && boostpoolBalance > 0)) {
        pool.balance = isNaN(boostpoolBalance)
          ? balance
          : formatDecimals(BigNumber.sum(balance, boostpoolBalance).toNumber());
        pool.oraclePrice = pricesReducer.prices[pool.oracleId];
        newUserVaults = {
          ...newUserVaults,
          [pool.id]: pool,
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
  const [config, setConfig] = useLocalStorage(
    FILTER_STORAGE_KEY,
    FILTER_DEFAULT,
    isStoredConfigValid
  );
  const filteredVaults = useFilteredVaults(allVaults, config, address, tokenBalances, userVaults);
  const sortedVaults = useSortedVaults(filteredVaults, config.key, config.direction);

  return [
    sortedVaults,
    config,
    setConfig,
    filteredVaults.length,
    allVaults.length,
    activeVaults.length,
    boostVaults,
  ];
};
