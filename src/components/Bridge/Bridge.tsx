import { Button } from '@material-ui/core';
import React, { memo, Suspense, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { initBridgeForm } from '../../features/data/actions/scenarios';
import { bridgeModalActions } from '../../features/data/reducers/wallet/bridge-modal';
import { selectIsWalletKnown, selectWalletAddress } from '../../features/data/selectors/wallet';
import { StatLoader } from '../StatLoader';
import { BridgeModal } from './components/BridgeModal';
import { useAppSelector, useAppStore } from '../../store';
import { isFulfilled } from '../../features/data/reducers/data-loader-types';

export const Bridge = memo(function _Bridge({ buttonClassname }: { buttonClassname: string }) {
  const { t } = useTranslation();
  const walletAddress = useAppSelector(state =>
    selectIsWalletKnown(state) ? selectWalletAddress(state) : null
  );

  const [openBridgeModal, setOpenBridgeModal] = useState<boolean>(false);

  const handleClose = useCallback(() => {
    setOpenBridgeModal(false);
  }, []);

  const handleOpen = useCallback(() => {
    setOpenBridgeModal(true);
  }, []);

  const isFormDataLoaded = useAppSelector(state =>
    isFulfilled(state.ui.dataLoader.global.bridgeForm)
  );

  const store = useAppStore();
  useEffect(() => {
    //Init from on mount
    initBridgeForm(store, walletAddress);

    return () => {
      store.dispatch(bridgeModalActions.resetForm());
    };
  }, [store, walletAddress]);

  return (
    <Suspense fallback={<StatLoader />}>
      {isFormDataLoaded ? (
        <>
          <Button className={buttonClassname} onClick={handleOpen} size="small">
            {t('Transact-Bridge')}
          </Button>
          <BridgeModal open={openBridgeModal} handleClose={handleClose} />
        </>
      ) : (
        <Button className={buttonClassname} size="small" disabled={true}>
          <StatLoader />
        </Button>
      )}
    </Suspense>
  );
});
