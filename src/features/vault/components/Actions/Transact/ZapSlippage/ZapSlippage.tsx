import { css, type CssStyles } from '@repo/styles/css';
import type {
  ButtonHTMLAttributes,
  ChangeEventHandler,
  DetailedHTMLProps,
  FocusEventHandler,
  MouseEventHandler,
} from 'react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BasicTooltipContent } from '../../../../../../components/Tooltip/BasicTooltipContent.tsx';
import { IconWithBasicTooltip } from '../../../../../../components/Tooltip/IconWithBasicTooltip.tsx';
import { IconWithTooltip } from '../../../../../../components/Tooltip/IconWithTooltip.tsx';
import { formatPercent } from '../../../../../../helpers/format.ts';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import ErrorOutline from '../../../../../../images/icons/mui/ErrorOutline.svg?react';
import ExpandLess from '../../../../../../images/icons/mui/ExpandLess.svg?react';
import ExpandMore from '../../../../../../images/icons/mui/ExpandMore.svg?react';
import ReportProblemOutlined from '../../../../../../images/icons/mui/ReportProblemOutlined.svg?react';
import { transactFetchQuotes, transactSetSlippage } from '../../../../../data/actions/transact.ts';
import { selectTransactSlippage } from '../../../../../data/selectors/transact.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

// Decimal space (0.1% = 0.001)
const SLIPPAGE_PRESETS = [0.1, 0.5, 1, 3].map(p => p / 100);
const DEFAULT_SLIPPAGE = 1 / 100;
const SLIPPAGE_WARNING = 5 / 100;
const SLIPPAGE_DANGER = 10 / 100;

// % space (0.1% = 0.1)
const INPUT_MIN = 0.1;
const INPUT_MAX = 49;

function isValidNumberInputString(value: string): boolean {
  const regex = new RegExp(`^[0-9]*\\.?[0-9]*$`);
  return !!value.match(regex);
}

function numberInputStringToNumber(value: string): number {
  const parsedText = value.replace(/[^0-9.]+/g, '').replace(/\.$/, '');
  return parseFloat(parsedText);
}

function clampRangeDecimals(value: number, min: number, max: number, decimals: number): number {
  if (isNaN(value) || !isFinite(value)) {
    value = min;
  } else {
    const multiplier = 10 ** decimals;
    value = Math.floor(value * multiplier) / multiplier;
  }

  if (value < min) {
    value = min;
  } else if (value > max) {
    value = max;
  }

  return value;
}

function numberToString(value: number, maxDecimals: number = 1): string {
  if (value < 0) {
    return '';
  }

  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
    useGrouping: false,
  });
}

// type InputProps = DetailedHTMLProps<
//   InputHTMLAttributes<HTMLInputElement>,
//   HTMLInputElement
// >;
type CustomSlippageInputProps = {
  onChange: (value: number | null) => void;
  onFocus: (focused: boolean) => void;
  value: number;
  placeholder: string;
  isCustom: boolean;
  css?: CssStyles;
};
const CustomSlippageInput = memo(function CustomSlippageInput({
  onChange,
  onFocus,
  value,
  placeholder,
  css: cssProp,
  isCustom,
}: CustomSlippageInputProps) {
  const [inputMode, setInputMode] = useState(false);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const showPlaceholder = !inputMode && !isCustom;

  const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(() => {
    inputRef.current?.focus();
  }, [inputRef]);

  const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    e => {
      const rawInput = e.target.value;

      if (!isValidNumberInputString(rawInput)) {
        return;
      }

      const parsedNumber = numberInputStringToNumber(rawInput);
      if (isNaN(parsedNumber) || !isFinite(parsedNumber) || parsedNumber < 0) {
        setInput('');
        return;
      }

      // 1inch will not quote over 49% slippage
      if (parsedNumber > INPUT_MAX) {
        setInput(INPUT_MAX.toString());
        return;
      }

      setInput(rawInput);
    },
    [setInput]
  );

  const handleBlur = useCallback<FocusEventHandler<HTMLInputElement>>(() => {
    setInputMode(false);
    onChange(clampRangeDecimals(numberInputStringToNumber(input), INPUT_MIN, INPUT_MAX, 1));
    onFocus(false);
  }, [onFocus, input, onChange, setInputMode]);

  const handleFocus = useCallback<FocusEventHandler<HTMLInputElement>>(
    e => {
      e.target.select();
      setInputMode(true);
      onFocus(true);
    },
    [onFocus]
  );

  useEffect(() => {
    if (!inputMode) {
      setInput(typeof value === 'number' && value >= 0 ? numberToString(value) : '');
    }
  }, [value, setInput, inputMode]);

  return (
    <div className={css(cssProp, styles.custom)}>
      <input
        className={css(styles.option, styles.customInput, showPlaceholder && styles.customHidden)}
        inputMode="decimal"
        value={input}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        ref={inputRef}
      />
      {showPlaceholder ?
        <button
          type="button"
          className={css(styles.option, styles.button, styles.customPlaceholder)}
          onClick={handleClick}
        >
          {placeholder}
        </button>
      : null}
    </div>
  );
});

type ButtonProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
type SlippageButtonProps = Omit<ButtonProps, 'onChange' | 'onClick' | 'value'> & {
  value: number;
  onChange: (value: number) => void;
};
const SlippageButton = memo(function SlippageButton({
  onChange,
  value,
  ...rest
}: SlippageButtonProps) {
  const handleClick = useCallback(() => onChange(value * 100), [onChange, value]);
  return (
    <button type="button" onClick={handleClick} {...rest}>
      {formatPercent(value, 1)}
    </button>
  );
});

export type ZapSlippageProps = {
  css?: CssStyles;
};
export const ZapSlippage = memo(function ZapSlippage({ css: cssProp }: ZapSlippageProps) {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const slippage = useAppSelector(selectTransactSlippage);
  const handleToggle = useCallback(() => setOpen(o => !o), [setOpen]);
  const Icon = open ? ExpandLess : ExpandMore;
  const selectedIndex = useMemo(
    () => SLIPPAGE_PRESETS.findIndex(percent => percent === slippage),
    [slippage]
  );
  const isCustom = selectedIndex === -1;
  const [customFocused, setCustomFocused] = useState(false);
  const handleChange = useCallback<CustomSlippageInputProps['onChange']>(
    value => {
      dispatch(transactSetSlippage({ slippage: value ? value / 100 : DEFAULT_SLIPPAGE }));
      dispatch(transactFetchQuotes());
    },
    [dispatch]
  );

  return (
    <div className={css(styles.container, cssProp)}>
      <button type="button" className={classes.titleToggle} onClick={handleToggle}>
        <div className={classes.title}>
          {t('Transact-Slippage')}
          <IconWithTooltip
            iconSize={16}
            tooltip={<BasicTooltipContent title={t('Transact-Slippage-Explainer')} />}
          />
        </div>
        <div className={classes.valueIcon}>
          <div
            className={css(
              styles.value,
              slippage >= SLIPPAGE_WARNING && styles.warning,
              slippage >= SLIPPAGE_DANGER && styles.danger
            )}
          >
            {slippage >= SLIPPAGE_WARNING ?
              <IconWithBasicTooltip
                iconSize={16}
                title={t(
                  `Transact-Slippage-Explainer-${
                    slippage >= SLIPPAGE_DANGER ? 'Danger' : 'Warning'
                  }`,
                  {
                    slippage: formatPercent(slippage, 1),
                  }
                )}
                Icon={slippage >= SLIPPAGE_DANGER ? ReportProblemOutlined : ErrorOutline}
              />
            : null}
            {formatPercent(slippage, 1)}
          </div>
          <Icon />
        </div>
      </button>
      {open ?
        <div className={classes.selector}>
          {SLIPPAGE_PRESETS.map((percent, i) => (
            <SlippageButton
              key={percent}
              value={percent}
              onChange={handleChange}
              className={css(
                styles.option,
                styles.button,
                !customFocused && selectedIndex === i && styles.selected
              )}
            />
          ))}
          <CustomSlippageInput
            css={(customFocused || isCustom) && styles.selected}
            placeholder={t('Transact-Slippage-Custom')}
            value={slippage * 100}
            onChange={handleChange}
            onFocus={setCustomFocused}
            isCustom={isCustom}
          />
        </div>
      : null}
    </div>
  );
});
