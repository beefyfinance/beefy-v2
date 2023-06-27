import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { initDashboardByAddress } from '../data/actions/wallet';
import { selectWalletAddressIfKnown } from '../data/selectors/wallet';

export function useInitDashboard(address: string) {
  const connectedAddress = useAppSelector(selectWalletAddressIfKnown);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (address && address !== connectedAddress) {
      dispatch(initDashboardByAddress({ address }));
    }
  }, [dispatch, address, connectedAddress]);
}
