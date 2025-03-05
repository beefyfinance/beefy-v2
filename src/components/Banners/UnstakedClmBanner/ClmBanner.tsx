import { memo } from 'react';
import { Banner } from '../Banner/Banner.tsx';
import type { ClmBannerProps } from './types.ts';
import clmIcon from '../../../images/icons/clm.svg';

export const ClmBanner = memo<ClmBannerProps>(function ClmBanner(rest) {
  return (
    <Banner
      variant="warning"
      icon={<img src={clmIcon} alt="" width={24} height={24} />}
      {...rest}
    />
  );
});
