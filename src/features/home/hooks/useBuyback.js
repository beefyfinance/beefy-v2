import React from 'react';
import { getBuyback } from 'helpers/api';
import BigNumber from 'bignumber.js';

const useBuyback = () => {
  const [state, setState] = React.useState(0);

  React.useEffect(() => {
    async function fetchData() {
      const data = await getBuyback();

      let _buyback = 0;

      // eslint-disable-next-line array-callback-return
      Object.keys(data).map(chain => {
        const number = parseFloat(data[chain].buybackUsdAmount);
        _buyback += number;
      });

      setState(BigNumber(_buyback).toFixed(2));
    }

    fetchData();
  }, []);

  return state;
};

export default useBuyback;
