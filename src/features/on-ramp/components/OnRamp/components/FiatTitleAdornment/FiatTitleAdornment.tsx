import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';
import { CurrencyFlag } from '../CurrencyFlag';

const useStyles = makeStyles(styles);

export type FiatTitleAdornmentProps = {
  currencyCode: string;
  className?: string;
};
export const FiatTitleAdornment = memo<FiatTitleAdornmentProps>(function TokenIconAdornment({
  currencyCode,
  className,
}) {
  const classes = useStyles();

  return (
    <div className={clsx(classes.fiatAdornment, className)}>
      <CurrencyFlag currencyCode={currencyCode} className={classes.flag} />
      {currencyCode}
    </div>
  );
});
