import React, { memo, useMemo } from 'react';
import { InputBase, makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';
import { InputBaseProps } from '@material-ui/core/InputBase/InputBase';
import ContentLoader from 'react-content-loader';
import { useAppSelector } from '../../../../../../store';
import { selectQuoteStatus } from '../../../../../data/selectors/on-ramp';

const useStyles = makeStyles(styles);

function numberToString(value: number, maxDecimals: number): string {
  if (value <= 0) {
    return '';
  }

  return value.toLocaleString('en-US', {
    maximumFractionDigits: maxDecimals,
  });
}

const PendingAmount = memo(() => {
  const classes = useStyles();
  return (
    <div className={classes.pending}>
      <ContentLoader
        viewBox="0 0 88 32"
        width="88"
        height="32"
        backgroundColor="rgba(255, 255, 255, 0.12)"
        foregroundColor="rgba(255, 255, 255, 0.32)"
      >
        <rect x="0" y="4" rx="8" ry="8" width="88" height="24" />
      </ContentLoader>
    </div>
  );
});

export type AmountOutputProps = {
  maxDecimals?: number;
  value: number;
  className?: string;
  endAdornment?: InputBaseProps['endAdornment'];
};
export const AmountOutput = memo<AmountOutputProps>(function AmountOutput({
  value,
  maxDecimals = 2,
  className,
  endAdornment,
}) {
  const classes = useStyles();
  const displayValue = useMemo(() => numberToString(value, maxDecimals), [value, maxDecimals]);
  const pending = useAppSelector(selectQuoteStatus) === 'pending';
  const startAdornment = useMemo(() => (pending ? <PendingAmount /> : undefined), [pending]);

  return (
    <InputBase
      className={clsx(classes.input, className)}
      value={pending ? '' : displayValue}
      fullWidth={true}
      startAdornment={startAdornment}
      endAdornment={endAdornment}
      placeholder={pending ? '' : '0'}
      readOnly={true}
    />
  );
});
