const getPoolsForNetwork = async (pool) => {
    const p = await import('../../../config/pools/' + pool);
    return p.pools
}

const getFormattedPools = (pools) => {
    const formattedPools = [];

    for (let key in pools) {
        pools[key].deposited = 0;
        pools[key].balance = 0;
        pools[key].daily = 1;
        pools[key].apy = 2;
        pools[key].tvl = 3;

        formattedPools.push(pools[key]);
    }

    return formattedPools;
}

const setNetwork = (netObj) => {
    return dispatch => {
        getPoolsForNetwork(netObj).then(function(data) {
            localStorage.setItem('network', netObj)
            dispatch({
                type: "SET_NETWORK",
                payload: {network: netObj, pools: data, poolsFormatted: getFormattedPools(data)}
            })
        })
    };
}

const obj = {
    setNetwork,
}

export default obj