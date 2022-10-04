import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { PartnerCard } from '../PartnerCard';
import InsuraceLogo from '../../../../images/partners/insurace.svg';

export const InsuraceCard = memo(function () {
  const { t } = useTranslation();
  return (
    <PartnerCard
      logo={InsuraceLogo}
      title={t('Insurace-Title')}
      content={t('Insurace-Content')}
      url="https://app.insurace.io/Insurance/Cart?id=110&chain=BSC&referrer=95244279533280151623141934507761661103282646845"
    />
  );
});
