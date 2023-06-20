import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectChainById } from '../data/selectors/chains';
import { initViewAsAddress } from '../data/actions/wallet';
import { setViewAsAddress } from '../data/reducers/wallet/wallet';
import { getEnsResolver, isValidAddress, isValidEns } from '../../helpers/addresses';
import { useHistory, useParams } from 'react-router';
import { selectConnectedWalletAddress } from '../data/selectors/wallet';

export type DashboardUrlParams = {
  address?: string;
};

export const useInitDashboard = () => {
  const { address } = useParams<DashboardUrlParams>();
  const [loading, setLoading] = useState<boolean>(false);
  const [userAddress, setUserAddress] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const ethChain = useAppSelector(state => selectChainById(state, 'ethereum'));
  const walletStatus = useAppSelector(state => state.ui.dataLoader.global.wallet.status);
  const connectedWalletAddress = useAppSelector(state => selectConnectedWalletAddress(state));
  const history = useHistory();

  useEffect(() => {
    async function fetchAddress() {
      setLoading(true);
      if (address && connectedWalletAddress !== address) {
        if (isValidEns(address)) {
          const resolvedAddress = await getEnsResolver(address, ethChain);
          if (resolvedAddress) {
            dispatch(initViewAsAddress({ address: resolvedAddress, ens: address }));
            setUserAddress(resolvedAddress);
          } else {
            setError(true);
          }
        } else {
          if (isValidAddress(address)) {
            dispatch(initViewAsAddress({ address }));
            setUserAddress(address);
          } else {
            setError(true);
          }
        }
      } else {
        if (connectedWalletAddress) {
          setUserAddress(connectedWalletAddress);
          history.push(`/dashboard/${connectedWalletAddress}`);
        } else {
          setUserAddress('');
        }
      }
      setLoading(false);
    }

    fetchAddress();

    return () => {
      dispatch(setViewAsAddress({ address: null }));
      setError(false);
    };
  }, [address, connectedWalletAddress, dispatch, ethChain, history, walletStatus]);

  return { userAddress, error, loading };
};
