import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useLocalStorageBoolean } from '../../../helpers/useLocalStorageBoolean';
import { Banner } from '../Banner';
import SnapshotLogo from '../../../images/partners/snapshot-logo.svg';

const useStyles = makeStyles(styles);

export const AnnouncementBanner = memo(function AnnouncementBanner() {
  const classes = useStyles();
  const [hideBanner, setHideBanner] = useLocalStorageBoolean('hideBIP71Banner', false);

  const closeBanner = useCallback(() => {
    setHideBanner(true);
  }, [setHideBanner]);

  if (hideBanner) {
    return null;
  }

  return (
    <Banner
      icon={<img alt="snapshot" src={SnapshotLogo} className={classes.icon} />}
      text={
        <>
          New proposal is live: [BIP:71] $BIFI Migration Plan. Discuss on{' '}
          <a
            className={classes.link}
            href="https://discord.com/invite/beefyfinance"
            target="_blank"
            rel="noopener"
          >
            Discord
          </a>{' '}
          and vote on{' '}
          <a
            className={classes.link}
            href="https://vote.beefy.finance/#/proposal/0x975b10f949c0ea62a53f7a3ab5aa738376422efbd7bb33712daa74b98bd4b727"
            target="_blank"
            rel="noopener"
          >
            Snapshot.
          </a>
        </>
      }
      onClose={closeBanner}
    />
  );
});
