import { memo, useCallback } from 'react';
import { CardHeader } from './CardHeader.tsx';
import { styled } from '@repo/styles/jsx';
import { PulseHighlight, type PulseHighlightProps } from '../PulseHighlight/PulseHighlight.tsx';

export type CardHeaderTabsProps = {
  selected: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  highlight?: string;
  variant?: PulseHighlightProps['variant'];
};

export const CardHeaderTabs = memo<CardHeaderTabsProps>(function CardHeaderTabs({
  selected,
  options,
  onChange,
  highlight,
  variant,
}) {
  return (
    <StyledCardHeader>
      {options.map(({ value, label }) => (
        <Tab
          key={value}
          label={label}
          value={value}
          onChange={onChange}
          selected={selected === value}
          highlight={highlight === value}
          variant={variant}
        />
      ))}
    </StyledCardHeader>
  );
});

const StyledCardHeader = styled(CardHeader, {
  base: {
    padding: '0',
    gap: '0',
    sm: {
      padding: '0',
    },
  },
});

type TabProps = {
  value: string;
  label: string;
  onChange: (selected: string) => void;
  selected: boolean;
  highlight?: boolean;
  variant?: PulseHighlightProps['variant'];
};
const Tab = memo<TabProps>(function Tab({
  value,
  label,
  onChange,
  selected,
  highlight,
  variant = 'warning',
}) {
  const handleClick = useCallback(() => {
    onChange(value);
  }, [value, onChange]);

  return (
    <StyledButton selected={selected} onClick={handleClick}>
      {label} {highlight && <PulseHighlight variant={variant} innerCircles={1} />}
    </StyledButton>
  );
});

const StyledButton = styled('button', {
  base: {
    textStyle: 'body.medium',
    position: 'relative',
    flexBasis: '1px',
    flexGrow: 1,
    flexShrink: 0,
    color: 'text.dark',
    paddingBlock: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    _hover: {
      color: 'text.middle',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      bottom: 0,
      right: 0,
      height: '2px',
      backgroundColor: 'background.border',
    },
    '&:first-child': {
      borderTopLeftRadius: '12px',
    },
    '&:last-child': {
      borderTopRightRadius: '12px',
    },
  },
  variants: {
    selected: {
      true: {
        color: 'text.light',
        cursor: 'default',
        pointerEvents: 'none',
        '&::before': {
          backgroundColor: 'text.dark',
        },
      },
    },
  },
});
