import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../../../../components/Modal/Modal.tsx';
import { formatLargeUsd } from '../../../../../helpers/format.ts';
import { useAppSelector } from '../../../../data/store/hooks.ts';
import { selectTotalTvl } from '../../../../data/selectors/tvl.ts';
import { selectTotalActiveVaults } from '../../../../data/selectors/vaults.ts';
import { ModalTvl } from '../ModalTvl/ModalTvl.tsx';
import { Stat } from './Stat.tsx';
import { Stats } from './Stats.tsx';

export const VaultsStats = memo(function VaultStats() {
  const [isTvlModalOpen, setIsTvlModalOpen] = useState<boolean>(false);
  const { t } = useTranslation();
  const totalTvl = useAppSelector(selectTotalTvl);
  const totalActiveVaults = useAppSelector(selectTotalActiveVaults);

  const handleTvlModalOpen = useCallback(() => {
    setIsTvlModalOpen(true);
  }, [setIsTvlModalOpen]);

  const handleTvlModalClose = useCallback(() => {
    setIsTvlModalOpen(false);
  }, [setIsTvlModalOpen]);

  return (
    <Stats>
      <Stat
        label={t('TVL')}
        value={formatLargeUsd(totalTvl)}
        onInfo={handleTvlModalOpen}
        loading={!totalTvl}
      />
      <Stat
        label={t('Vaults-Title')}
        value={totalActiveVaults.toString()}
        loading={!totalActiveVaults}
      />
      <Modal open={isTvlModalOpen} onClose={handleTvlModalClose} scrollable={false}>
        <ModalTvl close={handleTvlModalClose} />
      </Modal>
    </Stats>
  );
});
