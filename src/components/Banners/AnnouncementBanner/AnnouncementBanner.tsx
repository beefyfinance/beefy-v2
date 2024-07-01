import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useLocalStorageBoolean } from '../../../helpers/useLocalStorageBoolean';
import { Banner } from '../Banner';
import clm from '../../../images/icons/clm.svg';

const useStyles = makeStyles(styles);

export const AnnouncementBanner = memo(function AnnouncementBanner() {
  const classes = useStyles();
  const [hideBanner, setHideBanner] = useLocalStorageBoolean('hideClmbannerprod', false);

  const closeBanner = useCallback(() => {
    setHideBanner(true);
  }, [setHideBanner]);

  if (hideBanner) {
    return null;
  }

  return (
    <Banner
      icon={<img alt="snapshot" src={clm} className={classes.icon} />}
      text={
        <>
          <a
            className={classes.link}
            rel="noopener"
            target="_blank"
            href="https://beefy.com/articles/ltipp/"
          >
            Unleashing the CLM:
          </a>{' '}
          {`The full functionality of Beefy’s app arrives for CLM across the chains. ZAP, Yield Module, Dashboard, and 12 weeks of ARB incentives kick off to turbocharge CLM yields for users. Cowcentrate your liquidity today!`}
        </>
      }
      onClose={closeBanner}
    />
  );
});
