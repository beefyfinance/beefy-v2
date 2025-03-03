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
  const [open, setOpen] = useState<null | 'rpc' | 'status'>(null);

  const handleOpenRpc = useCallback(() => {
    setOpen('rpc');
  }, [setOpen]);

  const handleOpenStatus = useCallback(() => {
    setOpen('status');
  }, [setOpen]);

  const handleClose = useCallback(() => {
    setOpen(null);
  }, [setOpen]);

  return (
    <div ref={anchorEl} className={classes.container}>
      <RpcModalTrigger
        anchorEl={anchorEl}
        isOpen={open === 'rpc'}
        onOpen={handleOpenRpc}
        onClose={handleClose}
      />
      <NetworkStatus
        anchorEl={anchorEl}
        isOpen={open === 'status'}
        isOtherOpen={open !== null}
        onOpen={handleOpenStatus}
        onClose={handleClose}
      />
      <div>
        <Suspense>
          <WalletContainer />
        </Suspense>
      </div>
    </div>
  );
});
