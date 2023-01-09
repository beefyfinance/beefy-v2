import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { InputBase, makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';
import { InputBaseProps } from '@material-ui/core/InputBase/InputBase';
import BigNumber from 'bignumber.js';
import { BIG_ZERO } from '../../../../../../helpers/big-number';
import { useTranslation } from 'react-i18next';

export const useStyles = makeStyles(styles);

function isValidNumberInputString(value: string): boolean {
  const regex = new RegExp(`^[0-9]*\\.?[0-9]*$`);
  return !!value.match(regex);
}

function numberInputStringToNumber(value: string): BigNumber {
  const parsedText = value.replace(/[^0-9.]+/g, '').replace(/\.$/, '');
  return new BigNumber(parsedText);
}

function numberToString(value: BigNumber, maxDecimals: number): string {
  if (value.lte(BIG_ZERO)) {
    return '';
  }

  return value.decimalPlaces(maxDecimals, BigNumber.ROUND_FLOOR).toString(10);
}

export type AmountInputProps = {
  value: BigNumber;
  maxValue?: BigNumber;
  maxDecimals?: number;
  onChange: (value: BigNumber, isMax: boolean) => void;
  error?: boolean;
  className?: string;
};
export const AmountInput = memo<AmountInputProps>(function AmountInput({
  value,
  maxValue,
  onChange,
  maxDecimals = 2,
  error = false,
  className,
}) {
  const { t } = useTranslation();
  const classes = useStyles();
  const [input, setInput] = useState(() => {
    return numberToString(value, maxDecimals);
  });

  const handleMax = useCallback(() => {
    onChange(maxValue, true);
  }, [maxValue, onChange]);

  const endAdornment = useMemo(() => {
    return maxValue ? (
      <button onClick={handleMax} disabled={maxValue.lte(BIG_ZERO)} className={classes.max}>
        {t('Transact-Max')}
      </button>
    ) : undefined;
  }, [maxValue, handleMax, classes, t]);

  const handleChange = useCallback<InputBaseProps['onChange']>(
    e => {
      const rawInput = e.target.value;

      // empty
      if (rawInput.length === 0) {
        setInput('');
        onChange(BIG_ZERO, false);
        return;
      }

      if (rawInput === '.') {
        setInput('0.');
        onChange(BIG_ZERO, false);
        return;
      }

      // Don't let user type if invalid number input
      if (!isValidNumberInputString(rawInput)) {
        return;
      }

      // Convert string input to number
      const parsedNumber = numberInputStringToNumber(rawInput);

      // Check valid number
      if (parsedNumber.isNaN() || !parsedNumber.isFinite() || parsedNumber.isNegative()) {
        setInput('');
        onChange(BIG_ZERO, false);
        return;
      }

      // Can't go above max
      if (maxValue && parsedNumber.gt(maxValue)) {
        setInput(numberToString(maxValue, maxDecimals));
        onChange(maxValue, true);
        return;
      }

      // Raise changed event
      setInput(rawInput);
      onChange(parsedNumber, maxValue && parsedNumber.gte(maxValue));
    },
    [setInput, maxDecimals, onChange, maxValue]
  );

  const handleBlur = useCallback<InputBaseProps['onBlur']>(
    e => {
      const rawInput = e.target.value;

      if (rawInput.length === 0) {
        return;
      }

      if (rawInput === '.') {
        setInput('');
      } else {
        const parsedNumber = numberInputStringToNumber(rawInput);
        setInput(numberToString(parsedNumber, maxDecimals));
      }
    },
    [setInput, maxDecimals]
  );

  useEffect(() => {
    setInput(numberToString(value, maxDecimals));
  }, [value, setInput, maxDecimals]);

  useEffect(() => {
    if (maxValue && value.gt(maxValue)) {
      onChange(maxValue, true);
    }
  }, [value, maxValue, onChange]);

  return (
    <InputBase
      className={clsx(classes.input, className, { [classes.error]: error })}
      value={input}
      onChange={handleChange}
      onBlur={handleBlur}
      fullWidth={true}
      endAdornment={endAdornment}
      placeholder="0"
      inputMode="decimal"
    />
  );
});
