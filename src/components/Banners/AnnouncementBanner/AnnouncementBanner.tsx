import { memo } from 'react';
import clm from '../../../images/icons/zap.svg';
import { DismissibleBanner } from '../Banner/DismissibleBanner.tsx';
import { ExternalLink } from '../Links/ExternalLink.tsx';
export const AnnouncementBanner = memo(function AnnouncementBanner() {
  return (
    <DismissibleBanner
      id="zapv4-launch"
      icon={<img alt="snapshot" src={clm} width={24} height={24} />}
      text={
        <>
          Zap just got bigger. You can now deposit and withdraw from hundreds of Beefy vaults across
          10 chains in a single transaction — we handle the bridging, swapping, liquidity and
          staking for you. Find your vault and we'll handle the rest.{' '}
          <ExternalLink href="https://beefy.com/articles/zap-v4">Learn more.</ExternalLink>
        </>
      }
    />
  );
});
