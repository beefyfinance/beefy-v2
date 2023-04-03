import React, { memo, useMemo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { VaultTimelineAnalyticsEntity } from '../../../../../../../data/entities/analytics';
import clsx from 'clsx';
import { formatISO9075 } from 'date-fns';
import { formatBigUsd } from '../../../../../../../../helpers/format';
import { BIG_ZERO } from '../../../../../../../../helpers/big-number';
import { Row } from '../Row/Row';
import { InfoGrid } from '../InfoGrid';
import { TokenAmount } from '../../../../../../../../components/TokenAmount';

const useStyles = makeStyles(styles);

interface TransactionProps {
  data: VaultTimelineAnalyticsEntity;
  tokenDecimals: number;
}
export const Transaction = memo<TransactionProps>(function ({ data, tokenDecimals }) {
  const classes = useStyles();
  const {
    internal,
    datetime,
    shareBalance,
    usdBalance,
    underlyingDiff,
    shareToUnderlyingPrice,
    underlyingToUsdPrice,
  } = data;

  const amountClassName = useMemo(() => {
    return underlyingDiff.gt(BIG_ZERO) ? classes.textGreen : classes.textRed;
  }, [classes.textGreen, classes.textRed, underlyingDiff]);

  if (internal) return null;

  return (
    <Row>
      {/* Date */}
      <div className={clsx(classes.stat, classes.textFlexStart)}>{formatISO9075(datetime)}</div>
      <InfoGrid>
        {/*Amount */}
        <TokenAmount
          className={clsx(amountClassName, classes.stat)}
          amount={underlyingDiff}
          decimals={tokenDecimals}
          price={underlyingToUsdPrice}
        />
        {/*Balance */}
        <TokenAmount
          amount={shareBalance.times(shareToUnderlyingPrice)}
          decimals={tokenDecimals}
          price={underlyingToUsdPrice}
          className={classes.stat}
        />
        {/*MooTokenBal */}
        <TokenAmount
          amount={shareBalance}
          decimals={18}
          price={shareToUnderlyingPrice}
          className={classes.stat}
        />
        {/*Usd Balance */}
        <div className={classes.stat}>{formatBigUsd(usdBalance ?? BIG_ZERO)}</div>
      </InfoGrid>
    </Row>
  );
});
