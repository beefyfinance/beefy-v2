import React, { memo, useMemo } from 'react';
import { InputBase, makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';
import { InputBaseProps } from '@material-ui/core/InputBase/InputBase';

const useStyles = makeStyles(styles);

function numberToString(value: number, maxDecimals: number): string {
  if (value <= 0) {
    return '';
  }

  return value.toLocaleString('en-US', {
    maximumFractionDigits: maxDecimals,
  });
}

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

  return (
    <InputBase
      className={clsx(classes.input, className)}
      value={displayValue}
      fullWidth={true}
      endAdornment={endAdornment}
      placeholder={`0`}
      readOnly={true}
    />
  );
});
