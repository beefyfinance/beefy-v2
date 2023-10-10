import React, { memo, useCallback, useEffect, useMemo } from 'react';
import type { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { useLocalStorageBoolean } from '../../../helpers/useLocalStorageBoolean';
import { Banner } from '../Banner';
import Token from '../../../images/icons/beefy-treasury.svg';
import { useAppDispatch, useAppSelector } from '../../../store';
import { selectWalletAddressIfKnown } from '../../../features/data/selectors/wallet';
import { fetchUserSnapshotBalance } from '../../../features/data/actions/snapshot-balance';
import { BIG_ZERO } from '../../../helpers/big-number';
import type BigNumber from 'bignumber.js';
import { formatBigDecimals } from '../../../helpers/format';

const useStyles = makeStyles((theme: Theme) => ({
  icon: { height: '24px', width: '24px' },
  link: {
    textDecoration: 'none',
    color: theme.palette.primary.main,
  },
  space: { marginBottom: '4px' },
}));

export const SnapshotBalanceBanner = memo(function AnnouncementBanner() {
  const classes = useStyles();
  const [hideBanner, setHideBanner] = useLocalStorageBoolean('hideSnapCheckBanner2', false);
  const walletAddress = useAppSelector(selectWalletAddressIfKnown);
  const userLpBalance = useAppSelector(
    state => state.user.balance.byAddress[walletAddress]?.snapshotBalance?.lp ?? BIG_ZERO
  );

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (walletAddress) {
      dispatch(fetchUserSnapshotBalance({ address: walletAddress }));
    }
  }, [dispatch, walletAddress]);

  const closeBanner = useCallback(() => {
    setHideBanner(true);
  }, [setHideBanner]);

  const TextComponent = useMemo(() => {
    if (walletAddress && userLpBalance.gt(BIG_ZERO)) {
      return <LpText address={walletAddress} balance={userLpBalance} />;
    }

    return <EveryoneText />;
  }, [userLpBalance, walletAddress]);

  if (hideBanner) {
    return null;
  }

  return (
    <Banner
      icon={<img alt="snapshot" src={Token} className={classes.icon} />}
      text={TextComponent}
      onClose={closeBanner}
    />
  );
});

export const LpText = memo(function LpText({
  address,
  balance,
}: {
  address: string;
  balance: BigNumber;
}) {
  const classes = useStyles();
  return (
    <>
      <div className={classes.space}>
        {`The BIFI token migration is approaching. We strongly recommend that everyone keeps their BIFI in their wallet, on a CEX, or stakes it into the Earnings Pool. BIFI held in custom contracts (Gnosis, 3rd party staking pools, some LPs, etc.) won't be supported by the automated distribution.`}
      </div>
      According to the{' '}
      <a
        className={classes.link}
        href="https://snapshot.beefy.finance/"
        target="_blank"
        rel="noopener"
      >
        preliminary snapshot
      </a>{' '}
      taken on October 9th, you still have {formatBigDecimals(balance)} BIFI in the{' '}
      <a
        className={classes.link}
        href={`https://debank.com/profile/${address}`}
        target="_blank"
        rel="noopener"
      >
        liquidity pools.
      </a>{' '}
      Consider removing liquidity before the final snapshot to avoid any potential loss of value.
    </>
  );
});

export const EveryoneText = memo(function EveryoneText() {
  const classes = useStyles();
  return (
    <>
      {`The BIFI token migration is approaching. We strongly recommend that everyone keeps their BIFI in their wallet, on a CEX, or stakes it into the Earnings Pool. BIFI held in custom contracts (Gnosis, 3rd party staking pools, some LPs, etc.) won't be supported by the automated distribution. Review the`}{' '}
      <a
        className={classes.link}
        href="https://snapshot.beefy.finance/"
        target="_blank"
        rel="noopener"
      >
        preliminary snapshot
      </a>{' '}
      to check your allocation.
    </>
  );
});
