import axios from 'axios';

/*
*
* todo: fetch prices from blockchain, so we dont rely on api.
*  also fetch apys from blockchain.
*
*/

const fetchPrices = () => {
    return async (dispatch, getState) => {
        const updatePrices = async () => {
            console.log('redux fetchPrices called.');
            try {
                const request = await axios.get('https://api.beefy.finance/prices?_=' + new Date().getTime(), {timeout: 500});
                return request.status === 200 ? request.data : {}
            } catch(err) {
                console.log('error fetchPrices()', err);
                setTimeout(async () => {
                    return await updatePrices();
                }, 1000);
            }
        }

        const updateLps = async () => {
            console.log('redux fetchLps called.');
            try {
                const request = await axios.get('https://api.beefy.finance/lps?_=' + new Date().getTime(), {timeout: 500});
                return request.status === 200 ? request.data : {}
            } catch(err) {
                console.log('error fetchLps()', err);
                setTimeout(async () => {
                    return await updateLps();
                }, 1000);
            }
        }

        const updateApy = async () => {
            console.log('redux fetchApy called.');

            try {
                const request = await axios.get('https://api.beefy.finance/apy?_=' + new Date().getTime(), {timeout: 500});
                return request.status === 200 ? request.data : {};
            } catch(err) {
                console.log('error fetchApy()', err)
                setTimeout(async () => {
                    return await updateApy();
                }, 1000);
            }
        }

        const fetch = async () => {
            const prices = await updatePrices();
            const lps = await updateLps();
            const apy = await updateApy();

            dispatch({
                type: "FETCH_PRICES",
                payload: {prices: {...prices, ...lps }, apy: apy, lastUpdated: new Date().getTime()}
            });
        }

        await fetch();

        setInterval(async () => {
            await fetch();
        }, 60000);
    };
}

const obj = {
    fetchPrices,
}

export default obj
