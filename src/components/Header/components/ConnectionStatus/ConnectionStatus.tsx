import { makeStyles } from '@material-ui/core';
import { lazy, memo, Suspense, useRef } from 'react';

import { NetworkStatus } from '../../../NetworkStatus';
import { styles } from './styles';
import { RpcModalTrigger } from '../RpcModal';

// lazy load web3 related stuff, as libs are quite heavy
const WalletContainer = lazy(() => import(`../WalletContainer`));

const useStyles = makeStyles(styles);

export const ConnectionStatus = memo(function ConnectionStatus() {
  const classes = useStyles();
  const anchorEl = useRef<HTMLDivElement>(null);
  return (
    <div ref={anchorEl} className={classes.container}>
      <RpcModalTrigger />
      <NetworkStatus anchorEl={anchorEl} />
      <div>
        <Suspense>
          <WalletContainer />
        </Suspense>
      </div>
    </div>
  );
});
