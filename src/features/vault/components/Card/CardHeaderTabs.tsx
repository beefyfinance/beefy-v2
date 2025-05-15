import { styled } from '@repo/styles/jsx';
import { type ComponentType, memo, useCallback } from 'react';
import { CardHeader } from './CardHeader.tsx';
import { TabButton } from './TabButton.tsx';

export type TabOption<TValue extends string = string, TContext = unknown> = {
  value: TValue;
  label: string;
  context?: TContext;
};

export type CardHeaderTabsProps<T extends TabOption = TabOption> = {
  selected: T['value'];
  options: T[];
  onChange: (value: T['value']) => void;
  TabComponent?: ComponentType<TabProps<T['value'], T['context']>>;
};

export const CardHeaderTabs = memo(function CardHeaderTabs<T extends TabOption = TabOption>({
  selected,
  options,
  onChange,
  TabComponent = Tab,
}: CardHeaderTabsProps<T>) {
  return (
    <StyledCardHeader>
      {options.map(({ value, label, context }) => (
        <TabComponent
          key={value}
          label={label}
          value={value}
          onChange={onChange}
          selected={selected === value}
          context={context}
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

export type TabProps<TValue extends string = string, TContext = unknown> = {
  value: TValue;
  label: string;
  onChange: (selected: TValue) => void;
  selected: boolean;
  context?: TContext;
};

const Tab = memo(function Tab<TValue extends string>({
  value,
  label,
  onChange,
  selected,
}: TabProps<TValue>) {
  const handleClick = useCallback(() => {
    onChange(value);
  }, [value, onChange]);

  return (
    <TabButton selected={selected} onClick={handleClick}>
      {label}
    </TabButton>
  );
});
