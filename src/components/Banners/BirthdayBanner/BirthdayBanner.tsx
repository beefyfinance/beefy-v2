import { memo } from 'react';
import { DismissibleBanner } from '../Banner/DismissibleBanner.tsx';
import birthdayIcon from '../../../images/bifi-logos/header-logo-notext.png';

export const BirthdayBanner = memo(function BirthdayBanner() {
  return (
    <DismissibleBanner
      id="birthday-banner"
      icon={<img src={birthdayIcon} alt="" width={24} height={24} />}
      text="Celebrate Beefy’s 5th birthday! Explore our journey of growth and innovation — and share your #IUsedBeefy story to join the Hall of Fame. Moo-hoo!"
    />
  );
});
