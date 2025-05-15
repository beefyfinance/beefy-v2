import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../data/store/hooks.ts';
import type { VaultEntity } from '../../../data/entities/vault.ts';
import { selectIsVaultNexus } from '../../../data/selectors/partners.ts';
import { NexusCard } from '../NexusCard/NexusCard.tsx';
import { OpenCoverCard } from '../OpenCoverCard/OpenCoverCard.tsx';
import { PartnerCards } from '../PartnerCard/PartnerCards.tsx';

interface InsuranceCardsProps {
  vaultId: VaultEntity['id'];
}

export const InsuranceCards = memo<InsuranceCardsProps>(function InsuranceCards({ vaultId }) {
  const { t } = useTranslation();
  const isNexus = useAppSelector(state => selectIsVaultNexus(state, vaultId));

  return (
    <PartnerCards title={t('Insurance')} openByDefault={true}>
      {isNexus && <NexusCard />}
      <OpenCoverCard />
    </PartnerCards>
  );
});
