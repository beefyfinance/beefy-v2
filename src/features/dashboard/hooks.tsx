import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store.ts';
import { selectShouldInitDashboardForUser } from '../data/selectors/data-loader.ts';
import { selectIsDashboardDataLoadedByAddress } from '../data/selectors/analytics.ts';
import { initDashboardByAddress } from '../data/actions/analytics.ts';

export function useInitDashboard(address: string) {
  const dispatch = useAppDispatch();
  const canInitDashboard = useAppSelector(state =>
    selectShouldInitDashboardForUser(state, address)
  );
  const isDashboardAvailable = useAppSelector(state =>
    selectIsDashboardDataLoadedByAddress(state, address)
  );

  useEffect(() => {
    if (address && canInitDashboard) {
      dispatch(initDashboardByAddress({ walletAddress: address }));
    }
  }, [dispatch, address, canInitDashboard]);

  return !isDashboardAvailable;
}
