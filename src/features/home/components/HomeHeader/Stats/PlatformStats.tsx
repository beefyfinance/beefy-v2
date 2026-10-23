import { memo, type MouseEvent, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type BigNumber from 'bignumber.js';
import { styled } from '@repo/styles/jsx';
import { Modal } from '../../../../../components/Modal/Modal.tsx';
import { Sparkline } from '../../../../../components/Sparkline/Sparkline.tsx';
import { useAppSelector } from '../../../../data/store/hooks.ts';
import { selectTotalActiveVaults } from '../../../../data/selectors/vaults.ts';
import { PlatformStatsModal } from '../PlatformStatsModal/PlatformStatsModal.tsx';
import { Stat } from './Stat.tsx';
import { PlatformStatsContainer } from './Stats.tsx';
import { useBreakpoint } from '../../../../../hooks/useBreakpoint.ts';
import ExpandMore from '../../../../../images/icons/mui/ExpandMore.svg?react';
import type { BuybackUnit } from '../../../../data/utils/platform-stats.ts';
import {
  formatMetricValue,
  METRIC_CONFIG,
  PLATFORM_METRICS,
  type PlatformMetric,
  type PlatformMetricData,
  usePlatformMetrics,
} from './usePlatformMetrics.ts';

export const PlatformStats = memo(function PlatformStats() {
  const { t } = useTranslation();
  const [openMetric, setOpenMetric] = useState<PlatformMetric | null>(null);
  const [buybackUnit, setBuybackUnit] = useState<BuybackUnit>('usd');
  const totalActiveVaults = useAppSelector(selectTotalActiveVaults);
  const metrics = usePlatformMetrics(buybackUnit);
  const isMobile = useBreakpoint({ to: 'xs' });
  const handleClose = useCallback(() => setOpenMetric(null), []);

  return (
    <PlatformStatsContainer>
      <Stat
        label={t('Platform-Vaults')}
        value={totalActiveVaults.toString()}
        loading={!totalActiveVaults}
      />
      {PLATFORM_METRICS.map(metric => (
        <MetricStat
          key={metric}
          metric={metric}
          data={metrics[metric]}
          buybackUnit={buybackUnit}
          onBuybackUnitChange={setBuybackUnit}
          onOpen={setOpenMetric}
        />
      ))}
      <Modal
        position={isMobile ? 'bottom' : 'center'}
        open={openMetric !== null}
        onClose={handleClose}
        scrollable={false}
      >
        {openMetric ?
          <PlatformStatsModal
            metric={openMetric}
            onMetricChange={setOpenMetric}
            metrics={metrics}
            buybackUnit={buybackUnit}
            onBuybackUnitChange={setBuybackUnit}
            close={handleClose}
          />
        : null}
      </Modal>
    </PlatformStatsContainer>
  );
});

type MetricStatProps = {
  metric: PlatformMetric;
  data: PlatformMetricData;
  buybackUnit: BuybackUnit;
  onBuybackUnitChange: (unit: BuybackUnit) => void;
  onOpen: (metric: PlatformMetric) => void;
};

const MetricStat = memo(function MetricStat({
  metric,
  data,
  buybackUnit,
  onBuybackUnitChange,
  onOpen,
}: MetricStatProps) {
  const { t } = useTranslation();
  const handleClick = useCallback(() => onOpen(metric), [onOpen, metric]);

  return (
    <Stat
      label={t(METRIC_CONFIG[metric].label)}
      value={
        metric === 'buyback' ?
          <BuybackAmountStat
            value={data.value}
            unit={buybackUnit}
            onUnitChange={onBuybackUnitChange}
          />
        : <ValueWithChevron value={formatMetricValue(metric, data.value, buybackUnit)} />
      }
      onClick={handleClick}
      loading={data.loading}
      trend={<Sparkline values={data.trend} variant={METRIC_CONFIG[metric].trend} />}
    />
  );
});

const ValueWithChevron = memo(function ValueWithChevron({ value }: { value: string }) {
  return (
    <ValueStatContainer>
      {value}
      <Chevron />
    </ValueStatContainer>
  );
});

// focusable target; its click bubbles to the stat tile
const Chevron = memo(function Chevron() {
  const { t } = useTranslation();
  return (
    <ChevronButton type="button" aria-label={t('Platform-Stats')}>
      <ExpandMoreIcon />
    </ChevronButton>
  );
});

type BuybackAmountStatProps = {
  value: BigNumber.Value | undefined;
  unit: BuybackUnit;
  onUnitChange: (unit: BuybackUnit) => void;
};

const BuybackAmountStat = memo(function BuybackAmountStat({
  value,
  unit,
  onUnitChange,
}: BuybackAmountStatProps) {
  const formatted = formatMetricValue('buyback', value, unit);
  const handleUnitChange = useCallback(
    (e: MouseEvent) => {
      // the switch sits inside the clickable tile
      e.stopPropagation();
      onUnitChange(unit === 'usd' ? 'bifi' : 'usd');
    },
    [unit, onUnitChange]
  );

  return (
    <ValueStatContainer buyback={true}>
      {formatted}
      <StyledSwitchButton onClick={handleUnitChange}>
        {unit === 'usd' ? 'USD' : 'BIFI'}
      </StyledSwitchButton>
      <Chevron />
    </ValueStatContainer>
  );
});

const ValueStatContainer = styled('div', {
  base: {
    textStyle: 'h3',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    whiteSpace: 'nowrap',
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

const ChevronButton = styled('button', {
  base: {
    display: 'flex',
    // centred on the value, also in the buyback row that aligns to the bottom
    alignSelf: 'center',
    padding: 0,
    color: 'text.dark',
  },
});

const ExpandMoreIcon = styled(ExpandMore, {
  base: {
    transform: 'rotate(270deg)',
    width: '20px',
    height: '20px',
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
