import { styled } from '@repo/styles/jsx';
import type { ReactNode } from 'react';
import { memo, useCallback } from 'react';
import { Button, type ButtonVariantProps } from './Button.tsx';
import { Buttons, type ButtonsVariantProps } from './Buttons.tsx';

export type ToggleButtonItem<T extends string = string> = {
  value: T;
  label: string;
  subtitle?: string;
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
  disabled?: boolean;
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
  disabled = false,
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

  const isCard = variant === 'card';
  const buttonVariant = isCard ? 'card' : 'default';

  return (
    <Buttons
      fullWidth={fullWidth}
      variant={variant}
      noBackground={noBackground}
      noBorder={noBorder}
    >
      {options.map(({ value: optionValue, label, subtitle }) => {
        const active = value === optionValue;
        const content =
          isCard ? <CardContent label={label} subtitle={subtitle} active={active} /> : label;
        return (
          <ToggleButton
            key={optionValue}
            value={optionValue}
            label={content}
            onClick={handleClick}
            active={active}
            noBackground={noBackground}
            noPadding={noPadding}
            variant={buttonVariant}
            unselectable={!canUntoggle && active}
            disabled={disabled}
          />
        );
      })}
    </Buttons>
  );
});

type CardContentProps = {
  label: ReactNode;
  subtitle?: ReactNode;
  active: boolean;
};

const CardContent = memo(function CardContent({ label, subtitle, active }: CardContentProps) {
  return (
    <>
      <CardHeader>
        <CardRadio>
          {active ?
            <CardRadioDot />
          : null}
        </CardRadio>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      {subtitle ?
        <CardSubtitle active={active}>{subtitle}</CardSubtitle>
      : null}
    </>
  );
});

const CardHeader = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
});

const CardRadio = styled('span', {
  base: {
    flexShrink: 0,
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: 'solid 1.6px',
    borderColor: 'text.dark',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const CardRadioDot = styled('span', {
  base: {
    width: '6.4px',
    height: '6.4px',
    borderRadius: '50%',
    background: 'white.100',
  },
});

const CardTitle = styled('span', {
  base: {
    textStyle: 'body.medium',
    color: 'text.lightest',
  },
});

const CardSubtitle = styled('span', {
  base: {
    textStyle: 'body.sm',
    color: 'text.dark',
    paddingLeft: '24px',
    whiteSpace: 'normal',
    overflowWrap: 'break-word',
  },
  variants: {
    active: {
      true: {
        color: 'text.lightest',
      },
    },
  },
});

export type ToggleButtonProps<TValue extends string = string> = {
  value: TValue;
  label: ReactNode;
  onClick: (value: TValue) => void;
  disabled?: boolean;
} & ButtonVariantProps;

export const ToggleButton = memo(function ToggleButton<TValue extends string = string>({
  value,
  label,
  onClick,
  disabled,
  ...rest
}: ToggleButtonProps<TValue>) {
  const handleClick = useCallback(() => {
    onClick(value);
  }, [value, onClick]);

  return (
    <Button {...rest} onClick={handleClick} disabled={disabled}>
      {label}
    </Button>
  );
});
