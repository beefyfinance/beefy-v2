import { memo, useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectPriceWithChange } from '../../features/data/selectors/tokens';
import { formatLargeUsd, formatLargePercent, formatUsd } from '../../helpers/format';
import type BigNumber from 'bignumber.js';
import { fetchHistoricalPrices } from '../../features/data/actions/historical';
import type { ApiTimeBucket } from '../../features/data/apis/beefy/beefy-data-api-types';
import { BIG_ZERO } from '../../helpers/big-number';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { Tooltip, type TooltipProps } from '../Tooltip';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export type PriceWithChangeProps = {
  oracleId: string;
  className?: string;
};

export const PriceWithChange = memo<PriceWithChangeProps>(function PriceWithChange({
  oracleId,
  className,
}) {
  const bucket: ApiTimeBucket = '1h_1d';
  const dispatch = useAppDispatch();
  const { price, shouldLoad, previousPrice, previousDate } = useAppSelector(state =>
    selectPriceWithChange(state, oracleId, bucket)
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
    return <WithoutChange price={price} className={className} />;
  }

  return (
    <WithChange
      price={price}
      previousPrice={previousPrice}
      previousDate={previousDate}
      className={className}
    />
  );
});

type WithoutChangeProps = {
  price: BigNumber;
  className?: string;
};

const WithoutChange = memo<WithoutChangeProps>(function WithoutChange({ price, className }) {
  const classes = useStyles();

  return (
    <div className={clsx(classes.priceWithChange, className)}>
      <div className={classes.price}>{formatLargeUsd(price)}</div>
    </div>
  );
});

type WithChangeProps = {
  price: BigNumber;
  previousPrice: BigNumber;
  previousDate: Date;
  className?: string;
};

const WithChange = memo<WithChangeProps>(function WithChange({
  price,
  previousPrice,
  previousDate,
  className,
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const diff = price.minus(previousPrice);
  const diffAbs = diff.abs();
  const percentChange = diffAbs.div(previousPrice);
  const isPositive = diff.gt(BIG_ZERO);
  const isNegative = diff.lt(BIG_ZERO);
  const tooltipContent = t(`Price-Change-${isPositive ? 'Up' : isNegative ? 'Down' : 'Flat'}`, {
    change: formatUsd(diffAbs, diffAbs.gte(0.01) ? 2 : 4),
    date: format(previousDate, 'MMM d, yyyy h:mm a'),
  });
  const handleTooltipClick = useCallback<Exclude<TooltipProps['onTriggerClick'], undefined>>(e => {
    if (e) {
      // don't bubble up
      e.preventDefault();
    }
  }, []);

  return (
    <Tooltip
      content={tooltipContent}
      onTriggerClick={handleTooltipClick}
      triggerClass={clsx(className, {
        [classes.priceWithChange]: true,
        [classes.tooltipTrigger]: true,
        [classes.positive]: isPositive,
        [classes.negative]: isNegative,
      })}
    >
      <div className={classes.price}>{formatUsd(price, price.gte(0.01) ? 2 : 4)}</div>
      <div className={classes.change}>
        <div className={classes.changeValue}>
          {isPositive ? '+' : isNegative ? '-' : ''}
          {formatLargePercent(percentChange, 2)}
        </div>
      </div>
    </Tooltip>
  );
});
