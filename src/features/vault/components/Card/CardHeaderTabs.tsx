import { memo, useCallback, useMemo } from 'react';
import { CardHeader } from './CardHeader.tsx';
import { styled } from '@repo/styles/jsx';
import { PulseHighlight, type PulseHighlightProps } from '../PulseHighlight/PulseHighlight.tsx';
import type { BeefyState } from '../../../../redux-types.ts';
import { useAppSelector } from '../../../../store.ts';

type HighlightFn = (state: BeefyState) => PulseHighlightProps['variant'] | false | undefined | null;

export type TabOption<T extends string = string> = {
  value: T;
  label: string;
  shouldHighlight?: HighlightFn;
};

export type CardHeaderTabsProps<T extends TabOption = TabOption> = {
  selected: T['value'];
  options: T[];
  onChange: (value: T['value']) => void;
};

export const CardHeaderTabs = memo(function CardHeaderTabs<T extends TabOption = TabOption>({
  selected,
  options,
  onChange,
}: CardHeaderTabsProps<T>) {
  return (
    <StyledCardHeader>
      {options.map(({ value, label, shouldHighlight }) => (
        <Tab
          key={value}
          label={label}
          value={value}
          onChange={onChange}
          selected={selected === value}
          shouldHighlight={shouldHighlight}
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

type TabProps<T extends string = string> = {
  value: T;
  label: string;
  onChange: (selected: T) => void;
  selected: boolean;
  shouldHighlight?: TabOption['shouldHighlight'];
};

const Tab = memo(function Tab<T extends string = string>({
  value,
  label,
  onChange,
  selected,
  shouldHighlight,
}: TabProps<T>) {
  const handleClick = useCallback(() => {
    onChange(value);
  }, [value, onChange]);
  // @dev we can't conditionally use a hook, so create a dummy selector if no shouldHighlight is provided
  const selectShouldHighlight: HighlightFn = useMemo(
    () => shouldHighlight ?? ((_state: BeefyState) => false),
    [shouldHighlight]
  );
  const highlight = useAppSelector(state => selectShouldHighlight(state));

  return (
    <StyledButton selected={selected} onClick={handleClick}>
      {label} {highlight && <PulseHighlight variant={highlight} innerCircles={1} />}
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
