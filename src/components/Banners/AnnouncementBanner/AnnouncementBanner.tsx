import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useLocalStorageBoolean } from '../../../helpers/useLocalStorageBoolean';
import { Banner } from '../Banner';
import snapshotLogo from '../../../images/partners/snapshot-logo.svg';

const useStyles = makeStyles(styles);

export const AnnouncementBanner = memo(function AnnouncementBanner() {
  const classes = useStyles();
  const [hideBanner, setHideBanner] = useLocalStorageBoolean('hideBip58Banner', false);

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
          [BIP:58] Adopt Governance Guidelines. Discuss on
          <a className={classes.link} target="__blank" href="https://discord.gg/yq8wfHd">
            {' '}
            Discord{' '}
          </a>
          and vote on
          <a
            target="__blank"
            className={classes.link}
            href="https://vote.beefy.finance/#/proposal/0x90e15a8ba3cfa8b9539b6a428130ae2987d77336ed6f9005f198b744552bc081"
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
