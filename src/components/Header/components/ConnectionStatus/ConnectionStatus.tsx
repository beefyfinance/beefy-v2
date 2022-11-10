import { makeStyles } from '@material-ui/core';
import React, { memo, Suspense } from 'react';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
} from '../../../../features/data/selectors/wallet';
import { useAppSelector } from '../../../../store';
import { NetworkStatus } from '../../../NetworkStatus';
import { styles } from './styles';

// lazy load web3 related stuff, as libs are quite heavy
const WalletContainer = React.lazy(() => import(`../WalletContainer`));

const useStyles = makeStyles(styles);

const ActiveChain = ({ chainId }: { chainId: string | null }) => {
  const classes = useStyles();

  return (
    <>
      <div className={classes.line} />
      <div className={classes.chain} style={{ textDecoration: 'none' }}>
        <img
          alt={chainId}
          src={
            chainId
              ? require(`../../../../images/networks/${chainId}.svg`).default
              : require('../../../../images/icons/navigation/unsuported-chain.svg').default
          }
        />
      </div>
    </>
  );
};

export const ConnectionStatus = memo(function () {
  const currentChainId = useAppSelector(selectCurrentChainId);
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <div className={classes.statusContainer}>
        <NetworkStatus />
        {isWalletConnected && <ActiveChain chainId={currentChainId} />}
      </div>
      <div>
        <Suspense fallback={<>...</>}>
          <WalletContainer />
        </Suspense>
      </div>
    </div>
  );
});
