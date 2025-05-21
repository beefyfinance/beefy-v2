import type { ReactNode } from 'react';
import { memo, useCallback } from 'react';
import { Button, type ButtonVariantProps } from './Button.tsx';
import { Buttons, type ButtonsVariantProps } from './Buttons.tsx';

export type ToggleButtonItem<T extends string = string> = {
  value: T;
  label: string;
};

export type ToggleButtonsProps<
  TValue extends string = string,
  TUntoggle extends string = TValue,
> = {
  value: TValue;
  options: Array<ToggleButtonItem<TValue>>;
  onChange: (value: TValue | TUntoggle) => void;
  /** set this to 'all' key */
  untoggleValue?: TValue | TUntoggle;
  noPadding?: boolean;
  noBorder?: boolean;
} & ButtonsVariantProps;

export const ToggleButtons = memo(function ToggleButtons<
  TValue extends string = string,
  TUntoggle extends string = TValue,
>({
  value,
  options,
  fullWidth,
  onChange,
  untoggleValue,
  variant,
  noBackground,
  noPadding = false,
  noBorder = false,
}: ToggleButtonsProps<TValue, TUntoggle>) {
  const canUntoggle = untoggleValue !== undefined;
  const handleClick = useCallback(
    (newValue: TValue | TUntoggle) => {
      if (untoggleValue) {
        onChange(newValue === value ? untoggleValue : newValue);
      } else {
        onChange(newValue);
      }
    },
    [onChange, untoggleValue, value]
  );

  return (
    <Buttons
      fullWidth={fullWidth}
      variant={variant}
      noBackground={noBackground}
      noBorder={noBorder}
    >
      {options.map(({ value: optionValue, label }) => (
        <ToggleButton
          key={optionValue}
          value={optionValue}
          label={label}
          onClick={handleClick}
          active={value === optionValue}
          noBackground={noBackground}
          noPadding={noPadding}
          unselectable={!canUntoggle && value === optionValue}
        />
      ))}
    </Buttons>
  );
});

export type ToggleButtonProps<TValue extends string = string> = {
  value: TValue;
  label: ReactNode;
  onClick: (value: TValue) => void;
} & ButtonVariantProps;

export const ToggleButton = memo(function ToggleButton<TValue extends string = string>({
  value,
  label,
  onClick,
  ...rest
}: ToggleButtonProps<TValue>) {
  const handleClick = useCallback(() => {
    onClick(value);
  }, [value, onClick]);

  return (
    <Button {...rest} onClick={handleClick}>
      {label}
    </Button>
  );
});
