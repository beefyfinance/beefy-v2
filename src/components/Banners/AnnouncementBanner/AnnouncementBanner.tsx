import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useLocalStorageBoolean } from '../../../helpers/useLocalStorageBoolean';
import { Banner } from '../Banner';
import { Bookmark } from '@material-ui/icons';

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
      icon={<Bookmark className={classes.icon} />}
      text={
        <>
          Introducing{' '}
          <a
            className={classes.link}
            href="https://twitter.com/beefyfinance/status/1653402008890507267"
            target="_blank"
            rel="noopener"
          >
            Saved Vaults
          </a>{' '}
          {`- bookmark any of our 700+ vaults to keep track of the ones you're interested in, anytime
          and anywhere.`}
        </>
      }
      onClose={closeBanner}
    />
  );
});
