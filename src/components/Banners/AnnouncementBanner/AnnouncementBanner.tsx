import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useLocalStorageBoolean } from '../../../helpers/useLocalStorageBoolean';
import { Banner } from '../Banner';
import clm from '../../../images/icons/clm.svg';

const useStyles = makeStyles(styles);

export const AnnouncementBanner = memo(function AnnouncementBanner() {
  const classes = useStyles();
  const [hideBanner, setHideBanner] = useLocalStorageBoolean('hideClmbanner', false);

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
          {`Beefy's revolutionary Cowcentrated Liquidity Management beta is live! Discover a wealth of
          features in a whole new approach to liquidity and learn more with our launch`}{' '}
          <a className={classes.link} target="__blank" href="https://beefy.com/articles/clm/">
            blog post
          </a>{' '}
          and new{' '}
          <a
            className={classes.link}
            href="https://docs.beefy.finance/beefy-products/clm"
            target="_blank"
            rel="noopener"
          >
            documentation
          </a>
          .
        </>
      }
      onClose={closeBanner}
    />
  );
});
