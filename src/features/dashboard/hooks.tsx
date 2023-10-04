import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { initDashboardByAddress } from '../data/actions/wallet';
import { selectWalletAddressIfKnown } from '../data/selectors/wallet';
import { selectIsConfigAvailable } from '../data/selectors/data-loader';

export function useInitDashboard(address: string) {
  const isConfigAvailable = useAppSelector(selectIsConfigAvailable);
  const connectedAddress = useAppSelector(selectWalletAddressIfKnown);
  const addressBookLoaded = useAppSelector(
    state => state.ui.dataLoader.global.addressBook.alreadyLoadedOnce
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isConfigAvailable && addressBookLoaded && address && address !== connectedAddress) {
      dispatch(initDashboardByAddress({ address }));
    }
  }, [dispatch, address, connectedAddress, addressBookLoaded, isConfigAvailable]);
}
