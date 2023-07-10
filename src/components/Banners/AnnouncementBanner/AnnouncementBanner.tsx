import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useLocalStorageBoolean } from '../../../helpers/useLocalStorageBoolean';
import { Banner } from '../Banner';
import { ReactComponent as SnapshotLogo } from '../../../images/partners/snapshot-logo.svg';

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
      icon={<SnapshotLogo className={classes.icon} />}
      text={
        <>
          New signalling proposal is live: [BSP:03] To gauge support for a plan to promptly migrate
          $BIFI token away from Multichain. Discuss on{' '}
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
            href="https://vote.beefy.finance/#/proposal/0xdd3cc7640a784f78621062ccd0641d765f5ca9dcc91dfaa823e19329ee8f77f5"
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
