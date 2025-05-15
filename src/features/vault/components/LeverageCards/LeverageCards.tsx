import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../data/store/hooks.ts';
import type { VaultEntity } from '../../../data/entities/vault.ts';
import { selectIsVaultQidao } from '../../../data/selectors/partners.ts';
import { PartnerCards } from '../PartnerCard/PartnerCards.tsx';
import { QiDao } from '../QiDaoCard/QiDaoCard.tsx';

interface LeverageCardsProps {
  vaultId: VaultEntity['id'];
}

export const LeverageCards = memo<LeverageCardsProps>(function LeverageCards({ vaultId }) {
  const { t } = useTranslation();
  const isQidao = useAppSelector(state => selectIsVaultQidao(state, vaultId));

  if (!isQidao) {
    return null;
  }

  return (
    <PartnerCards title={t('Leverage')} openByDefault={true}>
      <QiDao />
    </PartnerCards>
  );
});
