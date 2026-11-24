import { css, type CssStyles } from '@repo/styles/css';
import type BigNumber from 'bignumber.js';
import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchHistoricalPrices } from '../../features/data/actions/historical.ts';
import { selectPriceWithChange } from '../../features/data/selectors/tokens.ts';
import { BIG_ZERO, type BigNumberish, toBigNumber } from '../../helpers/big-number.ts';
import { formatDateTime } from '../../helpers/date.ts';
import { formatLargePercent, formatLargeUsd, formatUsd } from '../../helpers/format.ts';
import { useAppDispatch, useAppSelector } from '../../features/data/store/hooks.ts';
import { DivWithTooltip } from '../Tooltip/DivWithTooltip.tsx';
import { styles } from './styles.ts';

export type PriceWithChangeProps = {
  oracleId: string;
  css?: CssStyles;
};

export const PriceWithChange = memo(function PriceWithChange({
  oracleId,
  css: cssProp,
}: PriceWithChangeProps) {
  const dispatch = useAppDispatch();
  const { price, bucket, shouldLoad, previousPrice, previousDate } = useAppSelector(state =>
    selectPriceWithChange(state, oracleId, '1h_1d')
  );

  useEffect(() => {
    if (shouldLoad) {
      dispatch(fetchHistoricalPrices({ oracleId, bucket }));
    }
  }, [dispatch, oracleId, bucket, shouldLoad]);

  if (!price || price.isZero()) {
    return null;
  }

  if (!previousPrice || previousPrice.isZero()) {
    return <WithoutChange price={price} css={cssProp} />;
  }

  return (
    <WithChange
      price={price}
      previousPrice={previousPrice}
      previousDate={previousDate}
      css={cssProp}
    />
  );
});

type WithoutChangeProps = {
  price: BigNumber;
  css?: CssStyles;
};

const WithoutChange = memo(function WithoutChange({ price, css: cssProp }: WithoutChangeProps) {
  return (
    <div className={css(styles.priceWithChange, cssProp)}>
      <div>{formatLargeUsd(price)}</div>
    </div>
  );
});

type WithChangeProps = {
  price: BigNumber;
  previousPrice: BigNumber;
  previousDate: Date;
  css?: CssStyles;
};

const WithChange = memo(function WithChange({
  price,
  previousPrice,
  previousDate,
  css: cssProp,
}: WithChangeProps) {
  const { t } = useTranslation();
  const diff = price.minus(previousPrice);
  const diffAbs = diff.abs();
  const isPositive = diff.gt(BIG_ZERO);
  const isNegative = diff.lt(BIG_ZERO);
  const tooltipContent = t(
    `Price-Change-${
      isPositive ? 'Up'
      : isNegative ? 'Down'
      : 'Flat'
    }`,
    {
      change: formatUsd(diffAbs, diffAbs.gte(0.01) ? 2 : 4),
      date: formatDateTime(previousDate),
    }
  );

  return (
    <DivWithTooltip
      tooltip={tooltipContent}
      className={css(styles.priceWithChange, styles.tooltipTrigger, cssProp)}
    >
      <div>{formatUsd(price, price.gte(0.01) ? 2 : 4)}</div>
      <PercentChange value={diff.div(previousPrice)} />
    </DivWithTooltip>
  );
});

type PercentChangeProps = {
  /** relative change, e.g. 0.25 for +25% */
  value: BigNumberish;
  css?: CssStyles;
};

export const PercentChange = memo(function PercentChange({
  value,
  css: cssProp,
}: PercentChangeProps) {
  const change = toBigNumber(value);
  const isPositive = change.gt(BIG_ZERO);
  const isNegative = change.lt(BIG_ZERO);

  return (
    <span
      className={css(
        styles.change,
        isPositive && styles.positive,
        isNegative && styles.negative,
        cssProp
      )}
    >
      {isPositive ?
        '+'
      : isNegative ?
        '-'
      : ''}
      {formatLargePercent(change.abs(), 2)}
    </span>
  );
});
