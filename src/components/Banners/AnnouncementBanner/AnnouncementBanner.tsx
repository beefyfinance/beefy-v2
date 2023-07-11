import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useLocalStorageBoolean } from '../../../helpers/useLocalStorageBoolean';
import { Banner } from '../Banner';
import SnapshotLogo from '../../../images/partners/snapshot-logo.svg';

const useStyles = makeStyles(styles);

export const AnnouncementBanner = memo(function AnnouncementBanner() {
  const classes = useStyles();
  const [hideBanner, setHideBanner] = useLocalStorageBoolean('hideSavedBanner', false);

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
          New signalling proposal is live: [BSP:03] To gauge support for a plan to migrate $BIFI
          away from Multichain. Discuss on{' '}
          <a
            className={classes.link}
            href="https://discord.gg/qvrRTRmW"
            target="_blank"
            rel="noopener"
          >
            Discord
          </a>{' '}
          and vote on{' '}
          <a
            className={classes.link}
            href="https://snapshot.org/#/beefydao.eth/proposal/0x55e6ad9dd3ebcca3334e23872fa8e2ab1e926466b3d2d0af6f462cc45b1541a2"
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
