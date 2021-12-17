import {
  HOME_FETCH_BOOSTS_BEGIN,
  HOME_FETCH_BOOSTS_DONE,
  HOME_FETCH_POOLS_BEGIN,
  HOME_FETCH_POOLS_DONE,
  HOME_LINK_BOOSTS_DONE,
} from '../constants';
import { config } from '../../../config/config';
import { getStablesForNetwork, isEmpty, bluechipTokens } from '../../../helpers/utils';
import { safetyScore } from '../../../helpers/safetyScore';
import BigNumber from 'bignumber.js';

let initPlatforms = {};
let pools = [];

const initialBoosts = () => {
  const boosts = [];

  for (let net in config) {
    const data = require(`../../../config/boost/${net}`);
    for (const key in data.pools) {
      const boost = data.pools[key];
      let pool;

      // Boost pools should have poolId, this is a temp fix until Boost pools are transferred correctly
      if (!isEmpty(pools[boost.poolId])) {
        pool = pools[boost.poolId];
      } else if (!isEmpty(pools[boost.tokenOracleId]) && pools[boost.tokenOracleId] !== 'BIFI') {
        pool = pools[boost.tokenOracleId];
      } else {
        continue;
      }

      boost['network'] = net;
      boost['apr'] = 0;
      boost['tvl'] = 0;
      boost['periodFinish'] = 0;
      boost['token'] = pool.earnedToken;
      boost['tokenDecimals'] = pool.tokenDecimals;
      boost['tokenAddress'] = pool.earnedTokenAddress;
      boost['tokenOracle'] = pool.oracle;
      boost['tokenOracleId'] = pool.oracleId;
      boost['assets'] = pool.assets;
      boost['isMooStaked'] = boost.id.toLocaleLowerCase().startsWith('moo_');


      boosts[boost.id] = boost;
    } //for (const key in data.pools)
  } //for (let net in config)

  return boosts;
}; //const initialBoosts = () =>

const initialPools = () => {
  const platforms = [];

  for (let net in config) {
    const data = require(`../../../config/vault/${net}`);
    for (const key in data.pools) {
      let pool = data.pools[key];

      pool['network'] = net;
      pool['pricePerFullShare'] = 1;
      pool['daily'] = 0;
      pool['apy'] = 0;
      pool['tvl'] = new BigNumber(0);
      pool['lastUpdated'] = 0;
      pool['tags'] = [];
      pool['safetyScore'] = 0;
      pool['withdrawalFee'] = pool.isGovVault ? '0%' : pool.withdrawalFee ?? '0.1%';
      pool['depositFee'] = pool.depositFee ?? '0%';
      pool['boosts'] = [];
      pool['isBoosted'] = false;
      pool['boostData'] = null;

      if (!isEmpty(pool.platform)) {
        if (!platforms.includes(pool.platform)) {
          platforms[pool.platform.toLowerCase()] = pool.platform;
        }
      }

      pool = initializeTags(pool, net);

      pools[pool.id] = pool;
    }
  }

  initPlatforms = platforms;

  return pools;
}; //const initialPools = () =>

const initializeTags = (pool, net) => {
  const stables = getStablesForNetwork(net);

  if (pool.assets.length === 1) {
    pool['vaultType'] = 'single';
  }
  if (pool.assets.length > 1) {
    pool['vaultType'] = 'lps';
  }

  if (pool.assets.every(stable => stables.includes(stable))) {
    pool.tags.push('stable');
  }

  if (pool.assets.some(asset => ['BIFI', 'POTS'].includes(asset))) {
    pool.tags.push('beefy');
  }

  if (pool.assets.every(asset => bluechipTokens.includes(asset))) {
    pool.tags.push('bluechip');
  }

  if (!isEmpty(pool.risks)) {
    const riskScore = safetyScore(pool.risks);
    pool['safetyScore'] = riskScore;
    if (parseInt(riskScore) >= 7.5) {
      pool.tags.push('low');
    }
  }

  if (pool.status !== 'active') {
    pool.tags.push(pool.status);
  }

  return pool;
}; //const initializeTags = (pool, net) =>

const initialState = {
  pools: initialPools(),
  boosts: initialBoosts(),
  totalTvl: new BigNumber(0),
  isPoolsLoading: true,
  isBoostsLoading: true,
  isFirstTime: true,
  lastUpdated: 0,
  platforms: initPlatforms,
};

export const vaultReducer = (state = initialState, action) => {
  switch (action.type) {
    case HOME_FETCH_POOLS_BEGIN:
      return {
        ...state,
        isPoolsLoading: state.isFirstTime,
      };
    case HOME_FETCH_POOLS_DONE:
      return {
        ...state,
        pools: action.payload.pools,
        totalTvl: action.payload.totalTvl,
        lastUpdated: action.payload.lastUpdated,
        isPoolsLoading: action.payload.isPoolsLoading,
        isFirstTime: false,
      };
    case HOME_FETCH_BOOSTS_BEGIN:
      return {
        ...state,
        isBoostsLoading: state.isFirstTime,
      };
    case HOME_FETCH_BOOSTS_DONE:
      return {
        ...state,
        boosts: action.payload.boosts,
        lastUpdated: action.payload.lastUpdated,
        isBoostsLoading: action.payload.isBoostsLoading,
        isFirstTime: false,
      };
    case HOME_LINK_BOOSTS_DONE:
      return {
        ...state,
        boosts: action.payload.boosts,
        lastUpdated: action.payload.lastUpdated,
        isBoostsLoading: action.payload.isBoostsLoading,
      };
    default:
      return state;
  }
}; //const vaultReducer =
