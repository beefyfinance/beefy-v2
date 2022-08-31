import React, { memo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectFiat,
  selectFiatTokenMinMaxFiat,
  selectInputAmount,
  selectInputError,
  selectOutputAmount,
  selectToken,
} from '../../../../../data/selectors/on-ramp';
import { onRampFormActions } from '../../../../../data/reducers/on-ramp';
import { AmountInput } from '../AmountInput';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { FiatAmountAdornment } from '../FiatAmountAdornment';
import { AmountOutput } from '../AmountOutput';
import { AmountLabel } from '../AmountLabel';
import { useTranslation } from 'react-i18next';
import { InputError } from '../../../../../data/reducers/on-ramp-types';

const useStyles = makeStyles(styles);

type OutOfRangeErrorProps = {
  currency: string;
  min: number;
  max: number;
};
const OutOfRangeError = memo<OutOfRangeErrorProps>(function ({ currency, min, max }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const key = 'OnRamp-' + (max === Number.MAX_VALUE ? 'RangeErrorMin' : 'RangeErrorMinMax');

  return (
    <div className={classes.error}>
      {t(key, {
        min: min.toFixed(2),
        max: max.toFixed(2),
        currency,
      })}
    </div>
  );
});

type FiatAmountInputProps = {
  fiat: string;
};
const FiatAmountInput = memo<FiatAmountInputProps>(function ({ fiat }) {
  const dispatch = useAppDispatch();

  const inputValue = useAppSelector(selectInputAmount);
  const token = useAppSelector(selectToken);
  const error = useAppSelector(selectInputError);
  const range = useAppSelector(state => selectFiatTokenMinMaxFiat(state, fiat, token));
  const handleValueChange = useCallback(
    (value: number) => {
      dispatch(onRampFormActions.setInputAmount({ amount: value }));
    },
    [dispatch]
  );

  return (
    <>
      <AmountInput
        value={inputValue}
        onChange={handleValueChange}
        maxDecimals={2}
        error={error === InputError.OutOfRange}
        endAdornment={<FiatAmountAdornment currencyCode={fiat} />}
      />
      {error === InputError.OutOfRange ? (
        <OutOfRangeError currency={fiat} min={range.min} max={range.max} />
      ) : null}
    </>
  );
});

type FiatAmountOutputProps = {
  fiat: string;
};
const FiatAmountOutput = memo<FiatAmountOutputProps>(function ({ fiat }) {
  const outputValue = useAppSelector(selectOutputAmount);

  return (
    <AmountOutput
      value={outputValue}
      maxDecimals={2}
      endAdornment={<FiatAmountAdornment currencyCode={fiat} />}
    />
  );
});

export type FiatAmountProps = {
  isInput: boolean;
  className?: string;
};
export const FiatAmount = memo<FiatAmountProps>(function FiatAmount({ isInput, className }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const fiat = useAppSelector(selectFiat);

  return (
    <div className={className}>
      <AmountLabel className={classes.label}>{t('OnRamp-YouPay')}</AmountLabel>
      {isInput ? <FiatAmountInput fiat={fiat} /> : <FiatAmountOutput fiat={fiat} />}
    </div>
  );
});
