import { styled } from '@repo/styles/jsx';
import { memo, useCallback, useMemo, type ChangeEventHandler, type CSSProperties } from 'react';
import { BIG_ZERO } from '../../../helpers/big-number.ts';
import { css } from '@repo/styles/css';

interface SliderInputProps {
  value: BigNumber;
  maxValue: BigNumber;
  onChange?: (value: BigNumber, isMax: boolean) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

export const SliderInput = memo(function SliderInput({
  value,
  maxValue,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
}: SliderInputProps) {
  const sliderValue = useMemo(() => {
    return value
      .times(100)
      .dividedBy(maxValue.gt(BIG_ZERO) ? maxValue : 1)
      .toNumber();
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

  return (
    <Slider
      disabled={disabled}
      className={css(styles.sliderBackground)}
      style={{ '--value': `${sliderValue}%` } as CSSProperties}
      onChange={handleSliderChange}
      value={sliderValue}
      type="range"
      min={min}
      max={max}
      step={step}
    />
  );
});

const Slider = styled('input', {
  base: {
    appearance: 'none',
    height: '4px',
    width: '100%',
    zIndex: 'slider',
    margin: '0',
    padding: '0',
    borderRadius: '8px',
    outline: 'none',
    border: 'none',
    '&::-webkit-slider-thumb': {
      appearance: 'none',
      height: '16px',
      width: '16px',
      background: 'text.dark',
      border: '2px solid {colors.text.light}',
      borderRadius: '50%',
      '&:hover': {
        cursor: 'pointer',
      },
    },
  },
});
const styles = {
  sliderBackground: css.raw({
    background:
      'linear-gradient(to right, {colors.text.dark} 0%,{colors.text.dark} var(--value),{colors.background.content.light} var(--value), {colors.background.content.light} 100%)',
  }),
};
