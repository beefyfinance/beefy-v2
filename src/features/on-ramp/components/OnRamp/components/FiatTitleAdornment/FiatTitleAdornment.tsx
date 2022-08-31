import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';
import { CurrencyFlag } from '../CurrencyFlag';
import { onRampFormActions } from '../../../../../data/reducers/on-ramp';
import { FormStep } from '../../../../../data/reducers/on-ramp-types';
import { useAppDispatch } from '../../../../../../store';

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
  const dispatch = useAppDispatch();

  const handleClick = useCallback(() => {
    dispatch(onRampFormActions.setStep({ step: FormStep.SelectFiat }));
  }, [dispatch]);

  return (
    <button className={clsx(classes.fiatAdornment, className)} onClick={handleClick}>
      <CurrencyFlag currencyCode={currencyCode} className={classes.flag} />
      {currencyCode}
    </button>
  );
});
