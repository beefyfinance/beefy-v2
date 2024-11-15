import { memo, useCallback } from 'react';
import { Banner, type BannerProps } from './Banner';
import { useLocalStorageBoolean } from '../../../helpers/useLocalStorageBoolean';

export type DismissibleBannerProps = Exclude<BannerProps, 'onClose'> & {
  id: string;
};

export const DismissibleBanner = memo<DismissibleBannerProps>(function DismissibleBanner({
  id,
  ...rest
}) {
  const [hideBanner, setHideBanner] = useLocalStorageBoolean(`banner.${id}`, false);

  const closeBanner = useCallback(() => {
    setHideBanner(true);
  }, [setHideBanner]);

  if (hideBanner) {
    return null;
  }

  return <Banner {...rest} onClose={closeBanner} />;
});
