import {HOME_FETCH_POOLS_BEGIN, HOME_FETCH_POOLS_DONE} from "../constants";
import {config} from "../../../config/config";
import {getStablesForNetwork, isEmpty} from "../../../helpers/utils";
import safetyScore from "../../../helpers/safetyScore";

let initPlatforms = {}
let pools = [];

const initialBoosts = () => {
    const boosts = [];

    for(let net in config) {
        const data = require('../../../config/boost/' + net + '.js');
        for (const key in data.pools) {
            const boost = data.pools[key];

            if(!isEmpty(pools[boost.poolId])) {
                const pool = pools[boost.poolId];

                boost['network'] = net;
                boost['balance'] = 0;
                boost['apy'] = 0;
                boost['tvl'] = 0;
                boost['periodFinish'] = 0;
                boost['name'] = pool.name;
                boost['logo'] = pool.logo;
                boost['token'] = pool.earnedToken;
                boost['tokenDecimals'] = pool.tokenDecimals;
                boost['tokenAddress'] = pool.earnedTokenAddress;
                boost['tokenOracle'] = pool.oracle;
                boost['tokenOracleId'] = pool.oracleId;

                boosts[boost.id] = boost;
            }
        }
    }

    return boosts;
}

const initialPools = () => {
    const platforms = [];

    for(let net in config) {
        const data = require('../../../config/vault/' + net + '.js');
        for(const key in data.pools) {
            const stables = getStablesForNetwork(net);
            const pool = data.pools[key];
            const isStable = type => stables.includes(type);

            pool['network'] = net;
            pool['pricePerShare'] = 1;
            pool['balance'] = 0;
            pool['daily'] = 0;
            pool['apy'] = 0;
            pool['tvl'] = 0;
            pool['lastUpdated'] = 0;
            pool['tags'] = [];
            pool['safetyScore'] = 0;

            if(!isEmpty(pool.platform)) {
                if(!platforms.includes(pool.platform)) {
                    platforms[(pool.platform).toLowerCase()] = pool.platform;
                }
            }

            if(pool.assets.length === 1) {
                pool['vaultType'] = 'single';
            } else {
                pool['vaultType'] = pool.assets.every(isStable) ? 'stable' : (pool.assets.some(isStable) ? 'stables' : false);
                if(pool.assets.every(isStable)) {
                    pool.tags.push('stable');
                }
            }

            if(!isEmpty(pool.createdAt)) {
                const created = new Date(pool.createdAt * 1000);
                const days = 3; // number of days to be considered "recent"
                if(created > new Date(new Date().getTime() - (days * 24 * 60 * 60 * 1000))) {
                    pool.tags.push('recent');
                }
            }

            if(!isEmpty(pool.risks)) {
                const riskScore = safetyScore(pool.risks);
                pool['safetyScore'] = riskScore;
                if(riskScore >= 7.5) {
                    pool.tags.push('low');
                }
            }

            pools[pool.id] = pool;
        }
    }

    initPlatforms = platforms;

    return pools;
}

const initialState = {
    pools: initialPools(),
    boosts: initialBoosts(),
    totalTvl: 0,
    isPoolsLoading: true,
    isFirstTime: true,
    lastUpdated: 0,
    platforms: initPlatforms,
}

const vaultReducer = (state = initialState, action) => {
    switch(action.type){
        case HOME_FETCH_POOLS_BEGIN:
            return {
                ...state,
                isPoolsLoading: state.isFirstTime,
            }
        case HOME_FETCH_POOLS_DONE:
            return {
                ...state,
                pools: action.payload.pools,
                totalTvl: action.payload.totalTvl,
                lastUpdated: action.payload.lastUpdated,
                isPoolsLoading: action.payload.isPoolsLoading,
                isFirstTime: false,
            }
        default:
            return state
    }
}

export default vaultReducer;
