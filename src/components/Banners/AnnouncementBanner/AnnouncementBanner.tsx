import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useLocalStorageBoolean } from '../../../helpers/useLocalStorageBoolean';
import { Banner } from '../Banner';
import SnapshotIcon from '../../../images/partners/snapshot-logo.svg';

const useStyles = makeStyles(styles);

export const AnnouncementBanner = memo(function AnnouncementBanner() {
  const classes = useStyles();
  const [hideBanner, setHideBanner] = useLocalStorageBoolean('hideBip62Banner', false);

  const closeBanner = useCallback(() => {
    setHideBanner(true);
  }, [setHideBanner]);

  if (hideBanner) {
    return null;
  }

  return (
    <Banner
      icon={<img className={classes.icon} src={SnapshotIcon} alt="snapshot" />}
      text={
        <>
          [BIP: 62] Request For Funds. Premium Placement on Coinbase. Discuss on{' '}
          <a
            href="https://discord.gg/beefyfinance"
            target="_blank"
            rel="noopener noreferrer"
            className={classes.link}
          >
            Discord
          </a>{' '}
          and vote on{' '}
          <a
            href="https://vote.beefy.finance/#/proposal/0x27c42e4677603cf9d546b3bc1a42a398444a9d664f0482594758680577a2e5a9/"
            target="_blank"
            rel="noopener noreferrer"
            className={classes.link}
          >
            Snapshot.
          </a>{' '}
        </>
      }
      onClose={closeBanner}
    />
  );
});
