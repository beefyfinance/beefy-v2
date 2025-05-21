import { type FC, memo, useCallback } from 'react';
import type { ToggleButtonProps, ToggleButtonsProps } from './ToggleButtons.tsx';
import { Buttons } from './Buttons.tsx';
import { Button } from './Button.tsx';

export type MultiToggleButtonProps<TValue extends string = string> = Omit<
  ToggleButtonProps<TValue>,
  'onClick'
> & {
  onClick: (isSelected: boolean, value: TValue) => void;
};

export const MultiToggleButton = memo(function MultiToggleButton<TValue extends string = string>({
  value,
  label,
  onClick,
  ...rest
}: MultiToggleButtonProps<TValue>) {
  const isSelected = rest.active;
  const handleClick = useCallback(() => {
    onClick(!isSelected, value);
  }, [onClick, isSelected, value]);

  return (
    <Button {...rest} onClick={handleClick}>
      {label}
    </Button>
  );
});

type MultiToggleButtonsProps<TValue extends string = string> = Omit<
  ToggleButtonsProps<TValue>,
  'value' | 'onChange' | 'untoggleValue'
> & {
  value: TValue[];
  onChange: (value: TValue[]) => void;
  ButtonComponent?: FC<MultiToggleButtonProps<TValue>>;
};

export const MultiToggleButtons = memo(function MultiToggleButtons<TValue extends string = string>({
  value,
  options,
  fullWidth,
  onChange,
  variant,
  ButtonComponent = MultiToggleButton,
}: MultiToggleButtonsProps<TValue>) {
  const handleClick = useCallback(
    (isSelected: boolean, id: TValue) => {
      onChange(isSelected ? [...value, id] : value.filter(selectedId => selectedId !== id));
    },
    [onChange, value]
  );

  return (
    <Buttons fullWidth={fullWidth} variant={variant}>
      {options.map(({ value: optionValue, label }) => (
        <ButtonComponent
          key={optionValue}
          value={optionValue}
          label={label}
          active={value.includes(optionValue)}
          onClick={handleClick}
        />
      ))}
    </Buttons>
  );
});
