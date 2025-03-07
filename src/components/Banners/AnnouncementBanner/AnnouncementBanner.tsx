import { memo } from 'react';
import clm from '../../../images/icons/clm.svg';
import { DismissibleBanner } from '../Banner/DismissibleBanner.tsx';
import { ExternalLink } from '../Links/ExternalLink.tsx';

export const AnnouncementBanner = memo(function AnnouncementBanner() {
  return (
    <DismissibleBanner
      id="clm-launch"
      icon={<img alt="snapshot" src={clm} width={24} height={24} />}
      text={
        <>
          <ExternalLink href="https://beefy.com/articles/ltipp/">Unleashing the CLM:</ExternalLink>{' '}
          {`The full functionality of Beefy’s app arrives for CLM across the chains. ZAP, Yield Module, Dashboard, and 12 weeks of ARB incentives kick off to turbocharge CLM yields for users. Cowcentrate your liquidity today!`}
        </>
      }
    />
  );
});
