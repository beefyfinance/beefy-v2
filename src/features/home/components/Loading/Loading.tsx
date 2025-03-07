import { memo } from 'react';
import { TechLoader } from '../../../../components/TechLoader/TechLoader.tsx';
import { useTranslation } from 'react-i18next';

export const Loading = memo(function Loading() {
  const { t } = useTranslation();

  return <TechLoader text={t('Vaults-LoadingData')} />;
});
