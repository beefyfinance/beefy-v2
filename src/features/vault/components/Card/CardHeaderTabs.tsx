import { memo, useCallback } from 'react';
import { CardHeader } from './CardHeader.tsx';
import { styled } from '@repo/styles/jsx';

export type CardHeaderTabsProps = {
  selected: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  highlight?: string;
};

export const CardHeaderTabs = memo<CardHeaderTabsProps>(function CardHeaderTabs({
  selected,
  options,
  onChange,
  highlight,
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
};
const Tab = memo<TabProps>(function Tab({ value, label, onChange, selected, highlight }) {
  const handleClick = useCallback(() => {
    onChange(value);
  }, [value, onChange]);

  return (
    <StyledButton selected={selected} highlighted={highlight} onClick={handleClick}>
      {label}
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
    highlighted: {
      true: {
        '&::after': {
          content: '""',
          display: 'block',
          backgroundColor: 'indicators.error',
          padding: '0',
          borderRadius: '100%',
          height: '8px',
          width: '8px',
          pointerEvents: 'none',
          transform: 'translate(0, -0.4em)',
        },
      },
    },
  },
});
