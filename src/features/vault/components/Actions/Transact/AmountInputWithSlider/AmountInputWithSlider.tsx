import {
  type ChangeEventHandler,
  type CSSProperties,
  memo,
  type MouseEventHandler,
  type ReactNode,
  useCallback,
  useMemo,
} from 'react';
import { AmountInput, type AmountInputProps } from '../AmountInput/AmountInput';
import { BIG_ZERO } from '../../../../../../helpers/big-number';
import { selectTransactForceSelection } from '../../../../../data/selectors/transact';
import { useAppSelector } from '../../../../../../store';
import clsx from 'clsx';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import type { TokenEntity } from '../../../../../data/entities/token';

type AmountInputWithSliderProps = AmountInputProps & {
  selectedToken: Pick<TokenEntity, 'decimals'>;
  endAdornment: ReactNode;
  warning?: boolean;
};

const useStyles = makeStyles(styles);

export const AmountInputWithSlider = memo<AmountInputWithSliderProps>(
  function AmountInputWithSlider({
    value,
    maxValue,
    onChange,
    selectedToken,
    className,
    price,
    endAdornment,
    warning,
  }) {
    const forceSelection = useAppSelector(selectTransactForceSelection);
    const classes = useStyles();
    const sliderValue = useMemo(() => {
      return value
        .times(100)
        .dividedBy(maxValue.gt(BIG_ZERO) ? maxValue : 1)
        .toNumber();
    }, [maxValue, value]);
    const error = useMemo(() => {
      return value.gt(maxValue);
    }, [maxValue, value]);

    const handlePercentChange = useCallback<(v: number) => void>(
      value => {
        if (onChange) {
          const isMax = value === 100;
          onChange(isMax ? maxValue : maxValue.multipliedBy(value / 100), isMax);
        }
      },
      [maxValue, onChange]
    );

    const handleSliderChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
      e => {
        handlePercentChange(parseInt(e.target.value) || 0);
      },
      [handlePercentChange]
    );

    const handleButtonClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
      e => {
        handlePercentChange(parseInt(e.currentTarget.value) || 0);
      },
      [handlePercentChange]
    );

    return (
      <div className={clsx(classes.inputContainer)}>
        <AmountInput
          className={clsx(classes.input, className)}
          errorClassName={classes.errorInput}
          warningClassName={classes.warningInput}
          value={value}
          maxValue={maxValue}
          tokenDecimals={selectedToken.decimals}
          onChange={onChange}
          error={error}
          allowInputAboveBalance={true}
          fullWidth={true}
          price={price}
          endAdornment={endAdornment}
          disabled={forceSelection}
          warning={warning}
        />
        <input
          disabled={forceSelection}
          className={clsx(classes.slider, {
            [classes.sliderBackground]: !error || !warning,
            [classes.errorRange]: error,
            [classes.warningRange]: warning && !error,
          })}
          style={{ '--value': `${sliderValue}%` } as CSSProperties}
          onChange={handleSliderChange}
          value={sliderValue}
          type="range"
          min="0"
          max="100"
        />
        <div className={classes.dataList}>
          {[0, 25, 50, 75, 100].map(item => (
            <button
              className={clsx(classes.itemList, {
                [classes.active]: item === sliderValue && !error,
                [classes.itemDisabled]: forceSelection,
              })}
              value={item}
              onClick={handleButtonClick}
              key={`index-${item}`}
              disabled={forceSelection}
            >{`${item}%`}</button>
          ))}
        </div>
      </div>
    );
  }
);
