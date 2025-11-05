import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../../../../components/Modal/Modal.tsx';
import { formatLargeUsd } from '../../../../../helpers/format.ts';
import { useAppSelector } from '../../../../data/store/hooks.ts';
import { selectTotalTvl } from '../../../../data/selectors/tvl.ts';
import { selectTotalActiveVaults } from '../../../../data/selectors/vaults.ts';
import { ModalTvl } from '../ModalTvl/ModalTvl.tsx';
import { Stat } from './Stat.tsx';
import { PlatformStatsContainer } from './Stats.tsx';
import { useBreakpoint } from '../../../../../components/MediaQueries/useBreakpoint.ts';
import ExpandMore from '../../../../../images/icons/mui/ExpandMore.svg?react';
import { styled } from '@repo/styles/jsx';

export const PlatformStats = memo(function PlatformStats() {
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

  const isMobile = useBreakpoint({ to: 'xs' });

  return (
    <PlatformStatsContainer>
      <Stat
        label={t('Platform-Vaults')}
        value={totalActiveVaults.toString()}
        loading={!totalActiveVaults}
      />
      <Stat
        label={t('Platform-TVL')}
        value={<ValueTvlStat totalTvl={totalTvl} />}
        onClick={handleTvlModalOpen}
        loading={!totalTvl}
      />
      <Stat
        label={t('Platform-TotalYield')}
        value={totalActiveVaults.toString()}
        loading={!totalActiveVaults}
        tooltip={t('Platform-TotalYield-Tooltip')}
      />
      <Stat
        label={t('Platform-7DaysRevenue')}
        value={totalActiveVaults.toString()}
        loading={!totalActiveVaults}
        tooltip={t('Platform-7DaysRevenue-Tooltip')}
      />
      <Stat
        label={t('Platform-7DaysBuyback')}
        value={totalActiveVaults.toString()}
        loading={!totalActiveVaults}
        tooltip={t('Platform-7DaysBuyback-Tooltip')}
      />
      <Modal
        position={isMobile ? 'bottom' : 'center'}
        open={isTvlModalOpen}
        onClose={handleTvlModalClose}
        scrollable={false}
      >
        <ModalTvl close={handleTvlModalClose} />
      </Modal>
    </PlatformStatsContainer>
  );
});

const ValueTvlStat = memo(function ValueTvlStat({ totalTvl }: { totalTvl: BigNumber }) {
  return (
    <ValueTvlStatContainer>
      {formatLargeUsd(totalTvl)} <ExpandMoreIcon />
    </ValueTvlStatContainer>
  );
});

const ValueTvlStatContainer = styled('div', {
  base: {
    textStyle: 'h3',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    _hover: {
      cursor: 'pointer',
    },
  },
});

const ExpandMoreIcon = styled(ExpandMore, {
  base: {
    transform: 'rotate(270deg)',
    width: '20px',
    height: '20px',
    color: 'text.light',
  },
});
