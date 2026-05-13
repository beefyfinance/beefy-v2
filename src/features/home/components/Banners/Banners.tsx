import { memo } from 'react';
import { BusdBannerHome } from '../../../../components/Banners/BusdBanner/BusdBannerHome.tsx';
import { UnstakedClmBanner } from '../../../../components/Banners/UnstakedClmBanner/UnstakedClmBanner.tsx';
import { styled } from '@repo/styles/jsx';
import { AnnouncementBanner } from '../../../../components/Banners/AnnouncementBanner/AnnouncementBanner.tsx';

export const Banners = memo(function Banners() {
  return (
    <BannerList>
      <UnstakedClmBanner />
      <BusdBannerHome />
      <AnnouncementBanner />
    </BannerList>
  );
});

const BannerList = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    '& > :last-child': {
      marginBottom: '24px',
    },
  },
});
