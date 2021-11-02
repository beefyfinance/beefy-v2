import axios from 'axios';

/*
 *
 * todo: fetch prices from blockchain, so we dont rely on api.
 *  also fetch apys from blockchain.
 *
 */

const fetchPrices = (reducer?: any) => {
  const cache = new Date();
  cache.setMinutes(0, 0, 0);

  return async (dispatch, getState) => {
    const updatePrices = async () => {
      try {
        const request = await axios.get('https://api.beefy.finance/prices?_=' + cache.getTime());
        return request.status === 200 ? request.data : await updatePrices();
      } catch (err) {
        return await updatePrices();
      }
    };

    const updateLps = async () => {
      try {
        const request = await axios.get('https://api.beefy.finance/lps?_=' + cache.getTime());
        return request.status === 200 ? request.data : await updateLps();
      } catch (err) {
        return await updateLps();
      }
    };

    const updateApy = async () => {
      try {
        const request = await axios.get(
          'https://api.beefy.finance/apy/breakdown?_=' + cache.getTime()
        );
        request.data['bifi-gov'] = { vaultApr: 0.55 };
        console.log(request.data);
        return request.status === 200 ? request.data : await updateApy();
      } catch (err) {
        return await updateApy();
      }
    };

    const updateHistoricalApy = async () => {
      try {
        const request = await axios.get('https://data.beefy.finance/bulk?_=' + cache.getTime());
        return request.status === 200 ? request.data : await updateHistoricalApy();
      } catch (err) {
        return await updateHistoricalApy();
      }
    };

    const fetch = async () => {
      const state = getState();

      const [prices, lps, apy, historicalApy] = await Promise.all([
        updatePrices(),
        updateLps(),
        updateApy(),
        updateHistoricalApy(),
      ]);

      dispatch({
        type: 'FETCH_PRICES',
        payload: {
          prices: {
            ...state.pricesReducer.prices,
            ...prices,
            ...lps,
          },
          apy,
          historicalApy,
          lastUpdated: new Date().getTime(),
        },
      });
    };

    await fetch();

    setInterval(async () => {
      await fetch();
    }, 300000);
  };
};

export const prices = {
  fetchPrices,
};
