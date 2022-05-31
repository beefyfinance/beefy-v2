import { Button } from '@material-ui/core';
import React, { memo, Suspense, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useStore } from 'react-redux';
import { initBridgeForm } from '../../features/data/actions/scenarios';
import { isFulfilled } from '../../features/data/reducers/data-loader';
import { bridgeModalActions } from '../../features/data/reducers/wallet/bridge-modal';
import { selectIsAddressBookLoaded } from '../../features/data/selectors/data-loader';
import { selectIsWalletKnown, selectWalletAddress } from '../../features/data/selectors/wallet';
import { BeefyState } from '../../redux-types';
import { ApyStatLoader } from '../ApyStatLoader';
import { BridgeModal } from './BridgeModal';

export const Bridge = memo(function _Bridge({ buttonClassname }: { buttonClassname: string }) {
  const { t } = useTranslation();
  const walletAddress = useSelector((state: BeefyState) =>
    selectIsWalletKnown(state) ? selectWalletAddress(state) : null
  );

  const [openBridgeModal, setOpenBridgeModal] = useState<boolean>(false);

  const handleClose = useCallback(() => {
    setOpenBridgeModal(false);
  }, []);

  const handleOpen = useCallback(() => {
    setOpenBridgeModal(true);
  }, []);

  const formState = useSelector((state: BeefyState) => state.ui.bridgeModal);

  const isFormDataLoaded = useSelector(
    (state: BeefyState) =>
      selectIsAddressBookLoaded(state, formState.fromChainId) &&
      isFulfilled(state.ui.dataLoader.global.bridgeForm)
  );

  const store = useStore();
  useEffect(() => {
    //Init from on mount
    initBridgeForm(store, walletAddress);

    return () => {
      store.dispatch(bridgeModalActions.resetForm());
    };
  }, [store, walletAddress]);

  return (
    <Suspense fallback={<ApyStatLoader />}>
      {isFormDataLoaded ? (
        <>
          <Button className={buttonClassname} onClick={handleOpen} size="small">
            {t('Transact-Bridge')}
          </Button>
          <BridgeModal open={openBridgeModal} handleClose={handleClose} />
        </>
      ) : null}
    </Suspense>
  );
});
