import axios from 'axios';

const getBuyback = async () => {
  const cache = new Date();
  cache.setMinutes(0, 0, 0);
  try {
    const request = await axios.get('https://api.beefy.finance/bifibuyback?_=' + cache.getTime());
    return request.status === 200 ? request.data : null;
  } catch (err) {
    return err;
  }
};

const getVaults = async () => {
  const cache = new Date();
  cache.setMinutes(0, 0, 0);
  try {
    const request = await axios.get('https://api.beefy.finance/vaults?_=' + cache.getTime());
    return request.status === 200 ? request.data : null;
  } catch (err) {
    return err;
  }
};

export { getBuyback, getVaults };
