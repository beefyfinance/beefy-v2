import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { initDashboardByAddress } from '../data/actions/wallet';
import { selectWalletAddressIfKnown } from '../data/selectors/wallet';

export function useInitDashboard(address: string) {
  const connectedAddress = useAppSelector(selectWalletAddressIfKnown);
  const addressBookLoaded = useAppSelector(
    state => state.ui.dataLoader.global.addressBook.alreadyLoadedOnce
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (address && addressBookLoaded && address !== connectedAddress) {
      dispatch(initDashboardByAddress({ address }));
    }
  }, [dispatch, address, connectedAddress, addressBookLoaded]);
}
