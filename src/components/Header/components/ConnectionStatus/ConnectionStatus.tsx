import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import React, { memo, Suspense } from 'react';
import { useAppSelector } from '../../../../store';

import { NetworkStatus } from '../../../NetworkStatus';
import { styles } from './styles';

// lazy load web3 related stuff, as libs are quite heavy
const WalletContainer = React.lazy(() => import(`../WalletContainer`));

const useStyles = makeStyles(styles);

export const ConnectionStatus = memo(function () {
  const classes = useStyles();
  const open = useAppSelector(state => state.ui.dataLoader.statusIndicator.open);
  return (
    <div className={clsx(classes.container, { [classes.open]: open })}>
      <NetworkStatus />
      <div>
        <Suspense fallback={<>...</>}>
          <WalletContainer />
        </Suspense>
      </div>
    </div>
  );
});
