import React from 'react';
import { getLaCucinaApi } from './laCucina';

interface LaCucinaData {
  aprValue: string;
  rewardTokenSymbol: string;
  expiryDate: Date;
}

export function useLaCucina(ovenId) {
  const [data, setData] = React.useState<LaCucinaData>({
    aprValue: '',
    rewardTokenSymbol: '',
    expiryDate: new Date(0),
  });
  const api = getLaCucinaApi();

  React.useEffect(() => {
    async function fetchData() {
      const { data } = await api.getLaCucinaInfo(ovenId);
      setData({
        aprValue: data.aprValue,
        rewardTokenSymbol: data.rewardTokenSymbol,
        expiryDate: new Date(data.expiryDate),
      });
    }
    fetchData();
  }, [api, ovenId]);

  return [data];
}
