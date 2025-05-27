import { styled } from '@repo/styles/jsx';
import { memo, useCallback } from 'react';

export type TabProps<TValue> = {
  value: TValue;
  onChange: (selected: TValue) => void;
  label: string;
  subLabel?: string;
  selected?: boolean;
  disabled?: boolean;
};

export const Tab = memo(function Tab<TValue>({
  value,
  onChange,
  label,
  subLabel,
  selected = false,
  disabled = false,
}: TabProps<TValue>) {
  const handleClick = useCallback(() => {
    onChange(value);
  }, [value, onChange]);
  return (
    <Button onClick={handleClick} data-active={selected || undefined} disabled={disabled}>
      <Label>{label}</Label>
      {subLabel && <SubLabel>{subLabel}</SubLabel>}
    </Button>
  );
});

const Label = styled('div', {
  base: {
    textStyle: 'body.medium',
    color: 'inherit',
    md: {
      textStyle: 'body.xl.medium',
    },
  },
});

const SubLabel = styled('div', {
  base: {
    textStyle: 'subline.sm',
    color: 'var(--sub-label-color, {colors.gold.30})',
    textTransform: 'none',
  },
});

const Button = styled('button', {
  base: {
    padding: '12px',
    flex: '1 0 33%',
    display: 'flex',
    flexDirection: 'column',
    color: 'text.dark',
    backgroundColor: 'background.cardBody',
    borderBottom: 'solid 2px {colors.darkBlue.60}',
    whiteSpace: 'wrap',
    _active: {
      '--sub-label-color': '{colors.gold.20}',
      color: 'text.lightest',
      borderBottomColor: 'white.70',
      backgroundImage: 'linear-gradient(180deg, transparent 0%, {colors.darkBlue.50-56a} 100%)',
    },
    _disabled: {
      color: 'white.70-24a',
    },
  },
  variants: {
    selected: {
      true: {},
    },
  },
});
