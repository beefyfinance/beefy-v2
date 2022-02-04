import { useEffect } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { initHomeDataV4 } from './features/data/actions/scenarios';
import { reduxActions } from './features/redux/actions';

export function useBeefyData(mode: 'v1' | 'v2') {
  const dispatch = useDispatch();
  const store = useStore();

  const { wallet } = useSelector((state: any) => ({
    wallet: state.walletReducer,
  }));

  useEffect(() => {
    if (mode !== 'v1') {
      return;
    }
    const updateBalances = async () => {
      await dispatch(reduxActions.balance.fetchBalances());
      await dispatch(reduxActions.balance.fetchBoostBalances());
    };

    if (wallet.address) {
      updateBalances();
    }
  }, [mode, dispatch, wallet]);

  useEffect(() => {
    if (mode !== 'v1') {
      return;
    }
    const initiate = async () => {
      let now = Date.now();

      await dispatch(reduxActions.prices.fetchPrices());
      let promises = [
        dispatch(reduxActions.vault.fetchPools()),
        dispatch(reduxActions.vault.fetchBoosts()),
      ];
      await Promise.all(promises);

      await dispatch(reduxActions.vault.linkVaultBoosts());

      await dispatch(reduxActions.balance.fetchBalances());
      await dispatch(reduxActions.balance.fetchBoostBalances());

      setInterval(async () => {
        await dispatch(reduxActions.balance.fetchBalances());
        await dispatch(reduxActions.balance.fetchBoostBalances());
      }, 60000);

      let end = Date.now();
      console.log(`Load time is ${(end - now) / 1000}s`);
    };
    initiate();
  }, [mode, dispatch]);

  useEffect(() => {
    if (mode !== 'v1') {
      return;
    }
    if (!wallet.web3modal) {
      dispatch(reduxActions.wallet.createWeb3Modal());
    }
  }, [mode, dispatch, wallet.web3modal]);

  useEffect(() => {
    if (mode !== 'v2') {
      return;
    }
    // give some time to the app to render a loader before doing this
    setTimeout(() => initHomeDataV4(store), 50);
  }, [mode, store]);
}
