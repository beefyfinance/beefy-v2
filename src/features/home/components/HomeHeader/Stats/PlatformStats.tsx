import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../../../../components/Modal/Modal.tsx';
import { formatLargeUsd, formatTokenDisplayCondensed } from '../../../../../helpers/format.ts';
import { useAppSelector } from '../../../../data/store/hooks.ts';
import { selectTotalTvl } from '../../../../data/selectors/tvl.ts';
import { selectTotalActiveVaults } from '../../../../data/selectors/vaults.ts';
import { ModalTvl } from '../ModalTvl/ModalTvl.tsx';
import { Stat } from './Stat.tsx';
import { PlatformStatsContainer } from './Stats.tsx';
import { useBreakpoint } from '../../../../../components/MediaQueries/useBreakpoint.ts';
import ExpandMore from '../../../../../images/icons/mui/ExpandMore.svg?react';
import { styled } from '@repo/styles/jsx';
import { selectCurrentWeekRevenueStat } from '../../../../data/selectors/revenue.ts';
import type { BeefyState } from '../../../../data/store/types.ts';

export const PlatformStats = memo(function PlatformStats() {
  const [isTvlModalOpen, setIsTvlModalOpen] = useState<boolean>(false);
  const { t } = useTranslation();
  const totalTvl = useAppSelector(selectTotalTvl);
  const totalActiveVaults = useAppSelector(selectTotalActiveVaults);
  const currentWeekRevenueYieldUsd = useAppSelector((state: BeefyState) =>
    selectCurrentWeekRevenueStat(state, 'yieldUsd')
  );
  const currentWeekRevenueRevenueUsd = useAppSelector((state: BeefyState) =>
    selectCurrentWeekRevenueStat(state, 'revenueUsd')
  );

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
        label={t('Platform-7DaysYield')}
        value={formatLargeUsd(currentWeekRevenueYieldUsd)}
        loading={!totalActiveVaults}
        tooltip={t('Platform-7DaysYield-Tooltip')}
      />
      <Stat
        label={t('Platform-7DaysRevenue')}
        value={formatLargeUsd(currentWeekRevenueRevenueUsd)}
        loading={!totalActiveVaults}
        tooltip={t('Platform-7DaysRevenue-Tooltip')}
      />
      <Stat
        label={t('Platform-7DaysBuyback')}
        value={<BuybackAmountStat />}
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
    <ValueStatContainer>
      {formatLargeUsd(totalTvl)} <ExpandMoreIcon />
    </ValueStatContainer>
  );
});

const BuybackAmountStat = memo(function BuybackAmountStat() {
  const [mode, setMode] = useState<'usd' | 'amount'>('usd');

  const currentWeekRevenueBuybackUsd = useAppSelector((state: BeefyState) =>
    selectCurrentWeekRevenueStat(state, 'buybackUsd')
  );
  const currentWeekRevenueBuybackAmount = useAppSelector((state: BeefyState) =>
    selectCurrentWeekRevenueStat(state, 'buybackAmount')
  );

  const Label = useMemo(() => {
    return mode === 'usd' ? 'USDT' : 'BIFI';
  }, [mode]);

  const Value = useMemo(() => {
    return mode === 'usd' ?
        formatLargeUsd(currentWeekRevenueBuybackUsd)
      : formatTokenDisplayCondensed(currentWeekRevenueBuybackAmount, 18, 6);
  }, [mode, currentWeekRevenueBuybackUsd, currentWeekRevenueBuybackAmount]);

  const handleModeChange = useCallback(() => {
    setMode(mode === 'usd' ? 'amount' : 'usd');
  }, [mode]);

  return (
    <ValueStatContainer buyback={true}>
      {Value}
      <StyledSwitchButton onClick={handleModeChange}>{Label}</StyledSwitchButton>
    </ValueStatContainer>
  );
});

const ValueStatContainer = styled('div', {
  base: {
    textStyle: 'h3',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    _hover: {
      cursor: 'pointer',
    },
  },
  variants: {
    buyback: {
      true: {
        gap: '4px',
        alignItems: 'flex-end',
      },
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

const StyledSwitchButton = styled('button', {
  base: {
    backgroundColor: 'transparent',
    border: 'none',
    padding: 0,
    margin: 0,
    textStyle: 'subline.sm.semiBold',
    color: 'text.dark',
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
    textDecorationColor: 'text.underline',
    _hover: {
      color: 'text.middle',
    },
  },
});
