import {HOME_FETCH_POOLS_BEGIN, HOME_FETCH_POOLS_DONE,} from "../constants";
import {config} from "../../../config/config";
import {getStablesForNetwork, isEmpty} from "../../../helpers/utils";

let initPlatforms = {}
const initialData = () => {
    const pools = [];
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

            if(!isEmpty(pool.riskScore)) {
                if(pool.riskScore < 2.5) {
                    pool.tags.push('low');
                }
            }

            pools[pool.id] = pool;
            //pools.push(pool);
        }
    }

    initPlatforms = platforms;

    return pools;
}

const initialState = {
    pools: initialData(),
    totalTvl: 0,
    isPoolsLoading: false,
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
