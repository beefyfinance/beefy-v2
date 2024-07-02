import React, { memo, useCallback } from 'react';
import { useLocalStorageBoolean } from '../../../helpers/useLocalStorageBoolean';
import { Banner } from '../Banner';
import clm from '../../../images/icons/clm.svg';
import { ExternalLink } from '../Links/Links';

export const AnnouncementBanner = memo(function AnnouncementBanner() {
  const [hideBanner, setHideBanner] = useLocalStorageBoolean('hideClmbannerprod', false);

  const closeBanner = useCallback(() => {
    setHideBanner(true);
  }, [setHideBanner]);

  if (hideBanner) {
    return null;
  }

  return (
    <Banner
      icon={<img alt="snapshot" src={clm} width={24} height={24} />}
      text={
        <>
          <ExternalLink href="https://beefy.com/articles/ltipp/">Unleashing the CLM:</ExternalLink>{' '}
          {`The full functionality of Beefy’s app arrives for CLM across the chains. ZAP, Yield Module, Dashboard, and 12 weeks of ARB incentives kick off to turbocharge CLM yields for users. Cowcentrate your liquidity today!`}
        </>
      }
      onClose={closeBanner}
    />
  );
});
