import { memo, useCallback } from 'react';
import type { DismissibleBannerProps } from './types.ts';
import { Banner } from './Banner.tsx';
import { useLocalStorageBoolean } from '../../../helpers/useLocalStorageBoolean.ts';

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
