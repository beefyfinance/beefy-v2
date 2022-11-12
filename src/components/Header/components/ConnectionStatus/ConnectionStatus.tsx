import { makeStyles } from '@material-ui/core';
import React, { memo, Suspense } from 'react';

import { NetworkStatus } from '../../../NetworkStatus';
import { styles } from './styles';

// lazy load web3 related stuff, as libs are quite heavy
const WalletContainer = React.lazy(() => import(`../WalletContainer`));

const useStyles = makeStyles(styles);

export const ConnectionStatus = memo(function () {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <NetworkStatus />
      <div>
        <Suspense fallback={<>...</>}>
          <WalletContainer />
        </Suspense>
      </div>
    </div>
  );
});
