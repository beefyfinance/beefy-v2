import { memo, useCallback } from 'react';
import { selectUserUnstakedCowcentratedVaultIds } from '../../../features/data/selectors/balance';
import { useAppSelector } from '../../../store';
import { Banner } from '../Banner';
import { useTranslation } from 'react-i18next';
import clmIcon from '../../../images/icons/clm.svg';
import { useLocalStorageBoolean } from '../../../helpers/useLocalStorageBoolean';

export const UnstakedClmBanner = memo(function UnstakedClmBanner() {
  const { t } = useTranslation();
  const unstakedIds = useAppSelector(selectUserUnstakedCowcentratedVaultIds);
  const [hideBanner, setHideBanner] = useLocalStorageBoolean(
    `hideUnstakedClmBanner.${unstakedIds.join(',')}`,
    false
  );
  const closeBanner = useCallback(() => {
    setHideBanner(true);
  }, [setHideBanner]);

  if (hideBanner || !unstakedIds.length) {
    return null;
  }

  return (
    <Banner
      icon={<img src={clmIcon} alt="" />}
      text={t('Banner-UnstakedClm', { count: unstakedIds.length })}
      onClose={closeBanner}
    />
  );
});
