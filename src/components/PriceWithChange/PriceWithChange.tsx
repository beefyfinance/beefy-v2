import { memo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectTokenPriceByTokenOracleId } from '../../features/data/selectors/tokens';
import { formatBigUsd, formatPercent } from '../../helpers/format';
import BigNumber from 'bignumber.js';
import {
  selectHistoricalPriceBucketData,
  selectHistoricalPriceBucketIsLoaded,
  selectHistoricalPriceBucketStatus,
} from '../../features/data/selectors/historical';
import { fetchHistoricalPrices } from '../../features/data/actions/historical';
import type { ApiTimeBucket } from '../../features/data/apis/beefy/beefy-data-api-types';
import { orderBy } from 'lodash-es';
import { BIG_ZERO } from '../../helpers/big-number';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { TrendingDown, TrendingFlat, TrendingUp } from '@material-ui/icons';
import { Tooltip } from '../Tooltip';
import { format, fromUnixTime } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';
import type { BeefyState } from '../../redux-types';
import { createCachedSelector } from 're-reselect';

const useStyles = makeStyles(styles);

const selectPriceWithChange = createCachedSelector(
  (state: BeefyState, oracleId: string, _bucket: ApiTimeBucket) =>
    selectTokenPriceByTokenOracleId(state, oracleId),
  (state: BeefyState, oracleId: string, bucket: ApiTimeBucket) =>
    selectHistoricalPriceBucketStatus(state, oracleId, bucket),
  (state: BeefyState, oracleId: string, bucket: ApiTimeBucket) =>
    selectHistoricalPriceBucketIsLoaded(state, oracleId, bucket),
  (state: BeefyState, oracleId: string, bucket: ApiTimeBucket) =>
    selectHistoricalPriceBucketData(state, oracleId, bucket),
  (price, status, loaded, data) => {
    if (!price) {
      return {
        price: undefined,
        shouldLoad: false,
        previousPrice: undefined,
        previousDate: undefined,
      };
    }

    if (!loaded && status === 'idle') {
      return { price, shouldLoad: true, previousPrice: undefined, previousDate: undefined };
    }

    if (!loaded || !data || data.length === 0) {
      return { price, shouldLoad: false, previousPrice: undefined, previousDate: undefined };
    }

    const oneDayAgo = Math.floor((Date.now() - 1000 * 60 * 60 * 24) / 1000);
    const oneDayAgoPricePoint = orderBy(data, 't', 'asc').find(point => point.t > oneDayAgo);
    if (!oneDayAgoPricePoint || !oneDayAgoPricePoint.v) {
      return { price, shouldLoad: false, previousPrice: undefined, previousDate: undefined };
    }

    const previousPrice = new BigNumber(oneDayAgoPricePoint.v);
    const previousDate = fromUnixTime(oneDayAgoPricePoint.t);
    return { price, shouldLoad: false, previousPrice, previousDate };
  }
)((_state: BeefyState, oracleId: string, bucket: ApiTimeBucket) => `${oracleId}-${bucket}`);

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

  return <WithChange price={price} previousPrice={previousPrice} previousDate={previousDate} />;
});

type WithoutChangeProps = {
  price: BigNumber;
  className?: string;
};

const WithoutChange = memo<WithoutChangeProps>(function WithoutChange({ price, className }) {
  const classes = useStyles();

  return (
    <div className={clsx(classes.priceWithChange, className)}>
      <div className={classes.price}>{formatBigUsd(price)}</div>
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
  const diff = price.minus(previousPrice).decimalPlaces(2, BigNumber.ROUND_FLOOR);
  const diffAbs = diff.abs();
  const percentChange = diffAbs.div(previousPrice);
  const isPositive = diff.gt(BIG_ZERO);
  const isNegative = diff.lt(BIG_ZERO);
  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : TrendingFlat;
  const tooltipContent = t(`Price-Change-${isPositive ? 'Up' : isNegative ? 'Down' : 'Flat'}`, {
    change: formatBigUsd(diffAbs),
    date: format(previousDate, 'MMM d, yyyy h:mm a'),
  });

  return (
    <Tooltip
      content={tooltipContent}
      triggerClass={clsx({
        [classes.priceWithChange]: true,
        [className]: true,
        [classes.tooltipTrigger]: true,
        [classes.positive]: isPositive,
        [classes.negative]: isNegative,
      })}
    >
      <div className={classes.price}>{formatBigUsd(price)}</div>
      <div className={classes.change}>
        <div className={classes.changeValue}>
          {isPositive ? '+' : isNegative ? '-' : ''}
          {formatPercent(percentChange, 2)}
        </div>
        <Icon className={classes.changeIcon} />
      </div>
    </Tooltip>
  );
});
