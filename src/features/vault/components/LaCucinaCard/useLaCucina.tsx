import React from 'react';
import { getLaCucinaApi } from './laCucina';

interface LaCucinaData {
  aprValue: string;
  rewardTokenSymbol: string;
  expiryDate: Date;
}

export function useLaCucina(ovenId, setIsLoading) {
  const [state, setState] = React.useState<LaCucinaData>({
    aprValue: '0%',
    rewardTokenSymbol: 'LAC',
    expiryDate: new Date(0),
  });

  React.useEffect(() => {
    async function fetchData() {
      const api = getLaCucinaApi();
      const res = await api.getLaCucinaInfo(ovenId);
      const expiryDate = new Date(parseInt(res.data.expiryDate) * 1000);
      setState({
        aprValue: res.data.aprValue,
        rewardTokenSymbol: res.data.rewardTokenSymbol,
        expiryDate,
      });
      setIsLoading(false);
    }
    fetchData();
  }, [ovenId, setIsLoading]);

  return [state];
}
