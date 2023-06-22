import { useEffect, useState } from 'react';
import { useAppDispatch } from '../../store';
import { initViewAsAddress } from '../data/actions/wallet';

export function useInitDashboard(address: string) {
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (address) {
      dispatch(initViewAsAddress({ address }));
      setLoading(false); // not a real indicator, only indicates init was dispatched
    }
  }, [dispatch, address, setLoading]);

  return { loading };
}
