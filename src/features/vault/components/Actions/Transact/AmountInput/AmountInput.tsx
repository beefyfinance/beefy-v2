import { memo, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';
import type { InputBaseProps } from '@material-ui/core/InputBase/InputBase';
import { BigNumber } from 'bignumber.js';
import { BIG_ZERO } from '../../../../../../helpers/big-number';
import { formatTokenInput, formatLargeUsd } from '../../../../../../helpers/format';

export const useStyles = makeStyles(styles);

function isValidNumberInputString(value: string): boolean {
  const regex = new RegExp(`^[0-9]*\\.?[0-9]*$`);
  return !!value.match(regex);
}

function numberInputStringToNumber(value: string): BigNumber {
  // Remove all anything that is not a number or a decimal point (e.g. 'abc1,234.567' -> '1234.567')
  // then, remove any trailing decimal point (e.g. '123.' -> '123')
  const parsedText = value.replace(/[^0-9.]+/g, '').replace(/\.$/, '');
  return new BigNumber(parsedText);
}

function numberToString(value: BigNumber, tokenDecimals: number): string {
  if (value.lte(BIG_ZERO)) {
    return '';
  }

  return formatTokenInput(value, tokenDecimals);
}

export type AmountInputProps = {
  value: BigNumber;
  maxValue: BigNumber;
  tokenDecimals?: number;
  onChange: (value: BigNumber, isMax: boolean) => void;
  error?: boolean;
  warning?: boolean;
  className?: string;
  allowInputAboveBalance?: boolean;
  fullWidth?: boolean;
  price?: BigNumber;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  disabled?: boolean;
  errorClassName?: string;
  warningClassName?: string;
};
export const AmountInput = memo<AmountInputProps>(function AmountInput({
  value,
  maxValue,
  onChange,
  tokenDecimals = 2,
  error = false,
  warning = false,
  className,
  allowInputAboveBalance = false,
  fullWidth = false,
  price,
  endAdornment,
  startAdornment,
  disabled,
  errorClassName = '',
  warningClassName = '',
}) {
  const classes = useStyles();
  const [input, setInput] = useState(() => {
    return numberToString(value, tokenDecimals);
  });

  const inputUsdValue = useMemo(() => {
    return price ? price.times(value) : BIG_ZERO;
  }, [price, value]);

  const handleMax = useCallback(() => {
    setInput(numberToString(maxValue, tokenDecimals));
    onChange(maxValue, true);
  }, [maxValue, onChange, tokenDecimals, setInput]);

  const handleChange = useCallback<Exclude<InputBaseProps['onChange'], undefined>>(
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
      if (!allowInputAboveBalance && maxValue && parsedNumber.gt(maxValue)) {
        handleMax();
        return;
      }
      // Raise changed event
      setInput(rawInput);
      onChange(parsedNumber, !allowInputAboveBalance && parsedNumber.gte(maxValue));
    },
    [allowInputAboveBalance, handleMax, maxValue, onChange]
  );

  const handleBlur = useCallback<Exclude<InputBaseProps['onBlur'], undefined>>(
    e => {
      const rawInput = e.target.value;

      if (rawInput.length === 0) {
        return;
      }

      if (rawInput === '.') {
        setInput('');
      } else {
        const parsedNumber = numberInputStringToNumber(rawInput);
        setInput(numberToString(parsedNumber, tokenDecimals));
      }
    },
    [setInput, tokenDecimals]
  );
  useEffect(() => {
    if (!allowInputAboveBalance && maxValue && value.gt(maxValue)) {
      setInput(numberToString(maxValue, tokenDecimals));
      onChange(maxValue, true);
    }

    setInput(numberToString(value, tokenDecimals));
  }, [value, maxValue, onChange, allowInputAboveBalance, tokenDecimals]);

  return (
    <div
      className={clsx(classes.inputContainer, className, {
        [classes.fullWidth]: fullWidth,
        [errorClassName]: error && errorClassName,
        [warningClassName]: warning && warningClassName,
        [classes.error]: error,
        [classes.warning]: warning,
      })}
    >
      {startAdornment && <div className={classes.startAdornment}>{startAdornment}</div>}
      <div className={classes.inputContent}>
        <input
          className={clsx(classes.input, { [classes.inputWithPrice]: Boolean(price) })}
          value={input}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="0"
          inputMode="decimal"
          disabled={disabled}
        />
        {price && value.gt(0) && (
          <div className={classes.price}>{formatLargeUsd(inputUsdValue)}</div>
        )}
      </div>

      {endAdornment && <div className={classes.endAdornment}>{endAdornment}</div>}
    </div>
  );
});
