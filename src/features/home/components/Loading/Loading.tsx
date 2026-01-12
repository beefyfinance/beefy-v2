import { memo } from 'react';
import { FullscreenTechLoader } from '../../../../components/TechLoader/TechLoader.tsx';
import { useTranslation } from 'react-i18next';

export const Loading = memo(function Loading() {
  const { t } = useTranslation();

  return <FullscreenTechLoader text={t('Vaults-LoadingData')} />;
});
