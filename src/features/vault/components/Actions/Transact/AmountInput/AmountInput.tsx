import {
  type ChangeEventHandler,
  type FocusEventHandler,
  memo,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { styles } from './styles.ts';
import { css, type CssStyles } from '@repo/styles/css';
import BigNumber from 'bignumber.js';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { formatLargeUsd, formatTokenInput } from '../../../../../../helpers/format.ts';

const useStyles = legacyMakeStyles(styles);

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
  onChange?: (value: BigNumber, isMax: boolean) => void;
  error?: boolean;
  warning?: boolean;
  css?: CssStyles;
  allowInputAboveBalance?: boolean;
  fullWidth?: boolean;
  price?: BigNumber;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  disabled?: boolean;
  errorCss?: CssStyles;
  warningCss?: CssStyles;
};
export const AmountInput = memo(function AmountInput({
  value,
  maxValue,
  onChange,
  tokenDecimals = 2,
  error = false,
  warning = false,
  css: cssProp,
  allowInputAboveBalance = false,
  fullWidth = false,
  price,
  endAdornment,
  startAdornment,
  disabled,
  errorCss,
  warningCss,
}: AmountInputProps) {
  const classes = useStyles();
  const [input, setInput] = useState(() => {
    return numberToString(value, tokenDecimals);
  });

  const inputUsdValue = useMemo(() => {
    return price ? price.times(value) : BIG_ZERO;
  }, [price, value]);

  const setValue = useCallback(
    (newValue: BigNumber, isMax: boolean) => {
      if (onChange) {
        onChange(newValue, isMax);
      }
    },
    [onChange]
  );

  const handleMax = useCallback(() => {
    setInput(numberToString(maxValue, tokenDecimals));
    setValue(maxValue, true);
  }, [maxValue, setValue, tokenDecimals, setInput]);

  const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    e => {
      const rawInput = e.target.value;

      // empty
      if (rawInput.length === 0) {
        setInput('');
        setValue(BIG_ZERO, false);
        return;
      }

      if (rawInput === '.') {
        setInput('0.');
        setValue(BIG_ZERO, false);
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
        setValue(BIG_ZERO, false);
        return;
      }

      // Can't go above max
      if (!allowInputAboveBalance && maxValue && parsedNumber.gt(maxValue)) {
        handleMax();
        return;
      }
      // Raise changed event
      setInput(rawInput);
      setValue(parsedNumber, !allowInputAboveBalance && parsedNumber.gte(maxValue));
    },
    [allowInputAboveBalance, handleMax, maxValue, setValue]
  );

  const handleBlur = useCallback<FocusEventHandler<HTMLInputElement>>(
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
      setValue(maxValue, true);
    }

    setInput(numberToString(value, tokenDecimals));
  }, [value, maxValue, setValue, allowInputAboveBalance, tokenDecimals]);

  return (
    <div
      className={css(
        styles.inputContainer,
        fullWidth && styles.fullWidth,
        error && styles.error,
        warning && styles.warning,
        cssProp,
        error && errorCss,
        warning && warningCss
      )}
    >
      {startAdornment && <div className={classes.startAdornment}>{startAdornment}</div>}
      <div className={classes.inputContent}>
        <input
          className={css(styles.input, Boolean(price) && styles.inputWithPrice)}
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
