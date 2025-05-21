import { styled } from '@repo/styles/jsx';
import { memo, useCallback, useMemo, type ChangeEventHandler, type CSSProperties } from 'react';
import { BIG_ZERO } from '../../../helpers/big-number.ts';

interface SliderInputProps {
  value: BigNumber;
  maxValue: BigNumber;
  onChange?: (value: BigNumber, isMax: boolean) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export const SliderInput = memo(function SliderInput({
  value,
  maxValue,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  size = 'sm',
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
      style={{ '--value': `${sliderValue}%` } as CSSProperties}
      onChange={handleSliderChange}
      value={sliderValue}
      type="range"
      min={min}
      max={max}
      step={step}
      size={size}
    />
  );
});

const Slider = styled('input', {
  base: {
    appearance: 'none',
    width: '100%',
    zIndex: 'slider',
    margin: '0',
    padding: '0',
    borderRadius: '8px',
    outline: 'none',
    border: 'none',
    background:
      'linear-gradient(to right, {colors.white.70-64a} 0%,{colors.white.70-64a} var(--value),{colors.background.content.light} var(--value), {colors.background.content.light} 100%)',
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
  variants: {
    size: {
      sm: {
        height: '4px',
      },
      md: {
        height: '8px',
      },
    },
  },
});
