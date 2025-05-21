import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../data/store/hooks.ts';
import { initDashboardByAddress } from '../data/actions/analytics.ts';
import { selectIsDashboardDataLoadedByAddress } from '../data/selectors/analytics.ts';
import { selectShouldInitDashboardForUser } from '../data/selectors/dashboard.ts';
import { filteredVaultsActions } from '../data/reducers/filtered-vaults.ts';

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
      dispatch(filteredVaultsActions.setSubSort({ column: 'apy', value: 'default' }));
    }
  }, [dispatch, address, canInitDashboard]);

  return !isDashboardAvailable;
}
