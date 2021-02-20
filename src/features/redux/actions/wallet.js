const getPoolsForNetwork = async (pool) => {
    const p = await import('../../../config/pools/' + pool);
    return p.pools
}

const getFormattedPools = (pools) => {
    const formattedPools = [];

    for (let key in pools) {
        formattedPools.push({
            id: key,
            logo: pools[key].logo,
            name: pools[key].name,
            tokenDescription: pools[key].tokenDescription,
            balance:Math.random(),
            deposited:2,
            apy:3,
            daily:4,
            tvl:5
        });
    }

    return formattedPools;
}

const setNetwork = (netObj) => {
    return dispatch => {
        getPoolsForNetwork(netObj).then(function(data) {
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