import { css, type CssStyles } from '@repo/styles/css';
import type BigNumber from 'bignumber.js';
import { format } from 'date-fns';
import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchHistoricalPrices } from '../../features/data/actions/historical.ts';
import { selectPriceWithChange } from '../../features/data/selectors/tokens.ts';
import { BIG_ZERO } from '../../helpers/big-number.ts';
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
  const percentChange = diffAbs.div(previousPrice);
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
      date: format(previousDate, 'MMM d, yyyy h:mm a'),
    }
  );

  return (
    <DivWithTooltip
      tooltip={tooltipContent}
      className={css(styles.priceWithChange, styles.tooltipTrigger, cssProp)}
    >
      <div>{formatUsd(price, price.gte(0.01) ? 2 : 4)}</div>
      <div
        className={css(styles.change, isPositive && styles.positive, isNegative && styles.negative)}
      >
        <div>
          {isPositive ?
            '+'
          : isNegative ?
            '-'
          : ''}
          {formatLargePercent(percentChange, 2)}
        </div>
      </div>
    </DivWithTooltip>
  );
});
