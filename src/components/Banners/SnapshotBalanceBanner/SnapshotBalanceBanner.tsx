import React, { memo, useCallback } from 'react';
import type { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { useLocalStorageBoolean } from '../../../helpers/useLocalStorageBoolean';
import { Banner } from '../Banner';
import Token from '../../../images/single-assets/BIFI.png';

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
  const [hideBanner, setHideBanner] = useLocalStorageBoolean('hideSnapCheckBanner4', false);

  const closeBanner = useCallback(() => {
    setHideBanner(true);
  }, [setHideBanner]);

  if (hideBanner) {
    return null;
  }

  return (
    <Banner
      icon={<img alt="snapshot" src={Token} className={classes.icon} />}
      text={<EveryoneText />}
      onClose={closeBanner}
    />
  );
});

export const EveryoneText = memo(function EveryoneText() {
  // const classes = useStyles();
  return (
    <>
      {
        "The new BIFI and mooBIFI tokens have officially launched! Distribution on both Ethereum and Optimism is now complete. We've also rolled out the BIFI Pool and Vault and provided liquidity on Uniswap and Velodrome for trading. Selected CEX's should resume operations shortly."
      }
      {/*<a*/}
      {/*  className={classes.link}*/}
      {/*  href="https://snapshot.beefy.finance/"*/}
      {/*  target="_blank"*/}
      {/*  rel="noopener"*/}
      {/*>*/}
      {/*  Review your allocation*/}
      {/*</a>{' '}*/}
      {/*and{' '}*/}
      {/*<a*/}
      {/*  className={classes.link}*/}
      {/*  target="_blank"*/}
      {/*  rel="noopener"*/}
      {/*  href="https://beefy.com/articles/migration-implementation/"*/}
      {/*>*/}
      {/*  read more.*/}
      {/*</a>*/}
    </>
  );
});
