import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { getPartnerSrc } from '../../../../helpers/partnerSrc.ts';
import { useAppSelector } from '../../../data/store/hooks.ts';
import type { VaultEntity } from '../../../data/entities/vault.ts';
import { selectVaultById } from '../../../data/selectors/vaults.ts';
import { PartnerCard } from '../PartnerCard/PartnerCard.tsx';

export type PoolTogetherCardProps = {
  vaultId: VaultEntity['id'];
};

export const PoolTogetherCard = memo(function PoolTogetherCard({ vaultId }: PoolTogetherCardProps) {
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
