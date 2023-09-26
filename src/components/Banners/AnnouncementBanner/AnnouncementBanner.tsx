import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useLocalStorageBoolean } from '../../../helpers/useLocalStorageBoolean';
import { Banner } from '../Banner';
import Snap from '../../../images/icons/beefy-treasury.svg';

const useStyles = makeStyles(styles);

export const AnnouncementBanner = memo(function AnnouncementBanner() {
  const classes = useStyles();
  const [hideBanner, setHideBanner] = useLocalStorageBoolean('hideSnapCheckBanner', false);

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
          The wait is almost over. A new era dawns. Review the{' '}
          <a
            className={classes.link}
            href="https://snapshot.beefy.finance/"
            target="_blank"
            rel="noopener"
          >
            $BIFI snapshot
          </a>{' '}
          to check your allocation for the upcoming distribution.
        </>
      }
      onClose={closeBanner}
    />
  );
});
