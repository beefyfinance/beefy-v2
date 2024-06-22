import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { PartnerCard } from '../PartnerCard';
import { getPartnerSrc } from '../../../../helpers/partnerSrc';
import type { VaultEntity } from '../../../data/entities/vault';
import { useAppSelector } from '../../../../store';
import { selectIsVaultCowcentrated } from '../../../data/selectors/vaults';

export const OpenCoverCard = memo(function OpenCoverCard({
  vaultId,
}: {
  vaultId: VaultEntity['id'];
}) {
  const { t } = useTranslation();

  const isCowcentrated = useAppSelector(state => selectIsVaultCowcentrated(state, vaultId));
  return (
    <PartnerCard
      logo={getPartnerSrc('openCover')}
      title={t('OpenCover-Title')}
      content={t('OpenCover-Content')}
      url={
        isCowcentrated
          ? 'https://opencover.com/app/?invite=Beefy&cover=168'
          : 'https://opencover.com/app/?invite=BEEF100K&cover=14'
      }
    />
  );
});
