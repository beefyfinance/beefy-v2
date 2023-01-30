import React, {
  ChangeEventHandler,
  memo,
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { formatSmallPercent } from '../../../../../../helpers/format';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { selectTransactSlippage } from '../../../../../data/selectors/transact';
import { ErrorOutline, ExpandLess, ExpandMore, ReportProblemOutlined } from '@material-ui/icons';
import { transactActions } from '../../../../../data/reducers/wallet/transact';
import { BasicTooltipContent } from '../../../../../../components/Tooltip/BasicTooltipContent';
import { IconWithTooltip } from '../../../../../../components/Tooltip';
import { IconWithBasicTooltip } from '../../../../../../components/Tooltip/IconWithBasicTooltip';

const useStyles = makeStyles(styles);

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

// type InputProps = React.DetailedHTMLProps<
//   React.InputHTMLAttributes<HTMLInputElement>,
//   HTMLInputElement
// >;
type CustomSlippageInputProps = {
  onChange: (value: number | null) => void;
  onFocus: (focused: boolean) => void;
  value: number;
  placeholder: string;
  isCustom: boolean;
  className?: string;
};
const CustomSlippageInput = memo<CustomSlippageInputProps>(function ({
  onChange,
  onFocus,
  value,
  placeholder,
  className,
  isCustom,
}) {
  const classes = useStyles();
  const [inputMode, setInputMode] = useState(false);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>();
  const showPlaceholder = !inputMode && !isCustom;

  const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(() => {
    inputRef.current.focus();
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

  const handleBlur = useCallback<React.FocusEventHandler<HTMLInputElement>>(() => {
    setInputMode(false);
    onChange(clampRangeDecimals(numberInputStringToNumber(input), INPUT_MIN, INPUT_MAX, 1));
    onFocus(false);
  }, [onFocus, input, onChange, setInputMode]);

  const handleFocus = useCallback<React.FocusEventHandler<HTMLInputElement>>(
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
    <div className={clsx(className, classes.custom)}>
      <input
        className={clsx(classes.option, classes.customInput, {
          [classes.customHidden]: showPlaceholder,
        })}
        inputMode="decimal"
        value={input}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        ref={inputRef}
      />
      {showPlaceholder ? (
        <button
          className={clsx(classes.option, classes.button, classes.customPlaceholder)}
          onClick={handleClick}
        >
          {placeholder}
        </button>
      ) : null}
    </div>
  );
});

type ButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;
type SlippageButtonProps = Omit<ButtonProps, 'onChange' | 'onClick' | 'value'> & {
  value: number;
  onChange: (value: number) => void;
};
const SlippageButton = memo<SlippageButtonProps>(function ({ onChange, value, ...rest }) {
  const handleClick = useCallback(() => onChange(value * 100), [onChange, value]);
  return (
    <button onClick={handleClick} {...rest}>
      {formatSmallPercent(value, 1)}
    </button>
  );
});

export type ZapSlippageProps = {
  className?: string;
};
export const ZapSlippage = memo<ZapSlippageProps>(function ({ className }) {
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
      dispatch(transactActions.setSlippage({ slippage: value ? value / 100 : DEFAULT_SLIPPAGE }));
    },
    [dispatch]
  );

  return (
    <div className={clsx(classes.container, className)}>
      <button className={classes.titleToggle} onClick={handleToggle}>
        <div className={classes.title}>
          {t('Transact-Slippage')}
          <IconWithTooltip
            triggerClass={classes.tooltipTrigger}
            content={<BasicTooltipContent title={t('Transact-Slippage-Explainer')} />}
          />
        </div>
        <div className={classes.valueIcon}>
          <div
            className={clsx(classes.value, {
              [classes.warning]: slippage >= SLIPPAGE_WARNING,
              [classes.danger]: slippage >= SLIPPAGE_DANGER,
            })}
          >
            {slippage >= SLIPPAGE_WARNING ? (
              <IconWithBasicTooltip
                triggerClass={classes.tooltipTrigger}
                title={t(
                  `Transact-Slippage-Explainer-${
                    slippage >= SLIPPAGE_DANGER ? 'Danger' : 'Warning'
                  }`,
                  {
                    slippage: formatSmallPercent(slippage, 1),
                  }
                )}
                Icon={slippage >= SLIPPAGE_DANGER ? ReportProblemOutlined : ErrorOutline}
              />
            ) : null}
            {formatSmallPercent(slippage, 1)}
          </div>
          <Icon className={classes.icon} />
        </div>
      </button>
      {open ? (
        <div className={classes.selector}>
          {SLIPPAGE_PRESETS.map((percent, i) => (
            <SlippageButton
              key={percent}
              value={percent}
              onChange={handleChange}
              className={clsx(classes.option, classes.button, {
                [classes.selected]: !customFocused && selectedIndex === i,
              })}
            />
          ))}
          <CustomSlippageInput
            className={clsx({
              [classes.selected]: customFocused || isCustom,
            })}
            placeholder={t('Transact-Slippage-Custom')}
            value={slippage * 100}
            onChange={handleChange}
            onFocus={setCustomFocused}
            isCustom={isCustom}
          />
        </div>
      ) : null}
    </div>
  );
});
