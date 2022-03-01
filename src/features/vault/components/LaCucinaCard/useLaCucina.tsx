import React from 'react';
import { getLaCucinaApi } from './laCucina';

export function useLaCucina(ovenId) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [data, setData] = React.useState([]);
  const api = getLaCucinaApi();

  React.useEffect(() => {
    async function fetchData() {
      const data = await api.getLaCucinaInfo(ovenId);
      return data;
    }
    fetchData();
  }, [api, ovenId]);

  return [data];
}
