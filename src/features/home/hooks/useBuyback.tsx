import React from 'react';
import { getBuyback } from '../../../helpers/api';

export const useBuyback = () => {
  const [state, setState] = React.useState(0);

  React.useEffect(() => {
    async function fetchData() {
      const data = await getBuyback();

      let _buyback = 0;

      // eslint-disable-next-line array-callback-return
      Object.keys(data).map(chain => {
        const number = !data[chain]
          ? 0
          : data[chain].buybackUsdAmount
          ? parseFloat(data[chain].buybackUsdAmount)
          : 0;
        _buyback += number;
      });

      setState(_buyback);
    }

    fetchData();
  }, []);

  return state;
};
