import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { PartnerCard } from '../PartnerCard';
import { getPartnerSrc } from '../../../../helpers/partnerSrc';
import type { VaultEntity } from '../../../data/entities/vault';
import { selectVaultById } from '../../../data/selectors/vaults';
import { useAppSelector } from '../../../../store';

export type PoolTogetherCardProps = {
  vaultId: VaultEntity['id'];
};

export const PoolTogetherCard = memo<PoolTogetherCardProps>(function PoolTogetherCard({ vaultId }) {
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  if (!vault.poolTogether) {
    return null;
  }

  return (
    <PartnerCard
      logo={getPartnerSrc('pooltogether')}
      title={t('PoolTogether-Title')}
      content={t('PoolTogether-Content')}
      url={vault.poolTogether}
    />
  );
});
