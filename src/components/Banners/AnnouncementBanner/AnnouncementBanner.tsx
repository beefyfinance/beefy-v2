import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useLocalStorageBoolean } from '../../../helpers/useLocalStorageBoolean';
import { Banner } from '../Banner';
import snapshotLogo from '../../../images/partners/snapshot-logo.svg';

const useStyles = makeStyles(styles);

export const AnnouncementBanner = memo(function AnnouncementBanner() {
  const classes = useStyles();
  const [hideBanner, setHideBanner] = useLocalStorageBoolean('hideQuantumMiami', false);

  const closeBanner = useCallback(() => {
    setHideBanner(true);
  }, [setHideBanner]);

  if (hideBanner) {
    return null;
  }

  return (
    <Banner
      icon={<img className={classes.icon} src={snapshotLogo} alt="snapshot" />}
      text={
        <>
          New proposal is live: Request for Funds: Quantum Miami Sponsorship. Discuss on
          <a
            target="_blank"
            rel="noreferrer"
            className={classes.link}
            href="https://discord.gg/yq8wfHd"
          >
            {' '}
            Discord{' '}
          </a>
          and vote on
          <a
            target="_blank"
            rel="noreferrer"
            className={classes.link}
            href="https://vote.beefy.finance/#/proposal/0x9dcee63fd9ee4ec94ca51ce07d2f559fad40a9083d786dfac59b1ba9232b3961"
          >
            {' '}
            Snapshot.
          </a>
        </>
      }
      onClose={closeBanner}
    />
  );
});
