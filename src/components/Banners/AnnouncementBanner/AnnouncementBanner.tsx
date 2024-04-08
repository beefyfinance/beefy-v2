import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useLocalStorageBoolean } from '../../../helpers/useLocalStorageBoolean';
import { Banner } from '../Banner';
import Snap from '../../../images/partners/snapshot-logo.svg';

const useStyles = makeStyles(styles);

export const AnnouncementBanner = memo(function AnnouncementBanner() {
  const classes = useStyles();
  const [hideBanner, setHideBanner] = useLocalStorageBoolean('hideBIP77', false);

  const closeBanner = useCallback(() => {
    setHideBanner(true);
  }, [setHideBanner]);

  if (hideBanner) {
    return null;
  }

  return (
    <Banner
      icon={<img alt="snapshot" src={Snap} className={classes.icon} />}
      text={
        <>
          [BIP:77] Contributor Funding Q2 2024. Discuss on
          <a className={classes.link} target="__blank" href="https://discord.gg/beefyfinance">
            {' '}
            Discord{' '}
          </a>
          and vote on{' '}
          <a
            className={classes.link}
            href="https://snapshot.org/#/beefydao.eth/proposal/0x0a8191d68040041a1e91562897c7563c0f4658c4b22e496813a18810cd7674c2"
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
