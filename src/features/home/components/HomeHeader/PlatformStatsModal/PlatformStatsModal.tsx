import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { css } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';
import CloseIcon from '../../../../../images/icons/mui/Close.svg?react';
import InfoIcon from '../../../../../images/icons/i.svg?react';
import { Button } from '../../../../../components/Button/Button.tsx';
import { PercentChange } from '../../../../../components/PriceWithChange/PriceWithChange.tsx';
import { Sparkline } from '../../../../../components/Sparkline/Sparkline.tsx';
import { StatLoader } from '../../../../../components/StatLoader/StatLoader.tsx';
import { ToggleButtons } from '../../../../../components/ToggleButtons/ToggleButtons.tsx';
import { IconWithTooltip } from '../../../../../components/Tooltip/IconWithTooltip.tsx';
import { useBreakpoint } from '../../../../../hooks/useBreakpoint.ts';
import { Card } from '../../../../vault/components/Card/Card.tsx';
import { CardHeader } from '../../../../vault/components/Card/CardHeader.tsx';
import { CardIconButton } from '../../../../vault/components/Card/CardIconButton.tsx';
import { CardTitle } from '../../../../vault/components/Card/CardTitle.tsx';
import { TabButton } from '../../../../vault/components/Card/TabButton.tsx';
import {
  LineToggles,
  type LineTogglesState,
} from '../../../../vault/components/HistoricGraph/LineToggles/LineToggles.tsx';
import { styles as graphControlStyles } from '../../../../vault/components/HistoricGraph/GraphWithControls/styles.ts';
import type { BuybackUnit } from '../../../../data/utils/platform-stats.ts';
import {
  formatMetricValue,
  METRIC_CONFIG,
  PLATFORM_METRICS,
  type PlatformMetric,
  type PlatformMetricData,
} from '../Stats/usePlatformMetrics.ts';
import { Chains } from './Chains.tsx';
import { PlatformChart } from './PlatformChart.tsx';

type TvlView = 'history' | 'chains';

const UNIT_OPTIONS = [
  { value: 'usd' as const, label: 'USD' },
  { value: 'bifi' as const, label: 'BIFI' },
];
const TOGGLES_OFF: LineTogglesState = { average: false, movingAverage: false };

type PlatformStatsModalProps = {
  metric: PlatformMetric;
  onMetricChange: (metric: PlatformMetric) => void;
  metrics: Record<PlatformMetric, PlatformMetricData>;
  buybackUnit: BuybackUnit;
  onBuybackUnitChange: (unit: BuybackUnit) => void;
  close: () => void;
};

export const PlatformStatsModal = memo(function PlatformStatsModal({
  metric,
  onMetricChange,
  metrics,
  buybackUnit,
  onBuybackUnitChange,
  close,
}: PlatformStatsModalProps) {
  const { t } = useTranslation();
  // TVL opens on the chain list, as it does on prod today
  const [tvlView, setTvlView] = useState<TvlView>('chains');
  const [toggles, setToggles] = useState<LineTogglesState>(TOGGLES_OFF);
  const isMobile = useBreakpoint({ to: 'xs' });
  const isCompact = !useBreakpoint({ from: 'md' });
  const showChains = metric === 'tvl' && tvlView === 'chains';
  const handleViewChange = useCallback((view: TvlView) => setTvlView(view), []);
  const viewOptions = useMemo(
    () => [
      { value: 'chains' as const, label: t('Platform-Stats-ByChain') },
      { value: 'history' as const, label: t('Platform-Stats-History') },
    ],
    [t]
  );

  // each panel holds Close itself, so no card gap draws a divider above it
  const mobileClose =
    isMobile ?
      <Button onClick={close} fullWidth={true} borderless={true}>
        {t('Close')}
      </Button>
    : null;

  return (
    <StyledCard>
      <StyledCardHeader>
        <Title>{t('Vault-platform')}</Title>
        {metric === 'tvl' ?
          <ToggleButtons
            value={tvlView}
            options={viewOptions}
            onChange={handleViewChange}
            variant="filter"
          />
        : metric === 'buyback' ?
          <ToggleButtons
            value={buybackUnit}
            options={UNIT_OPTIONS}
            onChange={onBuybackUnitChange}
            variant="filter"
          />
        : null}
        {
          isMobile ? null
            // the mobile sheet closes from its footer, like the filters and sort sheets
          : (
            <CardIconButton onClick={close}>
              <CloseIcon />
            </CardIconButton>
          )
        }
      </StyledCardHeader>
      <Tabs>
        {PLATFORM_METRICS.map(m => (
          <StatTab
            key={m}
            metric={m}
            data={metrics[m]}
            buybackUnit={buybackUnit}
            selected={m === metric}
            compact={isCompact}
            onSelect={onMetricChange}
          />
        ))}
      </Tabs>
      {showChains ?
        <ChainsPanel>
          <Chains />
          {mobileClose}
        </ChainsPanel>
      : <>
          <ChartPanel>
            <PlatformChart
              metric={metric}
              buybackUnit={buybackUnit}
              toggles={toggles}
              compact={isMobile}
            />
          </ChartPanel>
          <Footer>
            <LineToggles toggles={toggles} onChange={setToggles} />
            {mobileClose}
          </Footer>
        </>
      }
    </StyledCard>
  );
});

type StatTabProps = {
  metric: PlatformMetric;
  data: PlatformMetricData;
  buybackUnit: BuybackUnit;
  selected: boolean;
  compact: boolean;
  onSelect: (metric: PlatformMetric) => void;
};

const StatTab = memo(function StatTab({
  metric,
  data,
  buybackUnit,
  selected,
  compact,
  onSelect,
}: StatTabProps) {
  const { t } = useTranslation();
  const handleClick = useCallback(() => onSelect(metric), [onSelect, metric]);
  const { label, shortLabel, tooltip, trend } = METRIC_CONFIG[metric];

  return (
    <StatTabButton type="button" selected={selected} onClick={handleClick}>
      <TabLabel>
        {t(compact ? shortLabel : label)}
        {tooltip ?
          <IconWithTooltip
            Icon={InfoIcon}
            iconSize={10}
            iconCss={infoIconCss}
            tooltip={t(tooltip)}
            placement="bottom-start"
            layer={1}
          />
        : null}
      </TabLabel>
      <TabValue compact={compact}>
        {data.loading ?
          <StatLoader />
        : formatMetricValue(metric, data.value, buybackUnit)}
        {!data.loading && data.change !== undefined ?
          <PercentChange value={data.change} css={changeCss} />
        : null}
      </TabValue>
      <TabTrend>
        <Sparkline values={data.trend} variant={trend} />
      </TabTrend>
    </StatTabButton>
  );
});

// fontSize beats PercentChange's 0.8em, which outranks the text style
const changeCss = css.raw({
  textStyle: 'body.sm.medium',
  fontSize: 'body.sm',
  // hidden only where four tabs share a narrow row
  '@media (min-width: 600px) and (max-width: 767.98px)': {
    display: 'none',
  },
});
// the selected TabButton turns pointer events off; the tooltip still needs them
const infoIconCss = css.raw({ flexShrink: 0, pointerEvents: 'auto' });

// full-screen sheet below sm; the 1px gaps show background.body as dividers, even over the modal backdrop
const StyledCard = styled(Card, {
  base: {
    height: '100dvh',
    position: 'fixed',
    borderRadius: '0',
    bottom: 0,
    left: 0,
    right: 0,
    gap: '1px',
    backgroundColor: 'background.body',
    sm: {
      position: 'static',
      height: 'auto',
      borderRadius: '12px',
      // the vault page's chart cards (Historical rate, Position Performance) on desktop
      width: '832px',
    },
  },
});

const StyledCardHeader = styled(CardHeader, {
  base: {
    flexWrap: 'nowrap',
    borderTopRadius: '0',
    sm: {
      borderTopRadius: '12px',
    },
  },
});

// grows so the switch and close sit right; min height keeps the row steady when the switch appears
const Title = styled(CardTitle, {
  base: {
    flexGrow: 1,
    minHeight: '40px',
  },
});

// two by two on the mobile sheet, where four across would squeeze the labels
const Tabs = styled('div', {
  base: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '1px',
    sm: {
      display: 'flex',
    },
  },
});

const StatTabButton = styled(TabButton, {
  base: {
    flexDirection: 'column',
    alignItems: 'stretch',
    flexShrink: 1,
    minWidth: 0,
    gap: '2px',
    paddingInline: '16px',
    paddingBlock: '10px 12px',
    textAlign: 'left',
    backgroundColor: 'background.content',
    '&:first-child': {
      borderTopLeftRadius: '0',
    },
    '&:last-child': {
      borderTopRightRadius: '0',
    },
    // unselected tabs rely on the 1px divider below instead of TabButton's lighter underline
    '&::before': {
      backgroundColor: 'transparent',
    },
    md: {
      gap: '4px',
      paddingInline: '24px',
      paddingBlock: '14px 16px',
    },
  },
  variants: {
    selected: {
      true: {
        '&::before': {
          backgroundColor: 'text.dark',
        },
        _hover: {
          color: 'text.light',
        },
      },
    },
  },
});

const TabLabel = styled('span', {
  base: {
    textStyle: 'subline.sm.semiBold',
    color: 'text.dark',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    whiteSpace: 'nowrap',
  },
});

const TabValue = styled('span', {
  base: {
    textStyle: 'h3',
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    whiteSpace: 'nowrap',
  },
  variants: {
    compact: {
      true: {
        textStyle: 'body.medium',
      },
    },
  },
});

const TabTrend = styled('span', {
  base: {
    display: 'block',
    height: '16px',
    md: {
      height: '24px',
    },
  },
});

// padding lives in the chart and the loader, like GraphWithControls, so both are the same height
const ChartPanel = styled('div', { base: { backgroundColor: 'background.content' } });

// holds Close on the mobile sheet, like the chart view's footer; only the list scrolls
const ChainsPanel = styled('div', {
  base: {
    backgroundColor: 'background.content',
    padding: '16px 20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    flexGrow: 1,
    minHeight: 0,
    sm: {
      flexGrow: 0,
      // chart panel + footer, so switching views keeps the card height
      height: '327px',
      padding: '16px 24px',
      borderBottomRadius: '12px',
    },
  },
});

// the vault charts' footer, holding Close on the mobile sheet
const Footer = styled('div', {
  base: {
    ...graphControlStyles.footer,
    borderRadius: '0',
    flexDirection: 'column',
    alignItems: 'stretch',
    flexGrow: 1,
    // ScrollableDrawer's footer spacing, like the filters and menu sheets
    smDown: {
      padding: '8px 20px 24px',
    },
    sm: {
      borderRadius: '0px 0px 12px 12px',
      flexDirection: 'row',
      alignItems: 'center',
      flexGrow: 0,
    },
  },
});
