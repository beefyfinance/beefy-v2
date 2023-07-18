import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import React, { memo, Suspense, useRef } from 'react';
import { useAppSelector } from '../../../../store';

import { NetworkStatus } from '../../../NetworkStatus';
import { styles } from './styles';

// lazy load web3 related stuff, as libs are quite heavy
const WalletContainer = React.lazy(() => import(`../WalletContainer`));

const useStyles = makeStyles(styles);

export const ConnectionStatus = memo(function ConnectionStatus() {
  const classes = useStyles();
  const open = useAppSelector(state => state.ui.dataLoader.statusIndicator.open);
  const anchorEl = useRef();
  return (
    <div ref={anchorEl} className={clsx(classes.container, { [classes.open]: open })}>
      <NetworkStatus anchorEl={anchorEl} />
      <div>
        <Suspense fallback={<>...</>}>
          <WalletContainer />
        </Suspense>
      </div>
    </div>
  );
});
