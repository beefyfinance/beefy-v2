import React, { memo, useMemo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { VaultTimelineAnalyticsEntity } from '../../../../../../../data/entities/analytics';
import clsx from 'clsx';
import { formatISO9075 } from 'date-fns';
import { formatBigUsd, formatSignificantBigNumber } from '../../../../../../../../helpers/format';
import { BIG_ZERO } from '../../../../../../../../helpers/big-number';
import { Row } from '../Row/Row';
import { InfoGrid } from '../InfoGrid';

const useStyles = makeStyles(styles);

interface TransactionProps {
  data: VaultTimelineAnalyticsEntity;
  tokenDecimals: number;
}
export const Transaction = memo<TransactionProps>(function ({ data, tokenDecimals }) {
  const classes = useStyles();
  const { internal, datetime, shareBalance, usdBalance, underlyingDiff, shareToUnderlyingPrice } =
    data;

  const isDepositTx = useMemo(() => {
    return underlyingDiff.gt(BIG_ZERO);
  }, [underlyingDiff]);

  const amountClassName = useMemo(() => {
    return isDepositTx ? classes.textGreen : classes.textRed;
  }, [classes.textGreen, classes.textRed, isDepositTx]);

  const mooBalance = useMemo(() => {
    return formatSignificantBigNumber(shareBalance, tokenDecimals, shareToUnderlyingPrice, 0, 2);
  }, [shareBalance, shareToUnderlyingPrice, tokenDecimals]);

  const balance = useMemo(() => {
    return formatSignificantBigNumber(
      shareBalance.times(shareToUnderlyingPrice),
      tokenDecimals,
      shareToUnderlyingPrice,
      0,
      2
    );
  }, [shareBalance, shareToUnderlyingPrice, tokenDecimals]);

  const diff = useMemo(() => {
    return formatSignificantBigNumber(underlyingDiff, tokenDecimals, shareToUnderlyingPrice, 0, 2);
  }, [shareToUnderlyingPrice, tokenDecimals, underlyingDiff]);

  if (internal) return null;

  return (
    <Row>
      <Stat className={classes.textLeft} value={formatISO9075(datetime)} />
      <InfoGrid>
        <Stat className={amountClassName} value={`${isDepositTx ? '+' : ''} ${diff} `} />
        <Stat value={balance} />
        <Stat value={mooBalance} />
        <Stat value={formatBigUsd(usdBalance ?? BIG_ZERO)} />
      </InfoGrid>
    </Row>
  );
});

interface StatProps {
  value: string;
  className?: string;
}
export const Stat = memo<StatProps>(({ value, className }) => {
  const classes = useStyles();
  return <div className={clsx(classes.stat, className)}>{value}</div>;
});
