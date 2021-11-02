import {
  HOME_FETCH_BOOSTS_BEGIN,
  HOME_FETCH_BOOSTS_DONE,
  HOME_FETCH_POOLS_BEGIN,
  HOME_FETCH_POOLS_DONE,
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
    const data =  require(`../../../config/boost/${net}`);
    for (const key in data.pools) {
      const boost = data.pools[key];

      if (!isEmpty(pools[boost.poolId])) {
        const pool = pools[boost.poolId];

        boost['network'] = net;
        boost['apr'] = 0;
        boost['tvl'] = 0;
        boost['periodFinish'] = 0;
        boost['name'] = pool.name;
        boost['logo'] = pool.logo;
        boost['token'] = pool.earnedToken;
        boost['tokenDecimals'] = pool.tokenDecimals;
        boost['tokenAddress'] = pool.earnedTokenAddress;
        boost['tokenOracle'] = pool.oracle;
        boost['tokenOracleId'] = pool.oracleId;
        boost['assets'] = pool.assets;

        boosts[boost.id] = boost;
      }
    }
  }

  return boosts;
};

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
      pool['withdrawalFee'] = 0.001;
      pool['depositFee'] = 0;

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
};

const initializeTags = (pool, net) => {
  const stables = getStablesForNetwork(net);
  const isStable = type => stables.includes(type);

  if (pool.assets.length === 1) {
    pool['vaultType'] = 'single';
  } else {
    pool['vaultType'] = pool.assets.every(isStable)
      ? 'stable'
      : pool.assets.some(isStable)
      ? 'stables'
      : false;
    if (pool.assets.every(isStable)) {
      pool.tags.push('stable');
    }
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
    if (riskScore >= 7.5) {
      pool.tags.push('low');
    }
  }

  if (pool.status !== 'active') {
    pool.tags.push(pool.status);
  }

  return pool;
};

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
    default:
      return state;
  }
};