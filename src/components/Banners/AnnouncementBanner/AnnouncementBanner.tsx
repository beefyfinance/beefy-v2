import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useLocalStorageBoolean } from '../../../helpers/useLocalStorageBoolean';
import { Banner } from '../Banner';
import ZapIcon from '../../../images/bifi-logos/bifi-zap-v2.svg';

const useStyles = makeStyles(styles);

export const AnnouncementBanner = memo(function AnnouncementBanner() {
  const classes = useStyles();
  const [hideBanner, setHideBanner] = useLocalStorageBoolean('hideZapBanner', false);

  const closeBanner = useCallback(() => {
    setHideBanner(true);
  }, [setHideBanner]);

  if (hideBanner) {
    return null;
  }

  return (
    <Banner
      icon={<img className={classes.icon} src={ZapIcon} alt="treasury" />}
      text={
        <>
          Zap into the future with the all-new{' '}
          <a
            href="https://beefy.com/articles/revolutionizing-beefy-zap-in-partnership-with-1inch/"
            target="_blank"
            rel="noopener noreferrer"
            className={classes.link}
          >
            Beefy Zap.
          </a>{' '}
          From blue chips, natives and stables to Beefy vaults in just one transaction, powered by
          1inch.
        </>
      }
      onClose={closeBanner}
    />
  );
});
