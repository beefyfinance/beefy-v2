import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';
import { CurrencyFlag } from '../CurrencyFlag';
import { ButtonAdornment } from '../ButtonAdornment';
import { useAppDispatch } from '../../../../../../store';
import { onRampFormActions } from '../../../../../data/reducers/on-ramp';
import { FormStep } from '../../../../../data/reducers/on-ramp-types';

const useStyles = makeStyles(styles);

export type FiatAmountAdornmentProps = {
  currencyCode: string;
  className?: string;
};
export const FiatAmountAdornment = memo<FiatAmountAdornmentProps>(function FiatAmountAdornment({
  currencyCode,
  className,
}) {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const handleClick = useCallback(() => {
    dispatch(onRampFormActions.setStep({ step: FormStep.SelectFiat }));
  }, [dispatch]);

  return (
    <ButtonAdornment className={clsx(classes.button, className)} onClick={handleClick}>
      <CurrencyFlag currencyCode={currencyCode} className={classes.flag} />
      {currencyCode}
    </ButtonAdornment>
  );
});
