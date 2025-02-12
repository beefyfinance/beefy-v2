import { makeStyles } from '@material-ui/core';
import { lazy, memo, Suspense, useCallback, useRef, useState } from 'react';

import { NetworkStatus } from '../../../NetworkStatus';
import { styles } from './styles';
import { RpcModalTrigger } from '../RpcModal';

// lazy load web3 related stuff, as libs are quite heavy
const WalletContainer = lazy(() => import(`../WalletContainer`));

const useStyles = makeStyles(styles);

export const ConnectionStatus = memo(function ConnectionStatus() {
  const classes = useStyles();
  const anchorEl = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState({ rpcModal: false, networkStatusModal: false });

  const handleModals = modalName => {
    setOpen(prev => ({
      // Close the other modal automatically when opening one
      rpcModal: modalName === 'rpcModal' ? !prev.rpcModal : false,
      networkStatusModal: modalName === 'networkStatusModal' ? !prev.networkStatusModal : false,
    }));
  };

  const handleClose = useCallback(() => {
    setOpen({ rpcModal: false, networkStatusModal: false });
  }, []);

  return (
    <div ref={anchorEl} className={classes.container}>
      <RpcModalTrigger
        anchorEl={anchorEl}
        isOpen={open.rpcModal}
        handleIsOpen={() => handleModals('rpcModal')}
        handleClose={handleClose}
      />
      <NetworkStatus
        anchorEl={anchorEl}
        isOpen={open.networkStatusModal}
        handleIsOpen={() => handleModals('networkStatusModal')}
        closeModal={handleClose}
      />
      <div>
        <Suspense>
          <WalletContainer />
        </Suspense>
      </div>
    </div>
  );
});
