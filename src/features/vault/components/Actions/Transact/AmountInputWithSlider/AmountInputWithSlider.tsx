import { memo, type CSSProperties, useMemo, type ReactNode } from 'react';
import { AmountInput, type AmountInputProps } from '../AmountInput/AmountInput';
import { BIG_ZERO } from '../../../../../../helpers/big-number';
import { selectTransactForceSelection } from '../../../../../data/selectors/transact';
import { useAppSelector } from '../../../../../../store';
import clsx from 'clsx';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import type { TokenEntity } from '../../../../../data/entities/token';

type AmountInputWithSliderProps = AmountInputProps & {
  onSliderChange: (v: number) => void;
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
    onSliderChange,
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
          onChange={e => onSliderChange(parseInt(e.target.value))}
          value={sliderValue}
          type="range"
          min="0"
          max="100"
        />
        <div className={classes.dataList}>
          {[0, 25, 50, 75, 100].map(item => (
            <div
              className={clsx(classes.itemList, {
                [classes.active]: item === sliderValue && !error,
                [classes.itemDisabled]: forceSelection,
              })}
              onClick={() => onSliderChange(item)}
              key={`index-${item}`}
            >{`${item}%`}</div>
          ))}
        </div>
      </div>
    );
  }
);
