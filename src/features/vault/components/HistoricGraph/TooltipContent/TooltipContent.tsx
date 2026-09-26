import { memo, useMemo } from 'react';
import type { LineTogglesState } from '../LineToggles/LineToggles.tsx';
import { fromUnixTime } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { formatDateTime } from '../../../../../helpers/date.ts';
import { styled } from '@repo/styles/jsx';
import type { ChartDataPoint, ChartStat } from '../types.ts';
import type { RechartsTooltipProps } from '../../../../../helpers/graph/types.ts';

export type BaseTooltipProps<TStat extends ChartStat> = RechartsTooltipProps<
  'v',
  't',
  ChartDataPoint<TStat>
>;

export type ExtraTooltipContentProps = {
  /** name of the plotted value */
  label: string;
  /** moving average window, e.g. "30 days" */
  maLabel: string;
  toggles: LineTogglesState;
  valueFormatter: (value: number) => string;
  avg: number;
  formatTimestamp?: (timestamp: number) => string;
};

export type TooltipContentProps<TStat extends ChartStat> = BaseTooltipProps<TStat> &
  ExtraTooltipContentProps;

function getPayload(props: TooltipContentProps<'clm'>): ChartDataPoint<'clm'> | undefined;
function getPayload(props: TooltipContentProps<ChartStat>): ChartDataPoint<ChartStat> | undefined;
function getPayload(props: TooltipContentProps<ChartStat>): ChartDataPoint<ChartStat> | undefined {
  const { active, payload } = props;
  if (!active || !payload || !Array.isArray(payload) || !payload.length) {
    return undefined;
  }
  const valueLine = payload[0];
  if (!valueLine || !valueLine.payload || valueLine.value === undefined) {
    return undefined;
  }

  return valueLine.payload;
}

const formatUnixDateTime = (timestamp: number) => formatDateTime(fromUnixTime(timestamp));

export const TooltipContent = memo(function TooltipContent<TStat extends ChartStat>(
  props: TooltipContentProps<TStat>
) {
  const { t } = useTranslation();
  const {
    label,
    maLabel,
    toggles,
    valueFormatter,
    avg,
    formatTimestamp = formatUnixDateTime,
  } = props;
  const payload = getPayload(props);
  if (!payload) {
    return null;
  }

  const isClmTooltip = 'ranges' in payload;
  const { t: timestamp, v: value, ma: movingAverage } = payload;

  return (
    <Content>
      <Timestamp>{formatTimestamp(timestamp)}</Timestamp>
      <Item>
        <Label>{label}:</Label>
        <Value>
          {isClmTooltip ?
            <RangeIndicator ranges={payload.ranges} value={value} />
          : null}
          {valueFormatter(value)}
        </Value>
      </Item>
      {toggles.average ?
        <Item>
          <Label>{t('Average')}:</Label>
          <Value>{valueFormatter(avg)}</Value>
        </Item>
      : null}
      {toggles.movingAverage ?
        <Item>
          <Label>
            <div>{t('Moving-Average')}:</div>
            <LabelDetail>{`(${maLabel})`}</LabelDetail>
          </Label>
          <Value>{valueFormatter(movingAverage)}</Value>
        </Item>
      : null}
      {isClmTooltip ?
        <Ranges valueFormatter={valueFormatter} ranges={payload.ranges} />
      : null}
    </Content>
  );
});

type RangeIndicatorProps = {
  ranges: [number, number];
  value: number;
};
const RangeIndicator = memo(function RangeIndicator({ ranges, value }: RangeIndicatorProps) {
  const isOnRange = useMemo(() => value >= ranges[0] && value <= ranges[1], [ranges, value]);

  return <Indicator onRange={isOnRange} />;
});

type RangesProps = {
  ranges: [number, number];
  valueFormatter: (value: number) => string;
};
const Ranges = memo(function Ranges({ ranges, valueFormatter }: RangesProps) {
  const { t } = useTranslation();

  return (
    <Item>
      <Label>{t('Range')}:</Label>
      <Value>
        {valueFormatter(ranges[0])} - {valueFormatter(ranges[1])}{' '}
      </Value>
    </Item>
  );
});

const Content = styled('div', {
  base: {
    textStyle: 'body',
    color: 'text.lightest',
    padding: '12px 16px',
    minWidth: '250px',
    background: 'graphTooltipBackground',
    borderRadius: '8px',
    textAlign: 'left',
  },
});

const Timestamp = styled('div', {
  base: {
    marginBottom: '8px',
  },
});

const Item = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
});

const Label = styled('div', {
  base: {
    color: 'text.dark',
  },
});

const LabelDetail = styled('div', {
  base: {
    textStyle: 'body.sm',
    lineHeight: '1',
  },
});

const Value = styled('div', {
  base: {
    textStyle: 'body.medium',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    textAlign: 'right',
  },
});

const Indicator = styled('div', {
  base: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'indicators.error',
  },
  variants: {
    onRange: {
      true: {
        backgroundColor: 'indicators.success',
      },
    },
  },
});
