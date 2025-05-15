import { memo, useCallback, useMemo } from 'react';
import { useAppSelector } from '../../../data/store/hooks.ts';
import type { BeefyState } from '../../../data/store/types.ts';
import { PulseHighlight, type PulseHighlightProps } from '../PulseHighlight/PulseHighlight.tsx';
import type { TabOption, TabProps } from './CardHeaderTabs.tsx';
import { TabButton } from './TabButton.tsx';

type HighlightFn = (state: BeefyState) => PulseHighlightProps['variant'] | false | undefined | null;
type HighlightableContext = {
  shouldHighlight?: HighlightFn;
};

export type HighlightableTabOption<TValue extends string = string> = TabOption<
  TValue,
  HighlightableContext
>;

type HighlightableTabProps<TValue extends string = string> = TabProps<TValue, HighlightableContext>;

export const HighlightableTab = memo(function HighlightableTab<TValue extends string = string>({
  value,
  label,
  onChange,
  selected,
  context,
}: HighlightableTabProps<TValue>) {
  const shouldHighlight = context?.shouldHighlight;
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
    <TabButton selected={selected} onClick={handleClick}>
      {label} {highlight && <PulseHighlight variant={highlight} />}
    </TabButton>
  );
});
